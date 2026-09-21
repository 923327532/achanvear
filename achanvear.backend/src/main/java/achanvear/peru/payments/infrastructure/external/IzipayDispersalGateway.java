package achanvear.peru.payments.infrastructure.external;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Pasarela de dispersión de fondos (Izipay Dispersión).
 *
 * <p>NOTA: antes de producción, Tiyuy debe confirmar con Izipay el modelo comercial
 * de marketplace/freelance, costos, límites, tiempos y requisitos KYC. La implementación
 * actual usa un adaptador simulado hasta contar con credenciales reales.
 */
public interface IzipayDispersalGateway {

    /**
     * Solicita la dispersión de fondos hacia el método de retiro del profesional.
     * Devuelve el estado inicial de la operación en el proveedor.
     */
    DisbursementResult disperse(UUID payoutId, BigDecimal amount, String maskedCard, String cardToken);

    /**
     * Consulta el estado del desembolso en el proveedor.
     */
    DisbursementStatus getDisbursementStatus(String externalDisbursementId);

    record DisbursementResult(
            String externalDisbursementId,
            DisbursementStatus status,
            String message
    ) {}

    enum DisbursementStatus {
        PROCESSING,
        COMPLETED,
        FAILED
    }
}
