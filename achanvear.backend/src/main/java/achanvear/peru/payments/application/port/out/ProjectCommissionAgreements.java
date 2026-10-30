package achanvear.peru.payments.application.port.out;
import java.math.BigDecimal;
import java.util.UUID;
public interface ProjectCommissionAgreements {
    BigDecimal platformPercentage(UUID projectId);
    void assertPaymentAllowed(UUID projectId);
}
