package achanvear.peru.payments.web;

import jakarta.validation.constraints.NotBlank;

public record ProcessPaymentRequest(
        @NotBlank String mpPaymentId
) {
}
