package achanvear.peru.admin.domain.service;

import achanvear.peru.identity.domain.model.UserRole;

/**
 * Política de acceso del panel administrativo. Centraliza las reglas de
 * asignación de roles y de gestión de usuarios.
 *
 * <p>Reglas:
 * <ul>
 *   <li>Solo SUPERADMIN puede crear roles privilegiados (ADMIN, SOPORTE, SUBADMIN).</li>
 *   <li>El rol SUPERADMIN no puede asignarse a través de la API (se asigna manualmente en BD).</li>
 *   <li>ADMIN y SOPORTE no pueden crear usuarios con un nivel de privilegios igual o superior al suyo.</li>
 *   <li>Ningún usuario puede asignarse privilegios a sí mismo (se valida por id en el caso de uso).</li>
 * </ul>
 */
public final class RoleAccessPolicy {

    private RoleAccessPolicy() {
    }

    /** ¿El rol pertenece al panel administrativo? */
    public static boolean isAdminPanelRole(UserRole role) {
        return role != null && role.isPrivileged();
    }

    /** ¿Puede el actor crear un usuario con el rol indicado? */
    public static boolean canCreateUserWithRole(UserRole actor, UserRole targetRole) {
        if (actor == null || targetRole == null || !actor.isPrivileged()) {
            return false;
        }
        if (targetRole == UserRole.SUPERADMIN) {
            // SUPERADMIN se asigna manualmente por un administrador de base de datos.
            return false;
        }
        if (targetRole.isPrivileged()) {
            // Solo SUPERADMIN crea roles administrativos o de soporte.
            return actor == UserRole.SUPERADMIN;
        }
        // Roles de plataforma: el actor debe tener mayor nivel de privilegio.
        return targetRole.level() < actor.level();
    }

    /** ¿Puede el actor gestionar (estado/rol) a un usuario del rol indicado? */
    public static boolean canManageUser(UserRole actor, UserRole targetRole) {
        if (actor == null || targetRole == null || !actor.isPrivileged()) {
            return false;
        }
        if (actor == UserRole.SUPERADMIN) {
            return true;
        }
        return targetRole.level() < actor.level();
    }

    /** ¿Puede el actor cambiar el rol de un usuario a un nuevo rol? */
    public static boolean canAssignRole(UserRole actor, UserRole targetCurrentRole, UserRole newRole) {
        return canManageUser(actor, targetCurrentRole) && canCreateUserWithRole(actor, newRole);
    }
}
