package achanvear.peru.freelance.domain.model;

import java.math.BigDecimal;
import java.util.Objects;

public class Milestone {

    private final MilestoneId id;
    private final String title;
    private final String description;
    private final BigDecimal amount;
    private MilestoneStatus status;

    private Milestone(MilestoneId id, String title, String description, BigDecimal amount, MilestoneStatus status) {
        this.id = Objects.requireNonNull(id, "Milestone id cannot be null");
        this.title = Objects.requireNonNull(title, "Title cannot be null");
        this.description = Objects.requireNonNull(description, "Description cannot be null");
        this.amount = Objects.requireNonNull(amount, "Amount cannot be null");
        this.status = Objects.requireNonNull(status, "Status cannot be null");
    }

    public static Milestone create(String title, String description, BigDecimal amount) {
        return new Milestone(
                MilestoneId.generate(),
                title,
                description,
                amount,
                MilestoneStatus.PENDING
        );
    }

    public static Milestone restore(MilestoneId id, String title, String description, BigDecimal amount, MilestoneStatus status) {
        return new Milestone(id, title, description, amount, status);
    }

    public MilestoneId getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public MilestoneStatus getStatus() {
        return status;
    }

    public void submit() {
        if (this.status != MilestoneStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only in-progress milestones can be submitted");
        }
        this.status = MilestoneStatus.SUBMITTED;
    }

    public void approve() {
        if (this.status != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted milestones can be approved");
        }
        this.status = MilestoneStatus.APPROVED;
    }

    public void reject() {
        if (this.status != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted milestones can be rejected");
        }
        this.status = MilestoneStatus.REJECTED;
    }

    public void start() {
        if (this.status != MilestoneStatus.PENDING) {
            throw new IllegalStateException("Only pending milestones can be started");
        }
        this.status = MilestoneStatus.IN_PROGRESS;
    }
}
