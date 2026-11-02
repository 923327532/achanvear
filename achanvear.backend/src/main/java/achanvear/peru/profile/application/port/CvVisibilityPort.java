package achanvear.peru.profile.application.port;

import java.util.UUID;

public interface CvVisibilityPort {
    String visibility(UUID ownerId);

    boolean companyExists(UUID userId, UUID companyId, boolean requireValidated);
}
