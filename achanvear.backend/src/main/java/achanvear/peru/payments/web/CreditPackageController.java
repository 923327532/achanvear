package achanvear.peru.payments.web;

import achanvear.peru.payments.application.command.CreateCreditPackageCheckoutCommand;
import achanvear.peru.payments.application.dto.CreditPackageResponse;
import achanvear.peru.payments.application.port.in.CreateCreditPackageCheckoutUseCase;
import achanvear.peru.payments.application.port.in.GetCreditPackagesUseCase;
import achanvear.peru.payments.application.service.PublicationCreditService;
import achanvear.peru.payments.infrastructure.external.CulqiGateway;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageJpaEntity;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payments/credit-packages")
public class CreditPackageController {

    private final GetCreditPackagesUseCase getCreditPackagesUseCase;
    private final CreateCreditPackageCheckoutUseCase createCreditPackageCheckoutUseCase;
    private final CreditPackageRepository creditPackageRepository;
    private final CulqiGateway culqiGateway;
    private final PublicationCreditService publicationCreditService;

    public CreditPackageController(
            GetCreditPackagesUseCase getCreditPackagesUseCase,
            CreateCreditPackageCheckoutUseCase createCreditPackageCheckoutUseCase,
            CreditPackageRepository creditPackageRepository,
            CulqiGateway culqiGateway,
            PublicationCreditService publicationCreditService
    ) {
        this.getCreditPackagesUseCase = getCreditPackagesUseCase;
        this.createCreditPackageCheckoutUseCase = createCreditPackageCheckoutUseCase;
        this.creditPackageRepository = creditPackageRepository;
        this.culqiGateway = culqiGateway;
        this.publicationCreditService = publicationCreditService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CreditPackageResponse>>> getCreditPackages() {
        List<CreditPackageResponse> packages = getCreditPackagesUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(packages, "Credit packages retrieved"));
    }

    @PostMapping("/{packageId}/checkout")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<String>> checkoutPackage(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable String packageId,
            @Valid @RequestBody CreditPackageCheckoutRequest request
    ) {
        String initPoint = createCreditPackageCheckoutUseCase.execute(
                new CreateCreditPackageCheckoutCommand(
                        packageId,
                        user.getUserId().toString(),
                        request.clientEmail()
                )
        );
        return ResponseEntity.ok(ApiResponse.success(initPoint, "Checkout created. Redirect to payment."));
    }

    @PostMapping("/{packageId}/culqi-charge")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<String>> chargePackageWithCulqi(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable String packageId,
            @Valid @RequestBody CreditPackageCulqiChargeRequest request
    ) {
        CreditPackageJpaEntity pkg = creditPackageRepository.findById(packageId)
                .filter(CreditPackageJpaEntity::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Paquete de publicaciones no encontrado"));

        var charge = culqiGateway.createCreditPackageCharge(
                pkg.getPrice(),
                pkg.getId(),
                pkg.getName(),
                request.token(),
                request.clientEmail(),
                user.getUserId()
        );

        if (charge == null || !charge.isApproved()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Culqi no aprobo el pago del paquete"));
        }

        UUID purchaseId = publicationCreditService.recordCompletedCulqiPurchase(
                user.getUserId(),
                pkg.getId(),
                charge.id()
        );

        return ResponseEntity.ok(ApiResponse.success(purchaseId.toString(), "Credit package charged and activated via Culqi."));
    }

    public record CreditPackageCheckoutRequest(
            @NotBlank
            @Email
            String clientEmail
    ) {
    }

    public record CreditPackageCulqiChargeRequest(
            @NotBlank
            @Email
            String clientEmail,

            @NotBlank
            String token
    ) {
    }
}
