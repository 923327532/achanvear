package achanvear.peru.company.application.dto;

import java.util.List;

public record CompanyHistoryResponse(
        List<CompanyHistoryItem> items,
        int total
) {
    public record CompanyHistoryItem(
            String id,
            String type,
            String title,
            String description,
            String date,
            String status,
            String relatedId,
            String freelancerName,
            Double amount
    ) {}
}
