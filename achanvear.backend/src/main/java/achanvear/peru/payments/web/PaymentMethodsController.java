package achanvear.peru.payments.web;

import achanvear.peru.payments.application.dto.PaymentMethodResponse;
import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.domain.model.PaymentMethod;
import achanvear.peru.payments.domain.model.PaymentMethodId;
import achanvear.peru.payments.domain.repository.PaymentMethodRepository;
import achanvear.peru.payments.infrastructure.external.CulqiCardResponse;
import achanvear.peru.payments.infrastructure.external.CulqiCustomerResponse;
import achanvear.peru.payments.infrastructure.external.CulqiGateway;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(PaymentMethodsController.class);

    private final PaymentMethodRepository paymentMethodRepository;
    private final AuditService auditService;
    private final CulqiGateway culqiGateway;

    public PaymentMethodsController(
            PaymentMethodRepository paymentMethodRepository,
            AuditService auditService,
            CulqiGateway culqiGateway
    ) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.auditService = auditService;
        this.culqiGateway = culqiGateway;
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
     * Guarda una tarjeta tokenizada con Culqi Checkout.
     *
     * Flujo (segun documentacion de Culqi):
     *  1. El frontend abre Culqi Checkout (https://checkout.culqi.com/js/v4) y obtiene {@code Culqi.token.id}.
     *  2. Este endpoint registra (o reutiliza) el cliente en Culqi y asocia la tarjeta al token.
     *  3. Se persiste el metodo de pago con los datos enmascarados devueltos por Culqi.
     */
    @PostMapping("/save-culqi-card")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> saveCulqiCard(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody SaveCulqiCardRequest request
    ) {
        String email = request.email() != null ? request.email().trim() : null;
        String fullName = request.cardholderName() != null ? request.cardholderName().trim() : "";
        String firstName = firstName(fullName);
        String lastName = lastName(fullName);

        CulqiCustomerResponse customer;
        try {
            customer = culqiGateway.createCustomer(
                    firstName,
                    lastName,
                    email,
                    "Lima, Peru",
                    request.phoneNumber()
            );
        } catch (RuntimeException ex) {
            log.error("No se pudo registrar el cliente en Culqi: {}", ex.getMessage(), ex);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No se pudo registrar el cliente en Culqi: " + ex.getMessage()));
        }

        if (customer == null || customer.id() == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Culqi no devolvio el cliente registrado"));
        }

        CulqiCardResponse card;
        try {
            card = culqiGateway.createCard(customer.id(), request.token());
        } catch (RuntimeException ex) {
            log.error("No se pudo registrar la tarjeta en Culqi: {}", ex.getMessage(), ex);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No se pudo registrar la tarjeta en Culqi: " + ex.getMessage()));
        }

        if (card == null || card.id() == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Culqi no devolvio la tarjeta registrada"));
        }

        PaymentMethod method = PaymentMethod.create(
                user.getUserId(),
                card.id(),
                customer.id(),
                card.brand() != null ? card.brand().toUpperCase() : "CARD",
                card.lastFour(),
                fullName.isBlank() ? null : fullName,
                card.expirationDate(),
                card.brand()
        );

        // Si es el primer metodo, marcarlo como default
        List<PaymentMethod> existingMethods = paymentMethodRepository.findActiveByUserId(user.getUserId());
        if (existingMethods.isEmpty()) {
            method.markAsDefault();
        }

        paymentMethodRepository.save(method);

        auditService.logPaymentMethodAdded(user.getUserId(), method.getId().value().toString(),
                method.getPaymentType(), null);

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
        return ResponseEntity.ok(ApiResponse.success(response, "Tarjeta registrada correctamente"));
    }

    private static String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "Cliente";
        }
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 0 ? parts[0] : "Cliente";
    }

    private static String lastName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "Achanvear";
        }
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length <= 1) {
            return "Achanvear";
        }
        return String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));
    }

    public record SaveCulqiCardRequest(
            @NotBlank String token,
            @Email String email,
            String cardholderName,
            String phoneNumber
    ) {}

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
