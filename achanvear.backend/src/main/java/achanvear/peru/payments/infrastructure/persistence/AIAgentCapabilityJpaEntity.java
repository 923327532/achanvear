package achanvear.peru.payments.infrastructure.persistence;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_agent_capabilities")
public class AIAgentCapabilityJpaEntity {

    @Id
    private UUID id;

    @Column(name = "agent_id", nullable = false, length = 50)
    private String agentId;

    @Column(nullable = false, length = 200)
    private String capability;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public AIAgentCapabilityJpaEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAgentId() { return agentId; }
    public void setAgentId(String agentId) { this.agentId = agentId; }

    public String getCapability() { return capability; }
    public void setCapability(String capability) { this.capability = capability; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
