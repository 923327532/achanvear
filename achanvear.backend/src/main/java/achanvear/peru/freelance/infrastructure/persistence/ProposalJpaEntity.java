package achanvear.peru.freelance.infrastructure.persistence;

import achanvear.peru.freelance.domain.model.ProposalStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "freelance_proposals")
public class ProposalJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private FreelanceProjectJpaEntity project;

    @Column(name = "freelancer_user_id", nullable = false)
    private UUID freelancerUserId;

    @Column(name = "cover_letter", nullable = false, length = 2000)
    private String coverLetter;

    @Column(name = "proposed_budget", nullable = false, precision = 12, scale = 2)
    private BigDecimal proposedBudget;

    @Column(name = "estimated_days", nullable = false)
    private Integer estimatedDays;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProposalStatus status;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public FreelanceProjectJpaEntity getProject() {
        return project;
    }

    public void setProject(FreelanceProjectJpaEntity project) {
        this.project = project;
    }

    public UUID getFreelancerUserId() {
        return freelancerUserId;
    }

    public void setFreelancerUserId(UUID freelancerUserId) {
        this.freelancerUserId = freelancerUserId;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public BigDecimal getProposedBudget() {
        return proposedBudget;
    }

    public void setProposedBudget(BigDecimal proposedBudget) {
        this.proposedBudget = proposedBudget;
    }

    public Integer getEstimatedDays() {
        return estimatedDays;
    }

    public void setEstimatedDays(Integer estimatedDays) {
        this.estimatedDays = estimatedDays;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public ProposalStatus getStatus() {
        return status;
    }

    public void setStatus(ProposalStatus status) {
        this.status = status;
    }
}