package achanvear.peru.shared.application.port;

public interface NotificationPort {

    /**
     * Envía un correo transaccional.
     *
     * @return {@code true} si el envío se completó, {@code false} si falló.
     *         Los flujos que no necesitan saber el resultado pueden ignorar el retorno.
     */
    boolean sendEmail(String to, String subject, String htmlBody);
}
