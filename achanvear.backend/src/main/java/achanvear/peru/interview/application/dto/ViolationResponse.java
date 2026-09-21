package achanvear.peru.interview.application.dto;

public record ViolationResponse(
        String type,
        Integer count,
        String occurredAt
) {
}
