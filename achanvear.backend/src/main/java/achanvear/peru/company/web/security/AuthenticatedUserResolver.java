package achanvear.peru.company.web.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthenticatedUserResolver {

    public AuthenticatedUser resolve(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        String userId;
        UUID companyId = null;

        if (principal instanceof achanvear.peru.shared.security.AuthenticatedUser sharedUser) {
            userId = sharedUser.getUserId().toString();
            companyId = sharedUser.getCompanyId();
        } else {
            userId = authentication.getName();
        }

        boolean superAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_SUPER_ADMIN".equals(authority.getAuthority()) 
                        || "ROLE_SUPERADMIN".equals(authority.getAuthority()));

        return new AuthenticatedUser(userId, superAdmin, companyId);
    }
}
