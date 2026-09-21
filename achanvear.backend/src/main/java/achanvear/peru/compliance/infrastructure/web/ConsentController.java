package achanvear.peru.compliance.infrastructure.web;

import achanvear.peru.compliance.application.GetMyConsentsUseCase;
import achanvear.peru.compliance.application.RecordRegistrationConsentUseCase;
import achanvear.peru.compliance.application.command.RecordRegistrationConsentCommand;
import achanvear.peru.compliance.application.dto.ConsentRecordResponse;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ConsentController {

    private final RecordRegistrationConsentUseCase recordRegistrationConsentUseCase;
    private final GetMyConsentsUseCase getMyConsentsUseCase;

    public ConsentController(
            RecordRegistrationConsentUseCase recordRegistrationConsentUseCase,
            GetMyConsentsUseCase getMyConsentsUseCase
    ) {
        this.recordRegistrationConsentUseCase = recordRegistrationConsentUseCase;
        this.getMyConsentsUseCase = getMyConsentsUseCase;
    }

    /**
     * Registro de consentimientos de registro para el usuario autenticado.
     * La evidencia de aceptación no puede modificarse retroactivamente.
     */
    @PostMapping("/consents/registration")
    public ResponseEntity<ApiResponse<Void>> recordRegistrationConsent(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody RecordRegistrationConsentRequest request
    ) {
        recordRegistrationConsentUseCase.record(new RecordRegistrationConsentCommand(
                authenticatedUser.getUserId().toString(),
                request.acceptTerms(),
                request.acceptPrivacy(),
                request.termsVersion(),
                request.privacyVersion()
        ));
        return ResponseEntity.ok(ApiResponse.success(null, "Consentimientos registrados correctamente"));
    }

    @GetMapping("/me/consents")
    public ResponseEntity<ApiResponse<List<ConsentRecordResponse>>> getMyConsents(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        List<ConsentRecordResponse> response =
                getMyConsentsUseCase.getMyConsents(authenticatedUser.getUserId().toString());
        return ResponseEntity.ok(ApiResponse.success(response, "Consents fetched successfully"));
    }

    public record RecordRegistrationConsentRequest(
            boolean acceptTerms,
            boolean acceptPrivacy,
            String termsVersion,
            String privacyVersion
    ) {
    }
}
