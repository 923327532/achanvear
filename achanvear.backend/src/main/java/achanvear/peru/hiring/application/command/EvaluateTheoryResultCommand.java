package achanvear.peru.hiring.application.command;

public record EvaluateTheoryResultCommand(
        String hiringProcessId,
        int theoryScore
) {
}