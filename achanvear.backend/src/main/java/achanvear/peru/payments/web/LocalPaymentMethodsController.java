package achanvear.peru.payments.web;

import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.domain.model.LocalPaymentMethod;
import achanvear.peru.payments.domain.model.LocalPaymentMethodId;
import achanvear.peru.payments.domain.repository.LocalPaymentMethodRepository;
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
@RequestMapping("/payments/local-methods")
public class LocalPaymentMethodsController {

    private final LocalPaymentMethodRepository localPaymentMethodRepository;
    private final AuditService auditService;

    public LocalPaymentMethodsController(
            LocalPaymentMethodRepository localPaymentMethodRepository,
            AuditService auditService
    ) {
        this.localPaymentMethodRepository = localPaymentMethodRepository;
        this.auditService = auditService;
    }

    /**
     * Lista los métodos de pago locales del usuario (Yape, Plin).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LocalPaymentMethodResponse>>> listLocalMethods(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<LocalPaymentMethod> methods = localPaymentMethodRepository.findByUserId(user.getUserId());
        var formatter = DateTimeFormatter.ISO_INSTANT;
        List<LocalPaymentMethodResponse> response = methods.stream()
                .map(m -> new LocalPaymentMethodResponse(
                        m.getId().value().toString(),
                        m.getMethodType(),
                        m.getPhoneNumber(),
                        m.getAccountHolderName(),
                        m.isVerified(),
                        m.isDefault(),
                        m.isActive(),
                        m.getCreatedAt() != null ? formatter.format(m.getCreatedAt()) : null
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Local payment methods retrieved"));
    }

    /**
     * Agrega un método de pago local (Yape o Plin).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LocalPaymentMethodResponse>> addLocalMethod(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody AddLocalMethodRequest request
    ) {
        // Validar tipo
        if (!List.of("YAPE", "PLIN").contains(request.methodType().toUpperCase())) {
            throw new IllegalArgumentException("Invalid method type. Must be YAPE or PLIN");
        }

        LocalPaymentMethod method = LocalPaymentMethod.create(
                user.getUserId(),
                request.methodType().toUpperCase(),
                request.phoneNumber(),
                request.accountHolderName()
        );

        // Si es el primer método, marcarlo como default
        List<LocalPaymentMethod> existingMethods = localPaymentMethodRepository.findByUserId(user.getUserId());
        if (existingMethods.isEmpty()) {
            method.markAsDefault();
        }

        localPaymentMethodRepository.save(method);

        auditService.logLocalPaymentMethodAdded(user.getUserId(), method.getId().value().toString(),
                method.getMethodType(), null);

        var formatter = DateTimeFormatter.ISO_INSTANT;
        LocalPaymentMethodResponse response = new LocalPaymentMethodResponse(
                method.getId().value().toString(),
                method.getMethodType(),
                method.getPhoneNumber(),
                method.getAccountHolderName(),
                method.isVerified(),
                method.isDefault(),
                method.isActive(),
                method.getCreatedAt() != null ? formatter.format(method.getCreatedAt()) : null
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Local payment method added"));
    }

    /**
     * Elimina un método de pago local.
     */
    @DeleteMapping("/{methodId}")
    public ResponseEntity<ApiResponse<Void>> removeLocalMethod(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID methodId
    ) {
        LocalPaymentMethod method = localPaymentMethodRepository.findById(new LocalPaymentMethodId(methodId))
                .orElseThrow(() -> new IllegalArgumentException("Local payment method not found"));

        if (!method.getUserId().equals(user.getUserId())) {
            throw new SecurityException("Access denied");
        }

        method.deactivate();
        localPaymentMethodRepository.save(method);

        auditService.logLocalPaymentMethodRemoved(user.getUserId(), methodId.toString(),
                method.getMethodType(), null);

        return ResponseEntity.ok(ApiResponse.success(null, "Local payment method removed"));
    }

    /**
     * Marca un método de pago local como predeterminado.
     */
    @PostMapping("/{methodId}/default")
    public ResponseEntity<ApiResponse<Void>> setDefaultMethod(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID methodId
    ) {
        // Desmarcar el actual default
        localPaymentMethodRepository.findDefaultByUserId(user.getUserId())
                .ifPresent(currentDefault -> {
                    currentDefault.unmarkAsDefault();
                    localPaymentMethodRepository.save(currentDefault);
                });

        LocalPaymentMethod method = localPaymentMethodRepository.findById(new LocalPaymentMethodId(methodId))
                .orElseThrow(() -> new IllegalArgumentException("Local payment method not found"));

        if (!method.getUserId().equals(user.getUserId())) {
            throw new SecurityException("Access denied");
        }

        method.markAsDefault();
        localPaymentMethodRepository.save(method);

        return ResponseEntity.ok(ApiResponse.success(null, "Default local payment method updated"));
    }

    // === Request/Response DTOs ===

    public record AddLocalMethodRequest(
            @NotBlank String methodType,
            @NotBlank String phoneNumber,
            String accountHolderName
    ) {}

    public record LocalPaymentMethodResponse(
            String id,
            String methodType,
            String phoneNumber,
            String accountHolderName,
            boolean isVerified,
            boolean isDefault,
            boolean isActive,
            String createdAt
    ) {}
}
