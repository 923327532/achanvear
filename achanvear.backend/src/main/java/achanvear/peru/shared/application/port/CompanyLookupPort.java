package achanvear.peru.shared.application.port;

import java.util.Optional;
import java.util.UUID;

public interface CompanyLookupPort {

    Optional<CompanySummary> findById(UUID companyId);

    Optional<CompanySummary> findByOwnerUserId(UUID ownerUserId);

    record CompanySummary(
            UUID id,
            String businessName,
            String tradeName,
            String industry,
            String specialty,
            String companySize,
            String logoUrl,
            String status,
            double averageRating,
            int totalRatings,
            int publishedProjectsCount
    ) {
        public String getInitials() {
            if (businessName == null || businessName.isBlank()) return "EM";
            String[] parts = businessName.trim().split("\\s+");
            if (parts.length >= 2) {
                return (parts[0].charAt(0) + "" + parts[1].charAt(0)).toUpperCase();
            }
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
    }
}
