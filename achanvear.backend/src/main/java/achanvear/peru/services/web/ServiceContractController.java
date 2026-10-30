package achanvear.peru.services.web;
import achanvear.peru.services.application.*;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/services")
public class ServiceContractController {
    private final ServiceContractService service;
    private final ServiceContractStore store;
    public ServiceContractController(ServiceContractService service,ServiceContractStore store) { this.service=service; this.store=store; }
    public record CreateRequest(@NotNull UUID conversationId,@NotNull UUID serviceId,UUID planId,@NotNull UUID idempotencyKey) {}
    public record ReviewRequest(@Min(1) @Max(5) int stars,@Size(max=1000) String comment) {}
    @GetMapping("/{serviceId}/reviews")
    public ApiResponse<List<ServiceContractStore.VerifiedReview>> reviews(@PathVariable UUID serviceId) {
        return ApiResponse.success(store.reviews(serviceId),"Verified service reviews");
    }
    @PostMapping("/contracts") @PreAuthorize("hasAuthority('COMPANY')")
    public ApiResponse<ServiceContractStore.Contract> create(@AuthenticationPrincipal AuthenticatedUser user,@Valid @RequestBody CreateRequest request) {
        return ApiResponse.success(service.create(user.getUserId(),request.conversationId(),request.serviceId(),request.planId(),request.idempotencyKey()),"Contract created");
    }
    @PostMapping("/contracts/{id}/accept") @PreAuthorize("hasAuthority('FREELANCER')")
    public ApiResponse<Void> accept(@PathVariable UUID id,@AuthenticationPrincipal AuthenticatedUser user) {
        service.accept(id,user.getUserId()); return ApiResponse.success(null,"Contract accepted");
    }
    @PostMapping("/contracts/{id}/review") @PreAuthorize("hasAuthority('COMPANY')")
    public ApiResponse<Void> review(@PathVariable UUID id,@AuthenticationPrincipal AuthenticatedUser user,@Valid @RequestBody ReviewRequest request) {
        service.review(id,user.getUserId(),request.stars(),request.comment()); return ApiResponse.success(null,"Verified review saved");
    }
    @PostMapping("/conversations/{conversationId}/origins/{serviceId}") @PreAuthorize("hasAuthority('COMPANY')") @Transactional
    public ApiResponse<Void> origin(@PathVariable UUID conversationId,@PathVariable UUID serviceId,@AuthenticationPrincipal AuthenticatedUser user) {
        store.linkOrigin(conversationId,serviceId,user.getUserId()); return ApiResponse.success(null,"Service linked");
    }
    @GetMapping("/conversations/{conversationId}/offers") @PreAuthorize("isAuthenticated()") @Transactional
    public ApiResponse<List<ServiceContractStore.Offer>> offers(@PathVariable UUID conversationId,@AuthenticationPrincipal AuthenticatedUser user) {
        return ApiResponse.success(store.offers(conversationId,user.getUserId()),"Service plans");
    }
    @GetMapping("/conversations/{conversationId}/contracts") @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<ServiceContractStore.Contract>> list(@PathVariable UUID conversationId,@AuthenticationPrincipal AuthenticatedUser user) {
        return ApiResponse.success(store.list(conversationId,user.getUserId()),"Service contracts");
    }
}
