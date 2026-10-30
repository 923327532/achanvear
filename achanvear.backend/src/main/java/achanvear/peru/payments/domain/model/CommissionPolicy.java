package achanvear.peru.payments.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Política de comisiones de la plataforma.
 * Define cómo se calculan las comisiones para cada transacción.
 */
public final class CommissionPolicy {

    private CommissionPolicy() {}

    // Comisión de la plataforma: 5% por hito
    private static final BigDecimal PLATFORM_COMMISSION_PERCENTAGE = new BigDecimal("5.00");

    // Comisión de Mercado Pago: 3.99% + tarifa fija
    private static final BigDecimal MP_COMMISSION_PERCENTAGE = new BigDecimal("3.99");
    private static final BigDecimal MP_FIXED_FEE = new BigDecimal("0.50");

    /**
     * Calcula las comisiones para un monto dado.
     */
    public static CommissionBreakdown calculateCommission(BigDecimal amount) {
        return calculateCommission(amount, PLATFORM_COMMISSION_PERCENTAGE);
    }

    public record Tier(BigDecimal minimumInclusive, BigDecimal maximumInclusive, BigDecimal percentage) {}
    private static final java.util.List<Tier> TIERS = java.util.List.of(
            new Tier(BigDecimal.ZERO, new BigDecimal("4999.99"), new BigDecimal("5.00")),
            new Tier(new BigDecimal("5000.00"), new BigDecimal("15000.00"), new BigDecimal("4.00")),
            new Tier(new BigDecimal("15000.01"), null, new BigDecimal("3.00")));
    public static java.util.List<Tier> getTiers() { return TIERS; }

    public static BigDecimal platformRateForProject(BigDecimal projectTotal, boolean firstProject) {
        if (projectTotal == null || projectTotal.signum() <= 0) throw new IllegalArgumentException("Project amount must be positive");
        if (firstProject) return BigDecimal.ZERO;
        return TIERS.stream().filter(t -> projectTotal.compareTo(t.minimumInclusive()) >= 0 &&
                        (t.maximumInclusive() == null || projectTotal.compareTo(t.maximumInclusive()) <= 0))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Project amount must use at most two decimal places")).percentage();
    }

    public static CommissionBreakdown calculateCommission(BigDecimal amount, BigDecimal platformPercentage) {
        if (amount == null || amount.signum() < 0) throw new IllegalArgumentException("Invalid amount");
        BigDecimal platformCommission = amount
                .multiply(platformPercentage)
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
    public static BigDecimal getProcessorFixedFee() { return MP_FIXED_FEE; }

    public static BigDecimal getMpCommissionPercentage() {
        return MP_COMMISSION_PERCENTAGE;
    }

    public record CommissionBreakdown(
            BigDecimal platformCommission,
            BigDecimal mpCommission,
            BigDecimal freelancerAmount
    ) {}
}
