package achanvear.peru.payments.web;

import achanvear.peru.payments.application.command.CreateCreditPackageCheckoutCommand;
import achanvear.peru.payments.application.dto.CreditPackageResponse;
import achanvear.peru.payments.application.port.in.CreateCreditPackageCheckoutUseCase;
import achanvear.peru.payments.application.port.in.GetCreditPackagesUseCase;
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

@RestController
@RequestMapping("/payments/credit-packages")
public class CreditPackageController {

    private final GetCreditPackagesUseCase getCreditPackagesUseCase;
    private final CreateCreditPackageCheckoutUseCase createCreditPackageCheckoutUseCase;

    public CreditPackageController(
            GetCreditPackagesUseCase getCreditPackagesUseCase,
            CreateCreditPackageCheckoutUseCase createCreditPackageCheckoutUseCase
    ) {
        this.getCreditPackagesUseCase = getCreditPackagesUseCase;
        this.createCreditPackageCheckoutUseCase = createCreditPackageCheckoutUseCase;
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

    public record CreditPackageCheckoutRequest(
            @NotBlank
            @Email
            String clientEmail
    ) {
    }
}
