package achanvear.peru.identity.application.impl;

import achanvear.peru.identity.application.ForgotPasswordUseCase;
import achanvear.peru.identity.application.command.ForgotPasswordCommand;
import achanvear.peru.identity.application.dto.PasswordResetResponse;
import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.PasswordResetToken;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.repository.PasswordResetTokenRepository;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.shared.application.port.NotificationPort;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * Implementation of forgot password use case.
 * Genera un token de recuperación y envía el enlace por correo (Brevo) cuando el
 * correo transaccional está configurado. Si no está configurado, cae en modo manual
 * (dev) devolviendo el token en la respuesta.
 */
@Service
public class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {

    private static final Logger log = LoggerFactory.getLogger(ForgotPasswordUseCaseImpl.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final NotificationPort notificationPort;
    private final long tokenExpirationMinutes;
    private final String frontendUrl;
    private final String brevoApiKey;
    private final String brevoSenderEmail;

    public ForgotPasswordUseCaseImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            NotificationPort notificationPort,
            @Value("${security.password-reset.token-expiration-minutes:30}") long tokenExpirationMinutes,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl,
            @Value("${brevo.api-key:}") String brevoApiKey,
            @Value("${brevo.sender.email:}") String brevoSenderEmail
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.notificationPort = notificationPort;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
        this.frontendUrl = frontendUrl;
        this.brevoApiKey = brevoApiKey;
        this.brevoSenderEmail = brevoSenderEmail;
    }

    @Override
    @Transactional
    public PasswordResetResponse execute(ForgotPasswordCommand command) {
        Email email = new Email(command.email());

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new ResourceNotFoundException("No encontramos una cuenta con ese correo electrónico");
        }

        User user = userOpt.get();

        if (!user.isActive()) {
            throw new BusinessRuleViolationException("Tu cuenta no está activa, por lo que no es posible restablecer la contraseña");
        }

        tokenRepository.deleteByUserId(user.getId());

        PasswordResetToken token = PasswordResetToken.create(user.getId(), tokenExpirationMinutes);
        tokenRepository.save(token);

        // Correo transaccional configurado: enviamos el enlace al usuario y NO
        // exponemos el token en la respuesta (modo email).
        if (isEmailConfigured()) {
            String resetUrl = frontendUrl + "/reset-password?token=" + token.getToken();
            boolean sent = notificationPort.sendEmail(
                    user.getEmail().value(),
                    "Recupera tu contraseña - Achanvear",
                    buildResetEmail(user.getFullName(), resetUrl, token.getExpiresAt())
            );

            if (sent) {
                return PasswordResetResponse.email(token.getExpiresAt());
            }

            // Si el correo no pudo enviarse (Brevo rechazó, IP no autorizada, etc.),
            // degradamos a modo manual para que el usuario pueda completar el flujo.
            log.warn("No se pudo enviar el correo de recuperación a {}. Se devuelve el token en modo manual.",
                    user.getEmail().value());
            return PasswordResetResponse.manual(token.getToken(), token.getExpiresAt());
        }

        // Sin correo configurado (dev): devolvemos el token para poder completar el flujo.
        return PasswordResetResponse.manual(token.getToken(), token.getExpiresAt());
    }

    private boolean isEmailConfigured() {
        return brevoApiKey != null && !brevoApiKey.isBlank()
                && brevoSenderEmail != null && !brevoSenderEmail.isBlank();
    }

    private String buildResetEmail(String fullName, String resetUrl, Instant expiresAt) {
        String name = fullName != null && !fullName.isBlank() ? fullName : "usuario";
        return """
                <html>
                  <body style="font-family: Arial, sans-serif; background:#f8fafc; margin:0; padding:24px;">
                    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px; border:1px solid #e2e8f0;">
                      <h2 style="color:#1B3A6B; margin-top:0;">Recupera tu contraseña</h2>
                      <p style="color:#334155;">Hola <strong>%s</strong>,</p>
                      <p style="color:#334155;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
                      <p style="text-align:center; margin:28px 0;">
                        <a href="%s" style="background-color:#1B3A6B; color:#ffffff; padding:12px 24px; border-radius:10px; text-decoration:none; font-weight:600; display:inline-block;">
                          Restablecer contraseña
                        </a>
                      </p>
                      <p style="color:#64748b; font-size:13px;">Este enlace expira el %s. Si no solicitaste este cambio, ignora este correo.</p>
                      <p style="color:#94a3b8; font-size:12px; border-top:1px solid #e2e8f0; padding-top:12px;">© Achanvear</p>
                    </div>
                  </body>
                </html>
                """.formatted(name, resetUrl, expiresAt);
    }
}
