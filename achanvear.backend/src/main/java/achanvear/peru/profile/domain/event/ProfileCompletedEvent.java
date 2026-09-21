package achanvear.peru.profile.domain.event;

import achanvear.peru.profile.domain.model.TalentProfileId;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record ProfileCompletedEvent(
        TalentProfileId profileId,
        UUID userId,
        Instant occurredAt
) implements DomainEvent {

    public ProfileCompletedEvent {
        Objects.requireNonNull(profileId, "Profile id cannot be null");
        Objects.requireNonNull(userId, "User id cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static ProfileCompletedEvent now(TalentProfileId profileId, UUID userId) {
        return new ProfileCompletedEvent(profileId, userId, Instant.now());
    }
}