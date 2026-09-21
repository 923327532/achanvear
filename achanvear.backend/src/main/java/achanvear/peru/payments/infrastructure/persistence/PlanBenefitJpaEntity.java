package achanvear.peru.payments.infrastructure.persistence;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "plan_benefits")
public class PlanBenefitJpaEntity {

    @Id
    private UUID id;

    @Column(name = "plan_id", nullable = false, length = 50)
    private String planId;

    @Column(name = "benefit_text", nullable = false, length = 500)
    private String benefitText;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PlanBenefitJpaEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getBenefitText() { return benefitText; }
    public void setBenefitText(String benefitText) { this.benefitText = benefitText; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
