package achanvear.peru.identity.application.port.in;

import achanvear.peru.identity.domain.model.UserRole;

/**
 * Puerto para cambiar el rol de un usuario desde el panel administrativo.
 * La validación de permisos se realiza en la capa de aplicación del módulo admin.
 */
public interface UserRoleChangerPort {

    void changeRole(String userId, UserRole newRole);
}
