package achanvear.peru.interview.application.command;

public record ReportViolationCommand(
        String interviewId,
        String type,
        Integer count,
        String timestamp
) {
}
