package achanvear.peru.identity.application;

import achanvear.peru.identity.application.command.ChangePasswordCommand;

public interface ChangePasswordUseCase {
    void execute(ChangePasswordCommand command);
}
