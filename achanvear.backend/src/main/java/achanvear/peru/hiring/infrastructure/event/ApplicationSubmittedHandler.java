package achanvear.peru.hiring.infrastructure.event;

import achanvear.peru.freelance.domain.model.FreelancerCertification;
import achanvear.peru.freelance.domain.model.FreelancerProfile;
import achanvear.peru.freelance.domain.repository.FreelancerProfileRepository;
import achanvear.peru.hiring.application.StartScreeningUseCase;
import achanvear.peru.hiring.application.command.StartScreeningCommand;
import achanvear.peru.hiring.application.dto.ScreeningResultResponse;
import achanvear.peru.jobs.domain.event.ApplicationSubmittedEvent;
import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.ApplicationStatus;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationLevel;
import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.jobs.domain.repository.RecruitmentAutomationConfigRepository;
import achanvear.peru.freelance.application.port.out.StoragePort;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Escucha ApplicationSubmittedEvent.
 * En empleos manuales solo deja la postulacion disponible para revision de la empresa.
 * En empleos automatizados inicia screening IA y, si corresponde, agenda entrevista teorica.
 */
@Component
public class ApplicationSubmittedHandler {

    private static final Logger log = LoggerFactory.getLogger(ApplicationSubmittedHandler.class);

    private final JobPostRepository jobPostRepository;
    private final ApplicationRepository applicationRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final IdentityCandidateLookupPort candidateLookupPort;
    private final StartScreeningUseCase startScreeningUseCase;
    private final RecruitmentAutomationConfigRepository automationConfigRepository;
    private final StoragePort storagePort;

