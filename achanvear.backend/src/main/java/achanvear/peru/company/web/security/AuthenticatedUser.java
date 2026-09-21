package achanvear.peru.company.web.security;

import java.util.UUID;

public record AuthenticatedUser(
        String userId,
        boolean superAdmin,
        UUID companyId
) {
}
