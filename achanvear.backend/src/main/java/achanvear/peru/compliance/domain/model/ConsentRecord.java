package achanvear.peru.compliance.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Evidencia de aceptación o retiro de un consentimiento.
 * Los registros de aceptación no deben modificarse retroactivamente.
 */
public class ConsentRecord {

    private final ConsentRecordId id;
    private final String userId;
    private final String interviewId; // nullable: nulo para consentimientos de registro
    private final ConsentType type;
    private final String documentVersion; // nullable: versión del documento mostrado (registro)
    private final boolean accepted;
    private final Instant acceptedAt;
    private final Instant withdrawnAt;

    private ConsentRecord(
            ConsentRecordId id,
            String userId,
            String interviewId,
            ConsentType type,
            String documentVersion,
            boolean accepted,
            Instant acceptedAt,
            Instant withdrawnAt
    ) {
        this.id = Objects.requireNonNull(id, "Consent record id cannot be null");
        this.userId = Objects.requireNonNull(userId, "User id cannot be null");
        this.type = Objects.requireNonNull(type, "Consent type cannot be null");
        this.interviewId = interviewId;
        this.documentVersion = documentVersion;
        this.accepted = accepted;
        this.acceptedAt = acceptedAt;
        this.withdrawnAt = withdrawnAt;
    }

    public static ConsentRecord accept(
            ConsentRecordId id,
            String userId,
            String interviewId,
            ConsentType type,
            String documentVersion
    ) {
        return new ConsentRecord(
                id,
                userId,
                interviewId,
                type,
                documentVersion,
                true,
                Instant.now(),
                null
        );
    }

    public static ConsentRecord restore(
            ConsentRecordId id,
            String userId,
            String interviewId,
            ConsentType type,
            String documentVersion,
            boolean accepted,
            Instant acceptedAt,
            Instant withdrawnAt
    ) {
        return new ConsentRecord(id, userId, interviewId, type, documentVersion, accepted, acceptedAt, withdrawnAt);
    }

    public ConsentRecordId getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getInterviewId() {
        return interviewId;
    }

    public ConsentType getType() {
        return type;
    }

    public String getDocumentVersion() {
        return documentVersion;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public ConsentStatus getStatus() {
        return withdrawnAt != null || !accepted ? ConsentStatus.WITHDRAWN : ConsentStatus.ACCEPTED;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public Instant getWithdrawnAt() {
        return withdrawnAt;
    }
}
