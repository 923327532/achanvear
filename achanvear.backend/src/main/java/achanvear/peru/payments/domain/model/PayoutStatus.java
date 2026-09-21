package achanvear.peru.payments.domain.model;

/**
 * Estados de una solicitud de retiro (dispersión de fondos).
 */
public enum PayoutStatus {
    REQUESTED,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}
