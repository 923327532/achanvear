package achanvear.peru.identity.application;

import achanvear.peru.identity.application.command.RegisterUserCommand;
import achanvear.peru.identity.application.dto.UserResponse;

public interface RegisterUserUseCase {

    UserResponse execute(RegisterUserCommand command);
}