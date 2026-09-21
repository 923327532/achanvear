package achanvear.peru.payments.infrastructure.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Adaptador SIMULADO de Izipay Dispersión de Fondos.
 *
 * <p>Genera un identificador externo y responde PROCESSING -> COMPLETED al consultar.
 * Reemplazar por una implementación real (llamada HTTP a la API de Izipay) cuando
 * Tiyuy tenga credenciales y contrato de dispersión.
 */
@Component
@ConditionalOnProperty(name = "app.payments.izipay.enabled", havingValue = "false", matchIfMissing = true)
public class SimulatedIzipayDispersalGateway implements IzipayDispersalGateway {

    private static final Logger log = LoggerFactory.getLogger(SimulatedIzipayDispersalGateway.class);

    @Override
    public DisbursementResult disperse(UUID payoutId, BigDecimal amount, String maskedCard, String cardToken) {
        log.info("[SIMULATED IZIPAY] Dispersión solicitada payout={} amount={} card={}", payoutId, amount, maskedCard);
        return new DisbursementResult(
                "IZP-SIM-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(),
                DisbursementStatus.PROCESSING,
                "Solicitud de dispersión recibida (simulada)"
        );
    }

    @Override
    public DisbursementStatus getDisbursementStatus(String externalDisbursementId) {
        log.info("[SIMULATED IZIPAY] Consulta de desembolso id={}", externalDisbursementId);
        return DisbursementStatus.COMPLETED;
    }
}
