package achanvear.peru.admin.application.dto;

import java.util.List;

public record AdminInterviewPageResponse(
        List<AdminInterviewResponse> items,
        long totalItems,
        int totalPages,
        int page,
        int size
) {
}
