package achanvear.peru.interview.infrastructure.external;

import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.Question;

/**
 * Puerto de salida hacia el Agente Python (FastAPI).
 * Spring Boot orquesta, Python hace la IA.
 */
public interface AiInterviewerClient {

    // ── Theory Interview ────────────────────────────────────────────────

    record StartTheoryResponse(
            String session_id,
            Object profile,
            int total_questions,
            QuestionResponse current_question
    ) {}

    record QuestionResponse(int index, int total, String text) {}

    StartTheoryResponse startTheoryInterview(
            String sessionId, String career, String jobTitle, String profileId
    );

    // ── Answer Submission ───────────────────────────────────────────────

    record AnswerResponse(
            EvaluationResponse evaluation,
            String interview_status,
            Object next_question,
            Object theory_result
    ) {}

    record EvaluationResponse(int score, Object details) {}

    AnswerResponse submitTheoryAnswer(String sessionId, String answer);

    // ── Complete Theory ─────────────────────────────────────────────────

    record TheoryResultResponse(
            String session_id,
            double theory_score,
            boolean passed,
            Object scores_detail,
            String next_stage
    ) {}

    TheoryResultResponse completeTheoryInterview(String sessionId);

    // ── Technical Interview ─────────────────────────────────────────────

    record StartTechnicalResponse(
            String session_id,
            Object challenge
    ) {}

    StartTechnicalResponse startTechnicalInterview(
            String sessionId, String career, String jobTitle, String country
    );

    record SubmitTechnicalResponse(
            String session_id,
            Object evaluation,
            int violations_detected,
            double final_score,
            boolean passed
    ) {}

    SubmitTechnicalResponse submitTechnicalChallenge(
            String sessionId, String solution
    );

    // ── Screening ───────────────────────────────────────────────────────

    record ScreeningResponse(
            Object selected_candidates,
            Object rejected_candidates,
            int total_evaluated
    ) {}

    ScreeningResponse evaluateScreening(
            String jobTitle, String jobDescription, Object candidates
    );

    // ── Report ──────────────────────────────────────────────────────────

    record ReportResponse(
            String job_title,
            Object candidates,
            Object executive_summary,
            String pdf_url
    ) {}

    ReportResponse generateFinalReport(Object reportRequest);

    // ── Legacy (mantenido para compatibilidad) ──────────────────────────

    String generateNextQuestion(
            String interviewType, String candidateId, String interviewerProfileCode
    );

    AiAnswerEvaluation evaluateAnswer(
            Interview interview, String questionId, String answerContent
    );

    record AiAnswerEvaluation(
            Integer score,
            String feedback,
            Question nextQuestion,
            boolean interviewCompleted
    ) {}
}
