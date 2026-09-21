package achanvear.peru.identity.application.port.in;

/**
 * Puerto para cambiar el estado de un usuario (ACTIVE, BLOCKED, DISABLED).
 * La mutación del dominio vive en identity; el admin solo la invoca.
 */
public interface UserStatusChangerPort {

    void changeStatus(String userId, String newStatus);
}
