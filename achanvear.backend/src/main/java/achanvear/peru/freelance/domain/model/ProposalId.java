package achanvear.peru.freelance.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record ProposalId(UUID value) implements ValueObject {

    public ProposalId {
        Objects.requireNonNull(value, "Proposal id cannot be null");
    }

    public static ProposalId generate() {
        return new ProposalId(UUID.randomUUID());
    }

    @Override
    public String toString() {
        return value.toString();
    }
}