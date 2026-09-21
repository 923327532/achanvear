package achanvear.peru.company.web;

import achanvear.peru.company.application.ChangeCompanyStatusUseCase;
import achanvear.peru.company.application.CreateCompanyUseCase;
import achanvear.peru.company.application.DeactivateCompanyUseCase;
import achanvear.peru.company.application.GetCompanyByIdUseCase;
import achanvear.peru.company.application.GetCompanyByUserIdUseCase;
import achanvear.peru.company.application.ListCompaniesUseCase;
import achanvear.peru.company.application.UpdateCompanyUseCase;
import achanvear.peru.company.application.command.ChangeCompanyStatusCommand;
import achanvear.peru.company.application.command.CreateCompanyCommand;
import achanvear.peru.company.application.command.DeactivateCompanyCommand;
import achanvear.peru.company.application.command.UpdateCompanyCommand;
import achanvear.peru.company.application.dto.CompanyHistoryResponse;
import achanvear.peru.company.application.dto.CompanyPageResponse;
import achanvear.peru.company.application.dto.CompanyResponse;
import achanvear.peru.company.application.impl.CompanyApplicationService;
import achanvear.peru.company.application.query.CompanyListQuery;
import achanvear.peru.company.web.security.AuthenticatedUser;
import achanvear.peru.company.web.security.AuthenticatedUserResolver;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CreateCompanyUseCase createCompanyUseCase;
    private final GetCompanyByIdUseCase getCompanyByIdUseCase;
    private final GetCompanyByUserIdUseCase getCompanyByUserIdUseCase;
    private final UpdateCompanyUseCase updateCompanyUseCase;
    private final DeactivateCompanyUseCase deactivateCompanyUseCase;
    private final ListCompaniesUseCase listCompaniesUseCase;
    private final ChangeCompanyStatusUseCase changeCompanyStatusUseCase;
    private final CompanyApplicationService companyApplicationService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public CompanyController(
            CreateCompanyUseCase createCompanyUseCase,
            GetCompanyByIdUseCase getCompanyByIdUseCase,
            GetCompanyByUserIdUseCase getCompanyByUserIdUseCase,
            UpdateCompanyUseCase updateCompanyUseCase,
            DeactivateCompanyUseCase deactivateCompanyUseCase,
            ListCompaniesUseCase listCompaniesUseCase,
            ChangeCompanyStatusUseCase changeCompanyStatusUseCase,
            CompanyApplicationService companyApplicationService,
            AuthenticatedUserResolver authenticatedUserResolver
    ) {
        this.createCompanyUseCase = createCompanyUseCase;
        this.getCompanyByIdUseCase = getCompanyByIdUseCase;
        this.getCompanyByUserIdUseCase = getCompanyByUserIdUseCase;
        this.updateCompanyUseCase = updateCompanyUseCase;
        this.deactivateCompanyUseCase = deactivateCompanyUseCase;
        this.listCompaniesUseCase = listCompaniesUseCase;
        this.changeCompanyStatusUseCase = changeCompanyStatusUseCase;
        this.companyApplicationService = companyApplicationService;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyProfile(
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);

        CompanyResponse response = getCompanyByUserIdUseCase.executeByUserId(authenticatedUser.userId());

        if (response == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No company found for this user"));
        }

        return ResponseEntity.ok(ApiResponse.success(response, "Company profile retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('COMPANY', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(
            @Valid @RequestBody CreateCompanyRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);

        CreateCompanyCommand command = new CreateCompanyCommand(
                authenticatedUser.userId(),
                request.businessName(),
                request.tradeName(),
                request.legalName(),
                request.industry(),
                request.specialty(),
                request.companySize(),
                request.logoUrl(),
                request.biography(),
                request.achievements(),
                request.address(),
                request.paymentMethodType(),
                request.companyPlan(),
                request.representativeDni(),
                request.ruc()
        );

        CompanyResponse response = createCompanyUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Company created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable String id) {
        CompanyResponse response = getCompanyByIdUseCase.execute(id);

        return ResponseEntity.ok(ApiResponse.success(response, "Company retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable String id,
            @Valid @RequestBody UpdateCompanyRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);

        UpdateCompanyCommand command = new UpdateCompanyCommand(
                id,
                authenticatedUser.userId(),
                authenticatedUser.superAdmin(),
                request.businessName(),
                request.tradeName(),
                request.legalName(),
                request.industry(),
                request.specialty(),
                request.companySize(),
                request.logoUrl(),
                request.biography(),
                request.achievements(),
                request.address(),
                request.paymentMethodType(),
                request.companyPlan()
        );

        CompanyResponse response = updateCompanyUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Company updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateCompany(
            @PathVariable String id,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);

        DeactivateCompanyCommand command = new DeactivateCompanyCommand(
                id,
                authenticatedUser.userId(),
                authenticatedUser.superAdmin()
        );

        deactivateCompanyUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(null, "Company deactivated successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('COMPANY', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<CompanyPageResponse>> listCompanies(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String companySize,
            @RequestParam(required = false) String companyPlan,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        CompanyListQuery query = new CompanyListQuery(
                search,
                status,
                industry,
                companySize,
                companyPlan,
                page,
                size,
                sortBy,
                sortDirection
        );

        CompanyPageResponse response = listCompaniesUseCase.execute(query);

        return ResponseEntity.ok(ApiResponse.success(response, "Companies retrieved successfully"));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<CompanyHistoryResponse>> getCompanyHistory(@PathVariable String id) {
        CompanyHistoryResponse response = companyApplicationService.getHistory(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Company history retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> changeCompanyStatus(
            @PathVariable String id,
            @Valid @RequestBody ChangeCompanyStatusRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = authenticatedUserResolver.resolve(authentication);

        ChangeCompanyStatusCommand command = new ChangeCompanyStatusCommand(
                id,
                authenticatedUser.userId(),
                authenticatedUser.superAdmin(),
                request.status()
        );

        CompanyResponse response = changeCompanyStatusUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Company status changed successfully"));
    }
}