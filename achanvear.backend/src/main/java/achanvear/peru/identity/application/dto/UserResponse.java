package achanvear.peru.identity.application.dto;

import achanvear.peru.identity.domain.model.User;

public record UserResponse(
        String id,
        String email,
        String fullName,
        String dni,
        String phone,
        String role,
        String status,
        String representanteDni,
        String representanteLegal,
        String ruc
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getEmail().value(),
                user.getFullName(),
                user.getDni(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getRepresentanteDni(),
                user.getRepresentanteLegal(),
                user.getRuc()
        );
    }
}
