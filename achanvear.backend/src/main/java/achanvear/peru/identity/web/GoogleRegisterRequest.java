package achanvear.peru.identity.web;

import jakarta.validation.constraints.NotBlank;

public record GoogleRegisterRequest(
        @NotBlank
        String idToken,
        String dni,
        String phone,
        String role,
        boolean acceptTerms,
        boolean acceptPrivacy
) {
}
