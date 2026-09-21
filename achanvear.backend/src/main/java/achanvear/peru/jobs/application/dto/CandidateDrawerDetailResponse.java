package achanvear.peru.jobs.application.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO agregador que devuelve el detalle completo de un candidato
 * para el drawer lateral. Junta datos de:
 *   - jobs (postulación base)
 *   - hiring (screening, etapa actual, score, reporte)
 *   - interview (entrevista, puntajes, grabación S3)
 */
public record CandidateDrawerDetailResponse(
        // ─── Datos base de la postulación ──────────────────────────────────
        String applicationId,
        String candidateUserId,
        String candidateName,
        String candidateEmail,
        String cvUrl,
        String coverLetter,
        Instant appliedAt,
        String applicationStatus,

        // ─── Datos del hiring process ──────────────────────────────────────
        String hiringProcessId,
        String currentStage,
        Double screeningScore,
        String screeningSummary,

        // ─── Puntajes de entrevistas ───────────────────────────────────────
        Integer theoryInterviewScore,
        Integer technicalInterviewScore,
        Integer softSkillsScore,

        // ─── Reporte ejecutivo ─────────────────────────────────────────────
        ExecutiveReport executiveReport,

        // ─── Grabación de entrevista ───────────────────────────────────────
        InterviewRecording interviewRecording,

        // ─── Timeline de fases ─────────────────────────────────────────────
        List<StageTimeline> stages
) {

    public record ExecutiveReport(
            boolean available,
            String summary,
            String recommendation,
            String strengths,
            String areasOfOpportunity
    ) {}

    public record InterviewRecording(
            boolean available,
            String videoUrl,
            String audioUrl,
            Integer durationSeconds
    ) {}

    public record StageTimeline(
            String stage,
            String label,
            String status, // COMPLETED, CURRENT, PENDING
            Instant completedAt
    ) {}
}
