package achanvear.peru.company.application.impl;

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
import achanvear.peru.shared.application.port.IdentityUserLookupPort;
import achanvear.peru.company.application.port.out.PeruvianDocumentValidationPort;
import achanvear.peru.company.application.query.CompanyListQuery;
import achanvear.peru.company.domain.factory.CompanyFactory;
import achanvear.peru.company.domain.model.Company;
import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.company.domain.model.CompanyPlan;
import achanvear.peru.company.domain.model.CompanySize;
import achanvear.peru.company.domain.model.CompanyStatus;
import achanvear.peru.company.domain.model.PaymentMethodType;
import achanvear.peru.company.domain.model.RepresentativeDni;
import achanvear.peru.company.domain.model.Ruc;
import achanvear.peru.company.domain.repository.CompanyRepository;
import achanvear.peru.company.infrastructure.persistence.CompanyJpaRepository;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import achanvear.peru.shared.application.EventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CompanyApplicationService implements
        CreateCompanyUseCase,
        GetCompanyByIdUseCase,
        GetCompanyByUserIdUseCase,
        UpdateCompanyUseCase,
        DeactivateCompanyUseCase,
        ListCompaniesUseCase,
        ChangeCompanyStatusUseCase {

    private final CompanyRepository companyRepository;
    private final CompanyJpaRepository companyJpaRepository;
    private final CompanyFactory companyFactory;
    private final IdentityUserLookupPort identityUserLookupPort;
    private final PeruvianDocumentValidationPort peruvianDocumentValidationPort;
    private final EventPublisher eventPublisher;
    private final CompanyApplicationMapper companyApplicationMapper;

    public CompanyApplicationService(
            CompanyRepository companyRepository,
            CompanyJpaRepository companyJpaRepository,
            CompanyFactory companyFactory,
            IdentityUserLookupPort identityUserLookupPort,
            PeruvianDocumentValidationPort peruvianDocumentValidationPort,
            EventPublisher eventPublisher,
            CompanyApplicationMapper companyApplicationMapper
    ) {
        this.companyRepository = companyRepository;
        this.companyJpaRepository = companyJpaRepository;
        this.companyFactory = companyFactory;
        this.identityUserLookupPort = identityUserLookupPort;
        this.peruvianDocumentValidationPort = peruvianDocumentValidationPort;
        this.eventPublisher = eventPublisher;
        this.companyApplicationMapper = companyApplicationMapper;
    }

    @Override
    public CompanyResponse execute(CreateCompanyCommand command) {
        UUID ownerUserId = UUID.fromString(command.ownerUserId());

        IdentityUserLookupPort.IdentityUserSummary owner = identityUserLookupPort.findById(ownerUserId);
        validateCompanyOwner(owner, ownerUserId);

        if (companyRepository.existsByOwnerUserId(ownerUserId)) {
            throw new BusinessRuleViolationException("Owner user already has a company assigned");
        }

        if (companyRepository.existsByBusinessName(command.businessName().trim())) {
            throw new BusinessRuleViolationException("Company already exists with the same business name");
        }

        RepresentativeDni representativeDni = new RepresentativeDni(command.representativeDni());

        PeruvianDocumentValidationPort.DniValidationResult validationResult =
                peruvianDocumentValidationPort.validateDni(representativeDni.value());

        CompanyStatus initialStatus = resolveInitialStatus(validationResult);

        Ruc ruc = command.ruc() == null || command.ruc().trim().isBlank()
                ? null
                : new Ruc(command.ruc());

        CompanySize companySize = parseCompanySize(command.companySize());
        PaymentMethodType paymentMethod = parsePaymentMethodType(command.paymentMethodType());
        CompanyPlan companyPlan = parseCompanyPlan(command.companyPlan());

        Company company = companyFactory.create(
                ownerUserId,
                command.businessName(),
                command.tradeName(),
                command.legalName(),
                command.industry(),
                command.specialty(),
                companySize,
                command.logoUrl(),
                command.biography(),
                command.achievements(),
                command.address(),
                paymentMethod,
                companyPlan,
                representativeDni,
                ruc,
                initialStatus
        );

        companyRepository.save(company);
        company.pullDomainEvents().forEach(eventPublisher::publish);

        return companyApplicationMapper.toResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse execute(String companyId) {
        Company company = companyRepository.findById(CompanyId.from(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));

        return companyApplicationMapper.toResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse executeByUserId(String userId) {
        return companyRepository.findByOwnerUserId(UUID.fromString(userId))
                .map(companyApplicationMapper::toResponse)
                .orElse(null);
    }

    @Override
    public CompanyResponse execute(UpdateCompanyCommand command) {
        Company company = companyRepository.findById(CompanyId.from(command.companyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Company", command.companyId()));

        authorizeCompanyAccess(company, command.requesterUserId(), command.superAdmin());

        CompanySize companySize = parseCompanySize(command.companySize());
        PaymentMethodType paymentMethod = parsePaymentMethodType(command.paymentMethodType());
        CompanyPlan companyPlan = parseCompanyPlan(command.companyPlan());

        company.updateProfile(
                command.businessName(),
                command.tradeName(),
                command.legalName(),
                command.industry(),
                command.specialty(),
                companySize,
                command.logoUrl(),
                command.biography(),
                command.achievements(),
                command.address(),
                paymentMethod,
                companyPlan
        );

        companyRepository.save(company);
        company.pullDomainEvents().forEach(eventPublisher::publish);

        return companyApplicationMapper.toResponse(company);
    }

    @Override
    public void execute(DeactivateCompanyCommand command) {
        Company company = companyRepository.findById(CompanyId.from(command.companyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Company", command.companyId()));

        authorizeCompanyAccess(company, command.requesterUserId(), command.superAdmin());

        company.deactivate();
        companyRepository.save(company);
        company.pullDomainEvents().forEach(eventPublisher::publish);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyPageResponse execute(CompanyListQuery query) {
        Page<Company> resultPage = companyRepository.search(query);
        return companyApplicationMapper.toPageResponse(resultPage);
    }

    @Override
    public CompanyResponse execute(ChangeCompanyStatusCommand command) {
        if (!command.superAdmin()) {
            throw new ForbiddenOperationException("Only super admin can change company status");
        }

        Company company = companyRepository.findById(CompanyId.from(command.companyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Company", command.companyId()));

        company.changeStatus(CompanyStatus.valueOf(command.newStatus().trim().toUpperCase()));

        companyRepository.save(company);
        company.pullDomainEvents().forEach(eventPublisher::publish);

        return companyApplicationMapper.toResponse(company);
    }

    @Transactional(readOnly = true)
    public CompanyHistoryResponse getHistory(String companyId) {
        Company company = companyRepository.findById(CompanyId.from(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));

        List<Object[]> results = companyJpaRepository.findCompanyHistoryByOwnerUserId(company.getOwnerUserId());

        List<CompanyHistoryResponse.CompanyHistoryItem> items = results.stream()
                .map(row -> new CompanyHistoryResponse.CompanyHistoryItem(
                        (String) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        (String) row[4],
                        (String) row[5],
                        (String) row[6],
                        (String) row[7],
                        row[8] != null ? ((Number) row[8]).doubleValue() : null
                ))
                .toList();

        return new CompanyHistoryResponse(items, items.size());
    }

    private void validateCompanyOwner(
            IdentityUserLookupPort.IdentityUserSummary owner,
            UUID ownerUserId
    ) {
        if (owner == null) {
            throw new ResourceNotFoundException("Owner user", ownerUserId.toString());
        }

        if (!ownerUserId.equals(owner.id())) {
            throw new BusinessRuleViolationException("Owner user data mismatch");
        }

        if (!"COMPANY".equalsIgnoreCase(owner.role())) {
            throw new BusinessRuleViolationException("Owner user must have COMPANY role");
        }

        if (!"ACTIVE".equalsIgnoreCase(owner.status())) {
            throw new BusinessRuleViolationException("Owner user must be active");
        }
    }

    private CompanyStatus resolveInitialStatus(
            PeruvianDocumentValidationPort.DniValidationResult validationResult
    ) {
        if (validationResult.success() && validationResult.valid()) {
            return CompanyStatus.VALIDATED;
        }

        if (validationResult.uncertain()) {
            return CompanyStatus.PENDING;
        }

        return CompanyStatus.PENDING;
    }

    private void authorizeCompanyAccess(
            Company company,
            String requesterUserId,
            boolean superAdmin
    ) {
        if (superAdmin) {
            return;
        }

        UUID requesterId = UUID.fromString(requesterUserId);
        if (!company.belongsTo(requesterId)) {
            throw new ForbiddenOperationException("You do not have permission to manage this company");
        }
    }

    /**
     * Safely parses a PaymentMethodType from a string value.
     * Returns BANK_TRANSFER as default when the value is null, blank, or invalid.
     */
    private PaymentMethodType parsePaymentMethodType(String value) {
        if (value == null || value.isBlank()) {
            return PaymentMethodType.BANK_TRANSFER;
        }
        try {
            return PaymentMethodType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentMethodType.BANK_TRANSFER;
        }
    }

    /**
     * Safely parses a CompanySize from a string value.
     * Returns SMALL_BUSINESS as default when the value is null, blank, or invalid.
     */
    private CompanySize parseCompanySize(String value) {
        if (value == null || value.isBlank()) {
            return CompanySize.SMALL_BUSINESS;
        }
        try {
            return CompanySize.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return CompanySize.SMALL_BUSINESS;
        }
    }

    /**
     * Safely parses a CompanyPlan from a string value.
     * Returns FREE as default when the value is null, blank, or invalid.
     */
    private CompanyPlan parseCompanyPlan(String value) {
        if (value == null || value.isBlank()) {
            return CompanyPlan.FREE;
        }
        try {
            return CompanyPlan.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return CompanyPlan.FREE;
        }
    }
}
