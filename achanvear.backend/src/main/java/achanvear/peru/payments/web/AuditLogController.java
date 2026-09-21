package achanvear.peru.payments.web;

import achanvear.peru.payments.application.dto.AuditLogResponse;
import achanvear.peru.payments.domain.model.AuditLog;
import achanvear.peru.payments.domain.repository.AuditLogRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Obtiene los logs de auditoría del usuario autenticado.
     */
    @GetMapping("/my-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getMyAuditLogs(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        List<AuditLog> logs = auditLogRepository.findByUserId(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success(toResponseList(logs), "Audit logs retrieved"));
    }

    /**
     * Obtiene logs de auditoría por entidad (solo admin).
     */
    @GetMapping("/entity")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByEntity(
            @RequestParam String entityType,
            @RequestParam String entityId
    ) {
        List<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(toResponseList(logs), "Audit logs retrieved"));
    }

    /**
     * Obtiene logs de auditoría por acción (solo admin).
     */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByAction(
            @PathVariable String action
    ) {
        List<AuditLog> logs = auditLogRepository.findByAction(action);
        return ResponseEntity.ok(ApiResponse.success(toResponseList(logs), "Audit logs retrieved"));
    }

    /**
     * Obtiene logs de auditoría por rango de fechas (solo admin).
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogsByDateRange(
            @RequestParam String from,
            @RequestParam String to
    ) {
        Instant fromInstant = Instant.parse(from);
        Instant toInstant = Instant.parse(to);
        List<AuditLog> logs = auditLogRepository.findByDateRange(fromInstant, toInstant);
        return ResponseEntity.ok(ApiResponse.success(toResponseList(logs), "Audit logs retrieved"));
    }

    private List<AuditLogResponse> toResponseList(List<AuditLog> logs) {
        var formatter = DateTimeFormatter.ISO_INSTANT;
        return logs.stream()
                .map(log -> new AuditLogResponse(
                        log.getId().value().toString(),
                        log.getUserId() != null ? log.getUserId().toString() : null,
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getOldValue(),
                        log.getNewValue(),
                        log.getIpAddress(),
                        log.getMetadata(),
                        log.getCreatedAt() != null ? formatter.format(log.getCreatedAt()) : null
                ))
                .collect(Collectors.toList());
    }
}
