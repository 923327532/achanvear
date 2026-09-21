package achanvear.peru.payments.infrastructure.webhook;

import achanvear.peru.payments.application.command.ProcessPaymentCommand;
import achanvear.peru.payments.application.port.in.ProcessPaymentUseCase;
import achanvear.peru.payments.infrastructure.external.MercadoPagoProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
public class PaymentsWebhookController {

    private final ProcessPaymentUseCase processPaymentUseCase;
    private final MercadoPagoProperties properties;

    public PaymentsWebhookController(
            ProcessPaymentUseCase processPaymentUseCase,
            MercadoPagoProperties properties
    ) {
        this.processPaymentUseCase = processPaymentUseCase;
        this.properties = properties;
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<String> handleMercadoPagoWebhook(
            HttpServletRequest request,
            @RequestBody MercadoPagoWebhookRequest webhookRequest
    ) {
        // Validar signature del webhook
        if (!validateWebhookSignature(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        // Procesar solo pagos approved
        if (!"payment".equals(webhookRequest.type()) || !"approved".equals(webhookRequest.data().status())) {
            return ResponseEntity.ok("Ignored event");
        }

        String paymentId = webhookRequest.data().id();
        var result = processPaymentUseCase.execute(new ProcessPaymentCommand(paymentId));

        return result.isSuccess()
                ? ResponseEntity.ok("OK")
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Processing failed");
    }

    private boolean validateWebhookSignature(HttpServletRequest request) {
        // TODO: Implementar validacion HMAC con webhookSecret
        // Por seguridad, esto debe validar la signature real de Mercado Pago
        return true; // Placeholder para desarrollo
    }
}