package achanvear.peru.notifications.infrastructure.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class BrevoEmailClient {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailClient.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String senderEmail;
    private final String senderName;

    public BrevoEmailClient(
            RestClient.Builder restClientBuilder,
            @Value("${brevo.api-key}") String apiKey,
            @Value("${brevo.sender.email}") String senderEmail,
            @Value("${brevo.sender.name}") String senderName
    ) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.brevo.com/v3")
                .build();
        this.apiKey = apiKey;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
    }

    public void sendEmail(String recipient, String subject, String content) {
        Map<String, Object> payload = Map.of(
                "sender", Map.of(
                        "name", senderName,
                        "email", senderEmail
                ),
                "to", List.of(
                        Map.of("email", recipient)
                ),
                "subject", subject,
                "htmlContent", content
        );

        log.debug("Brevo payload: sender={}, to={}, subject={}", senderEmail, recipient, subject);

        String response = restClient.post()
                .uri("/smtp/email")
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);

        log.debug("Brevo response: {}", response);
    }

    public void sendWelcomeEmail(String recipient) {
        sendEmail(
                recipient,
                "Bienvenido a Achanvear",
                """
                <html>
                  <body>
                    <h2>Bienvenido a Achanvear</h2>
                    <p>Tu cuenta fue creada correctamente.</p>
                    <p>Ya puedes explorar empleos, proyectos freelance y oportunidades profesionales.</p>
                  </body>
                </html>
                """
        );
    }
}
