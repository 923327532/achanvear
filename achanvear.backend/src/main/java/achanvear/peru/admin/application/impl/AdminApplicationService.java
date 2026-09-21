package achanvear.peru.admin.application.impl;

import achanvear.peru.admin.application.ChangeUserRoleUseCase;
import achanvear.peru.admin.application.ChangeUserStatusUseCase;
import achanvear.peru.admin.application.CreateLegalDocumentVersionUseCase;
import achanvear.peru.admin.application.CreateUserUseCase;
import achanvear.peru.admin.application.GetAdminMetricsUseCase;
import achanvear.peru.admin.application.GetAuditHistoryUseCase;
import achanvear.peru.admin.application.GetLegalDocumentHistoryUseCase;
import achanvear.peru.admin.application.GetUserVolumeKpisUseCase;
import achanvear.peru.admin.application.ListConsentRecordsUseCase;
import achanvear.peru.admin.application.ListInterviewsUseCase;
import achanvear.peru.admin.application.ListLegalDocumentsUseCase;
import achanvear.peru.admin.application.ListUsersUseCase;
import achanvear.peru.admin.application.PublishLegalDocumentVersionUseCase;
import achanvear.peru.admin.application.command.CreateUserCommand;
import achanvear.peru.admin.application.dto.AdminInterviewPageResponse;
import achanvear.peru.admin.application.dto.AdminInterviewResponse;
import achanvear.peru.admin.application.dto.AdminMetricsResponse;
import achanvear.peru.admin.application.dto.AdminUserPageResponse;
import achanvear.peru.admin.application.dto.AdminUserResponse;
import achanvear.peru.admin.application.dto.AuditLogPageResponse;
import achanvear.peru.admin.application.dto.AuditLogResponse;
import achanvear.peru.admin.application.dto.UserVolumeKpisResponse;
import achanvear.peru.admin.application.query.UserKpiQuery;
import achanvear.peru.admin.domain.model.AdminAuditLog;
import achanvear.peru.admin.domain.model.AuditAction;
import achanvear.peru.admin.domain.repository.AdminAuditLogRepository;
import achanvear.peru.admin.domain.service.RoleAccessPolicy;
import achanvear.peru.company.application.port.out.CompanyQueryPort;
import achanvear.peru.compliance.application.ListConsentRecordsQuery;
import achanvear.peru.compliance.application.command.ConsentListQuery;
import achanvear.peru.compliance.application.command.CreateLegalDocumentVersionCommand;
import achanvear.peru.compliance.application.command.PublishLegalDocumentVersionCommand;
import achanvear.peru.compliance.application.dto.ConsentPageResponse;
import achanvear.peru.compliance.application.dto.LegalDocumentResponse;
import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;
import achanvear.peru.identity.application.port.in.UserCreatorPort;
import achanvear.peru.identity.application.port.in.UserQueryPort;
import achanvear.peru.identity.application.port.in.UserRoleChangerPort;
import achanvear.peru.identity.application.port.in.UserStatusChangerPort;
import achanvear.peru.identity.application.query.AdminUserQuery;
import achanvear.peru.identity.application.query.UserPeriodBucket;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.identity.domain.model.UserStatus;
import achanvear.peru.interview.application.port.out.InterviewAdminQueryPort;
import achanvear.peru.interview.application.query.AdminInterviewQuery;
import achanvear.peru.jobs.application.port.out.ApplicationQueryPort;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class AdminApplicationService implements
        ListUsersUseCase,
        ChangeUserStatusUseCase,
        ListConsentRecordsUseCase,
        ListInterviewsUseCase,
        GetAdminMetricsUseCase,
        CreateLegalDocumentVersionUseCase,
        PublishLegalDocumentVersionUseCase,
        ListLegalDocumentsUseCase,
        GetLegalDocumentHistoryUseCase,
        GetAuditHistoryUseCase,
        CreateUserUseCase,
        ChangeUserRoleUseCase,
        GetUserVolumeKpisUseCase {

    private final UserQueryPort userQueryPort;
    private final UserStatusChangerPort userStatusChangerPort;
    private final UserCreatorPort userCreatorPort;
    private final UserRoleChangerPort userRoleChangerPort;
    private final PasswordEncoder passwordEncoder;
    private final InterviewAdminQueryPort interviewAdminQueryPort;
    private final ApplicationQueryPort applicationQueryPort;
    private final CompanyQueryPort companyQueryPort;
    private final ListConsentRecordsQuery listConsentRecordsQuery;
    private final achanvear.peru.compliance.application.CreateLegalDocumentVersionUseCase complianceCreateUseCase;
    private final achanvear.peru.compliance.application.PublishLegalDocumentVersionUseCase compliancePublishUseCase;
    private final achanvear.peru.compliance.application.ListLegalDocumentsUseCase complianceListUseCase;
    private final achanvear.peru.compliance.application.GetLegalDocumentHistoryUseCase complianceHistoryUseCase;
    private final AdminAuditLogRepository auditLogRepository;

    public AdminApplicationService(
            UserQueryPort userQueryPort,
            UserStatusChangerPort userStatusChangerPort,
            UserCreatorPort userCreatorPort,
            UserRoleChangerPort userRoleChangerPort,
            PasswordEncoder passwordEncoder,
            InterviewAdminQueryPort interviewAdminQueryPort,
            ApplicationQueryPort applicationQueryPort,
            CompanyQueryPort companyQueryPort,
            ListConsentRecordsQuery listConsentRecordsQuery,
            achanvear.peru.compliance.application.CreateLegalDocumentVersionUseCase complianceCreateUseCase,
            achanvear.peru.compliance.application.PublishLegalDocumentVersionUseCase compliancePublishUseCase,
            achanvear.peru.compliance.application.ListLegalDocumentsUseCase complianceListUseCase,
            achanvear.peru.compliance.application.GetLegalDocumentHistoryUseCase complianceHistoryUseCase,
            AdminAuditLogRepository auditLogRepository
    ) {
        this.userQueryPort = userQueryPort;
        this.userStatusChangerPort = userStatusChangerPort;
        this.userCreatorPort = userCreatorPort;
        this.userRoleChangerPort = userRoleChangerPort;
        this.passwordEncoder = passwordEncoder;
        this.interviewAdminQueryPort = interviewAdminQueryPort;
        this.applicationQueryPort = applicationQueryPort;
        this.companyQueryPort = companyQueryPort;
        this.listConsentRecordsQuery = listConsentRecordsQuery;
        this.complianceCreateUseCase = complianceCreateUseCase;
        this.compliancePublishUseCase = compliancePublishUseCase;
        this.complianceListUseCase = complianceListUseCase;
        this.complianceHistoryUseCase = complianceHistoryUseCase;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserPageResponse list(AdminUserQuery query) {
        var page = userQueryPort.findAll(query).map(AdminUserResponse::from);
        return new AdminUserPageResponse(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    @Override
    public void changeStatus(String adminUserId, String userId, String newStatus) {
        if (adminUserId.equals(userId)) {
            throw new ForbiddenOperationException("Un administrador no puede cambiar su propio estado");
        }

        User actor = userQueryPort.findById(UUID.fromString(adminUserId))
                .orElseThrow(() -> new IllegalArgumentException("Administrador no encontrado"));
        User target = userQueryPort.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId));

        // Solo un SUPERADMIN (o un rol con mayor nivel) puede suspender/reactivar al objetivo.
        if (!RoleAccessPolicy.canManageUser(actor.getRole(), target.getRole())) {
            throw new ForbiddenOperationException(
                    "Tu rol (" + actor.getRole() + ") no permite modificar el estado de usuarios con rol " + target.getRole()
            );
        }

        userStatusChangerPort.changeStatus(userId, newStatus);
        auditLogRepository.save(AdminAuditLog.create(
                adminUserId,
                AuditAction.USER_STATUS_CHANGE,
                "USER",
                userId,
                "{\"newStatus\":\"" + newStatus.toUpperCase() + "\"}"
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public ConsentPageResponse list(ConsentListQuery query) {
        return listConsentRecordsQuery.list(query);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminInterviewPageResponse list(AdminInterviewQuery query) {
        var page = interviewAdminQueryPort.findForAdmin(query).map(AdminInterviewResponse::from);
        return new AdminInterviewPageResponse(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        return new AdminMetricsResponse(
                userQueryPort.count(),
                companyQueryPort.countAll(),
                userQueryPort.countByRole(UserRole.FREELANCER)
                        + userQueryPort.countByRole(UserRole.CANDIDATE),
                applicationQueryPort.countAll(),
                interviewAdminQueryPort.countByStatus("IN_PROGRESS"),
                interviewAdminQueryPort.countByStatus("COMPLETED"),
                interviewAdminQueryPort.countApproved(),
                interviewAdminQueryPort.countRejected(),
                interviewAdminQueryPort.countTotalViolations(),
                interviewAdminQueryPort.countWithPythonSession()
        );
    }

    @Override
    public LegalDocumentVersionResponse create(CreateLegalDocumentVersionCommand command) {
        LegalDocumentVersionResponse response = complianceCreateUseCase.create(command);
        auditLogRepository.save(AdminAuditLog.create(
                command.publishedBy(),
                AuditAction.LEGAL_DOCUMENT_CREATE,
                "LEGAL_DOCUMENT_VERSION",
                response.id(),
                "{\"type\":\"" + command.type() + "\",\"version\":\"" + command.version() + "\"}"
        ));
        return response;
    }

    @Override
    public LegalDocumentVersionResponse publish(PublishLegalDocumentVersionCommand command) {
        LegalDocumentVersionResponse response = compliancePublishUseCase.publish(command);
        auditLogRepository.save(AdminAuditLog.create(
                command.publishedBy(),
                AuditAction.LEGAL_DOCUMENT_PUBLISH,
                "LEGAL_DOCUMENT_VERSION",
                command.versionId(),
                "{\"type\":\"" + command.type() + "\"}"
        ));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LegalDocumentResponse> listAll() {
        return complianceListUseCase.listAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LegalDocumentVersionResponse> history(String type) {
        return complianceHistoryUseCase.history(achanvear.peru.compliance.domain.model.LegalDocumentType.valueOf(type));
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogPageResponse getHistory(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        var result = auditLogRepository.findAll(PageRequest.of(safePage, safeSize))
                .map(AuditLogResponse::from);
        return new AuditLogPageResponse(
                result.getContent(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize()
        );
    }

    // ── Gestión de usuarios (creación y roles) ──────────────────────────────

    @Override
    public AdminUserResponse create(String adminUserId, CreateUserCommand command) {
        User actor = userQueryPort.findById(UUID.fromString(adminUserId))
                .orElseThrow(() -> new IllegalArgumentException("Administrador no encontrado"));
        UserRole actorRole = actor.getRole();

        if (command.role() == null || command.role() == UserRole.SUPERADMIN) {
            throw new ForbiddenOperationException("El rol SUPERADMIN no puede asignarse desde el panel; se asigna manualmente en base de datos");
        }

        // Validación de permisos en el backend (no solo en la interfaz).
        if (!RoleAccessPolicy.canCreateUserWithRole(actorRole, command.role())) {
            throw new ForbiddenOperationException(
                    "Tu rol (" + actorRole + ") no permite crear usuarios con el rol " + command.role()
            );
        }

        String passwordHash = passwordEncoder.encode(command.rawPassword());
        User created = userCreatorPort.createUser(
                command.email(),
                command.fullName(),
                command.dni(),
                command.phone(),
                passwordHash,
                command.role()
        );

        auditLogRepository.save(AdminAuditLog.create(
                adminUserId,
                AuditAction.USER_CREATE,
                "USER",
                created.getId().toString(),
                "{\"role\":\"" + command.role().name() + "\",\"email\":\"" + command.email() + "\"}"
        ));

        return AdminUserResponse.from(created);
    }

    @Override
    public void changeRole(String adminUserId, String userId, String newRole) {
        if (adminUserId.equals(userId)) {
            throw new ForbiddenOperationException("Ningún usuario puede cambiarse el rol a sí mismo");
        }

        User actor = userQueryPort.findById(UUID.fromString(adminUserId))
                .orElseThrow(() -> new IllegalArgumentException("Administrador no encontrado"));
        User target = userQueryPort.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId));

        if (!RoleAccessPolicy.isAdminPanelRole(actor.getRole())) {
            throw new ForbiddenOperationException("No tienes permisos para gestionar roles");
        }

        UserRole newRoleEnum;
        try {
            newRoleEnum = UserRole.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Rol inválido: " + newRole);
        }

        if (newRoleEnum == UserRole.SUPERADMIN) {
            throw new ForbiddenOperationException("El rol SUPERADMIN no puede asignarse desde el panel; se asigna manualmente en base de datos");
        }
        if (!RoleAccessPolicy.canAssignRole(actor.getRole(), target.getRole(), newRoleEnum)) {
            throw new ForbiddenOperationException(
                    "No puedes asignar el rol " + newRoleEnum + " al usuario " + target.getEmail().value()
            );
        }

        userRoleChangerPort.changeRole(userId, newRoleEnum);
        auditLogRepository.save(AdminAuditLog.create(
                adminUserId,
                AuditAction.USER_ROLE_CHANGE,
                "USER",
                userId,
                "{\"fromRole\":\"" + target.getRole().name() + "\",\"toRole\":\"" + newRoleEnum.name() + "\"}"
        ));
    }

    // ── KPIs de volumen de usuarios ─────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public UserVolumeKpisResponse getKpis(UserKpiQuery query) {
        int days = Math.max(query.days(), 1);
        Instant periodEnd = Instant.now();
        Instant periodStart = periodEnd.minus(days, ChronoUnit.DAYS);
        Instant previousStart = periodStart.minus(days, ChronoUnit.DAYS);
        Instant previousEnd = periodStart;

        long totalUsers = userQueryPort.count();
        long activeUsers = userQueryPort.countActive();
        long newUsers = userQueryPort.countCreatedBetween(periodStart, periodEnd);
        long previousNewUsers = userQueryPort.countCreatedBetween(previousStart, previousEnd);
        long activeUsersInPeriod = userQueryPort.countActiveCreatedBetween(periodStart, periodEnd);
        long previousActiveUsersInPeriod = userQueryPort.countActiveCreatedBetween(previousStart, previousEnd);

        String granularity = days <= 35 ? "day" : days <= 200 ? "week" : "month";
        String granularityLabel = switch (granularity) {
            case "day" -> "DAY";
            case "week" -> "WEEK";
            default -> "MONTH";
        };

        List<UserPeriodBucket> usersByPeriod = userQueryPort.countSeries(periodStart, periodEnd, granularity);
        List<UserPeriodBucket> previousUsersByPeriod = userQueryPort.countSeries(previousStart, previousEnd, granularity);

        Map<String, Long> usersByStatus = new LinkedHashMap<>();
        for (UserStatus status : UserStatus.values()) {
            usersByStatus.put(status.name(), userQueryPort.countByStatus(status.name()));
        }

        Map<String, Long> usersByRole = new LinkedHashMap<>();
        for (UserRole role : UserRole.values()) {
            usersByRole.put(role.name(), userQueryPort.countByRole(role));
        }

        return new UserVolumeKpisResponse(
                totalUsers,
                activeUsers,
                newUsers,
                previousNewUsers,
                variationPercentage(previousNewUsers, newUsers),
                growthPercentage(totalUsers, newUsers),
                activeUsersInPeriod,
                previousActiveUsersInPeriod,
                variationPercentage(previousActiveUsersInPeriod, activeUsersInPeriod),
                usersByPeriod,
                previousUsersByPeriod,
                usersByStatus,
                usersByRole,
                periodStart.toString(),
                periodEnd.toString(),
                previousStart.toString(),
                previousEnd.toString(),
                granularityLabel
        );
    }

    private double variationPercentage(long previous, long current) {
        if (previous == 0) {
            return current == 0 ? 0.0 : 100.0;
        }
        return Math.round(((current - previous) / (double) previous) * 1000.0) / 10.0;
    }

    private double growthPercentage(long total, long newUsers) {
        long base = total - newUsers;
        if (base <= 0) {
            return newUsers == 0 ? 0.0 : 100.0;
        }
        return Math.round((newUsers / (double) base) * 1000.0) / 10.0;
    }
}
