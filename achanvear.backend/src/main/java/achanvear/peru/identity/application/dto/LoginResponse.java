package achanvear.peru.identity.application.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        UserResponse user
) {
}