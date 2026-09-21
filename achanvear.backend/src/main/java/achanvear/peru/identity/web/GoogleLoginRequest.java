package achanvear.peru.identity.web;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
        @NotBlank
        String idToken
) {
}
