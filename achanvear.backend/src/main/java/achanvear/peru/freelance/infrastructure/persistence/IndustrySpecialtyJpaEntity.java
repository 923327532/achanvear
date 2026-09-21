package achanvear.peru.freelance.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "industry_specialties")
public class IndustrySpecialtyJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String industry;

    @Column(nullable = false, length = 120)
    private String specialty;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public IndustrySpecialtyJpaEntity() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
