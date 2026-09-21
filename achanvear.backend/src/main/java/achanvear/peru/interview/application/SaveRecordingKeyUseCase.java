package achanvear.peru.interview.application;

import achanvear.peru.interview.application.command.SaveRecordingKeyCommand;

public interface SaveRecordingKeyUseCase {
    void execute(SaveRecordingKeyCommand command);
}
