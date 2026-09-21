package achanvear.peru.jobs.web.request;

import jakarta.validation.constraints.NotBlank;

public record JobAiSuggestionRequest(
        @NotBlank(message = "El prompt es requerido")
        String prompt
) {}
