package achanvear.peru.freelance.application.dto;

import java.util.List;

public record FreelanceProjectPageResponse(
        List<FreelanceProjectResponse> items,
        long totalItems,
        int totalPages,
        int currentPage,
        int pageSize,
        boolean first,
        boolean last
) {
}