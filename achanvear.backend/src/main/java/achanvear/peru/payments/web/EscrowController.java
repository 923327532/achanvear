package achanvear.peru.payments.web;

import achanvear.peru.payments.application.dto.EscrowStatusResponse;
import achanvear.peru.payments.application.service.EscrowService;
import achanvear.peru.payments.domain.model.Escrow;
import achanvear.peru.payments.domain.model.EscrowStatus;
import achanvear.peru.payments.domain.repository.EscrowRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments/escrow")
public class EscrowController {

    private final EscrowService escrowService;
    private final EscrowRepository escrowRepository;

    public EscrowController(EscrowService escrowService, EscrowRepository escrowRepository) {
        this.escrowService = escrowService;
        this.escrowRepository = escrowRepository;
    }

    /**
     * Obtiene el estado del escrow para un milestone específico.
     */
    @GetMapping("/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<EscrowStatusResponse>> getEscrowByMilestone(
            @PathVariable UUID milestoneId
    ) {
        Escrow escrow = escrowService.getEscrowByMilestone(milestoneId);
        return ResponseEntity.ok(ApiResponse.success(toResponse(escrow), "Escrow status retrieved"));
    }

    /**
     * Lista todos los escrows del usuario autenticado como cliente.
     */
    @GetMapping("/client")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<List<EscrowStatusResponse>>> getClientEscrows(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<Escrow> escrows = escrowRepository.findByClientUserId(user.getUserId());
        List<EscrowStatusResponse> response = escrows.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Client escrows retrieved"));
    }

    /**
     * Lista todos los escrows del usuario autenticado como freelancer.
     */
    @GetMapping("/freelancer")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<List<EscrowStatusResponse>>> getFreelancerEscrows(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<Escrow> escrows = escrowRepository.findByFreelancerUserId(user.getUserId());
        List<EscrowStatusResponse> response = escrows.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Freelancer escrows retrieved"));
    }

    /**
     * Lista escrows por estado.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EscrowStatusResponse>>> getEscrowsByStatus(
            @PathVariable String status
    ) {
        EscrowStatus escrowStatus = EscrowStatus.valueOf(status.toUpperCase());
        List<Escrow> escrows = escrowRepository.findByStatus(escrowStatus);
        List<EscrowStatusResponse> response = escrows.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Escrows by status retrieved"));
    }

    private EscrowStatusResponse toResponse(Escrow escrow) {
        var formatter = DateTimeFormatter.ISO_INSTANT;
        return new EscrowStatusResponse(
                escrow.getId().value().toString(),
                escrow.getMilestoneId().toString(),
                escrow.getProjectId().toString(),
                escrow.getAmount(),
                escrow.getPlatformCommission(),
                escrow.getMpCommission(),
                escrow.getFreelancerAmount(),
                escrow.getStatus().name(),
                escrow.getHeldAt() != null ? formatter.format(escrow.getHeldAt()) : null,
                escrow.getReleasedAt() != null ? formatter.format(escrow.getReleasedAt()) : null,
                escrow.getRefundedAt() != null ? formatter.format(escrow.getRefundedAt()) : null,
                escrow.getDisputedAt() != null ? formatter.format(escrow.getDisputedAt()) : null,
                escrow.getDisputeReason()
        );
    }
}
