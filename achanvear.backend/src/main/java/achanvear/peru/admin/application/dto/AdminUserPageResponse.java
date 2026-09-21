package achanvear.peru.admin.application.dto;

import java.util.List;

public record AdminUserPageResponse(
        List<AdminUserResponse> items,
        long totalItems,
        int totalPages,
        int page,
        int size
) {
}
