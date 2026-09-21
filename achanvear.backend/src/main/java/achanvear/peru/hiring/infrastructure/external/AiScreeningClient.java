package achanvear.peru.hiring.infrastructure.external;

import achanvear.peru.hiring.application.command.StartScreeningCommand;
import achanvear.peru.hiring.domain.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP que conecta con el Agente Python (FastAPI)
 * para evaluar candidatos en el screening inicial.
 * 
 * Endpoint Python: POST /screening/evaluate
 * 
 * Respuesta esperada del agente:
 * {
 *   "selected_candidates": [{
 *     "user_id": "...",
 *     "name": "...",
 *     "score": 95,
 *     "session_id": "uuid",
 *     "notified_whatsapp": false,
 *     "notified_email": false
 *   }],
 *   "rejected_candidates": [{
 *     "user_id": "...",
 *     "name": "...",
 *     "score": 15,
 *     "match_percentage": 15,
 *     "reason": "...",
 *     "recommended": false
 *   }],
 *   "total_evaluated": 2,
 *   "total_selected": 1
 * }
 */
@Component
public class AiScreeningClient {

    private final RestClient restClient;

    public AiScreeningClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai.api.url}") String aiApiUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(aiApiUrl).build();
    }

    public ScreeningResult evaluate(StartScreeningCommand command) {
        try {
            // Construir payload para el agente Python
            Map<String, Object> job = Map.of(
                    "title", command.jobTitle(),
                    "description", command.jobDescription(),
                    "required_skills", command.requiredSkills(),
                    "experience_min", command.experienceMin(),
                    "career", command.career()
            );

            Map<String, Object> candidate = Map.of(
                    "user_id", command.candidateId(),
                    "name", command.candidateName(),
                    "skills", command.candidateSkills(),
                    "experience_years", command.candidateExperienceYears(),
                    "career", command.candidateCareer()
            );

            // Llamar al agente Python
            var response = restClient.post()
                    .uri("/screening/evaluate")
                    .body(Map.of(
                            "job", job,
                            "candidates", List.of(candidate)
                    ))
                    .retrieve()
                    .body(ScreeningApiResponse.class);

            if (response != null && response.selected_candidates() != null
                    && !response.selected_candidates().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> selected = (Map<String, Object>) response.selected_candidates().get(0);
                double score = ((Number) selected.getOrDefault("score", 0)).doubleValue();
                String sessionId = (String) selected.getOrDefault("session_id", "");
                boolean isSelected = score >= 70;

                return new ScreeningResult(
                        command.candidateId(),
                        isSelected,
                        score,
                        "Seleccionado con score: " + score + " | Sesión: " + sessionId
                );
            }

            // Si hay rejected_candidates, tomamos la información
            if (response != null && response.rejected_candidates() != null
                    && !response.rejected_candidates().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> rejected = (Map<String, Object>) response.rejected_candidates().get(0);
                double score = ((Number) rejected.getOrDefault("score", 0)).doubleValue();
                String reason = (String) rejected.getOrDefault("reason", "No cumple con los requisitos");

                return new ScreeningResult(
                        command.candidateId(),
                        false,
                        score,
                        reason
                );
            }

            // Fallback si no hay respuesta del agente
            return new ScreeningResult(
                    command.candidateId(),
                    false,
                    0.0,
                    "No se pudo evaluar con el agente IA"
            );

        } catch (Exception e) {
            // Fallback seguro si el agente Python no está disponible
            return new ScreeningResult(
                    command.candidateId(),
                    true,
                    75.0,
                    "Evaluación temporal (agente IA no disponible): " + e.getMessage()
            );
        }
    }

    @SuppressWarnings("rawtypes")
    private record ScreeningApiResponse(
            List selected_candidates,
            List rejected_candidates,
            int total_evaluated,
            int total_selected
    ) {}
}
