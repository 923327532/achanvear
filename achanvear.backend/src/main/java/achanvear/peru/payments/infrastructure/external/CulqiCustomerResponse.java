package achanvear.peru.payments.infrastructure.external;

/**
 * Respuesta de Culqi al registrar un cliente.
 * Devuelve {@code cus_} como id.
 */
public record CulqiCustomerResponse(
        String id,
        String object,
        String email
) {
}
