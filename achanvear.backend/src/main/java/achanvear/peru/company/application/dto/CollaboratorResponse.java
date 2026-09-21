package achanvear.peru.company.application.dto;

import achanvear.peru.company.domain.model.CompanyCollaborator;

public record CollaboratorResponse(
        String id,
        String companyId,
        String userId,
        String fullName,
        String email,
        String role,
        String status,
        String invitedAt,
        String tempPassword
) {
    public static CollaboratorResponse from(CompanyCollaborator collaborator) {
        return new CollaboratorResponse(
                collaborator.getId().toString(),
                collaborator.getCompanyId().toString(),
                collaborator.getUserId().toString(),
                collaborator.getFullName(),
                collaborator.getEmail(),
                "COMPANY_COLLABORATOR",
                collaborator.getStatus().name(),
                collaborator.getInvitedAt().toString(),
                null
        );
    }

    public static CollaboratorResponse withTempPassword(CompanyCollaborator collaborator, String tempPassword) {
        return new CollaboratorResponse(
                collaborator.getId().toString(),
                collaborator.getCompanyId().toString(),
                collaborator.getUserId().toString(),
                collaborator.getFullName(),
                collaborator.getEmail(),
                "COMPANY_COLLABORATOR",
                collaborator.getStatus().name(),
                collaborator.getInvitedAt().toString(),
                tempPassword
        );
    }
}
