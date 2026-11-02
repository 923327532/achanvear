package achanvear.peru.shared.application.port;

import java.util.Optional;
import java.util.UUID;

public interface CurrentActorPort {
    Optional<Actor> current();

    record Actor(UUID userId, UUID companyId, String role, boolean administrator) {
        public boolean isCompany() {
            return "COMPANY".equals(role) || "COMPANY_COLLABORATOR".equals(role);
        }
    }
}
