package achanvear.peru.interview.infrastructure.external.impl;

import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.Question;
import achanvear.peru.interview.infrastructure.external.AiInterviewerClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP que conecta con el Agente Python (FastAPI).
 * 
 * Endpoints del agente Python:
 *   POST /theory-interview/start       → inicia sesion y devuelve primera pregunta
 *   POST /theory-interview/answer       → evalua respuesta y devuelve siguiente pregunta
 *   POST /theory-interview/result/{session_id} → obtiene resultado final teorico
 *   POST /technical-interview/start     → genera reto tecnico
 *   POST /technical-interview/submit/{session_id} → evalua solucion tecnica
 *   POST /technical-interview/violation → registra violacion anti-cheat
 *   POST /screening/evaluate           → evalua candidatos
 *   POST /reports/generate/{session_id}  → genera reporte final
 *   POST /session/create               → crea sesion en el orquestador Python
 *   GET  /session/{session_id}         → obtiene estado de sesion
 */
@Component
public class RealAiInterviewerClient implements AiInterviewerClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public RealAiInterviewerClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai.api.url}") String aiApiUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(aiApiUrl).build();
        this.objectMapper = new ObjectMapper();
    }

    // ── Session Management ──────────────────────────────────────────────

    /**
     * Crea una sesion en el orquestador Python.
     * Java debe llamar esto ANTES de iniciar cualquier entrevista.
     * Python genera su propio session_id internamente (uuid.uuid4()).
     * Retorna un Map con "session_id" (el UUID que Python asignó).
     */
    public Map<String, Object> createPythonSession(
            String candidateId, String jobId, String career, String jobTitle,
            String phone, String email
    ) {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("candidate_id", candidateId);
        body.put("job_id", jobId);
        body.put("career", career);
        body.put("job_title", jobTitle);
        if (phone != null) body.put("phone", phone);
        if (email != null) body.put("email", email);

        return restClient.post()
                .uri("/session/create")
                .body(body)
                .retrieve()
                .body(Map.class);
    }

    // ── Theory Interview ────────────────────────────────────────────────

    @Override
    public StartTheoryResponse startTheoryInterview(
            String sessionId, String career, String jobTitle, String profileId
    ) {
        var response = restClient.post()
                .uri("/theory-interview/start")
                .body(Map.of(
                        "session_id", sessionId,
                        "career", career,
                        "job_title", jobTitle
                ))
                .retrieve()
                .body(Map.class);

        if (response == null) return null;

        Map<String, Object> resp = response;
        Map<String, Object> currentQ = (Map<String, Object>) resp.get("current_question");
        QuestionResponse question = currentQ != null
                ? new QuestionResponse(
                        toInt(currentQ.get("index"), 1),
                        toInt(currentQ.get("total"), 8),
                        toString(currentQ.get("text"), "Describe tu experiencia profesional.")
                )
                : new QuestionResponse(1, 8, "Describe tu experiencia profesional.");

        String sid = toString(resp.get("session_id"), sessionId);
        int totalQ = toInt(resp.get("total_questions"), 8);

        return new StartTheoryResponse(sid, null, totalQ, question);
    }

    @Override
    @SuppressWarnings("unchecked")
    public AnswerResponse submitTheoryAnswer(String sessionId, String answer) {
        try {
            var response = restClient.post()
                    .uri("/theory-interview/answer")
                    .body(Map.of(
                            "session_id", sessionId,
                            "answer", answer
                    ))
                    .retrieve()
                    .body(Map.class);

            if (response == null) return null;

            Map<String, Object> resp = response;
            Map<String, Object> evalMap = (Map<String, Object>) resp.get("evaluation");
            EvaluationResponse eval = evalMap != null
                    ? new EvaluationResponse(
                            toInt(evalMap.get("score"), 0),
                            evalMap.get("details")
                    )
                    : new EvaluationResponse(0, null);

            String status = toString(resp.get("interview_status"), "in_progress");
            Object nextQNode = resp.get("next_question");
            Object theoryResultNode = resp.get("theory_result");

            return new AnswerResponse(eval, status, nextQNode, theoryResultNode);
        } catch (Exception e) {
            System.err.println("[submitTheoryAnswer] Error: " + e.getMessage());
            return null;
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public TheoryResultResponse completeTheoryInterview(String sessionId) {
        try {
            var response = restClient.post()
                    .uri("/theory-interview/result/" + sessionId)
                    .retrieve()
                    .body(Map.class);

            if (response == null) return null;

            Map<String, Object> resp = response;
            double theoryScore = toDouble(resp.get("theory_score"), 0.0);
            boolean passed = theoryScore >= 75.0;

            return new TheoryResultResponse(
                    sessionId,
                    theoryScore,
                    passed,
                    resp.get("scores_detail"),
                    theoryScore >= 75.0 ? "technical" : "failed"
            );
        } catch (Exception e) {
            // Fallback: si falla la conexion con Python
            return new TheoryResultResponse(sessionId, 75.0, true, List.of(), "technical");
        }
    }

    // ── Technical Interview ─────────────────────────────────────────────

    @Override
    @SuppressWarnings("unchecked")
    public StartTechnicalResponse startTechnicalInterview(
            String sessionId, String career, String jobTitle, String country
    ) {
        var response = restClient.post()
                .uri("/technical-interview/start")
                .body(Map.of(
                        "session_id", sessionId,
                        "career", career,
                        "job_title", jobTitle,
                        "country", country != null ? country : "Peru"
                ))
                .retrieve()
                .body(Map.class);

        if (response == null) return null;

        Map<String, Object> resp = response;
        return new StartTechnicalResponse(
                toString(resp.get("session_id"), sessionId),
                resp.get("challenge")
        );
    }

    @Override
    @SuppressWarnings("unchecked")
    public SubmitTechnicalResponse submitTechnicalChallenge(
            String sessionId, String solution
    ) {
        try {
            var response = restClient.post()
                    .uri("/technical-interview/submit/" + sessionId)
                    .body(Map.of("solution", solution))
                    .retrieve()
                    .body(Map.class);

            if (response == null) return null;

            Map<String, Object> resp = response;
            double techScore = toDouble(resp.get("tech_score"), 0.0);
            return new SubmitTechnicalResponse(
                    sessionId,
                    resp.get("evaluation"),
                    toInt(resp.get("violations_detected"), 0),
                    techScore,
                    techScore >= 75.0
            );
        } catch (Exception e) {
            return new SubmitTechnicalResponse(sessionId, null, 0, 75.0, true);
        }
    }

    // ── Screening ───────────────────────────────────────────────────────

    @Override
    @SuppressWarnings("unchecked")
    public ScreeningResponse evaluateScreening(
            String jobTitle, String jobDescription, Object candidates
    ) {
        var response = restClient.post()
                .uri("/screening/evaluate")
                .body(Map.of(
                        "job", Map.of(
                                "title", jobTitle,
                                "description", jobDescription
                        ),
                        "candidates", candidates
                ))
                .retrieve()
                .body(Map.class);

        if (response == null) return null;
        Map<String, Object> resp = response;
        return new ScreeningResponse(
                resp.get("selected_candidates"),
                resp.get("rejected_candidates"),
                toInt(resp.get("total_evaluated"), 0)
        );
    }

    // ── Report ──────────────────────────────────────────────────────────

    @Override
    @SuppressWarnings("unchecked")
    public ReportResponse generateFinalReport(Object reportRequest) {
        String sessionId = "unknown";
        if (reportRequest instanceof Map<?, ?> map) {
            Object sid = map.get("session_id");
            if (sid instanceof String) {
                sessionId = (String) sid;
            } else if (reportRequest instanceof SessionReportRequest sr) {
                sessionId = sr.sessionId();
            }
        }

        try {
            var response = restClient.post()
                    .uri("/reports/generate/" + sessionId)
                    .retrieve()
                    .body(Map.class);

            if (response == null) return null;

            Map<String, Object> resp = response;
            return new ReportResponse(
                    toString(resp.get("job_title"), ""),
                    resp.get("candidates"),
                    resp.get("executive_summary"),
                    toString(resp.get("pdf_url"), "")
            );
        } catch (Exception e) {
            return new ReportResponse("", List.of(), Map.of(), "");
        }
    }

    // ── Reportar Violacion Anti-Cheat ──────────────────────────────────

    public void reportViolationToPython(String sessionId, String type) {
        try {
            restClient.post()
                    .uri("/technical-interview/violation")
                    .body(Map.of(
                            "session_id", sessionId,
                            "type", type
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // Silenciar error de red
        }
    }

    // ── Helper para crear request de reporte ────────────────────────────

    public record SessionReportRequest(String sessionId, String jobTitle, String companyName) {}

    // ── Helpers para manejar Map con tipos seguros ──────────────────────

    private static int toInt(Object value, int defaultValue) {
        if (value instanceof Number n) return n.intValue();
        if (value instanceof String s) {
            try { return Integer.parseInt(s); } catch (NumberFormatException e) { return defaultValue; }
        }
        return defaultValue;
    }

    private static double toDouble(Object value, double defaultValue) {
        if (value instanceof Number n) return n.doubleValue();
        if (value instanceof String s) {
            try { return Double.parseDouble(s); } catch (NumberFormatException e) { return defaultValue; }
        }
        return defaultValue;
    }

    private static String toString(Object value, String defaultValue) {
        if (value instanceof String s) return s;
        return value != null ? value.toString() : defaultValue;
    }

    // ── Legacy methods (mantenidos por compatibilidad con la interfaz) ──

    @Override
    public String generateNextQuestion(
            String interviewType, String candidateId, String interviewerProfileCode
    ) {
        try {
            StartTheoryResponse resp = startTheoryInterview(
                    "session-" + candidateId, "", "Senior", interviewerProfileCode
            );
            if (resp != null && resp.current_question() != null) {
                return resp.current_question().text();
            }
        } catch (Exception ignored) {}
        return "Describe tu experiencia profesional y como se alinea con el puesto al que postulas.";
    }

    @Override
    @SuppressWarnings("unchecked")
    public AiAnswerEvaluation evaluateAnswer(
            Interview interview,
            String questionId,
            String answerContent
    ) {
        try {
            String sessionId = interview.getPythonSessionId();
            if (sessionId == null) {
                sessionId = interview.getId().toString();
            }
            AnswerResponse resp = submitTheoryAnswer(sessionId, answerContent);
            if (resp != null && resp.evaluation() != null) {
                String details = resp.evaluation().details() != null
                        ? resp.evaluation().details().toString()
                        : "Sin detalles";

                // Extraer siguiente pregunta si existe (ahora es Map, no JsonNode)
                Question nextQuestion = null;
                if (resp.next_question() instanceof Map nextQ) {
                    String text = toString(nextQ.get("text"), "");
                    int index = toInt(nextQ.get("index"), 1);
                    nextQuestion = new Question(
                            java.util.UUID.randomUUID().toString(),
                            text,
                            index
                    );
                    // Si hay siguiente pregunta, la entrevista NO ha terminado
                    return new AiAnswerEvaluation(
                            resp.evaluation().score(),
                            details,
                            nextQuestion,
                            false
                        );
                }

                // Si no hay siguiente pregunta, verificar si la IA dice que terminó
                boolean completed = "theory_completed".equals(resp.interview_status());
                return new AiAnswerEvaluation(
                        resp.evaluation().score(),
                        completed ? "Entrevista completada" : details,
                        null,
                        completed
                    );
            }
        } catch (Exception e) {
            // No tragar la excepción - loguearla y devolver respuesta genérica
            System.err.println("[evaluateAnswer] Error: " + e.getMessage());
        }
        // Fallback con 15 preguntas ÚNICAS (no repetir nunca)
        int answerCount = interview.getAnswers().size();
        
        // Máximo 15 preguntas en total
        if (answerCount >= 15) {
            return new AiAnswerEvaluation(50, "Entrevista completada", null, true);
        }
        
        String[] allFallbackQuestions = {
            "Cuéntame más sobre tu experiencia profesional.",
            "¿Qué te motivó a postularte a esta posición?",
            "Describe una situación donde trabajaste en equipo.",
            "¿Cómo manejas la presión en el trabajo?",
            "¿Dónde te ves en los próximos años?",
            "Describe un proyecto desafiante que hayas liderado.",
            "¿Qué herramientas técnicas dominas?",
            "Explica cómo resolverías un problema complejo en tu área.",
            "¿Cómo te mantienes actualizado en tu campo?",
            "Describe tu metodología de trabajo.",
            "¿Qué harías si un proyecto se atrasa?",
            "¿Cómo evalúas la calidad de tu trabajo?",
            "Describe tu experiencia con equipos multidisciplinarios.",
            "¿Qué feedback has recibido de tus superiores?",
            "Propón una mejora para el área en la que trabajas."
        };
        
        // Usar answerCount como índice directo (0-14), nunca repite
        String fallbackText = allFallbackQuestions[Math.min(answerCount, 14)];
        Question fallbackQuestion = new Question(
                java.util.UUID.randomUUID().toString(),
                fallbackText,
                answerCount + 1
        );
        return new AiAnswerEvaluation(50, "Evaluación temporal", fallbackQuestion, false);
    }
}
