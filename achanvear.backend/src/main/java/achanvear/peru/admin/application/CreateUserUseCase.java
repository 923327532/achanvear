package achanvear.peru.admin.application;

import achanvear.peru.admin.application.command.CreateUserCommand;
import achanvear.peru.admin.application.dto.AdminUserResponse;

/**
 * Creación de un usuario desde el panel administrativo.
 * El rol se valida según el nivel del administrador antes de guardar.
 */
public interface CreateUserUseCase {

    AdminUserResponse create(String adminUserId, CreateUserCommand command);
}
