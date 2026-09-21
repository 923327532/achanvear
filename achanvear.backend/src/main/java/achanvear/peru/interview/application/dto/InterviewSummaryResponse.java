 package achanvear.peru.interview.application.dto;

public record InterviewSummaryResponse(
        String interviewId,
        String position,
        String company,
        String date,
        String time,
        String agent,
        String status,
        String interviewType,
        Integer score,
        Integer maxScore,
        boolean passed,
        String abortReason
) {
}
