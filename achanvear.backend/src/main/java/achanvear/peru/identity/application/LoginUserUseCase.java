package achanvear.peru.identity.application;

import achanvear.peru.identity.application.command.LoginUserCommand;
import achanvear.peru.identity.application.dto.LoginResponse;

public interface LoginUserUseCase {

    LoginResponse execute(LoginUserCommand command);
}