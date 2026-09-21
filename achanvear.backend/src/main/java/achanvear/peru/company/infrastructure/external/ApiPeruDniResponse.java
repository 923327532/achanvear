package achanvear.peru.company.infrastructure.external;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ApiPeruDniResponse(
        boolean success,
        DniData data
) {
    public record DniData(
            String numero,
            @JsonProperty("nombre_completo")
            String nombreCompleto,
            String nombres,
            @JsonProperty("apellido_paterno")
            String apellidoPaterno,
            @JsonProperty("apellido_materno")
            String apellidoMaterno
    ) {}
}
