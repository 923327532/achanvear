package achanvear.peru.company.application.dto;

import java.util.List;

public record CompanyPageResponse(
        List<CompanyResponse> items,
        long totalItems,
        int totalPages,
        int currentPage,
        int pageSize,
        boolean first,
        boolean last
) {
}