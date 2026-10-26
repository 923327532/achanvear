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

    private final org.springframework.jdbc.core.JdbcTemplate jdbc;
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
            IdentityCandidateLookupPort identityCandidateLookupPort, org.springframework.jdbc.core.JdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
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

        if (!application.getJobPostId().toString().equals(jobId)) {
            throw new ResourceNotFoundException("Application does not belong to this job");
        }
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
        String screeningSummary = application.getScreeningSummary();
        String hiringProcessId = null;

        if (application.getStatus().name().equals("REJECTED")) {
            currentStage = "REJECTED";
        } else if (application.getStatus().name().equals("HIRED")) {
            currentStage = "HIRED";
        } else if (hiringProcessOpt.isPresent()) {
            HiringProcess hp = hiringProcessOpt.get();
            hiringProcessId = hp.getId().toString();
            currentStage = hp.getStage().name();
        } else if (screeningScore != null && application.getStatus().name().equals("IN_REVIEW")) {
            currentStage = "SCREENING_REVIEW";
        } else if (application.getStatus().name().equals("SHORTLISTED")) {
            currentStage = "THEORY_INTERVIEW";
        } else if (application.getStatus().name().equals("HIRED")
                || application.getStatus().name().equals("REJECTED")) {
            currentStage = application.getStatus().name();
        }

        // 5. Get interview data
        Integer theoryInterviewScore = application.getTheoryScore();
        Integer technicalInterviewScore = application.getTechnicalScore();
        Integer softSkillsScore = null;
        boolean interviewAvailable = false;
        String recordingKey = null;

        // Match the candidate AND this job/process. Interview ids are independent ids.
        var evaluations = jdbc.query("""
                SELECT i.id, i.interview_type, i.status, i.score, i.recording_file_key,
                       d.communication_score
                FROM interviews i
                LEFT JOIN interview_evaluation_details d ON d.interview_id = i.id
                WHERE i.candidate_id = ? AND i.hiring_process_id IN (?, ?)
                ORDER BY i.updated_at DESC NULLS LAST, i.created_at DESC NULLS LAST, i.id DESC
                """, (rs, row) -> new EvaluationRow(rs.getString("interview_type"), rs.getString("status"),
                        (Integer) rs.getObject("score"), rs.getString("recording_file_key"),
                        (Integer) rs.getObject("communication_score")),
                application.getCandidateUserId().toString(), jobId, hiringProcessId);
        boolean theoryFound = false;
        boolean technicalFound = false;
        interviewAvailable = !evaluations.isEmpty();
        for (var evaluation : evaluations) {
            if (recordingKey == null && evaluation.recordingKey() != null && !evaluation.recordingKey().isBlank()) {
                recordingKey = evaluation.recordingKey();
            }
            if (!"COMPLETED".equals(evaluation.status()) || evaluation.score() == null) continue;
            if ("THEORY".equals(evaluation.type()) && !theoryFound) {
                theoryInterviewScore = evaluation.score();
                theoryFound = true;
            } else if ("TECHNICAL".equals(evaluation.type()) && !technicalFound) {
                technicalInterviewScore = evaluation.score();
                softSkillsScore = evaluation.communicationScore();
                technicalFound = true;
            }
        }

        // 6. Build timeline
        List<CandidateDrawerDetailResponse.StageTimeline> stages = buildTimeline(
                currentStage,
                screeningScore != null
        );
        java.util.Map<String, Instant> completionDates = new java.util.HashMap<>();
        jdbc.query("SELECT stage, completed_at FROM hiring_stage_completions WHERE job_id = ? AND candidate_id = ?",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> completionDates.put(rs.getString("stage"), rs.getTimestamp("completed_at").toInstant()),
                application.getJobPostId(), application.getCandidateUserId());
        completionDates.put("SUBMITTED", application.getAppliedAt());
        stages = stages.stream().map(stage -> new CandidateDrawerDetailResponse.StageTimeline(
                stage.stage(), stage.label(), stage.status(),
                "COMPLETED".equals(stage.status()) ? completionDates.get(stage.stage()) : null)).toList();
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

    private record EvaluationRow(String type, String status, Integer score, String recordingKey,
                                 Integer communicationScore) {}

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

    private List<CandidateDrawerDetailResponse.StageTimeline> buildTimeline(
            String currentStage,
            boolean screeningCompleted
    ) {
        List<CandidateDrawerDetailResponse.StageTimeline> stages = new ArrayList<>();
        if ("REJECTED".equals(currentStage)) {
            stages.add(new CandidateDrawerDetailResponse.StageTimeline(
                    "SUBMITTED", "Postulación recibida", "COMPLETED", null
            ));
            if (screeningCompleted) {
                stages.add(new CandidateDrawerDetailResponse.StageTimeline(
                        "SCREENING", "Evaluación curricular",
                        "COMPLETED", null
                ));
            }
            stages.add(new CandidateDrawerDetailResponse.StageTimeline(
                    "REJECTED", "No continúa", "CURRENT", null
            ));
            return stages;
        }

        String[][] stageDefs = {
                {"SUBMITTED", "Postulación recibida"},
                {"SCREENING", "Evaluación curricular"},
                {"SCREENING_REVIEW", "Revisión de recomendación IA"},
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
                    null
            ));
        }

        return stages;
    }
}
