package achanvear.peru.identity.application.query;

/**
 * Bucket temporal (día / semana / mes) con el número de usuarios registrados.
 */
public record UserPeriodBucket(String period, long count) {
}
