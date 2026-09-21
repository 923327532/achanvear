package achanvear.peru.company.web;

import achanvear.peru.company.application.CreateCompanyUseCase;
import achanvear.peru.company.application.GetCompanyByUserIdUseCase;
import achanvear.peru.company.application.UpdateCompanyUseCase;
import achanvear.peru.company.application.command.CreateCompanyCommand;
import achanvear.peru.company.application.command.UpdateCompanyCommand;
import achanvear.peru.company.application.dto.CompanyResponse;
import achanvear.peru.company.web.security.AuthenticatedUser;
import achanvear.peru.company.web.security.AuthenticatedUserResolver;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/company/onboarding")
@PreAuthorize("hasAnyAuthority('COMPANY', 'SUPERADMIN')")
public class CompanyOnboardingController {

    private final CreateCompanyUseCase createCompanyUseCase;
    private final UpdateCompanyUseCase updateCompanyUseCase;
    private final GetCompanyByUserIdUseCase getCompanyByUserIdUseCase;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public CompanyOnboardingController(
            CreateCompanyUseCase createCompanyUseCase,
            UpdateCompanyUseCase updateCompanyUseCase,
            GetCompanyByUserIdUseCase getCompanyByUserIdUseCase,
            AuthenticatedUserResolver authenticatedUserResolver
    ) {
        this.createCompanyUseCase = createCompanyUseCase;
        this.updateCompanyUseCase = updateCompanyUseCase;
        this.getCompanyByUserIdUseCase = getCompanyByUserIdUseCase;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    /**
     * PASO 1: Inicializa la compañía con datos básicos.
     * Crea la compañía con valores placeholder para los campos que se llenarán después.
     */
    @PostMapping("/init")
    @Transactional
    public ResponseEntity<ApiResponse<CompanyResponse>> initOnboarding(
            @Valid @RequestBody InitOnboardingRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);
        UUID ownerUserId = UUID.fromString(authenticatedUser.userId());

        // Verificar si ya tiene compañía
        CompanyResponse existing = getCompanyByUserIdUseCase.executeByUserId(ownerUserId.toString());
        if (existing != null) {
            return ResponseEntity.ok(ApiResponse.success(existing, "Compañía ya existe, continuando onboarding"));
        }

        CreateCompanyCommand command = new CreateCompanyCommand(
                ownerUserId.toString(),
                request.businessName(),
                request.businessName(), // tradeName = businessName por defecto
                request.legalName(),
                request.industry() != null ? request.industry() : "Tecnologia",
                "General", // specialty por defecto
                "SMALL_BUSINESS", // companySize por defecto
                null, // logoUrl
                request.biography() != null ? request.biography() : "Empresa registrada en Achanvear",
                null, // achievements
                request.address() != null ? request.address() : "Direccion pendiente",
                "BANK_TRANSFER", // paymentMethodType por defecto
                "FREE", // companyPlan por defecto
                request.representativeDni(),
                request.ruc()
        );

        CompanyResponse response = createCompanyUseCase.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Compañía creada correctamente"));
    }

    /**
     * PASO 2: Actualiza la industria.
     */
    @PatchMapping("/industry")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateIndustry(
            @Valid @RequestBody UpdateIndustryRequest request,
            Authentication authentication
    ) {
        CompanyResponse company = getCompany(authentication);
        CompanyResponse updated = updateCompanyUseCase.execute(buildUpdateCommand(
                company, request.industry(), company.specialty(), null, null, null, null, null, null
        ));
        return ResponseEntity.ok(ApiResponse.success(updated, "Industria actualizada"));
    }

    /**
     * PASO 3: Actualiza la especialidad.
     */
    @PatchMapping("/specialty")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateSpecialty(
            @Valid @RequestBody UpdateSpecialtyRequest request,
            Authentication authentication
    ) {
        CompanyResponse company = getCompany(authentication);
        CompanyResponse updated = updateCompanyUseCase.execute(buildUpdateCommand(
                company, company.industry(), request.specialty(), null, null, null, null, null, null
        ));
        return ResponseEntity.ok(ApiResponse.success(updated, "Especialidad actualizada"));
    }

