package achanvear.peru.freelance.domain.event;
import achanvear.peru.shared.domain.DomainEvent;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
public record ProjectAcceptedEvent(UUID projectId,UUID freelancerId,BigDecimal amount,Instant occurredAt) implements DomainEvent {}
