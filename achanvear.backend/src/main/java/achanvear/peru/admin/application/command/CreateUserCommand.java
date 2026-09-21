package achanvear.peru.admin.application.command;

import achanvear.peru.identity.domain.model.UserRole;

/**
 * Comando de creación de un usuario desde el panel administrativo.
 * El rol ya viene seleccionado y se valida antes de guardar.
 */
public record CreateUserCommand(
        String email,
        String fullName,
        String dni,
        String phone,
        String rawPassword,
        UserRole role
) {
}
