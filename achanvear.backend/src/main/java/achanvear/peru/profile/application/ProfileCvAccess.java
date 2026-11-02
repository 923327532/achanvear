package achanvear.peru.profile.application;

import achanvear.peru.shared.application.port.CurrentActorPort;
import achanvear.peru.profile.application.port.CvVisibilityPort;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class ProfileCvAccess {
    private final CvVisibilityPort visibility;
    private final CurrentActorPort actors;

    public ProfileCvAccess(CvVisibilityPort visibility, CurrentActorPort actors) {
        this.visibility = visibility;
        this.actors = actors;
    }

    public boolean canView(UUID owner) {
        return actors.current().map(actor -> {
            if (owner.equals(actor.userId()) || actor.administrator()) return true;
            if (!actor.isCompany()) return false;
            String policy = visibility.visibility(owner);
            if ("PRIVATE".equals(policy)) return false;
            return visibility.companyExists(actor.userId(), actor.companyId(), !"ALL_COMPANIES".equals(policy));
        }).orElse(false);
    }
}
