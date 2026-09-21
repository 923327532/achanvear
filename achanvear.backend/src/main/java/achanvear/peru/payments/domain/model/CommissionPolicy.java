package achanvear.peru.payments.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Política de comisiones de la plataforma.
 * Define cómo se calculan las comisiones para cada transacción.
 */
public final class CommissionPolicy {

    private CommissionPolicy() {}

    // Comisión de la plataforma: 10% del monto total
    private static final BigDecimal PLATFORM_COMMISSION_PERCENTAGE = new BigDecimal("10.00");

    // Comisión de Mercado Pago: 3.99% + tarifa fija
    private static final BigDecimal MP_COMMISSION_PERCENTAGE = new BigDecimal("3.99");
    private static final BigDecimal MP_FIXED_FEE = new BigDecimal("0.50");

    /**
     * Calcula las comisiones para un monto dado.
     */
    public static CommissionBreakdown calculateCommission(BigDecimal amount) {
        BigDecimal platformCommission = amount
                .multiply(PLATFORM_COMMISSION_PERCENTAGE)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        BigDecimal mpCommission = amount
                .multiply(MP_COMMISSION_PERCENTAGE)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
                .add(MP_FIXED_FEE);

        BigDecimal totalDeductions = platformCommission.add(mpCommission);
        BigDecimal freelancerAmount = amount.subtract(totalDeductions);

        // Asegurar que el freelancer reciba al menos algo
        if (freelancerAmount.compareTo(BigDecimal.ZERO) < 0) {
            freelancerAmount = BigDecimal.ZERO;
        }

        return new CommissionBreakdown(platformCommission, mpCommission, freelancerAmount);
    }

    /**
     * Obtiene el porcentaje de comisión de la plataforma.
     */
    public static BigDecimal getPlatformCommissionPercentage() {
        return PLATFORM_COMMISSION_PERCENTAGE;
    }

    /**
     * Obtiene el porcentaje de comisión de Mercado Pago.
     */
    public static BigDecimal getMpCommissionPercentage() {
        return MP_COMMISSION_PERCENTAGE;
    }

    public record CommissionBreakdown(
            BigDecimal platformCommission,
            BigDecimal mpCommission,
            BigDecimal freelancerAmount
    ) {}
}
