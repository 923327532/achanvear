package achanvear.peru.freelance.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Solicitud para editar una sección específica del CV con IA.
 */
public record CvEditSectionRequest(
        @NotBlank(message = "El nombre de la sección es obligatorio")
        String sectionName,
        
        @NotBlank(message = "La instrucción de edición es obligatoria")
        @Size(min = 10, max = 1000, message = "La instrucción debe tener entre 10 y 1000 caracteres")
        String instruction
) {}
