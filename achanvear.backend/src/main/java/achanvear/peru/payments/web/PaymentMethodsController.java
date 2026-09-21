package achanvear.peru.payments.web;

import achanvear.peru.payments.application.dto.PaymentMethodResponse;
import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.domain.model.PaymentMethod;
import achanvear.peru.payments.domain.model.PaymentMethodId;
import achanvear.peru.payments.domain.repository.PaymentMethodRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments/methods")
public class PaymentMethodsController {

    private final PaymentMethodRepository paymentMethodRepository;
    private final AuditService auditService;

    public PaymentMethodsController(
            PaymentMethodRepository paymentMethodRepository,
            AuditService auditService
    ) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.auditService = auditService;
    }

    /**
     * Lista todos los métodos de pago del usuario autenticado.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> listPaymentMethods(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<PaymentMethod> methods = paymentMethodRepository.findActiveByUserId(user.getUserId());
        var formatter = DateTimeFormatter.ISO_INSTANT;
        List<PaymentMethodResponse> response = methods.stream()
                .map(m -> new PaymentMethodResponse(
                        m.getId().value().toString(),
                        m.getPaymentType(),
                        m.getLastFourDigits(),
                        m.getCardholderName(),
                        m.getExpirationDate(),
                        m.getIssuerName(),
                        m.isDefault(),
                        m.isActive(),
                        m.getCreatedAt() != null ? formatter.format(m.getCreatedAt()) : null
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Payment methods retrieved"));
    }

    /**
     * Obtiene un método de pago específico.
     */
    @GetMapping("/{paymentMethodId}")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> getPaymentMethod(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID paymentMethodId
    ) {
        PaymentMethod method = paymentMethodRepository.findById(new PaymentMethodId(paymentMethodId))
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));

        if (!method.getUserId().equals(user.getUserId())) {
            throw new SecurityException("Access denied");
        }

        var formatter = DateTimeFormatter.ISO_INSTANT;
        PaymentMethodResponse response = new PaymentMethodResponse(
                method.getId().value().toString(),
                method.getPaymentType(),
                method.getLastFourDigits(),
                method.getCardholderName(),
                method.getExpirationDate(),
                method.getIssuerName(),
                method.isDefault(),
                method.isActive(),
                method.getCreatedAt() != null ? formatter.format(method.getCreatedAt()) : null
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Payment method retrieved"));
    }

    /**
     * Elimina (desactiva) un método de pago.
     */
    @DeleteMapping("/{paymentMethodId}")
    public ResponseEntity<ApiResponse<Void>> removePaymentMethod(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID paymentMethodId
    ) {
        PaymentMethod method = paymentMethodRepository.findById(new PaymentMethodId(paymentMethodId))
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));

        if (!method.getUserId().equals(user.getUserId())) {
            throw new SecurityException("Access denied");
        }

        method.deactivate();
        paymentMethodRepository.save(method);

        auditService.logPaymentMethodRemoved(user.getUserId(), paymentMethodId.toString(), null);

        return ResponseEntity.ok(ApiResponse.success(null, "Payment method removed"));
    }

    /**
     * Marca un método de pago como predeterminado.
     */
    @PostMapping("/{paymentMethodId}/default")
    public ResponseEntity<ApiResponse<Void>> setDefaultPaymentMethod(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID paymentMethodId
    ) {
        // Desmarcar el actual default
        paymentMethodRepository.findDefaultByUserId(user.getUserId())
                .ifPresent(currentDefault -> {
                    currentDefault.unmarkAsDefault();
                    paymentMethodRepository.save(currentDefault);
                });

        // Marcar el nuevo como default
        PaymentMethod method = paymentMethodRepository.findById(new PaymentMethodId(paymentMethodId))
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));

        if (!method.getUserId().equals(user.getUserId())) {
            throw new SecurityException("Access denied");
        }

        method.markAsDefault();
        paymentMethodRepository.save(method);

        return ResponseEntity.ok(ApiResponse.success(null, "Default payment method updated"));
    }

    /**
     * Guarda un método de pago desde Mercado Pago (callback).
     */
    @PostMapping("/save-card")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> savePaymentMethod(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody SavePaymentMethodRequest request
    ) {
        PaymentMethod method = PaymentMethod.create(
                user.getUserId(),
                request.mpCardId(),
                request.mpPayerId(),
                request.paymentType(),
                request.lastFourDigits(),
                request.cardholderName(),
                request.expirationDate(),
                request.issuerName()
        );

        // Si es el primer método, marcarlo como default
        List<PaymentMethod> existingMethods = paymentMethodRepository.findActiveByUserId(user.getUserId());
        if (existingMethods.isEmpty()) {
            method.markAsDefault();
        }

        paymentMethodRepository.save(method);

        auditService.logPaymentMethodAdded(user.getUserId(), method.getId().value().toString(),
                request.paymentType(), null);

        var formatter = DateTimeFormatter.ISO_INSTANT;
        PaymentMethodResponse response = new PaymentMethodResponse(
                method.getId().value().toString(),
                method.getPaymentType(),
                method.getLastFourDigits(),
                method.getCardholderName(),
                method.getExpirationDate(),
                method.getIssuerName(),
                method.isDefault(),
                method.isActive(),
                method.getCreatedAt() != null ? formatter.format(method.getCreatedAt()) : null
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Payment method saved"));
    }

    public record SavePaymentMethodRequest(
            @NotBlank String mpCardId,
            @NotBlank String mpPayerId,
            @NotBlank String paymentType,
            String lastFourDigits,
            String cardholderName,
            String expirationDate,
            String issuerName
    ) {}
}
