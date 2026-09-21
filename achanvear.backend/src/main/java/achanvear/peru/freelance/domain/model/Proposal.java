package achanvear.peru.freelance.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class Proposal {

    private final ProposalId id;
    private final UUID freelancerUserId;
    private final String coverLetter;
    private final BigDecimal proposedBudget;
    private final Integer estimatedDays;
    private final String portfolioUrl;
    private final Instant submittedAt;
    private ProposalStatus status;

    private Proposal(
            ProposalId id,
            UUID freelancerUserId,
            String coverLetter,
            BigDecimal proposedBudget,
            Integer estimatedDays,
            String portfolioUrl,
            Instant submittedAt,
            ProposalStatus status
    ) {
        this.id = Objects.requireNonNull(id, "Proposal id cannot be null");
        this.freelancerUserId = Objects.requireNonNull(freelancerUserId, "Freelancer user id cannot be null");
        this.coverLetter = validateRequiredText(coverLetter, "Cover letter", 10, 2000);
        this.proposedBudget = validateAmount(proposedBudget, "Proposed budget");
        this.estimatedDays = validatePositive(estimatedDays, "Estimated days");
        this.portfolioUrl = normalizeOptionalText(portfolioUrl);
        this.submittedAt = Objects.requireNonNull(submittedAt, "Submitted at cannot be null");
        this.status = Objects.requireNonNull(status, "Proposal status cannot be null");
    }

    public static Proposal create(
            UUID freelancerUserId,
            String coverLetter,
            BigDecimal proposedBudget,
            Integer estimatedDays,
            String portfolioUrl
    ) {
        return new Proposal(
                ProposalId.generate(),
                freelancerUserId,
                coverLetter,
                proposedBudget,
                estimatedDays,
                portfolioUrl,
                Instant.now(),
                ProposalStatus.SUBMITTED
        );
    }

    public static Proposal restore(
            ProposalId id,
            UUID freelancerUserId,
            String coverLetter,
            BigDecimal proposedBudget,
            Integer estimatedDays,
            String portfolioUrl,
            Instant submittedAt,
            ProposalStatus status
    ) {
        return new Proposal(id, freelancerUserId, coverLetter, proposedBudget, estimatedDays, portfolioUrl, submittedAt, status);
    }

    public void accept() {
        if (this.status != ProposalStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted proposals can be accepted");
        }

        this.status = ProposalStatus.ACCEPTED;
    }

    public void reject() {
        if (this.status != ProposalStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted proposals can be rejected");
        }

        this.status = ProposalStatus.REJECTED;
    }

    public ProposalId getId() {
        return id;
    }

    public UUID getFreelancerUserId() {
        return freelancerUserId;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public BigDecimal getProposedBudget() {
        return proposedBudget;
    }

    public Integer getEstimatedDays() {
        return estimatedDays;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public ProposalStatus getStatus() {
        return status;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalizedValue = value.trim();
        return normalizedValue.isBlank() ? null : normalizedValue;
    }

    private static String validateRequiredText(String value, String fieldName, int min, int max) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        String normalizedValue = value.trim();
        if (normalizedValue.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank");
        }

        if (normalizedValue.length() < min || normalizedValue.length() > max) {
            throw new IllegalArgumentException(fieldName + " length must be between " + min + " and " + max + " characters");
        }

        return normalizedValue;
    }

    private static BigDecimal validateAmount(BigDecimal value, String fieldName) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        if (value.signum() <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }

        return value;
    }

    private static Integer validatePositive(Integer value, String fieldName) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }

        return value;
    }
}