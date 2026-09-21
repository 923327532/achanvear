package achanvear.peru.admin.application;

/**
 * Cambio del rol de un usuario permitido. Valida que el administrador tenga
 * nivel suficiente y que el nuevo rol sea asignable.
 */
public interface ChangeUserRoleUseCase {

    void changeRole(String adminUserId, String userId, String newRole);
}
