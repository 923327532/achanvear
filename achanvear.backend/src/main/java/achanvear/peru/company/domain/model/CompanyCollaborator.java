package achanvear.peru.company.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class CompanyCollaborator extends AggregateRoot<UUID> {

    private final UUID id;
    private final UUID companyId;
    private final UUID userId;
    private String fullName;
    private String email;
    private CollaboratorStatus status;
    private Instant invitedAt;

    private CompanyCollaborator(
            UUID id,
            UUID companyId,
            UUID userId,
            String fullName,
            String email,
            CollaboratorStatus status,
            Instant invitedAt
    ) {
        this.id = Objects.requireNonNull(id, "id cannot be null");
        this.companyId = Objects.requireNonNull(companyId, "companyId cannot be null");
        this.userId = Objects.requireNonNull(userId, "userId cannot be null");
        this.fullName = validateRequiredText(fullName, "fullName", 3, 255);
        this.email = Objects.requireNonNull(email, "email cannot be null");
        this.status = Objects.requireNonNull(status, "status cannot be null");
        this.invitedAt = Objects.requireNonNull(invitedAt, "invitedAt cannot be null");
    }

    public static CompanyCollaborator create(
            UUID id,
            UUID companyId,
            UUID userId,
            String fullName,
            String email
    ) {
        return new CompanyCollaborator(
                id,
                companyId,
                userId,
                fullName,
                email,
                CollaboratorStatus.ACTIVE,
                Instant.now()
        );
    }

    public static CompanyCollaborator restore(
            UUID id,
            UUID companyId,
            UUID userId,
            String fullName,
            String email,
            CollaboratorStatus status,
            Instant invitedAt
    ) {
        return new CompanyCollaborator(id, companyId, userId, fullName, email, status, invitedAt);
    }

    public void deactivate() {
        this.status = CollaboratorStatus.INACTIVE;
        markUpdated();
    }

    public UUID getId() {
        return id;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public CollaboratorStatus getStatus() {
        return status;
    }

    public Instant getInvitedAt() {
        return invitedAt;
    }

    private String validateRequiredText(String value, String fieldName, int min, int max) {
        Objects.requireNonNull(value, fieldName + " cannot be null");
        String normalized = value.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank");
        }
        if (normalized.length() < min || normalized.length() > max) {
            throw new IllegalArgumentException(fieldName + " length must be between " + min + " and " + max);
        }
        return normalized;
    }
}
