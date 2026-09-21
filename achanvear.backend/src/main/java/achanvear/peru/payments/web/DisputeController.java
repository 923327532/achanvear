package achanvear.peru.payments.web;

import achanvear.peru.payments.application.dto.DisputeResponse;
import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.application.service.EscrowService;
import achanvear.peru.payments.domain.model.Dispute;
import achanvear.peru.payments.domain.model.DisputeId;
import achanvear.peru.payments.domain.model.DisputeStatus;
import achanvear.peru.payments.domain.repository.DisputeRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments/disputes")
public class DisputeController {

    private final DisputeRepository disputeRepository;
    private final EscrowService escrowService;
    private final AuditService auditService;

    public DisputeController(
            DisputeRepository disputeRepository,
            EscrowService escrowService,
            AuditService auditService
    ) {
        this.disputeRepository = disputeRepository;
        this.escrowService = escrowService;
        this.auditService = auditService;
    }

    /**
     * Abre una disputa sobre un milestone.
     */
    @PostMapping("/open")
    public ResponseEntity<ApiResponse<DisputeResponse>> openDispute(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody OpenDisputeRequest request
    ) {
        // Obtener el escrow para determinar contra quién se disputa
        var escrow = escrowService.getEscrowByMilestone(request.milestoneId());

        UUID raisedAgainstUserId;
        if (escrow.getClientUserId().equals(user.getUserId())) {
            raisedAgainstUserId = escrow.getFreelancerUserId();
        } else if (escrow.getFreelancerUserId().equals(user.getUserId())) {
            raisedAgainstUserId = escrow.getClientUserId();
        } else {
            throw new SecurityException("You are not part of this transaction");
        }

        // Marcar el escrow como en disputa
        escrowService.disputeFunds(request.milestoneId(), request.reason());

        // Crear la disputa
        Dispute dispute = Dispute.create(
                request.milestoneId(),
                escrow.getProjectId(),
                user.getUserId(),
                raisedAgainstUserId,
                request.reason(),
                request.description()
        );
        disputeRepository.save(dispute);

        auditService.logDisputeOpened(user.getUserId(), request.milestoneId().toString(),
                request.reason(), null);

        return ResponseEntity.ok(ApiResponse.success(toResponse(dispute), "Dispute opened"));
    }

    /**
     * Obtiene una disputa por ID.
     */
    @GetMapping("/{disputeId}")
    public ResponseEntity<ApiResponse<DisputeResponse>> getDispute(
            @PathVariable UUID disputeId
    ) {
        Dispute dispute = disputeRepository.findById(new DisputeId(disputeId))
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(dispute), "Dispute retrieved"));
    }

    /**
     * Obtiene la disputa asociada a un milestone.
     */
    @GetMapping("/by-milestone/{milestoneId}")
    public ResponseEntity<ApiResponse<DisputeResponse>> getDisputeByMilestone(
            @PathVariable UUID milestoneId
    ) {
        Dispute dispute = disputeRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("No dispute found for this milestone"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(dispute), "Dispute retrieved"));
    }

    /**
     * Lista disputas del usuario autenticado.
     */
    @GetMapping("/my-disputes")
    public ResponseEntity<ApiResponse<List<DisputeResponse>>> getMyDisputes(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<Dispute> disputes = disputeRepository.findByRaisedByUserId(user.getUserId());
        List<DisputeResponse> response = disputes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Disputes retrieved"));
    }

    /**
     * Resuelve una disputa (solo admin/soporte).
     */
    @PostMapping("/{disputeId}/resolve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<DisputeResponse>> resolveDispute(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID disputeId,
            @RequestBody ResolveDisputeRequest request
    ) {
        Dispute dispute = disputeRepository.findById(new DisputeId(disputeId))
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found"));

        dispute.startReview();
        dispute.resolve(request.resolution(), user.getUserId());
        disputeRepository.save(dispute);

        // Resolver el escrow según la decisión
        escrowService.resolveDispute(
                dispute.getMilestoneId(),
                request.resolution(),
                request.releaseToFreelancer()
        );

        auditService.logDisputeResolved(user.getUserId(), dispute.getMilestoneId().toString(),
                request.resolution(), null);

        return ResponseEntity.ok(ApiResponse.success(toResponse(dispute), "Dispute resolved"));
    }

    /**
     * Desestima una disputa (solo admin/soporte).
     */
    @PostMapping("/{disputeId}/dismiss")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<DisputeResponse>> dismissDispute(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID disputeId,
            @RequestBody DismissDisputeRequest request
    ) {
        Dispute dispute = disputeRepository.findById(new DisputeId(disputeId))
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found"));

        dispute.startReview();
        dispute.dismiss(request.reason(), user.getUserId());
        disputeRepository.save(dispute);

        return ResponseEntity.ok(ApiResponse.success(toResponse(dispute), "Dispute dismissed"));
    }

    private DisputeResponse toResponse(Dispute dispute) {
        var formatter = DateTimeFormatter.ISO_INSTANT;
        return new DisputeResponse(
                dispute.getId().value().toString(),
                dispute.getMilestoneId().toString(),
                dispute.getProjectId().toString(),
                dispute.getRaisedByUserId().toString(),
                dispute.getRaisedAgainstUserId().toString(),
                dispute.getReason(),
                dispute.getDescription(),
                dispute.getStatus().name(),
                dispute.getResolution(),
                dispute.getResolvedByUserId() != null ? dispute.getResolvedByUserId().toString() : null,
                dispute.getResolvedAt() != null ? formatter.format(dispute.getResolvedAt()) : null,
                dispute.getCreatedAt() != null ? formatter.format(dispute.getCreatedAt()) : null
        );
    }

    public record OpenDisputeRequest(
            @NotBlank UUID milestoneId,
            @NotBlank @Size(max = 2000) String reason,
            @Size(max = 5000) String description
    ) {}

    public record ResolveDisputeRequest(
            @NotBlank @Size(max = 2000) String resolution,
            boolean releaseToFreelancer
    ) {}

    public record DismissDisputeRequest(
            @NotBlank @Size(max = 2000) String reason
    ) {}
}
