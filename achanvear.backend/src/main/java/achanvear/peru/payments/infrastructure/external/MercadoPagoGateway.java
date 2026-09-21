package achanvear.peru.payments.infrastructure.external;

import achanvear.peru.payments.domain.model.PlanType;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Component
public class MercadoPagoGateway {

    private final RestClient restClient;
    private final MercadoPagoProperties properties;

    public MercadoPagoGateway(MercadoPagoProperties properties) {
        this.properties = properties;

        // Interceptor para loggear request y response
        ClientHttpRequestInterceptor loggingInterceptor = (request, body, execution) -> {
            System.out.println("DEBUG MP - Request URL: " + request.getURI());
            System.out.println("DEBUG MP - Request Method: " + request.getMethod());
            System.out.println("DEBUG MP - Request Body: " + new String(body, StandardCharsets.UTF_8));
            var response = execution.execute(request, body);
            BufferedReader reader = new BufferedReader(new InputStreamReader(response.getBody(), StandardCharsets.UTF_8));
            StringBuilder responseBody = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                responseBody.append(line);
            }
            System.out.println("DEBUG MP - Response Status: " + response.getStatusCode());
            System.out.println("DEBUG MP - Response Body: " + responseBody);
            return response;
        };

        this.restClient = RestClient.builder()
                .baseUrl("https://api.mercadopago.com")
                .defaultHeader("Authorization", "Bearer " + properties.accessToken())
                .defaultHeader("Content-Type", "application/json")
                .requestInterceptor(loggingInterceptor)
                .build();
    }

    // === Pagos (Milestones) ===

    public MercadoPagoPaymentResponse getPayment(String paymentId) {
        return restClient.get()
                .uri("/v1/payments/{id}", paymentId)
                .retrieve()
                .body(MercadoPagoPaymentResponse.class);
    }

    // === Compra de paquetes de créditos ===

    public MercadoPagoPreferenceResponse createCreditPackagePreference(
            String packageId,
            String packageName,
            BigDecimal amount,
            String clientEmail
    ) {
        var items = new MercadoPagoPreferenceItem(
                "Paquete de créditos: " + packageName,
                "Compra de créditos en Achanvear",
                amount.intValue(), // MercadoPago usa centavos
                1
        );

        var payer = new MercadoPagoPreferencePayer(clientEmail);

        var backUrls = new MercadoPagoBackUrls(
                properties.successUrl(),
                properties.failureUrl(),
                properties.pendingUrl()
        );

        var preferenceRequest = new CreateMilestonePreferenceRequest(
                items,
                payer,
                backUrls,
                packageId,
                true // Auto-return tras el pago
        );

        return restClient.post()
                .uri("/checkout/preferences")
                .body(preferenceRequest)
                .retrieve()
                .body(MercadoPagoPreferenceResponse.class);
    }

    public boolean isPaymentApproved(String paymentId) {
        try {
            var payment = getPayment(paymentId);
            return payment != null && "approved".equals(payment.status());
        } catch (Exception e) {
            return false;
        }
    }

    public MercadoPagoPreferenceResponse createMilestonePreference(
            BigDecimal amount,
            String milestoneId,
            String projectTitle,
            String clientEmail
    ) {
        var items = new MercadoPagoPreferenceItem(
                "Milestone: " + projectTitle,
                "Depósito en garantía para hito de proyecto",
                amount.intValue(), // MercadoPago usa centavos
                1
        );

        var payer = new MercadoPagoPreferencePayer(clientEmail);

        var backUrls = new MercadoPagoBackUrls(
                properties.successUrl() + "/milestones/" + milestoneId + "/success",
                properties.failureUrl() + "/milestones/" + milestoneId + "/failure",
                properties.pendingUrl() + "/milestones/" + milestoneId + "/pending"
        );

        var preferenceRequest = new CreateMilestonePreferenceRequest(
                items,
                payer,
                backUrls,
                milestoneId,
                false // No auto-return, esperamos webhook
        );

        return restClient.post()
                .uri("/checkout/preferences")
                .body(preferenceRequest)
                .retrieve()
                .body(MercadoPagoPreferenceResponse.class);
    }

    // === Suscripciones (Planes) ===

    public MercadoPagoSubscriptionResponse createSubscription(PlanType plan, String userId, String userEmail) {
        var subscriptionRequest = new CreateSubscriptionRequest(
                plan.name() + " Plan - Achanvear",
                "Suscripción mensual al plan " + plan.name(),
                plan.monthlyPrice(),
                userId,
                userEmail
        );

        System.out.println("DEBUG MP - Request: " + subscriptionRequest);
        String token = properties.accessToken();
        System.out.println("DEBUG MP - Token length: " + token.length());
        System.out.println("DEBUG MP - Token preview: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));

        try {
            var response = restClient.post()
                    .uri("/preapproval")
                    .body(subscriptionRequest)
                    .retrieve()
                    .body(MercadoPagoSubscriptionResponse.class);
            System.out.println("DEBUG MP - Response: " + response);
            return response;
        } catch (Exception e) {
            System.err.println("DEBUG MP - Error: " + e.getMessage());
            throw e;
        }
    }

    public MercadoPagoSubscriptionResponse getSubscription(String subscriptionId) {
        System.out.println("DEBUG MP - Request: Get subscription " + subscriptionId);
        String token = properties.accessToken();
        System.out.println("DEBUG MP - Token length: " + token.length());
        System.out.println("DEBUG MP - Token preview: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));

        return restClient.get()
                .uri("/preapproval/{id}", subscriptionId)
                .retrieve()
                .body(MercadoPagoSubscriptionResponse.class);
    }

    public boolean cancelSubscription(String subscriptionId) {
        try {
            restClient.put()
                    .uri("/preapproval/{id}", subscriptionId)
                    .body(new CancelSubscriptionRequest("cancelled"))
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // === Reembolsos ===

    /**
     * Procesa un reembolso total o parcial en Mercado Pago.
     */
    public void refundPayment(String paymentId, BigDecimal amount) {
        try {
            var refundRequest = new MercadoPagoRefundRequest(amount);
            restClient.post()
                    .uri("/v1/payments/{id}/refunds", paymentId)
                    .body(refundRequest)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("DEBUG MP - Refund error for payment " + paymentId + ": " + e.getMessage());
            throw e;
        }
    }
}