    public ApplicationSubmittedHandler(
            JobPostRepository jobPostRepository,
            ApplicationRepository applicationRepository,
            FreelancerProfileRepository freelancerProfileRepository,
            IdentityCandidateLookupPort candidateLookupPort,
            StartScreeningUseCase startScreeningUseCase,
            RecruitmentAutomationConfigRepository automationConfigRepository,
            StoragePort storagePort
    ) {
        this.jobPostRepository = jobPostRepository;
        this.applicationRepository = applicationRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.candidateLookupPort = candidateLookupPort;
        this.startScreeningUseCase = startScreeningUseCase;
        this.automationConfigRepository = automationConfigRepository;
        this.storagePort = storagePort;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleApplicationSubmitted(ApplicationSubmittedEvent event) {
        JobApplication application = null;
        try {
            UUID jobPostUuid = event.jobPostId().value();
            log.info("=== INICIO SCREENING AUTO para candidato {} en job {}", 
                     event.candidateUserId(), jobPostUuid);

            JobPost jobPost = jobPostRepository.findById(event.jobPostId()).orElse(null);
            if (jobPost == null) {
                log.warn("Job post {} no encontrado", jobPostUuid);
                return;
            }

            IdentityCandidateLookupPort.CandidateSummary candidate = candidateLookupPort.findById(event.candidateUserId());
            if (candidate == null) {
                log.warn("Candidato {} no encontrado", event.candidateUserId());
                return;
            }

            application = applicationRepository.findById(event.applicationId().value()).orElse(null);
            FreelancerProfile profile = freelancerProfileRepository.findByUserId(event.candidateUserId()).orElse(null);
            RecruitmentAutomationConfig automationConfig = automationConfigRepository
                    .findByJobPostId(jobPostUuid)
                    .orElse(null);
            if (isManualFlow(automationConfig)) {
                log.info("Postulacion manual recibida para candidato {} en job {}. No se ejecuta screening IA.",
                        event.candidateUserId(), jobPostUuid);
                return;
            }

            boolean hasTheoryInterviewCapacity = hasTheoryInterviewCapacity(jobPostUuid, automationConfig);
            boolean autoAdvance = hasTheoryInterviewCapacity;

            log.info("Candidato: {} <{}> - Postula a: {}", 
                     candidate.fullName(), candidate.email(), jobPost.getTitle());

            // Parsear requirements del job
            List<String> requirementsList = List.of();
            if (jobPost.getRequirements() != null && !jobPost.getRequirements().isBlank()) {
                requirementsList = Arrays.stream(jobPost.getRequirements().split("[,;\\n•]"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }

            log.info("Job requirements: {}", requirementsList);
            String cvUrl = text(application != null ? application.getCvUrl() : null);
            if (cvUrl.isBlank()) {
                cvUrl = text(profile != null ? profile.getCurriculumUrl() : null);
            }
            String cvText = text(profile != null ? profile.getCvData() : null);
            if (!cvUrl.isBlank()) {
                try {
                    String extractedText = storagePort.extractPdfText(cvUrl);
                    if (!extractedText.isBlank()) {
                        cvText = (cvText + " " + extractedText).trim();
                    }
                } catch (Exception e) {
                    log.warn("No se pudo extraer texto del CV del candidato {}: {}",
                            event.candidateUserId(), e.getMessage());
                }
            }
            Double scoreThreshold = resolveScoreThreshold(
                    jobPost.getRequiredScoreThreshold(),
                    automationConfig,
                    hasTheoryInterviewCapacity
            );

            // Iniciar screening - la IA evalua y si pasa, genera schedule de entrevista
            StartScreeningCommand command = new StartScreeningCommand(
                    jobPostUuid.toString(),
                    event.candidateUserId().toString(),
                    candidate.fullName() != null ? candidate.fullName() : "Candidato",
                    jobPost.getTitle(),
                    jobPost.getDescription(),
                    requirementsList,
                    parseExperienceMin(jobPost),
                    deriveCareer(jobPost),
                    buildCandidateSkills(profile),
                    resolveCandidateExperienceYears(profile, cvText),
                    text(profile != null ? profile.getSpecialty() : null),
                    text(profile != null ? profile.getBiography() : null),
                    cvUrl,
                    cvText,
                    text(application != null ? application.getCoverLetter() : null),
                    scoreThreshold,
                    autoAdvance
            );

            ScreeningResultResponse screening = startScreeningUseCase.execute(command);
            persistScreeningResult(application, screening, autoAdvance);
            log.info("=== SCREENING COMPLETADO para candidato {} en job {}", 
                     event.candidateUserId(), jobPostUuid);

        } catch (Exception e) {
            log.error("Error en screening automatico: {}", e.getMessage(), e);
            persistScreeningReviewFallback(application);
        }
    }

    /**
     * Extrae la experiencia minima exigida por el puesto a partir de sus requisitos
     * o descripcion (ej. "3 anos de experiencia", "minimo 5 anos").
     * Devuelve null si el puesto no declara un minimo explicito.
     */
    private Integer parseExperienceMin(JobPost jobPost) {
        String source = (text(jobPost.getRequirements()) + " " + text(jobPost.getDescription())).toLowerCase();
        if (source.isBlank()) {
            return null;
        }
        var matcher = java.util.regex.Pattern
                .compile("(\\d{1,2})\\s*(?:años|anos|years?)")
                .matcher(source);
        Integer min = null;
        while (matcher.find()) {
            try {
                int value = Integer.parseInt(matcher.group(1));
                if (min == null || value < min) {
                    min = value;
                }
            } catch (NumberFormatException ignored) {
                // Ignorar valores no numericos
            }
        }
        return min;
    }

    /**
     * Deriva la carrera o area profesional solicitada por el puesto.
     * No usa el titulo como carrera obligatoria porque generaba falsos negativos:
     * un cargo como "Asistente Administrativo Junior" no significa una carrera exacta.
     */
    private String deriveCareer(JobPost jobPost) {
        return "No especificada";
    }

    /**
     * Estima los anos de experiencia del candidato a partir de su perfil:
     * usa la suma maxima declarada en certificaciones y, si no hay dato,
     * deja null para que la IA evalue la evidencia textual.
     */
    private Integer resolveCandidateExperienceYears(FreelancerProfile profile, String cvText) {
        String biography = text(profile != null ? profile.getBiography() : null) + " " + text(cvText);
        var matcher = java.util.regex.Pattern
                .compile("(\\d{1,2})\\s*(?:años|anos|years?)")
                .matcher(biography.toLowerCase());
        Integer years = null;
        while (matcher.find()) {
            try {
                int value = Integer.parseInt(matcher.group(1));
                if (years == null || value > years) {
                    years = value;
                }
            } catch (NumberFormatException ignored) {
                // Ignorar valores no numericos
            }
        }
        return years;
    }
    private List<String> buildCandidateSkills(FreelancerProfile profile) {
        if (profile == null) {
            return List.of();
        }

        List<String> skills = new ArrayList<>();
        addIfPresent(skills, profile.getIndustry());
        addIfPresent(skills, profile.getSpecialty());
        addIfPresent(skills, profile.getAchievements());

        for (FreelancerCertification certification : profile.getCertifications()) {
            addIfPresent(skills, certification.getName());
            addIfPresent(skills, certification.getIssuingOrganization());
        }

        return skills.stream().distinct().toList();
    }

    private void persistScreeningResult(
            JobApplication application,
            ScreeningResultResponse screening,
            boolean autoAdvance
    ) {
        if (application == null || screening == null || screening.score() == null || screening.recommended() == null) {
            return;
        }

        application.registerScreeningResult(
                screening.score(),
                screening.recommended(),
                autoAdvance,
                screening.summary()
        );
        applicationRepository.save(application);
    }

    private void persistScreeningReviewFallback(JobApplication application) {
        if (application == null) {
            return;
        }

        try {
            application.markScreeningInReview(
                    "No se pudo completar la evaluacion automatica con IA. Tu postulacion quedo en revision para que la empresa la revise."
            );
            applicationRepository.save(application);
        } catch (Exception saveError) {
            log.error("No se pudo guardar el estado de revision de la postulacion {}: {}",
                    application.getId().value(), saveError.getMessage(), saveError);
        }
    }

    private Double resolveScoreThreshold(
            Double jobThreshold,
            RecruitmentAutomationConfig automationConfig,
            boolean hasTheoryInterviewCapacity
    ) {
        double configuredThreshold = jobThreshold != null ? jobThreshold : 60.0;
        if (automationConfig != null) {
            String configuredMinimum = automationConfig.getScreeningCriteria().get("minimumScore");
            if (configuredMinimum != null && !configuredMinimum.isBlank()) {
                try {
                    double threshold = Double.parseDouble(configuredMinimum);
                    if (threshold < 0 || threshold > 100) {
                        throw new IllegalArgumentException("minimumScore must be between 0 and 100");
                    }
                    configuredThreshold = threshold;
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Configured minimumScore is not numeric", e);
                }
            }
        }

        if (hasTheoryInterviewCapacity) {
            return Math.min(configuredThreshold, 80.0);
        }

        return configuredThreshold;
    }

    private boolean hasTheoryInterviewCapacity(
            UUID jobPostUuid,
            RecruitmentAutomationConfig automationConfig
    ) {
        int configuredLimit = resolveTheoryInterviewLimit(automationConfig);
        if (configuredLimit <= 0) {
            return true;
        }

        long alreadyShortlisted = applicationRepository.countByJobPostIdAndStatus(
                jobPostUuid,
                ApplicationStatus.SHORTLISTED.name()
        );
        return alreadyShortlisted < configuredLimit;
    }

    private int resolveTheoryInterviewLimit(RecruitmentAutomationConfig automationConfig) {
        if (automationConfig == null) {
            return 0;
        }

        String configuredLimit = automationConfig.getScreeningCriteria().get("candidatesForTheoryInterview");
        if (configuredLimit == null || configuredLimit.isBlank()) {
            return 0;
        }

        try {
            return Math.max(0, Integer.parseInt(configuredLimit));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Configured candidatesForTheoryInterview is not numeric", e);
        }
    }

    private boolean isManualFlow(RecruitmentAutomationConfig automationConfig) {
        return automationConfig == null || automationConfig.getLevel() == RecruitmentAutomationLevel.MANUAL;
    }

    private void addIfPresent(List<String> values, String value) {
        String normalized = text(value);
        if (!normalized.isBlank()) {
            values.add(normalized);
        }
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }
}
