package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.JobAiSuggestionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class JobAiSuggestionService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.provider:groq}")
    private String aiProvider;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${groq.base-url:https://api.groq.com/openai/v1}")
    private String groqBaseUrl;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiBaseUrl;

    public JobAiSuggestionService(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public JobAiSuggestionResponse suggest(String userPrompt) {
        String prompt = buildPrompt(userPrompt);
        String aiResponse = callAiApi(prompt);
        return parseResponse(aiResponse);
    }

    public <T> T suggest(String userPrompt, String systemPrompt, Class<T> responseType) {
        String fullPrompt = systemPrompt + "\n\n## SOLICITUD DEL USUARIO:\n" + userPrompt;
        String aiResponse = callAiApi(fullPrompt);
        try {
            String cleanJson = aiResponse.trim();
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.replaceAll("```(?:json)?", "").trim();
            }
            return objectMapper.readValue(cleanJson, responseType);
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta de IA: " + e.getMessage() +
                    ". Respuesta raw: " + (aiResponse != null ? aiResponse.substring(0, Math.min(aiResponse.length(), 300)) : "null"), e);
        }
    }

    private String buildPrompt(String userPrompt) {
        return """
            Eres un asistente experto en creacion de ofertas laborales para una plataforma de freelancers.
            Genera una sugerencia de oferta laboral en formato JSON estricto basandote en la siguiente solicitud del usuario.

            ## REGLAS:
            1. Usa los datos proporcionados por el usuario como base.
            2. Puedes inferir detalles tipicos de la industria y el rol solicitado.
            3. No inventes datos que contradigan lo que el usuario pide.
            4. Responde SOLO con el JSON, sin texto adicional, sin bloques markdown.
            5. Todos los textos en espanol.
            6. Sin emojis, sin lenguaje informal.

            ## SOLICITUD DEL USUARIO:
            %s

            ## FORMATO DE RESPUESTA (JSON ESTRICTO):
            {
              "title": "Titulo del puesto sugerido",
              "description": "Descripcion del puesto con responsabilidades, equipo y contexto (2-4 parrafos)",
              "requirements": "Requisitos tecnicos, experiencia necesaria, formacion academica (lista con guiones)",
              "type": "FULL_TIME | PART_TIME | FREELANCE",
              "location": "Ubicacion sugerida o 'Remoto'",
              "salaryMin": numero minimo en soles,
              "salaryMax": numero maximo en soles
            }

            ## IMPORTANTE:
            - El campo 'type' debe ser exactamente uno de: FULL_TIME, PART_TIME, FREELANCE
            - salaryMin y salaryMax deben ser numeros enteros (sin comillas)
            - Si el usuario no especifica rango salarial, infiere uno apropiado para el rol en Peru
            - La descripcion debe ser profesional y detallada
            - Los requisitos deben ser especificos y relevantes

            Devuelve SOLO el JSON, sin texto adicional.
            """.formatted(userPrompt);
    }

    private String callAiApi(String prompt) {
        boolean useGemini = "gemini".equalsIgnoreCase(aiProvider);
        System.out.println(">>> JOB AI SUGGESTION - PROVEEDOR: " + (useGemini ? "GEMINI" : "GROQ"));

        try {
            if (useGemini) {
                return callGeminiApi(prompt);
            }
            return callGroqApi(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Error al llamar a " + (useGemini ? "Gemini" : "Groq") + " API: " + e.getMessage(), e);
        }
    }

    private String callGroqApi(String prompt) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groqModel);

        ArrayNode messages = requestBody.putArray("messages");
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 4096);
        requestBody.put("top_p", 0.95);

        String url = groqBaseUrl + "/chat/completions";

        String response = restClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .body(requestBody.toString())
                .retrieve()
                .body(String.class);

        return extractTextFromOpenAiResponse(response);
    }

    private String callGeminiApi(String prompt) {
        String url = geminiBaseUrl + "/models/" + geminiModel + ":generateContent";

        ObjectNode requestBody = objectMapper.createObjectNode();

        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        ObjectNode part = parts.addObject();
        part.put("text", prompt);

        ObjectNode generationConfig = requestBody.putObject("generationConfig");
        generationConfig.put("temperature", 0.3);
        generationConfig.put("maxOutputTokens", 4096);
        generationConfig.put("topP", 0.95);

        String response = restClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", geminiApiKey)
                .body(requestBody.toString())
                .retrieve()
                .body(String.class);

        return extractTextFromGeminiResponse(response);
    }

    private String extractTextFromOpenAiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode choice = root.path("choices").get(0);
            if (choice == null) {
                throw new RuntimeException("Respuesta sin choices");
            }
            JsonNode text = choice.path("message").path("content");
            if (text == null || text.isMissingNode()) {
                String finishReason = choice.path("finish_reason").asText();
                throw new RuntimeException("Respuesta sin contenido. finish_reason: " + finishReason);
            }
            return text.asText();
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta: " + e.getMessage(), e);
        }
    }

    private String extractTextFromGeminiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidate = root.path("candidates").get(0);
            if (candidate == null) {
                JsonNode promptFeedback = root.path("promptFeedback");
                if (!promptFeedback.isMissingNode()) {
                    throw new RuntimeException("Gemini bloqueo la solicitud: " + promptFeedback.toString());
                }
                throw new RuntimeException("Respuesta de Gemini sin candidates");
            }
            JsonNode text = candidate.path("content").path("parts").get(0).path("text");
            if (text == null || text.isMissingNode()) {
                String finishReason = candidate.path("finishReason").asText();
                throw new RuntimeException("Respuesta sin contenido de Gemini. finishReason: " + finishReason);
            }
            return text.asText();
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta de Gemini: " + e.getMessage(), e);
        }
    }

    private JobAiSuggestionResponse parseResponse(String aiText) {
        try {
            String cleanJson = aiText.trim();
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.replaceAll("```(?:json)?", "").trim();
            }

            JsonNode root = objectMapper.readTree(cleanJson);

            String title = getStringOrNull(root, "title");
            String description = getStringOrNull(root, "description");
            String requirements = getStringOrNull(root, "requirements");
            String type = getStringOrNull(root, "type");
            String location = getStringOrNull(root, "location");
            Integer salaryMin = root.has("salaryMin") && !root.path("salaryMin").isNull()
                    ? root.path("salaryMin").asInt() : null;
            Integer salaryMax = root.has("salaryMax") && !root.path("salaryMax").isNull()
                    ? root.path("salaryMax").asInt() : null;

            return new JobAiSuggestionResponse(title, description, requirements, type, location, salaryMin, salaryMax);
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear sugerencia de IA: " + e.getMessage() +
                    ". Respuesta raw: " + (aiText != null ? aiText.substring(0, Math.min(aiText.length(), 300)) : "null"), e);
        }
    }

    private String getStringOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return (value.isNull() || value.isMissingNode()) ? null : value.asText();
    }
}
