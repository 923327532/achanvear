package achanvear.peru.payments.application.port.out;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
public interface PaymentProjectLookup {
    Map<UUID, String> findTitles(Collection<UUID> projectIds);
}
