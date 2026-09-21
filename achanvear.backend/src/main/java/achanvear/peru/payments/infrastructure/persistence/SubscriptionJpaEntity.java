package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.SubscriptionStatus;
import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
public class SubscriptionJpaEntity extends BaseJpaEntity {

    @Id
    private UUID id;

    @Column(name = "company_user_id", nullable = false)
    private UUID companyUserId;

    @Column(name = "plan", nullable = false, length = 50)
    private String plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubscriptionStatus status;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    @Column(name = "mp_subscription_id", unique = true)
    private String mpSubscriptionId;

    // getters y setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCompanyUserId() { return companyUserId; }
    public void setCompanyUserId(UUID companyUserId) { this.companyUserId = companyUserId; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }

    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }

    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }

    public String getMpSubscriptionId() { return mpSubscriptionId; }
    public void setMpSubscriptionId(String mpSubscriptionId) { this.mpSubscriptionId = mpSubscriptionId; }
}