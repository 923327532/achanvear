package achanvear.peru.freelance.application.dto;

import java.math.BigDecimal;

public record MilestoneResponse(
        String id,
        String title,
        String description,
        BigDecimal amount,
        String status
) {
}