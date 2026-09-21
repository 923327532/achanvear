package achanvear.peru.notifications.infrastructure.adapter;

import achanvear.peru.notifications.infrastructure.external.BrevoEmailClient;
import achanvear.peru.shared.application.port.NotificationPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class BrevoNotificationAdapter implements NotificationPort {

    private static final Logger log = LoggerFactory.getLogger(BrevoNotificationAdapter.class);

    private final BrevoEmailClient brevoEmailClient;

    public BrevoNotificationAdapter(BrevoEmailClient brevoEmailClient) {
        this.brevoEmailClient = brevoEmailClient;
    }

    @Override
    public boolean sendEmail(String to, String subject, String htmlBody) {
        try {
            log.info("Sending email to: {} subject: {}", to, subject);
            brevoEmailClient.sendEmail(to, subject, htmlBody);
            log.info("Email sent successfully to: {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to: {} subject: {} error: {}", to, subject, e.getMessage(), e);
            // No rethrow: no romper flujos que dependen del envío (invitaciones, etc.),
            // pero el llamador puede conocer el fallo por el valor de retorno.
            return false;
        }
    }
}
