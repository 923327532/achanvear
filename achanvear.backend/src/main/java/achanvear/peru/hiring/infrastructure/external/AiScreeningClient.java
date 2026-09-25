package achanvear.peru.hiring.infrastructure.external;

import achanvear.peru.hiring.application.command.StartScreeningCommand;
import achanvear.peru.hiring.domain.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP que conecta con el Agente Python (FastAPI)
 * para evaluar candidatos en el screening inicial.
 *
 * Endpoint Python: POST /screening/evaluate
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
            Map<String, Object> job = new LinkedHashMap<>();
            job.put("title", text(command.jobTitle()));
            job.put("description", text(command.jobDescription()));
            job.put("required_skills", list(command.requiredSkills()));
            job.put("experience_min", number(command.experienceMin()));
            job.put("career", text(command.career()));

            Map<String, Object> candidate = new LinkedHashMap<>();
            candidate.put("user_id", text(command.candidateId()));
            candidate.put("name", text(command.candidateName()));
            candidate.put("skills", list(command.candidateSkills()));
            candidate.put("experience_years", number(command.candidateExperienceYears()));
            candidate.put("career", text(command.candidateCareer()));
            candidate.put("biography", text(command.candidateBiography()));
            candidate.put("cv_url", text(command.candidateCvUrl()));
            candidate.put("cv_data", text(command.candidateCvData()));
            candidate.put("cover_letter", text(command.coverLetter()));

            var response = restClient.post()
                    .uri("/screening/evaluate")
                    .body(Map.of(
                            "job", job,
                            "candidates", List.of(candidate),
                            "required_score_threshold", command.requiredScoreThreshold() != null
                                    ? command.requiredScoreThreshold()
                                    : 70.0
                    ))
                    .retrieve()
                    .body(ScreeningApiResponse.class);

            if (response != null && response.selected_candidates() != null
                    && !response.selected_candidates().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> selected = (Map<String, Object>) response.selected_candidates().get(0);
                double score = ((Number) selected.getOrDefault("score", 0)).doubleValue();
                String sessionId = (String) selected.getOrDefault("session_id", "");

                return new ScreeningResult(
                        command.candidateId(),
                        true,
                        score,
                        "Seleccionado con score: " + score + " | Sesion: " + sessionId
                );
            }

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

            return new ScreeningResult(
                    command.candidateId(),
                    false,
                    0.0,
                    "No se pudo evaluar con el agente IA"
            );

        } catch (Exception e) {
            return new ScreeningResult(
                    command.candidateId(),
                    false,
                    0.0,
                    "Evaluacion IA no disponible. La postulacion queda sin entrevista automatica: " + e.getMessage()
            );
        }
    }

    private String text(String value) {
        return value == null ? "" : value;
    }

    private int number(Integer value) {
        return value == null ? 0 : value;
    }

    private List<String> list(List<String> value) {
        return value == null ? List.of() : value;
    }

    @SuppressWarnings("rawtypes")
    private record ScreeningApiResponse(
            List selected_candidates,
            List rejected_candidates,
            int total_evaluated,
            int total_selected
    ) {}
}
