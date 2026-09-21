package achanvear.peru.payments.web;

import achanvear.peru.payments.application.service.WalletService;
import achanvear.peru.payments.domain.model.PayoutMethod;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Métodos de retiro del profesional (tarjeta tokenizada vía Izipay).
 * Tiyuy nunca almacena el número completo de tarjeta ni el CVV.
 */
@RestController
@RequestMapping("/payments/payout-methods")
public class PayoutMethodController {

    private final WalletService walletService;

    public PayoutMethodController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Lista los métodos de retiro del usuario.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PayoutMethodResponse>>> list(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<PayoutMethodResponse> response = walletService.listPayoutMethods(user.getUserId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Métodos de retiro obtenidos"));
    }

    /**
     * Registra una tarjeta tokenizada como método de retiro.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PayoutMethodResponse>> register(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody RegisterPayoutMethodRequest request
    ) {
        PayoutMethod method = walletService.registerPayoutMethod(
                user.getUserId(),
                request.cardToken(),
                request.maskedCard(),
                request.cardBrand(),
                request.lastFourDigits(),
                request.accountHolderName()
        );
        return ResponseEntity.ok(ApiResponse.success(toResponse(method), "Método de retiro registrado"));
    }

    /**
     * Desactiva un método de retiro.
     */
    @DeleteMapping("/{methodId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID methodId
    ) {
        walletService.removePayoutMethod(user.getUserId(), methodId);
        return ResponseEntity.ok(ApiResponse.success(null, "Método de retiro eliminado"));
    }

    /**
     * Marca un método de retiro como principal.
     */
    @PostMapping("/{methodId}/default")
    public ResponseEntity<ApiResponse<Void>> setDefault(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID methodId
    ) {
        walletService.setDefaultPayoutMethod(user.getUserId(), methodId);
        return ResponseEntity.ok(ApiResponse.success(null, "Método de retiro principal actualizado"));
    }

    private PayoutMethodResponse toResponse(PayoutMethod m) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
        return new PayoutMethodResponse(
                m.getId().value().toString(),
                m.getProvider(),
                m.getCardToken(),
                m.getMaskedCard(),
                m.getCardBrand(),
                m.getLastFourDigits(),
                m.getAccountHolderName(),
                m.isDefault(),
                m.isActive(),
                m.getCreatedAt() != null ? formatter.format(m.getCreatedAt()) : null
        );
    }

    // === Request/Response DTOs ===

    public record RegisterPayoutMethodRequest(
            String cardToken,
            @NotBlank String maskedCard,
            String cardBrand,
            @NotBlank @Pattern(regexp = "\\d{4}", message = "Se requieren los últimos 4 dígitos") String lastFourDigits,
            String accountHolderName
    ) {}

    public record PayoutMethodResponse(
            String id,
            String provider,
            String cardToken,
            String maskedCard,
            String cardBrand,
            String lastFourDigits,
            String accountHolderName,
            boolean isDefault,
            boolean isActive,
            String createdAt
    ) {}
}
