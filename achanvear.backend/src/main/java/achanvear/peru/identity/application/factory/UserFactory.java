package achanvear.peru.identity.application.factory;

import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.model.UserRole;
import org.springframework.stereotype.Component;

@Component
public class UserFactory {

    public User create(Email email, String fullName, String dni, String phone, String passwordHash, UserRole role) {
        return User.create(UserId.generate(), email, fullName, dni, phone, passwordHash, role);
    }

    public User create(Email email, String fullName, String dni, String phone, String passwordHash, UserRole role,
                       String representanteDni, String representanteLegal, String ruc) {
        return User.create(UserId.generate(), email, fullName, dni, phone, passwordHash, role,
                representanteDni, representanteLegal, ruc);
    }
}
