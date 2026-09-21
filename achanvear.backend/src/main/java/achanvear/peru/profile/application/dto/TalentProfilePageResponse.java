package achanvear.peru.profile.application.dto;

import java.util.List;

public record TalentProfilePageResponse(
        List<TalentProfileResponse> items,
        long totalItems,
        int totalPages,
        int currentPage,
        int pageSize,
        boolean first,
        boolean last
) {
}