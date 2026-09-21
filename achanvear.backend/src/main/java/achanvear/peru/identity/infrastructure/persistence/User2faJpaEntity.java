package achanvear.peru.identity.infrastructure.persistence;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_2fa")
public class User2faJpaEntity {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = false;

    @Column(name = "secret", length = 255)
    private String secret;

    @Column(name = "method", length = 50)
    private String method = "TOTP";

    @Column(name = "setup_at")
    private Instant setupAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public User2faJpaEntity() {}

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public Instant getSetupAt() { return setupAt; }
    public void setSetupAt(Instant setupAt) { this.setupAt = setupAt; }
}