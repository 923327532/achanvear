package achanvear.peru.admin.infrastructure.web;

import achanvear.peru.admin.application.*;
import achanvear.peru.admin.application.command.CreateUserCommand;
import achanvear.peru.admin.application.dto.*;
import achanvear.peru.admin.application.query.UserKpiQuery;
import achanvear.peru.compliance.application.command.*;
import achanvear.peru.compliance.application.dto.*;
import achanvear.peru.identity.application.query.AdminUserQuery;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.interview.application.query.AdminInterviewQuery;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAnyAuthority('SUPERADMIN', 'SUBADMIN', 'ADMIN', 'SUPPORT')")
public class AdminController {

    private final ListUsersUseCase listUsersUseCase;
    private final ChangeUserStatusUseCase changeUserStatusUseCase;
    private final CreateUserUseCase createUserUseCase;
    private final ChangeUserRoleUseCase changeUserRoleUseCase;
    private final GetUserVolumeKpisUseCase getUserVolumeKpisUseCase;
    private final ListConsentRecordsUseCase listConsentRecordsUseCase;
    private final ListInterviewsUseCase listInterviewsUseCase;
    private final GetAdminMetricsUseCase getAdminMetricsUseCase;
    private final ListLegalDocumentsUseCase listLegalDocumentsUseCase;
    private final GetLegalDocumentHistoryUseCase getLegalDocumentHistoryUseCase;
    private final CreateLegalDocumentVersionUseCase createLegalDocumentVersionUseCase;
    private final PublishLegalDocumentVersionUseCase publishLegalDocumentVersionUseCase;
    private final GetAuditHistoryUseCase getAuditHistoryUseCase;

