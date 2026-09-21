package achanvear.peru.freelance.domain.event;

import achanvear.peru.freelance.domain.model.FreelanceProjectId;
import achanvear.peru.freelance.domain.model.ProposalId;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record ProposalSubmittedEvent(
        FreelanceProjectId projectId,
        ProposalId proposalId,
        UUID freelancerUserId,
        Instant occurredAt
) implements DomainEvent {

    public ProposalSubmittedEvent {
        Objects.requireNonNull(projectId, "Project id cannot be null");
        Objects.requireNonNull(proposalId, "Proposal id cannot be null");
        Objects.requireNonNull(freelancerUserId, "Freelancer user id cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static ProposalSubmittedEvent now(
            FreelanceProjectId projectId,
            ProposalId proposalId,
            UUID freelancerUserId
    ) {
        return new ProposalSubmittedEvent(projectId, proposalId, freelancerUserId, Instant.now());
    }
}