package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.repository.CompanyProjectStatsRepository;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;

@Repository
public class CompanyProjectStatsRepositoryImpl implements CompanyProjectStatsRepository {

    private final DataSource dataSource;
    private final SubscriptionRepository subscriptionRepository;

    public CompanyProjectStatsRepositoryImpl(DataSource dataSource, SubscriptionRepository subscriptionRepository) {
        this.dataSource = dataSource;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Override
    public int countPublishedProjectsByCompany(UUID companyUserId) {
        String sql = "SELECT COUNT(*) FROM job_posts WHERE company_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setObject(1, companyUserId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error counting projects for company: " + companyUserId, e);
        }
        return 0;
    }

    @Override
    public boolean hasActiveSubscription(UUID companyUserId) {
        return subscriptionRepository.findByCompanyUserId(companyUserId)
                .map(sub -> sub.isActive())
                .orElse(false);
    }
}
