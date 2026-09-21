package achanvear.peru.payments.web;

import achanvear.peru.payments.application.service.WalletService;
import achanvear.peru.payments.domain.model.Payout;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Solicitudes de retiro del profesional (dispersión de fondos a su tarjeta).
 */
@RestController
@RequestMapping("/payments/payouts")
public class PayoutController {

    private final WalletService walletService;

    public PayoutController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Historial de retiros del usuario.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PayoutResponse>>> history(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<PayoutResponse> response = walletService.getPayoutHistory(user.getUserId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Historial de retiros obtenido"));
    }

    /**
     * Solicita un retiro del saldo disponible. Idempotente por idempotencyKey.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PayoutResponse>> request(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody RequestPayoutRequest request
    ) {
        Payout payout = walletService.requestPayout(
                user.getUserId(),
                request.amount(),
                request.payoutMethodId(),
                request.idempotencyKey()
        );
        return ResponseEntity.ok(ApiResponse.success(toResponse(payout), "Retiro solicitado"));
    }

    /**
     * Consulta el estado del desembolso en el proveedor y actualiza el retiro.
     */
    @PostMapping("/{payoutId}/refresh")
    public ResponseEntity<ApiResponse<PayoutResponse>> refresh(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID payoutId
    ) {
        Payout payout = walletService.refreshPayout(user.getUserId(), payoutId);
        return ResponseEntity.ok(ApiResponse.success(toResponse(payout), "Estado del retiro actualizado"));
    }

    private PayoutResponse toResponse(Payout p) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
        return new PayoutResponse(
                p.getId().value().toString(),
                p.getUserId().toString(),
                p.getPayoutMethodId().toString(),
                p.getAmount(),
                p.getStatus().name(),
                p.getExternalDisbursementId(),
                p.getFailureReason(),
                p.getRequestedAt() != null ? formatter.format(p.getRequestedAt()) : null,
                p.getCompletedAt() != null ? formatter.format(p.getCompletedAt()) : null,
                p.getCreatedAt() != null ? formatter.format(p.getCreatedAt()) : null
        );
    }

    // === Request/Response DTOs ===

    public record RequestPayoutRequest(
            @NotNull @DecimalMin("1.00") BigDecimal amount,
            @NotNull UUID payoutMethodId,
            String idempotencyKey
    ) {}

    public record PayoutResponse(
            String id,
            String userId,
            String payoutMethodId,
            BigDecimal amount,
            String status,
            String externalDisbursementId,
            String failureReason,
            String requestedAt,
            String completedAt,
            String createdAt
    ) {}
}
