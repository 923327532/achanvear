package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.domain.model.RatingTargetType;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "profile_ratings")
public class ProfileRatingJpaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private TalentProfileJpaEntity profile;

    @Column(name = "reviewer_user_id", nullable = false)
    private UUID reviewerUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reviewer_type", nullable = false, length = 30)
    private RatingTargetType reviewerType;

    @Column(name = "stars", nullable = false)
    private int stars;

    @Column(name = "recommended", nullable = false)
    private boolean recommended;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public TalentProfileJpaEntity getProfile() {
        return profile;
    }

    public void setProfile(TalentProfileJpaEntity profile) {
        this.profile = profile;
    }

    public UUID getReviewerUserId() {
        return reviewerUserId;
    }

    public void setReviewerUserId(UUID reviewerUserId) {
        this.reviewerUserId = reviewerUserId;
    }

    public RatingTargetType getReviewerType() {
        return reviewerType;
    }

    public void setReviewerType(RatingTargetType reviewerType) {
        this.reviewerType = reviewerType;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public boolean isRecommended() {
        return recommended;
    }

    public void setRecommended(boolean recommended) {
        this.recommended = recommended;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}