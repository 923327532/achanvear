package achanvear.peru.interview.application.dto;

import java.util.List;

public record InterviewReportResponse(
        String interviewId,
        String status,
        String interviewType,
        Integer finalScore,
        Boolean passed,
        InterviewerProfile interviewerProfile,
        AssignedSlot assignedSlot,
        RecordingInfo recording,
        AbortReason abortReason,
        Totals totals,
        List<QuestionItem> questions,
        List<AnswerItem> answers,
        List<ViolationItem> violations
) {

    public record InterviewerProfile(
            String name,
            String voice
    ) {
    }

    public record AssignedSlot(
            Integer slotNumber,
            String startTime,
            String endTime
    ) {
    }

    public record RecordingInfo(
            String fileKey
    ) {
    }

    public record AbortReason(
            String reason
    ) {
    }

    public record Totals(
            Integer totalQuestions,
            Integer totalAnswers,
            Integer totalViolations
    ) {
    }

    public record QuestionItem(
            String id,
            String content,
            String audioUrl
    ) {
    }

    public record AnswerItem(
            String id,
            String questionId,
            String content,
            Integer score
    ) {
    }

    public record ViolationItem(
            String type,
            Integer count,
            String occurredAt
    ) {
    }
}