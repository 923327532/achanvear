package achanvear.peru.profile.infrastructure.event;

import achanvear.peru.identity.domain.event.UserRegisteredEvent;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.profile.TalentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

/**
 * Escucha el evento de registro de usuario y crea automáticamente
 * un TalentProfile básico para los freelancers.
 */
@Component
public class UserRegisteredEventHandler {

    private static final Logger log = LoggerFactory.getLogger(UserRegisteredEventHandler.class);

    private final TalentProfileRepository talentProfileRepository;

    public UserRegisteredEventHandler(TalentProfileRepository talentProfileRepository) {
        this.talentProfileRepository = talentProfileRepository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(UserRegisteredEvent event) {
        // Solo crear perfil para freelancers
        if (event.role() != UserRole.FREELANCER) {
            return;
        }

        UUID userId = event.userId().value();

        // Verificar si ya existe un perfil para este usuario
        if (talentProfileRepository.findByUserId(userId).isPresent()) {
            log.debug("TalentProfile already exists for userId={}", userId);
            return;
        }

        // Crear perfil básico con los datos del registro
        TalentProfile profile = TalentProfile.createBasic(userId, event.fullName());
        talentProfileRepository.save(profile);

        log.info("TalentProfile created for userId={}, profileId={}", userId, profile.getId());
    }
}
