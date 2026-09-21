package achanvear.peru.payments.domain.repository;

import java.util.UUID;

public interface CompanyProjectStatsRepository {
    int countPublishedProjectsByCompany(UUID companyUserId);
    boolean hasActiveSubscription(UUID companyUserId);
}
