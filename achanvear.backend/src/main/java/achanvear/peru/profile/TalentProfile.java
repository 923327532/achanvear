package achanvear.peru.profile;

import achanvear.peru.profile.domain.event.ProfileCompletedEvent;
import achanvear.peru.profile.domain.model.*;
import achanvear.peru.shared.domain.AggregateRoot;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class TalentProfile extends AggregateRoot<TalentProfileId> {

    private final TalentProfileId id;
    private final UUID userId;
    private ProfileType profileType;
    private String headline;
    private String biography;
    private String location;
    private String profilePhotoUrl;
    private String curriculumUrl;
    private ProfileStatus status;
    private final List<Skill> skills;
    private final List<PortfolioItem> portfolioItems;
    private final List<ProfileRating> ratings;
    private ReputationScore reputationScore;

    private TalentProfile(
            TalentProfileId id,
            UUID userId,
            ProfileType profileType,
            String headline,
            String biography,
            String location,
            String profilePhotoUrl,
            String curriculumUrl,
            ProfileStatus status,
            List<Skill> skills,
            List<PortfolioItem> portfolioItems,
            List<ProfileRating> ratings
    ) {
        this.id = Objects.requireNonNull(id, "Talent profile id cannot be null");
        this.userId = Objects.requireNonNull(userId, "User id cannot be null");
        this.profileType = Objects.requireNonNull(profileType, "Profile type cannot be null");
        this.headline = validateRequiredText(headline, "Headline", 5, 180);
        this.biography = validateRequiredText(biography, "Biography", 20, 2000);
        this.location = location != null && !location.trim().isEmpty() ? location.trim() : "Por definir";
        this.profilePhotoUrl = normalizeOptionalText(profilePhotoUrl);
        this.curriculumUrl = normalizeOptionalText(curriculumUrl);
        this.status = Objects.requireNonNull(status, "Profile status cannot be null");
        this.skills = new ArrayList<>(Objects.requireNonNull(skills, "Skills cannot be null"));
        this.portfolioItems = new ArrayList<>(Objects.requireNonNull(portfolioItems, "Portfolio items cannot be null"));
        this.ratings = new ArrayList<>(Objects.requireNonNull(ratings, "Ratings cannot be null"));
        this.reputationScore = ReputationScore.fromRatings(this.ratings);
    }

    public static TalentProfile create(
            UUID userId,
            ProfileType profileType,
            String headline,
            String biography,
            String location,
            String profilePhotoUrl,
            String curriculumUrl,
            List<Skill> skills,
            List<PortfolioItem> portfolioItems
    ) {
        TalentProfile profile = new TalentProfile(
                TalentProfileId.generate(),
                userId,
                profileType,
                headline,
                biography,
                location,
                profilePhotoUrl,
                curriculumUrl,
                ProfileStatus.INCOMPLETE,
                skills,
                portfolioItems,
                new ArrayList<>()
        );

        profile.refreshCompletionStatus();
        return profile;
    }

    /**
     * Crea un perfil básico al momento del registro del usuario.
     * Usa el nombre completo como headline y valores por defecto para los campos obligatorios.
     */
    public static TalentProfile createBasic(UUID userId, String fullName) {
        TalentProfile profile = new TalentProfile(
                TalentProfileId.generate(),
                userId,
                ProfileType.FREELANCER,
                fullName != null ? fullName : "Profesional",
                "Perfil en construcción. Completa tu información profesional para que las empresas puedan conocerte mejor.",
                "Por definir",
                null,
                null,
                ProfileStatus.INCOMPLETE,
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>()
        );

        return profile;
    }

    public static TalentProfile restore(
            TalentProfileId id,
            UUID userId,
            ProfileType profileType,
            String headline,
            String biography,
            String location,
            String profilePhotoUrl,
            String curriculumUrl,
            ProfileStatus status,
            List<Skill> skills,
            List<PortfolioItem> portfolioItems,
            List<ProfileRating> ratings
    ) {
        return new TalentProfile(
                id,
                userId,
                profileType,
                headline,
                biography,
                location,
                profilePhotoUrl,
                curriculumUrl,
                status,
                skills,
                portfolioItems,
                ratings
        );
    }

    public void updateProfile(
            ProfileType profileType,
            String headline,
            String biography,
            String location,
            String profilePhotoUrl,
            String curriculumUrl,
            List<Skill> skills,
            List<PortfolioItem> portfolioItems
    ) {
        ensureNotSuspended();

        this.profileType = Objects.requireNonNull(profileType, "Profile type cannot be null");
        this.headline = validateRequiredText(headline, "Headline", 5, 180);
        this.biography = validateRequiredText(biography, "Biography", 20, 2000);
        this.location = location != null && !location.trim().isEmpty() ? location.trim() : "Por definir";
        this.profilePhotoUrl = normalizeOptionalText(profilePhotoUrl);
        this.curriculumUrl = normalizeOptionalText(curriculumUrl);

        this.skills.clear();
        this.skills.addAll(Objects.requireNonNull(skills, "Skills cannot be null"));

        this.portfolioItems.clear();
        this.portfolioItems.addAll(Objects.requireNonNull(portfolioItems, "Portfolio items cannot be null"));

        refreshCompletionStatus();
    }

    public void addRating(
            UUID reviewerUserId,
            RatingTargetType reviewerType,
            int stars,
            boolean recommended,
            String comment
    ) {
        ensureNotSuspended();
        validateReviewerType(reviewerType);

        if (this.userId.equals(reviewerUserId)) {
            throw new IllegalArgumentException("User cannot rate own profile");
        }

        // Check if user already rated — if so, update the existing rating
        for (int i = 0; i < this.ratings.size(); i++) {
            ProfileRating existing = this.ratings.get(i);
            if (existing.getReviewerUserId().equals(reviewerUserId)) {
                this.ratings.set(i, existing.update(stars, recommended, comment));
                this.reputationScore = ReputationScore.fromRatings(this.ratings);
                return;
            }
        }

        this.ratings.add(ProfileRating.create(
                reviewerUserId,
                reviewerType,
                stars,
                recommended,
                comment
        ));

        this.reputationScore = ReputationScore.fromRatings(this.ratings);
    }

    public void suspend() {
        this.status = ProfileStatus.SUSPENDED;
    }

    public boolean belongsTo(UUID userId) {
        return this.userId.equals(userId);
    }

    public TalentProfileId getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public ProfileType getProfileType() {
        return profileType;
    }

    public String getHeadline() {
        return headline;
    }

    public String getBiography() {
        return biography;
    }

    public String getLocation() {
        return location;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public String getCurriculumUrl() {
        return curriculumUrl;
    }

    public ProfileStatus getStatus() {
        return status;
    }

    public List<Skill> getSkills() {
        return List.copyOf(skills);
    }

    public List<PortfolioItem> getPortfolioItems() {
        return List.copyOf(portfolioItems);
    }

    public List<ProfileRating> getRatings() {
        return List.copyOf(ratings);
    }

    public ReputationScore getReputationScore() {
        return reputationScore;
    }

    private void refreshCompletionStatus() {
        boolean completed = this.profilePhotoUrl != null
                && this.curriculumUrl != null
                && !this.skills.isEmpty()
                && !this.portfolioItems.isEmpty()
                && this.biography.length() >= 50;

        ProfileStatus previousStatus = this.status;
        this.status = completed ? ProfileStatus.COMPLETED : ProfileStatus.INCOMPLETE;

        if (previousStatus != ProfileStatus.COMPLETED && this.status == ProfileStatus.COMPLETED) {
            registerEvent(ProfileCompletedEvent.now(this.id, this.userId));
        }
    }

    private void ensureNotSuspended() {
        if (this.status == ProfileStatus.SUSPENDED) {
            throw new IllegalStateException("Suspended profile cannot be modified");
        }
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

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();
        return normalizedValue.isBlank() ? null : normalizedValue;
    }

    private void validateReviewerType(RatingTargetType reviewerType) {
        boolean validCombination =
                (this.profileType == ProfileType.COMPANY
                        && (reviewerType == RatingTargetType.FREELANCER || reviewerType == RatingTargetType.PROFESSIONAL))
                        || ((this.profileType == ProfileType.FREELANCER || this.profileType == ProfileType.PROFESSIONAL)
                        && reviewerType == RatingTargetType.COMPANY);

        if (!validCombination) {
            throw new IllegalArgumentException("Reviewer type is not allowed for this target profile");
        }
    }
}