package achanvear.peru.identity.application.port.in;

import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserRole;

/**
 * Puerto para crear un usuario con un rol específico desde el panel administrativo.
 * El rol llega ya validado por la capa de aplicación del módulo admin.
 */
public interface UserCreatorPort {

    User createUser(String email, String fullName, String dni, String phone, String passwordHash, UserRole role);
}
