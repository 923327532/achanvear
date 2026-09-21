package achanvear.peru.company.web;

import achanvear.peru.company.application.dto.CollaboratorResponse;
import achanvear.peru.company.application.usecase.CollaboratorUseCase;
import achanvear.peru.company.web.security.AuthenticatedUser;
import achanvear.peru.company.web.security.AuthenticatedUserResolver;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/companies/collaborators")
public class CollaboratorController {

    private final CollaboratorUseCase collaboratorUseCase;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public CollaboratorController(
            CollaboratorUseCase collaboratorUseCase,
            AuthenticatedUserResolver authenticatedUserResolver
    ) {
        this.collaboratorUseCase = collaboratorUseCase;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<List<CollaboratorResponse>>> getCollaborators(
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);
        UUID companyId = authenticatedUser.companyId();

        if (companyId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No company associated with this user"));
        }

        List<CollaboratorResponse> collaborators = collaboratorUseCase.getCollaborators(companyId);
        return ResponseEntity.ok(ApiResponse.success(collaborators, "Collaborators retrieved successfully"));
    }

    @PostMapping("/invite")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<CollaboratorResponse>> inviteCollaborator(
            @Valid @RequestBody InviteCollaboratorRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);
        UUID companyId = authenticatedUser.companyId();

        if (companyId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No company associated with this user"));
        }

        CollaboratorResponse response = collaboratorUseCase.inviteCollaborator(
                companyId,
                request.email(),
                request.fullName()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Collaborator invited successfully"));
    }

    @DeleteMapping("/{collaboratorId}")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<Void>> removeCollaborator(
            @PathVariable UUID collaboratorId,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);
        UUID companyId = authenticatedUser.companyId();

        if (companyId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No company associated with this user"));
        }

        collaboratorUseCase.removeCollaborator(companyId, collaboratorId);
        return ResponseEntity.ok(ApiResponse.success(null, "Collaborator removed successfully"));
    }

    @PatchMapping("/{collaboratorId}/deactivate")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<Void>> deactivateCollaborator(
            @PathVariable UUID collaboratorId,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);
        UUID companyId = authenticatedUser.companyId();

        if (companyId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No company associated with this user"));
        }

        collaboratorUseCase.deactivateCollaborator(companyId, collaboratorId);
        return ResponseEntity.ok(ApiResponse.success(null, "Collaborator deactivated successfully"));
    }
}
