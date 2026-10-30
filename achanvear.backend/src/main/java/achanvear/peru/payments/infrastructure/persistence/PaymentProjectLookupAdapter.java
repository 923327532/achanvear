package achanvear.peru.payments.infrastructure.persistence;
import achanvear.peru.payments.application.port.out.PaymentProjectLookup;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public class PaymentProjectLookupAdapter implements PaymentProjectLookup {
    private final NamedParameterJdbcTemplate jdbc;
    public PaymentProjectLookupAdapter(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }
    public Map<UUID, String> findTitles(Collection<UUID> projectIds) {
        if (projectIds.isEmpty()) return Map.of();
        Map<UUID, String> titles = new HashMap<>();
        jdbc.query("SELECT id, title FROM freelance_projects WHERE id IN (:ids)", Map.of("ids", projectIds),
                (org.springframework.jdbc.core.RowCallbackHandler) row -> titles.put(row.getObject("id", UUID.class), row.getString("title")));
        return titles;
    }
}
