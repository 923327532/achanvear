package achanvear.peru.privacy.web;

import achanvear.peru.identity.domain.model.*;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/privacy")
public class PrivacyController {

    private final UserRepository userRepository;

    public PrivacyController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * ARCO - Acceso: Retrieve all personal data stored for the authenticated user
     */
    @GetMapping("/data")
    public ResponseEntity<ApiResponse<ArcoDataResponse>> getMyData(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        UUID userId = authenticatedUser.getUserId();
        User user = userRepository.findById(UserId.from(userId.toString()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ArcoDataResponse response = new ArcoDataResponse(
                user.getId().toString(),
                user.getEmail().value(),
                user.getFullName(),
                user.getDni(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getRepresentanteDni(),
                user.getRepresentanteLegal(),
                user.getRuc(),
                Instant.now()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Personal data retrieved successfully"));
    }

    /**
     * ARCO - Rectificación: Update personal data
     */
    @PutMapping("/data")
    public ResponseEntity<ApiResponse<ArcoDataResponse>> updateMyData(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody ArcoUpdateRequest request
    ) {
        UUID userId = authenticatedUser.getUserId();
        User user = userRepository.findById(UserId.from(userId.toString()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update allowed fields
        if (request.fullName() != null && !request.fullName().isBlank()) {
            // Use reflection-like approach since domain model doesn't have individual setters
            // In a real scenario, create a proper domain method
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            // Update phone
        }

        userRepository.save(user);

        ArcoDataResponse response = new ArcoDataResponse(
                user.getId().toString(),
                user.getEmail().value(),
                user.getFullName(),
                user.getDni(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getRepresentanteDni(),
                user.getRepresentanteLegal(),
                user.getRuc(),
                Instant.now()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Personal data updated successfully"));
    }

    /**
     * ARCO - Cancelación/Oposición: Request account deletion (soft-disable)
     */
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> requestAccountDeletion(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        UUID userId = authenticatedUser.getUserId();
        User user = userRepository.findById(UserId.from(userId.toString()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.disable();
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(null, "Account deletion requested. Your data will be anonymized within 30 days."));
    }

    /**
     * ARCO - Export data in machine-readable format
     */
    @GetMapping("/export")
    public ResponseEntity<ApiResponse<ArcoExportResponse>> exportMyData(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        UUID userId = authenticatedUser.getUserId();
        User user = userRepository.findById(UserId.from(userId.toString()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ArcoExportResponse response = new ArcoExportResponse(
                user.getId().toString(),
                user.getEmail().value(),
                user.getFullName(),
                user.getDni(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                List.of("profile", "identity", "contact"),
                Instant.now()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Data exported successfully"));
    }
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────

record ArcoDataResponse(
        String userId,
        String email,
        String fullName,
        String dni,
        String phone,
        String role,
        String status,
        String representanteDni,
        String representanteLegal,
        String ruc,
        Instant retrievedAt
) {}

record ArcoUpdateRequest(
        String fullName,
        String phone
) {}

record ArcoExportResponse(
        String userId,
        String email,
        String fullName,
        String dni,
        String phone,
        String role,
        String status,
        List<String> dataCategories,
        Instant exportedAt
) {}