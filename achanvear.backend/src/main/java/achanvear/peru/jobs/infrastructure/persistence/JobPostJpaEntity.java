package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "job_posts")
public class JobPostJpaEntity extends BaseJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", nullable = false, length = 5000)
    private String description;

    @Column(name = "location", nullable = false, length = 120)
    private String location;

    @Column(name = "job_type", nullable = false, length = 40)
    private String type;

    @Column(name = "salary_min", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "vacancies", nullable = false)
    private Integer vacancies;

    @Column(name = "requirements", length = 5000)
    private String requirements;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    // Nuevos campos de configuracion de seleccion
    @Column(name = "max_applicants")
    private Integer maxApplicants;

    @Column(name = "closing_date")
    private Instant closingDate;

    @Column(name = "required_score_threshold")
    private Double requiredScoreThreshold;

    @Column(name = "selected_candidates_count")
    private Integer selectedCandidatesCount;

    @Column(name = "selection_mode", length = 30)
    private String selectionMode;

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<JobApplicationJpaEntity> applications = new ArrayList<>();

    public JobPostJpaEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(BigDecimal salaryMin) {
        this.salaryMin = salaryMin;
    }

    public BigDecimal getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(BigDecimal salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Integer getVacancies() {
        return vacancies;
    }

    public void setVacancies(Integer vacancies) {
        this.vacancies = vacancies;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<JobApplicationJpaEntity> getApplications() {
        return applications;
    }

    public void setApplications(List<JobApplicationJpaEntity> applications) {
        this.applications = applications;
    }

    // Getters y setters para nuevos campos

    public Integer getMaxApplicants() {
        return maxApplicants;
    }

    public void setMaxApplicants(Integer maxApplicants) {
        this.maxApplicants = maxApplicants;
    }

    public Instant getClosingDate() {
        return closingDate;
    }

    public void setClosingDate(Instant closingDate) {
        this.closingDate = closingDate;
    }

    public Double getRequiredScoreThreshold() {
        return requiredScoreThreshold;
    }

    public void setRequiredScoreThreshold(Double requiredScoreThreshold) {
        this.requiredScoreThreshold = requiredScoreThreshold;
    }

    public Integer getSelectedCandidatesCount() {
        return selectedCandidatesCount;
    }

    public void setSelectedCandidatesCount(Integer selectedCandidatesCount) {
        this.selectedCandidatesCount = selectedCandidatesCount;
    }

    public String getSelectionMode() {
        return selectionMode;
    }

    public void setSelectionMode(String selectionMode) {
        this.selectionMode = selectionMode;
    }
}
