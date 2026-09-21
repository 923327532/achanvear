package achanvear.peru.compliance.application.command;

public record RecordInterviewConsentCommand(
        String interviewId,
        String userId,
        boolean acceptDataProcessing,
        boolean acceptAiEvaluation,
        boolean acceptRecording
) {
}
