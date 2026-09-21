package achanvear.peru.payments.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CulqiProcessPaymentRequest(
        @NotBlank String token,
        @Email @NotBlank String email
) {
}
