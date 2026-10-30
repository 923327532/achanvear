package achanvear.peru.services.application;
import java.math.BigDecimal;
import java.util.*;
public interface ServiceContractStore {
    record Offer(UUID serviceId, UUID planId, UUID freelancerId, String title, String description,
                 String category, String planName, BigDecimal amount, int deliveryDays, String currency) {}
    record Contract(UUID id, UUID projectId, UUID serviceId, UUID planId, UUID conversationId,
                    UUID clientId, UUID freelancerId, UUID milestoneId, String title, String planName,
                    BigDecimal amount, int deliveryDays, String currency, String status, UUID idempotencyKey) {}
    record VerifiedReview(String reviewerUserId, int stars, String comment, String createdAt) {}
    List<VerifiedReview> reviews(UUID serviceId);
    Offer quote(UUID serviceId, UUID planId);
    void linkOrigin(UUID conversationId, UUID serviceId, UUID clientId);
    boolean canFormalize(UUID conversationId, UUID serviceId, UUID clientId, UUID freelancerId);
    List<Offer> offers(UUID conversationId, UUID userId);
    List<Contract> list(UUID conversationId, UUID userId);
    Optional<Contract> findByKey(UUID clientId, UUID key);
    Contract lock(UUID contractId);
    void save(Contract contract);
    void setStatus(UUID contractId, String status);
    void review(Contract contract, UUID reviewerId, int stars, String comment);
}
