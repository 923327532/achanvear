package achanvear.peru.payments.domain.model;

public enum MilestoneStatus {
    PENDING,           // Creado, esperando depósito
    FUNDED,            // Dinero depositado y retenido
    IN_PROGRESS,       // Freelancer trabajando
    READY_FOR_REVIEW,  // Freelancer entregó trabajo
    RELEASED,          // Cliente liberó pago
    DISPUTED,          // Hay disputa
    REFUNDED           // Dinero devuelto al cliente
}
