package achanvear.peru.admin.application.dto;

import achanvear.peru.identity.domain.model.User;

import java.time.Instant;

public record AdminUserResponse(
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

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
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
