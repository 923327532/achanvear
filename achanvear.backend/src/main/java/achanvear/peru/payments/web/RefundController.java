package achanvear.peru.payments.web;

import achanvear.peru.payments.application.dto.RefundResponse;
import achanvear.peru.payments.application.service.RefundService;
import achanvear.peru.payments.domain.model.Escrow;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/payments/refunds")
public class RefundController {

    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    /**
     * Procesa un reembolso completo para un milestone.
     * Solo disponible para administradores o soporte.
     */
    @PostMapping("/milestones/{milestoneId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<RefundResponse>> processRefund(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID milestoneId,
            @RequestBody RefundRequest request
    ) {
        Escrow escrow = refundService.processRefund(milestoneId, request.reason());

        var formatter = DateTimeFormatter.ISO_INSTANT;
        RefundResponse response = new RefundResponse(
                escrow.getId().value().toString(),
                escrow.getMilestoneId().toString(),
                escrow.getAmount(),
                request.reason(),
                escrow.getMpPaymentId(),
                "PROCESSED",
                escrow.getRefundedAt() != null ? formatter.format(escrow.getRefundedAt()) : null,
                escrow.getCreatedAt() != null ? formatter.format(escrow.getCreatedAt()) : null
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Refund processed successfully"));
    }

    /**
     * Procesa un reembolso parcial.
     */
    @PostMapping("/milestones/{milestoneId}/partial")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<RefundResponse>> processPartialRefund(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID milestoneId,
            @RequestBody PartialRefundRequest request
    ) {
        Escrow escrow = refundService.processPartialRefund(milestoneId, request.amount(), request.reason());

        var formatter = DateTimeFormatter.ISO_INSTANT;
        RefundResponse response = new RefundResponse(
                escrow.getId().value().toString(),
                escrow.getMilestoneId().toString(),
                request.amount(),
                request.reason(),
                escrow.getMpPaymentId(),
                "PROCESSED",
                null,
                escrow.getCreatedAt() != null ? formatter.format(escrow.getCreatedAt()) : null
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Partial refund processed successfully"));
    }

    public record RefundRequest(
            @NotBlank @Size(max = 2000) String reason
    ) {}

    public record PartialRefundRequest(
            @NotBlank java.math.BigDecimal amount,
            @NotBlank @Size(max = 2000) String reason
    ) {}
}
