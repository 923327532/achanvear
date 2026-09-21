package achanvear.peru.payments.web;

import achanvear.peru.payments.application.service.WalletService;
import achanvear.peru.payments.domain.model.QuickRecharge;
import achanvear.peru.payments.domain.model.Wallet;
import achanvear.peru.payments.domain.model.WalletTransaction;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Obtiene el saldo y estado de la wallet del usuario.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        Wallet wallet = walletService.getOrCreateWallet(user.getUserId());
        WalletResponse response = new WalletResponse(
                wallet.getId().value().toString(),
                wallet.getBalance(),
                wallet.getTotalDeposited(),
                wallet.getTotalWithdrawn(),
                wallet.getTotalSpent(),
                wallet.getCurrency(),
                wallet.isActive()
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Wallet retrieved"));
    }

    /**
     * Inicia una recarga rápida (Yape, Plin, etc.).
     */
    @PostMapping("/recharge")
    public ResponseEntity<ApiResponse<QuickRechargeResponse>> initiateRecharge(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody InitiateRechargeRequest request
    ) {
        QuickRecharge recharge = walletService.processQuickRecharge(
                user.getUserId(),
                request.amount(),
                request.method(),
                request.phoneNumber()
        );

        QuickRechargeResponse response = new QuickRechargeResponse(
                recharge.getId().value().toString(),
                recharge.getAmount(),
                recharge.getMethod(),
                recharge.getPhoneNumber(),
                recharge.getStatus().name(),
                recharge.getReferenceCode(),
                recharge.getCreatedAt() != null ?
                        DateTimeFormatter.ISO_INSTANT.format(recharge.getCreatedAt()) : null
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Recharge initiated"));
    }

    /**
     * Confirma una recarga rápida (completada).
     */
    @PostMapping("/recharge/{rechargeId}/confirm")
    public ResponseEntity<ApiResponse<QuickRechargeResponse>> confirmRecharge(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID rechargeId,
            @RequestBody ConfirmRechargeRequest request
    ) {
        QuickRecharge recharge = walletService.confirmQuickRecharge(rechargeId, request.referenceCode());

        QuickRechargeResponse response = new QuickRechargeResponse(
                recharge.getId().value().toString(),
                recharge.getAmount(),
                recharge.getMethod(),
                recharge.getPhoneNumber(),
                recharge.getStatus().name(),
                recharge.getReferenceCode(),
                recharge.getCompletedAt() != null ?
                        DateTimeFormatter.ISO_INSTANT.format(recharge.getCompletedAt()) : null
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Recharge confirmed"));
    }

    /**
     * Rechaza una recarga rápida (falló).
     */
    @PostMapping("/recharge/{rechargeId}/fail")
    public ResponseEntity<ApiResponse<QuickRechargeResponse>> failRecharge(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID rechargeId,
            @RequestBody FailRechargeRequest request
    ) {
        QuickRecharge recharge = walletService.failQuickRecharge(rechargeId, request.reason());

        QuickRechargeResponse response = new QuickRechargeResponse(
                recharge.getId().value().toString(),
                recharge.getAmount(),
                recharge.getMethod(),
                recharge.getPhoneNumber(),
                recharge.getStatus().name(),
                recharge.getReferenceCode(),
                recharge.getFailedAt() != null ?
                        DateTimeFormatter.ISO_INSTANT.format(recharge.getFailedAt()) : null
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Recharge failed"));
    }

    /**
     * Obtiene el historial de recargas del usuario.
     */
    @GetMapping("/recharges")
    public ResponseEntity<ApiResponse<List<QuickRechargeResponse>>> getRechargeHistory(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<QuickRecharge> recharges = walletService.getRechargeHistory(user.getUserId());
        var formatter = DateTimeFormatter.ISO_INSTANT;
        List<QuickRechargeResponse> response = recharges.stream()
                .map(r -> new QuickRechargeResponse(
                        r.getId().value().toString(),
                        r.getAmount(),
                        r.getMethod(),
                        r.getPhoneNumber(),
                        r.getStatus().name(),
                        r.getReferenceCode(),
                        r.getCompletedAt() != null ? formatter.format(r.getCompletedAt()) :
                                r.getFailedAt() != null ? formatter.format(r.getFailedAt()) :
                                        r.getCreatedAt() != null ? formatter.format(r.getCreatedAt()) : null
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response, "Recharge history retrieved"));
    }

    /**
     * Obtiene las transacciones de la wallet.
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransactionResponse>>> getTransactions(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<WalletTransaction> transactions = walletService.getWalletTransactions(user.getUserId());
        var formatter = DateTimeFormatter.ISO_INSTANT;
        List<WalletTransactionResponse> response = transactions.stream()
                .map(t -> new WalletTransactionResponse(
                        t.getId().value().toString(),
                        t.getType(),
                        t.getAmount(),
                        t.getBalanceBefore(),
                        t.getBalanceAfter(),
                        t.getReferenceType(),
                        t.getReferenceId(),
                        t.getDescription(),
                        t.getCreatedAt() != null ? formatter.format(t.getCreatedAt()) : null
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response, "Transactions retrieved"));
    }

    // === Request/Response DTOs ===

    public record InitiateRechargeRequest(
            @NotNull @DecimalMin("5.00") @DecimalMax("5000.00") BigDecimal amount,
            @NotBlank String method,
            String phoneNumber
    ) {}

    public record ConfirmRechargeRequest(
            @NotBlank String referenceCode
    ) {}

    public record FailRechargeRequest(
            @NotBlank String reason
    ) {}

    public record WalletResponse(
            String id,
            BigDecimal balance,
            BigDecimal totalDeposited,
            BigDecimal totalWithdrawn,
            BigDecimal totalSpent,
            String currency,
            boolean isActive
    ) {}

    public record QuickRechargeResponse(
            String id,
            BigDecimal amount,
            String method,
            String phoneNumber,
            String status,
            String referenceCode,
            String completedAt
    ) {}

    public record WalletTransactionResponse(
            String id,
            String type,
            BigDecimal amount,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String referenceType,
            String referenceId,
            String description,
            String createdAt
    ) {}
}
