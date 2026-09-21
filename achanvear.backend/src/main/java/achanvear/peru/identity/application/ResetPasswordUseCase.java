package achanvear.peru.identity.application;

import achanvear.peru.identity.application.command.ResetPasswordCommand;

/**
 * Use case for resetting password using token.
 */
public interface ResetPasswordUseCase {

    void execute(ResetPasswordCommand command);
}