    public AdminController(
            ListUsersUseCase listUsersUseCase,
            ChangeUserStatusUseCase changeUserStatusUseCase,
            CreateUserUseCase createUserUseCase,
            ChangeUserRoleUseCase changeUserRoleUseCase,
            GetUserVolumeKpisUseCase getUserVolumeKpisUseCase,
            ListConsentRecordsUseCase listConsentRecordsUseCase,
            ListInterviewsUseCase listInterviewsUseCase,
            GetAdminMetricsUseCase getAdminMetricsUseCase,
            ListLegalDocumentsUseCase listLegalDocumentsUseCase,
            GetLegalDocumentHistoryUseCase getLegalDocumentHistoryUseCase,
            CreateLegalDocumentVersionUseCase createLegalDocumentVersionUseCase,
            PublishLegalDocumentVersionUseCase publishLegalDocumentVersionUseCase,
            GetAuditHistoryUseCase getAuditHistoryUseCase
    ) {
        this.listUsersUseCase = listUsersUseCase;
        this.changeUserStatusUseCase = changeUserStatusUseCase;
        this.createUserUseCase = createUserUseCase;
        this.changeUserRoleUseCase = changeUserRoleUseCase;
        this.getUserVolumeKpisUseCase = getUserVolumeKpisUseCase;
        this.listConsentRecordsUseCase = listConsentRecordsUseCase;
        this.listInterviewsUseCase = listInterviewsUseCase;
        this.getAdminMetricsUseCase = getAdminMetricsUseCase;
        this.listLegalDocumentsUseCase = listLegalDocumentsUseCase;
        this.getLegalDocumentHistoryUseCase = getLegalDocumentHistoryUseCase;
        this.createLegalDocumentVersionUseCase = createLegalDocumentVersionUseCase;
        this.publishLegalDocumentVersionUseCase = publishLegalDocumentVersionUseCase;
        this.getAuditHistoryUseCase = getAuditHistoryUseCase;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<AdminUserPageResponse>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        AdminUserPageResponse response = listUsersUseCase.list(
                new AdminUserQuery(search, role, status, page, size));
        return ResponseEntity.ok(ApiResponse.success(response, "Users fetched successfully"));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateUserRequest request
    ) {
        AdminUserResponse response = createUserUseCase.create(
                authenticatedUser.getUserId().toString(),
                new CreateUserCommand(
                        request.email(),
                        request.fullName(),
                        request.dni(),
                        request.phone(),
                        request.password(),
                        UserRole.valueOf(request.role())
                )
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User created with role " + request.role()));
    }

    @GetMapping("/users/kpis")
    public ResponseEntity<ApiResponse<UserVolumeKpisResponse>> getUserKpis(
            @RequestParam(defaultValue = "30") int days
    ) {
        UserVolumeKpisResponse response = getUserVolumeKpisUseCase.getKpis(new UserKpiQuery(days));
        return ResponseEntity.ok(ApiResponse.success(response, "User volume KPIs fetched successfully"));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<Void>> changeUserStatus(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable String userId,
            @RequestBody ChangeUserStatusRequest request
    ) {
        changeUserStatusUseCase.changeStatus(
                authenticatedUser.getUserId().toString(),
                userId,
                request.newStatus()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "User status updated successfully"));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> changeUserRole(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable String userId,
            @RequestBody ChangeUserRoleRequest request
    ) {
        changeUserRoleUseCase.changeRole(
                authenticatedUser.getUserId().toString(),
                userId,
                request.newRole()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "User role updated successfully"));
    }

    @GetMapping("/consents")
    public ResponseEntity<ApiResponse<ConsentPageResponse>> listConsents(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        ConsentPageResponse response = listConsentRecordsUseCase.list(
                new ConsentListQuery(type, userId, status, page, size));
        return ResponseEntity.ok(ApiResponse.success(response, "Consents fetched successfully"));
    }

    @GetMapping("/interviews")
    public ResponseEntity<ApiResponse<AdminInterviewPageResponse>> listInterviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        AdminInterviewPageResponse response = listInterviewsUseCase.list(
                new AdminInterviewQuery(status, type, page, size));
        return ResponseEntity.ok(ApiResponse.success(response, "Interviews fetched successfully"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<AdminMetricsResponse>> getMetrics() {
        AdminMetricsResponse response = getAdminMetricsUseCase.getMetrics();
        return ResponseEntity.ok(ApiResponse.success(response, "Metrics fetched successfully"));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<AuditLogPageResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        AuditLogPageResponse response = getAuditHistoryUseCase.getHistory(page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Audit logs fetched successfully"));
    }

    @GetMapping("/legal-documents")
    public ResponseEntity<ApiResponse<List<LegalDocumentResponse>>> listLegalDocuments() {
        List<LegalDocumentResponse> response = listLegalDocumentsUseCase.listAll();
        return ResponseEntity.ok(ApiResponse.success(response, "Legal documents fetched successfully"));
    }

    @GetMapping("/legal-documents/{type}/versions")
    public ResponseEntity<ApiResponse<List<LegalDocumentVersionResponse>>> getLegalDocumentHistory(
            @PathVariable String type
    ) {
        List<LegalDocumentVersionResponse> response = getLegalDocumentHistoryUseCase.history(type);
        return ResponseEntity.ok(ApiResponse.success(response, "Legal document versions fetched successfully"));
    }

    @PostMapping("/legal-documents/{type}/versions")
    public ResponseEntity<ApiResponse<LegalDocumentVersionResponse>> createLegalDocumentVersion(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable String type,
            @Valid @RequestBody CreateLegalDocumentVersionRequest request
    ) {
        LegalDocumentVersionResponse response = createLegalDocumentVersionUseCase.create(
                new CreateLegalDocumentVersionCommand(
                        type,
                        request.version(),
                        request.title(),
                        request.content(),
                        authenticatedUser.getUserId().toString()
                )
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Legal document version created successfully"));
    }

    @PatchMapping("/legal-documents/{type}/versions/{versionId}/publish")
    public ResponseEntity<ApiResponse<LegalDocumentVersionResponse>> publishLegalDocumentVersion(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable String type,
            @PathVariable String versionId
    ) {
        LegalDocumentVersionResponse response = publishLegalDocumentVersionUseCase.publish(
                new PublishLegalDocumentVersionCommand(
                        type,
                        versionId,
                        authenticatedUser.getUserId().toString()
                )
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Legal document version published successfully"));
    }

    public record ChangeUserStatusRequest(
            @NotBlank String newStatus
    ) {
    }

    public record CreateUserRequest(
            @NotBlank
            @Email
            String email,

            @NotBlank
            String fullName,

            @Pattern(regexp = "\\d{8}")
            String dni,

            @Pattern(regexp = "\\d{9,15}")
            String phone,

            @NotBlank
            @Size(min = 8, max = 100)
            String password,

            @NotBlank
            String role
    ) {
    }

    public record ChangeUserRoleRequest(
            @NotBlank String newRole
    ) {
    }

    public record CreateLegalDocumentVersionRequest(
            @NotBlank String version,
            @NotBlank String title,
            @NotBlank String content
    ) {
    }
}
