package achanvear.peru.identity.application;

import achanvear.peru.identity.application.command.ForgotPasswordCommand;
import achanvear.peru.identity.application.dto.PasswordResetResponse;

/**
 * Use case for initiating password reset process.
 */
public interface ForgotPasswordUseCase {

    PasswordResetResponse execute(ForgotPasswordCommand command);
}
