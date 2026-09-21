package achanvear.peru.identity.application.impl;

import achanvear.peru.identity.application.ResetPasswordUseCase;
import achanvear.peru.identity.application.command.ResetPasswordCommand;
import achanvear.peru.identity.domain.model.PasswordResetToken;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.repository.PasswordResetTokenRepository;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of reset password use case.
 * Validates token and updates user password.
 */
@Service
public class ResetPasswordUseCaseImpl implements ResetPasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public ResetPasswordUseCaseImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void execute(ResetPasswordCommand command) {
        PasswordResetToken token = tokenRepository.findByToken(command.token())
                .orElseThrow(() -> new ResourceNotFoundException("El enlace de recuperación no es válido o ya fue usado"));

        if (!token.isValid()) {
            throw new BusinessRuleViolationException("El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", token.getUserId().toString()));

        validatePasswordStrength(command.newPassword());

        String hashedPassword = passwordEncoder.encode(command.newPassword());
        user.changePassword(hashedPassword);

        token.markAsUsed();
        tokenRepository.save(token);

        userRepository.save(user);
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new BusinessRuleViolationException("La contraseña debe tener al menos 8 caracteres");
        }

        boolean hasUppercase = !password.equals(password.toLowerCase());
        boolean hasLowercase = !password.equals(password.toUpperCase());
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");

        if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
            throw new BusinessRuleViolationException(
                    "La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial"
            );
        }
    }
}
