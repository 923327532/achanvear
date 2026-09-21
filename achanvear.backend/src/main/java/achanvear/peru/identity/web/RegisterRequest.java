package achanvear.peru.identity.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank
        @Email
        String email,

        @Size(min = 3, max = 150)
        String fullName,

        @Pattern(regexp = "\\d{8}")
        String dni,

        @Pattern(regexp = "\\d{9,15}")
        String phone,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        @NotBlank
        String role,

        @Pattern(regexp = "\\d{8}")
        String representanteDni,

        String representanteLegal,

        @Size(max = 11)
        String ruc,

        boolean acceptTerms,

        boolean acceptPrivacy,

        String termsVersion,

        String privacyVersion
) {
}
