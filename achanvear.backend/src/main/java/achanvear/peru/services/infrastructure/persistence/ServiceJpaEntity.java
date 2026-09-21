package achanvear.peru.services.infrastructure.persistence;

import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "services")
public class ServiceJpaEntity extends BaseJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "freelancer_user_id", nullable = false)
    private UUID freelancerUserId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "short_description", length = 300)
    private String shortDescription;

    @Column(name = "description", nullable = false, length = 5000)
    private String description;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "subcategory", length = 100)
    private String subcategory;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "delivery_days", nullable = false)
    private Integer deliveryDays;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "views", nullable = false)
    private Integer views;

    @Column(name = "sales", nullable = false)
    private Integer sales;

    @Column(name = "rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Column(name = "video_urls", columnDefinition = "TEXT")
    private String videoUrls;

    @Column(name = "pdf_urls", columnDefinition = "TEXT")
    private String pdfUrls;

    @Column(name = "certificate_urls", columnDefinition = "TEXT")
    private String certificateUrls;

    @Column(name = "modality", length = 30)
    private String modality;

    @Column(name = "coverage_type", length = 30)
    private String coverageType;

    @Column(name = "coverage_details", columnDefinition = "TEXT")
    private String coverageDetails;

    @Column(name = "schedule", columnDefinition = "TEXT")
    private String schedule;

    @Column(name = "billing_type", length = 30)
    private String billingType;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "whatsapp", length = 20)
    private String whatsapp;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email_contact", length = 255)
    private String emailContact;

    @Column(name = "faqs", columnDefinition = "TEXT")
    private String faqs;

    @Column(name = "warranty_info", columnDefinition = "TEXT")
    private String warrantyInfo;

    @Column(name = "cancellation_policy", columnDefinition = "TEXT")
    private String cancellationPolicy;

    @Column(name = "support_info", columnDefinition = "TEXT")
    private String supportInfo;

    @Column(name = "response_time", length = 50)
    private String responseTime;

    @Column(name = "is_featured")
    private Boolean isFeatured;

    @Column(name = "is_premium")
    private Boolean isPremium;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @Column(name = "available_immediately")
    private Boolean availableImmediately;

    // ─── Getters & Setters ──────────────────────────────────────────────────────

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getFreelancerUserId() { return freelancerUserId; }
    public void setFreelancerUserId(UUID freelancerUserId) { this.freelancerUserId = freelancerUserId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public Integer getDeliveryDays() { return deliveryDays; }
    public void setDeliveryDays(Integer deliveryDays) { this.deliveryDays = deliveryDays; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public Integer getSales() { return sales; }
    public void setSales(Integer sales) { this.sales = sales; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }

    public String getVideoUrls() { return videoUrls; }
    public void setVideoUrls(String videoUrls) { this.videoUrls = videoUrls; }

    public String getPdfUrls() { return pdfUrls; }
    public void setPdfUrls(String pdfUrls) { this.pdfUrls = pdfUrls; }

    public String getCertificateUrls() { return certificateUrls; }
    public void setCertificateUrls(String certificateUrls) { this.certificateUrls = certificateUrls; }

    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }

    public String getCoverageType() { return coverageType; }
    public void setCoverageType(String coverageType) { this.coverageType = coverageType; }

    public String getCoverageDetails() { return coverageDetails; }
    public void setCoverageDetails(String coverageDetails) { this.coverageDetails = coverageDetails; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public String getBillingType() { return billingType; }
    public void setBillingType(String billingType) { this.billingType = billingType; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmailContact() { return emailContact; }
    public void setEmailContact(String emailContact) { this.emailContact = emailContact; }

    public String getFaqs() { return faqs; }
    public void setFaqs(String faqs) { this.faqs = faqs; }

    public String getWarrantyInfo() { return warrantyInfo; }
    public void setWarrantyInfo(String warrantyInfo) { this.warrantyInfo = warrantyInfo; }

    public String getCancellationPolicy() { return cancellationPolicy; }
    public void setCancellationPolicy(String cancellationPolicy) { this.cancellationPolicy = cancellationPolicy; }

    public String getSupportInfo() { return supportInfo; }
    public void setSupportInfo(String supportInfo) { this.supportInfo = supportInfo; }

    public String getResponseTime() { return responseTime; }
    public void setResponseTime(String responseTime) { this.responseTime = responseTime; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public Boolean getIsPremium() { return isPremium; }
    public void setIsPremium(Boolean isPremium) { this.isPremium = isPremium; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Boolean getAvailableImmediately() { return availableImmediately; }
    public void setAvailableImmediately(Boolean availableImmediately) { this.availableImmediately = availableImmediately; }
}
