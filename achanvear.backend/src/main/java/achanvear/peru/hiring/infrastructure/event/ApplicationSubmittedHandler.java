package achanvear.peru.hiring.infrastructure.event;

import achanvear.peru.hiring.application.StartScreeningUseCase;
import achanvear.peru.hiring.application.command.StartScreeningCommand;
import achanvear.peru.jobs.domain.event.ApplicationSubmittedEvent;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Escucha ApplicationSubmittedEvent.
 * Inicia el screening automaticamente para TODAS las postulaciones.
 * El screening evalua al candidato con IA y si pasa, genera schedule de entrevista teorica.
 */
@Component
public class ApplicationSubmittedHandler {

    private static final Logger log = LoggerFactory.getLogger(ApplicationSubmittedHandler.class);

    private final JobPostRepository jobPostRepository;
    private final IdentityCandidateLookupPort candidateLookupPort;
    private final StartScreeningUseCase startScreeningUseCase;

    public ApplicationSubmittedHandler(
            JobPostRepository jobPostRepository,
            IdentityCandidateLookupPort candidateLookupPort,
            StartScreeningUseCase startScreeningUseCase
    ) {
        this.jobPostRepository = jobPostRepository;
        this.candidateLookupPort = candidateLookupPort;
        this.startScreeningUseCase = startScreeningUseCase;
    }

    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleApplicationSubmitted(ApplicationSubmittedEvent event) {
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

            log.info("Candidato: {} <{}> - Postula a: {}", 
                     candidate.fullName(), candidate.email(), jobPost.getTitle());

            // Parsear requirements del job
            List<String> requirementsList = List.of();
            if (jobPost.getRequirements() != null && !jobPost.getRequirements().isBlank()) {
                requirementsList = Arrays.stream(jobPost.getRequirements().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }

            log.info("Job requirements: {}", requirementsList);

            // Iniciar screening - la IA evalua y si pasa, genera schedule de entrevista
            StartScreeningCommand command = new StartScreeningCommand(
                    jobPostUuid.toString(),
                    event.candidateUserId().toString(),
                    candidate.fullName() != null ? candidate.fullName() : "Candidato",
                    jobPost.getTitle(),
                    jobPost.getDescription(),
                    requirementsList,
                    null,  // experienceMin
                    "",    // career
                    List.of(), // candidateSkills
                    null,  // candidateExperienceYears
                    ""     // candidateCareer
            );

            startScreeningUseCase.execute(command);
            log.info("=== SCREENING COMPLETADO para candidato {} en job {}", 
                     event.candidateUserId(), jobPostUuid);

        } catch (Exception e) {
            log.error("Error en screening automatico: {}", e.getMessage(), e);
        }
    }
}