package achanvear.peru.identity.application.impl;

import achanvear.peru.identity.application.ChangePasswordUseCase;
import achanvear.peru.identity.application.command.ChangePasswordCommand;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChangePasswordUseCaseImpl implements ChangePasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ChangePasswordUseCaseImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void execute(ChangePasswordCommand command) {
        User user = userRepository.findById(UserId.from(command.userId().toString()))
                .orElseThrow(() -> new ResourceNotFoundException("User", command.userId().toString()));

        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(command.currentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleViolationException("La contraseña actual no es correcta");
        }

        // Validar fortaleza de la nueva contraseña
        validatePasswordStrength(command.newPassword());

        // Codificar y cambiar la contraseña
        String hashedPassword = passwordEncoder.encode(command.newPassword());
        user.changePassword(hashedPassword);

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
