package achanvear.peru.interview.application.command;

public record SaveRecordingKeyCommand(
        String interviewId,
        String fileKey
) {
}
