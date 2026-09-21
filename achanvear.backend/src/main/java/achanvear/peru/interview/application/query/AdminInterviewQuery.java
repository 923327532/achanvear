package achanvear.peru.interview.application.query;

public record AdminInterviewQuery(
        String status,
        String interviewType,
        int page,
        int size
) {
}
