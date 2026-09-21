package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.SkillLevel;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "profile_skills")
public class SkillJpaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private TalentProfileJpaEntity profile;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 30)
    private SkillLevel level;

    @Column(name = "years_of_experience", nullable = false)
    private Integer yearsOfExperience;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
}