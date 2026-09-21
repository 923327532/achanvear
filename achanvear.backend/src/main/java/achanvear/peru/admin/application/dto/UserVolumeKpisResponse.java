package achanvear.peru.admin.application.dto;

import achanvear.peru.identity.application.query.UserPeriodBucket;

import java.util.List;
import java.util.Map;

/**
 * KPIs de volumen y comportamiento de usuarios, con comparación entre el
 * periodo seleccionado y el periodo anterior equivalente.
 */
public record UserVolumeKpisResponse(
        long totalUsers,
        long activeUsers,
        long newUsers,
        long previousNewUsers,
        double newUsersVariationPct,
        double totalUsersGrowthPct,
        long activeUsersInPeriod,
        long previousActiveUsersInPeriod,
        double activeUsersVariationPct,
        List<UserPeriodBucket> usersByPeriod,
        List<UserPeriodBucket> previousUsersByPeriod,
        Map<String, Long> usersByStatus,
        Map<String, Long> usersByRole,
        String periodStart,
        String periodEnd,
        String previousPeriodStart,
        String previousPeriodEnd,
        String granularity
) {
}
