package achanvear.peru.payments.domain.model;

public enum EscrowStatus {
    PENDING,    // Creado, esperando confirmación de pago
    HELD,       // Dinero retenido en escrow
    RELEASED,   // Dinero liberado al freelancer
    REFUNDED,   // Dinero devuelto al cliente
    DISPUTED    // En disputa
}
