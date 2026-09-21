package achanvear.peru.jobs.application.dto;

import java.util.List;

public record JobPostPageResponse(
        List<JobPostResponse> items,
        long totalItems,
        int totalPages,
        int currentPage,
        int pageSize,
        boolean first,
        boolean last
) {
}