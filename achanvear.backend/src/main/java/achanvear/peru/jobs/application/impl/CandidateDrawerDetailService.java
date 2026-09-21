package achanvear.peru.jobs.application.impl;

import achanvear.peru.hiring.domain.model.HiringProcess;
import achanvear.peru.hiring.domain.repository.HiringProcessRepository;
import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.jobs.application.GetCandidateDrawerDetailUseCase;
import achanvear.peru.jobs.application.dto.CandidateDrawerDetailResponse;
import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementation that aggregates data from jobs, hiring, and interview modules
 * to build the full candidate drawer detail.
 */
@Service
@Transactional(readOnly = true)
public class CandidateDrawerDetailService implements GetCandidateDrawerDetailUseCase {

    private final JobPostRepository jobPostRepository;
    private final ApplicationRepository applicationRepository;
    private final HiringProcessRepository hiringProcessRepository;
    private final InterviewRepository interviewRepository;
    private final IdentityCandidateLookupPort identityCandidateLookupPort;

    public CandidateDrawerDetailService(
            JobPostRepository jobPostRepository,
            ApplicationRepository applicationRepository,
            HiringProcessRepository hiringProcessRepository,
            InterviewRepository interviewRepository,
            IdentityCandidateLookupPort identityCandidateLookupPort
    ) {
        this.jobPostRepository = jobPostRepository;
        this.applicationRepository = applicationRepository;
        this.hiringProcessRepository = hiringProcessRepository;
        this.interviewRepository = interviewRepository;
        this.identityCandidateLookupPort = identityCandidateLookupPort;
    }

    @Override
    public CandidateDrawerDetailResponse execute(String jobId, String applicationId, String companyId, boolean superAdmin) {
        // 1. Verify job post ownership
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(jobId))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        if (!superAdmin) {
            if (companyId == null || companyId.isBlank()) {
                throw new ForbiddenOperationException("Company context is required");
            }
            if (!jobPost.belongsTo(UUID.fromString(companyId))) {
                throw new ForbiddenOperationException("You do not have permission to view this candidate");
            }
        }

