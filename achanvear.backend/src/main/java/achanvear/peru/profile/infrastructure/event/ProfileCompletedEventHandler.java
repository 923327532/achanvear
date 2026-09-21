package achanvear.peru.profile.infrastructure.event;

import achanvear.peru.profile.application.port.out.ProfileValidationPort;
import achanvear.peru.profile.domain.event.ProfileCompletedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ProfileCompletedEventHandler {

    private final ProfileValidationPort profileValidationPort;

    public ProfileCompletedEventHandler(ProfileValidationPort profileValidationPort) {
        this.profileValidationPort = profileValidationPort;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(ProfileCompletedEvent event) {
        profileValidationPort.validateProfile(event.profileId().toString());
    }
}
