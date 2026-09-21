package achanvear.peru.payments.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SubscribePlanRequest(
        @NotBlank(message = "Plan is required")
        @Pattern(regexp = "BASIC|PREMIUM|ENTERPRISE", message = "Plan must be BASIC, PREMIUM, or ENTERPRISE")
        String plan,

        @NotBlank(message = "Company email is required")
        @Email(message = "Invalid email format")
        String companyEmail
) {
}