        // 2. Get the application
        JobApplication application = applicationRepository.findById(UUID.fromString(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // 3. Get candidate info
        IdentityCandidateLookupPort.CandidateSummary candidate =
                identityCandidateLookupPort.findById(application.getCandidateUserId());

        String candidateName = candidate != null ? candidate.fullName() : "Unknown";
        String candidateEmail = candidate != null ? candidate.email() : "Unknown";

        // 4. Get hiring process
        Optional<HiringProcess> hiringProcessOpt =
                hiringProcessRepository.findByJobIdAndCandidateId(jobId, application.getCandidateUserId().toString());

        String currentStage = "PENDING";
        Double screeningScore = application.getScreeningScore();
        String screeningSummary = screeningScore != null
                ? "Evaluacion curricular registrada por IA para esta postulacion."
                : null;
        String hiringProcessId = null;

        if (hiringProcessOpt.isPresent()) {
            HiringProcess hp = hiringProcessOpt.get();
            hiringProcessId = hp.getId().toString();
            currentStage = hp.getStage().name();
        }

        // 5. Get interview data
        Integer theoryInterviewScore = application.getTheoryScore();
        Integer technicalInterviewScore = application.getTechnicalScore();
        Integer softSkillsScore = null;
        boolean interviewAvailable = false;
        String recordingKey = null;

        // Try to find interview by hiring process id
        if (hiringProcessId != null) {
            Optional<Interview> interviewOpt = interviewRepository.findById(
                    achanvear.peru.interview.domain.model.InterviewId.of(hiringProcessId)
            );
            if (interviewOpt.isEmpty()) {
                // Try by candidateId
                interviewOpt = interviewRepository.findById(
                        achanvear.peru.interview.domain.model.InterviewId.of(application.getCandidateUserId().toString())
                );
            }

            if (interviewOpt.isPresent()) {
                Interview interview = interviewOpt.get();
                interviewAvailable = true;
                if (interview.getScore() != null) {
                    if ("THEORY".equals(interview.getType().name())) {
                        theoryInterviewScore = interview.getScore().getValue();
                    } else if ("TECHNICAL".equals(interview.getType().name())) {
                        technicalInterviewScore = interview.getScore().getValue();
                    }
                }
                if (interview.getRecordingSession() != null) {
                    recordingKey = interview.getRecordingSession().getFileKey();
                }
            }
        }

        // 6. Build timeline
        List<CandidateDrawerDetailResponse.StageTimeline> stages = buildTimeline(currentStage);
        CandidateDrawerDetailResponse.ExecutiveReport executiveReport = buildExecutiveReport(
                candidateName,
                jobPost.getTitle(),
                screeningScore,
                theoryInterviewScore,
                technicalInterviewScore,
                softSkillsScore
        );

        // 7. Build response
        return new CandidateDrawerDetailResponse(
                application.getId().toString(),
                application.getCandidateUserId().toString(),
                candidateName,
                candidateEmail,
                application.getCvUrl(),
                application.getCoverLetter(),
                application.getAppliedAt(),
                application.getStatus().name(),
                hiringProcessId,
                currentStage,
                screeningScore,
                screeningSummary,
                theoryInterviewScore,
                technicalInterviewScore,
                softSkillsScore,
                executiveReport,
                new CandidateDrawerDetailResponse.InterviewRecording(
                        interviewAvailable || recordingKey != null,
                        recordingKey,
                        recordingKey,
                        null
                ),
                stages
        );
    }

    private CandidateDrawerDetailResponse.ExecutiveReport buildExecutiveReport(
            String candidateName,
            String jobTitle,
            Double screeningScore,
            Integer theoryScore,
            Integer technicalScore,
            Integer softSkillsScore
    ) {
        List<Integer> scores = new ArrayList<>();
        if (screeningScore != null) {
            scores.add(screeningScore.intValue());
        }
        if (theoryScore != null) {
            scores.add(theoryScore);
        }
        if (technicalScore != null) {
            scores.add(technicalScore);
        }
        if (softSkillsScore != null) {
            scores.add(softSkillsScore);
        }

        if (scores.isEmpty()) {
            return new CandidateDrawerDetailResponse.ExecutiveReport(false, null, null, null, null);
        }

        int average = Math.round((float) scores.stream().mapToInt(Integer::intValue).average().orElse(0));
        String recommendation = average >= 80
                ? "Recomendado para avanzar con prioridad."
                : average >= 65
                ? "Recomendado con revision complementaria del equipo."
                : "No recomendado para avanzar sin una validacion adicional.";

        String summary = "Informe IA consolidado para " + candidateName + " en la postulacion a " + jobTitle
                + ". Score promedio actual: " + average + "/100.";
        String strengths = buildStrengths(screeningScore, theoryScore, technicalScore, softSkillsScore);
        String opportunities = buildOpportunities(screeningScore, theoryScore, technicalScore, softSkillsScore);

        return new CandidateDrawerDetailResponse.ExecutiveReport(
                true,
                summary,
                recommendation,
                strengths,
                opportunities
        );
    }

    private String buildStrengths(Double screeningScore, Integer theoryScore, Integer technicalScore, Integer softSkillsScore) {
        List<String> strengths = new ArrayList<>();
        if (screeningScore != null && screeningScore >= 75) {
            strengths.add("Buen ajuste curricular");
        }
        if (theoryScore != null && theoryScore >= 75) {
            strengths.add("Base teorica solida");
        }
        if (technicalScore != null && technicalScore >= 75) {
            strengths.add("Desempeno practico competitivo");
        }
        if (softSkillsScore != null && softSkillsScore >= 75) {
            strengths.add("Comunicacion y habilidades blandas favorables");
        }
        return strengths.isEmpty() ? "Sin fortalezas concluyentes registradas aun." : String.join("; ", strengths) + ".";
    }

    private String buildOpportunities(Double screeningScore, Integer theoryScore, Integer technicalScore, Integer softSkillsScore) {
        List<String> opportunities = new ArrayList<>();
        if (screeningScore != null && screeningScore < 75) {
            opportunities.add("Validar mejor el ajuste curricular");
        }
        if (theoryScore != null && theoryScore < 75) {
            opportunities.add("Profundizar fundamentos teoricos");
        }
        if (technicalScore != null && technicalScore < 75) {
            opportunities.add("Revisar desempeno practico");
        }
        if (softSkillsScore != null && softSkillsScore < 75) {
            opportunities.add("Observar comunicacion en entrevista final");
        }
        return opportunities.isEmpty() ? "Mantener seguimiento en la siguiente etapa del proceso." : String.join("; ", opportunities) + ".";
    }

    private List<CandidateDrawerDetailResponse.StageTimeline> buildTimeline(String currentStage) {
        List<CandidateDrawerDetailResponse.StageTimeline> stages = new ArrayList<>();

        String[][] stageDefs = {
                {"SUBMITTED", "Postulación recibida"},
                {"SCREENING", "Evaluación curricular"},
                {"THEORY_INTERVIEW", "Entrevista teórica"},
                {"TECHNICAL_INTERVIEW", "Entrevista técnica"},
                {"UNDER_REVIEW", "Revisión final"},
                {"APPROVED", "Aprobado"},
                {"HIRED", "Contratado"}
        };

        boolean foundCurrent = false;
        for (String[] def : stageDefs) {
            String stageName = def[0];
            String label = def[1];

            String status;
            if (stageName.equals(currentStage)) {
                status = "CURRENT";
                foundCurrent = true;
            } else if (!foundCurrent) {
                status = "COMPLETED";
            } else {
                status = "PENDING";
            }

            stages.add(new CandidateDrawerDetailResponse.StageTimeline(
                    stageName,
                    label,
                    status,
                    status.equals("COMPLETED") ? Instant.now() : null
            ));
        }

        return stages;
    }
}