    /**
     * PASO 4: Actualiza el perfil corporativo (companySize, descripción, dirección, logo).
     */
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        CompanyResponse company = getCompany(authentication);
        CompanyResponse updated = updateCompanyUseCase.execute(buildUpdateCommand(
                company, company.industry(), company.specialty(),
                request.companySize(), request.biography(), request.address(), request.logoUrl(),
                null, null
        ));
        return ResponseEntity.ok(ApiResponse.success(updated, "Perfil corporativo actualizado"));
    }

    /**
     * PASO 5: Actualiza el plan seleccionado.
     */
    @PatchMapping("/plan")
    public ResponseEntity<ApiResponse<CompanyResponse>> updatePlan(
            @Valid @RequestBody UpdatePlanRequest request,
            Authentication authentication
    ) {
        CompanyResponse company = getCompany(authentication);
        CompanyResponse updated = updateCompanyUseCase.execute(buildUpdateCommand(
                company, company.industry(), company.specialty(),
                null, null, null, null, request.companyPlan(), null
        ));
        return ResponseEntity.ok(ApiResponse.success(updated, "Plan actualizado"));
    }

    /**
     * PASO 6: Actualiza el método de pago.
     */
    @PatchMapping("/payment-method")
    public ResponseEntity<ApiResponse<CompanyResponse>> updatePaymentMethod(
            @Valid @RequestBody UpdatePaymentMethodRequest request,
            Authentication authentication
    ) {
        CompanyResponse company = getCompany(authentication);
        CompanyResponse updated = updateCompanyUseCase.execute(buildUpdateCommand(
                company, company.industry(), company.specialty(),
                null, null, null, null, null, request.paymentMethodType()
        ));
        return ResponseEntity.ok(ApiResponse.success(updated, "Método de pago actualizado"));
    }

    /**
     * PASO 7: Finaliza el onboarding.
     */
    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<CompanyResponse>> completeOnboarding(
            @Valid @RequestBody CompleteOnboardingRequest request,
            Authentication authentication
    ) {
        CompanyResponse company = getCompany(authentication);
        CompanyResponse updated = updateCompanyUseCase.execute(buildUpdateCommand(
                company,
                request.industry() != null ? request.industry() : company.industry(),
                request.specialty() != null ? request.specialty() : company.specialty(),
                request.companySize() != null ? request.companySize() : company.companySize(),
                request.biography() != null ? request.biography() : company.biography(),
                request.address() != null ? request.address() : company.address(),
                request.logoUrl(),
                request.companyPlan() != null ? request.companyPlan() : company.companyPlan(),
                request.paymentMethodType() != null ? request.paymentMethodType() : company.paymentMethodType()
        ));
        return ResponseEntity.ok(ApiResponse.success(updated, "Onboarding completado correctamente"));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private CompanyResponse getCompany(Authentication authentication) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);
        CompanyResponse company = getCompanyByUserIdUseCase.executeByUserId(authenticatedUser.userId());
        if (company == null) {
            throw new IllegalStateException("No se encontró compañía para el usuario. Debe llamar a POST /company/onboarding/init primero.");
        }
        return company;
    }

    private UpdateCompanyCommand buildUpdateCommand(
            CompanyResponse company,
            String industry,
            String specialty,
            String companySize,
            String biography,
            String address,
            String logoUrl,
            String companyPlan,
            String paymentMethodType
    ) {
        return new UpdateCompanyCommand(
                company.id(),
                company.ownerUserId(),
                false, // superAdmin
                company.businessName(),
                company.tradeName() != null ? company.tradeName() : company.businessName(),
                company.legalName(),
                industry != null ? industry : company.industry(),
                specialty != null ? specialty : company.specialty(),
                companySize != null ? companySize : company.companySize(),
                logoUrl != null ? logoUrl : company.logoUrl(),
                biography != null ? biography : company.biography(),
                company.achievements(),
                address != null ? address : company.address(),
                paymentMethodType != null ? paymentMethodType : company.paymentMethodType(),
                companyPlan != null ? companyPlan : company.companyPlan()
        );
    }

    // ─── Request DTOs ─────────────────────────────────────────────────────────

    public record InitOnboardingRequest(
            @NotBlank @Size(min = 3, max = 150) String businessName,
            @NotBlank @Size(min = 3, max = 180) String legalName,
            @NotBlank @Size(min = 8, max = 8) String representativeDni,
            @Size(max = 11) String ruc,
            String industry,
            String biography,
            String address
    ) {}

    public record UpdateIndustryRequest(
            @NotBlank @Size(min = 2, max = 120) String industry
    ) {}

    public record UpdateSpecialtyRequest(
            @NotBlank @Size(min = 2, max = 120) String specialty
    ) {}

    public record UpdateProfileRequest(
            @NotBlank String companySize,
            @NotBlank @Size(min = 10, max = 1500) String biography,
            @NotBlank @Size(min = 5, max = 255) String address,
            String logoUrl
    ) {}

    public record UpdatePlanRequest(
            @NotBlank String companyPlan
    ) {}

    public record UpdatePaymentMethodRequest(
            @NotBlank String paymentMethodType
    ) {}

    public record CompleteOnboardingRequest(
            String industry,
            String specialty,
            String companySize,
            String logoUrl,
            String biography,
            String achievements,
            String address,
            String paymentMethodType,
            String companyPlan
    ) {}
}
