package achanvear.peru.payments.domain.model;

import achanvear.peru.payments.domain.event.SubscriptionActivatedEvent;
import achanvear.peru.shared.domain.AggregateRoot;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

public class Subscription extends AggregateRoot<SubscriptionId> {

    private final SubscriptionId id;
    private final UUID companyUserId;
    private final PlanType plan;
    private SubscriptionStatus status;
    private Instant startDate;
    private Instant endDate;
    private String mpSubscriptionId;
    private Instant createdAt;
    private Instant updatedAt;

    public Subscription(
            SubscriptionId id,
            UUID companyUserId,
            PlanType plan,
            Instant startDate,
            Instant endDate,
            String mpSubscriptionId
    ) {
        this.id = id;
        this.companyUserId = companyUserId;
        this.plan = plan;
        this.status = SubscriptionStatus.ACTIVE;
        this.startDate = startDate;
        this.endDate = endDate;
        this.mpSubscriptionId = mpSubscriptionId;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static Subscription create(
            UUID companyUserId,
            PlanType plan,
            String mpSubscriptionId
    ) {
        Instant startDate = Instant.now();
        Instant endDate = startDate.plus(30, ChronoUnit.DAYS);

        Subscription subscription = new Subscription(
                new SubscriptionId(UUID.randomUUID()),
                companyUserId,
                plan,
                startDate,
                endDate,
                mpSubscriptionId
        );

        subscription.addDomainEvent(new SubscriptionActivatedEvent(
                subscription.id.value(),
                companyUserId,
                plan,
                startDate,
                endDate
        ));

        return subscription;
    }

    public void expire() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("Subscription can only be expired from ACTIVE status");
        }
        this.status = SubscriptionStatus.EXPIRED;
        this.updatedAt = Instant.now();
    }

    public void cancel() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("Subscription can only be cancelled from ACTIVE status");
        }
        this.status = SubscriptionStatus.CANCELLED;
        this.updatedAt = Instant.now();
    }

    public void activate() {
        if (this.status != SubscriptionStatus.EXPIRED && this.status != SubscriptionStatus.CANCELLED) {
            throw new IllegalStateException("Subscription can only be activated from EXPIRED or CANCELLED status");
        }
        this.status = SubscriptionStatus.ACTIVE;
        this.updatedAt = Instant.now();
    }

    public boolean isActive() {
        return this.status == SubscriptionStatus.ACTIVE && Instant.now().isBefore(this.endDate);
    }

    // getters
    public SubscriptionId getId() { return id; }
    public UUID getCompanyUserId() { return companyUserId; }
    public PlanType getPlan() { return plan; }
    public SubscriptionStatus getStatus() { return status; }
    public Instant getStartDate() { return startDate; }
    public Instant getEndDate() { return endDate; }
    public String getMpSubscriptionId() { return mpSubscriptionId; }
}