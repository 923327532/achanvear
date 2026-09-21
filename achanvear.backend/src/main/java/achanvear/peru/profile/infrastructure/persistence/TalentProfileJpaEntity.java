package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.domain.model.ProfileStatus;
import achanvear.peru.profile.ProfileType;
import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "talent_profiles")
public class TalentProfileJpaEntity extends BaseJpaEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_type", nullable = false, length = 30)
    private ProfileType profileType;

    @Column(name = "headline", nullable = false, length = 180)
    private String headline;

    @Column(name = "biography", nullable = false, length = 2000)
    private String biography;

    @Column(name = "location", nullable = false, length = 120)
    private String location;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "curriculum_url")
    private String curriculumUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProfileStatus status;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SkillJpaEntity> skills = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PortfolioItemJpaEntity> portfolioItems = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfileRatingJpaEntity> ratings = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public ProfileType getProfileType() {
        return profileType;
    }

    public void setProfileType(ProfileType profileType) {
        this.profileType = profileType;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getCurriculumUrl() {
        return curriculumUrl;
    }

    public void setCurriculumUrl(String curriculumUrl) {
        this.curriculumUrl = curriculumUrl;
    }

    public ProfileStatus getStatus() {
        return status;
    }

    public void setStatus(ProfileStatus status) {
        this.status = status;
    }

    public List<SkillJpaEntity> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillJpaEntity> skills) {
        this.skills = skills;
    }

    public List<PortfolioItemJpaEntity> getPortfolioItems() {
        return portfolioItems;
    }

    public void setPortfolioItems(List<PortfolioItemJpaEntity> portfolioItems) {
        this.portfolioItems = portfolioItems;
    }

    public List<ProfileRatingJpaEntity> getRatings() {
        return ratings;
    }

    public void setRatings(List<ProfileRatingJpaEntity> ratings) {
        this.ratings = ratings;
    }
}