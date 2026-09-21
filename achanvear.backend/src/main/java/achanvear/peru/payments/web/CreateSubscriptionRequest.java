package achanvear.peru.payments.web;

import jakarta.validation.constraints.NotBlank;

public record CreateSubscriptionRequest(
        @NotBlank String plan
) {
}
