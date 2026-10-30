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

    private final achanvear.peru.payments.application.service.EscrowResponseMapper mapper;
    private final EscrowService escrowService;
    private final EscrowRepository escrowRepository;

    public EscrowController(EscrowService escrowService, EscrowRepository escrowRepository, achanvear.peru.payments.application.service.EscrowResponseMapper mapper) {
        this.mapper = mapper;
        this.escrowService = escrowService;
        this.escrowRepository = escrowRepository;
    }

    /**
     * Obtiene el estado del escrow para un milestone específico.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EscrowStatusResponse>>> getMyEscrows(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<Escrow> escrows = new java.util.ArrayList<>();
        escrows.addAll(escrowRepository.findByClientUserId(user.getUserId()));
        escrows.addAll(escrowRepository.findByFreelancerUserId(user.getUserId()));

        var unique = escrows.stream().collect(Collectors.toMap(
                e -> e.getId().value(), e -> e, (first, ignored) -> first)).values();
        List<EscrowStatusResponse> response = mapper.toResponses(List.copyOf(unique));

        return ResponseEntity.ok(ApiResponse.success(response, "Escrows retrieved"));
    }

    @GetMapping("/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<EscrowStatusResponse>> getEscrowByMilestone(
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        Escrow escrow = escrowService.getEscrowByMilestone(milestoneId);
        if (!escrow.getClientUserId().equals(user.getUserId()) && !escrow.getFreelancerUserId().equals(user.getUserId())) {
            throw new SecurityException("You are not part of this transaction");
        }
        return ResponseEntity.ok(ApiResponse.success(mapper.toResponse(escrow), "Escrow status retrieved"));
    }

    /**
     * Lista todos los escrows del usuario autenticado como cliente.
     */
    @GetMapping("/client")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<List<EscrowStatusResponse>>> getClientEscrows(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<Escrow> escrows = escrowRepository.findByClientUserId(user.getUserId());
        List<EscrowStatusResponse> response = mapper.toResponses(escrows);
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
        List<EscrowStatusResponse> response = mapper.toResponses(escrows);
        return ResponseEntity.ok(ApiResponse.success(response, "Freelancer escrows retrieved"));
    }

    /**
     * Lista escrows por estado.
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<EscrowStatusResponse>>> getEscrowsByStatus(
            @PathVariable String status
    ) {
        EscrowStatus escrowStatus = EscrowStatus.valueOf(status.toUpperCase());
        List<Escrow> escrows = escrowRepository.findByStatus(escrowStatus);
        List<EscrowStatusResponse> response = mapper.toResponses(escrows);
        return ResponseEntity.ok(ApiResponse.success(response, "Escrows by status retrieved"));
    }

}
