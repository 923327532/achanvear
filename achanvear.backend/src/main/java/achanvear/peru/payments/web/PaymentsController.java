package achanvear.peru.payments.web;

import achanvear.peru.payments.application.command.CreateMilestoneDepositIntentCommand;
import achanvear.peru.payments.application.command.CreateSubscriptionCommand;
import achanvear.peru.payments.application.command.ReleaseMilestonePaymentCommand;
import achanvear.peru.payments.application.dto.*;
import achanvear.peru.payments.application.port.in.*;
import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.application.service.EscrowService;
import achanvear.peru.payments.domain.model.Milestone;
import achanvear.peru.payments.domain.model.MilestoneId;
import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import achanvear.peru.payments.domain.repository.PaymentRepository;
import achanvear.peru.payments.infrastructure.external.CulqiGateway;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
public class PaymentsController {

    private final GetPaymentsOverviewUseCase getPaymentsOverviewUseCase;
    private final GetAvailablePlansUseCase getAvailablePlansUseCase;
    private final GetCurrentPlanUseCase getCurrentPlanUseCase;
    private final CheckProjectPublishingEligibilityUseCase checkProjectPublishingEligibilityUseCase;
    private final CreateSubscriptionUseCase createSubscriptionUseCase;
    private final CreateMilestoneDepositIntentUseCase createMilestoneDepositIntentUseCase;
    private final GetMilestonePaymentDetailUseCase getMilestonePaymentDetailUseCase;
    private final ReleaseMilestonePaymentUseCase releaseMilestonePaymentUseCase;
    private final GetPaymentTransactionsUseCase getPaymentTransactionsUseCase;
    private final GetFreelancerWalletSummaryUseCase getFreelancerWalletSummaryUseCase;
    private final CulqiGateway culqiGateway;
    private final MilestoneRepository milestoneRepository;
    private final PaymentRepository paymentRepository;
    private final EscrowService escrowService;
    private final AuditService auditService;

    public PaymentsController(
            GetPaymentsOverviewUseCase getPaymentsOverviewUseCase,
            GetAvailablePlansUseCase getAvailablePlansUseCase,
            GetCurrentPlanUseCase getCurrentPlanUseCase,
            CheckProjectPublishingEligibilityUseCase checkProjectPublishingEligibilityUseCase,
            CreateSubscriptionUseCase createSubscriptionUseCase,
            CreateMilestoneDepositIntentUseCase createMilestoneDepositIntentUseCase,
            GetMilestonePaymentDetailUseCase getMilestonePaymentDetailUseCase,
            ReleaseMilestonePaymentUseCase releaseMilestonePaymentUseCase,
            GetPaymentTransactionsUseCase getPaymentTransactionsUseCase,
            GetFreelancerWalletSummaryUseCase getFreelancerWalletSummaryUseCase,
            CulqiGateway culqiGateway,
            MilestoneRepository milestoneRepository,
            PaymentRepository paymentRepository,
            EscrowService escrowService,
            AuditService auditService
    ) {
        this.getPaymentsOverviewUseCase = getPaymentsOverviewUseCase;
        this.getAvailablePlansUseCase = getAvailablePlansUseCase;
        this.getCurrentPlanUseCase = getCurrentPlanUseCase;
        this.checkProjectPublishingEligibilityUseCase = checkProjectPublishingEligibilityUseCase;
        this.createSubscriptionUseCase = createSubscriptionUseCase;
        this.createMilestoneDepositIntentUseCase = createMilestoneDepositIntentUseCase;
        this.getMilestonePaymentDetailUseCase = getMilestonePaymentDetailUseCase;
        this.releaseMilestonePaymentUseCase = releaseMilestonePaymentUseCase;
        this.getPaymentTransactionsUseCase = getPaymentTransactionsUseCase;
        this.getFreelancerWalletSummaryUseCase = getFreelancerWalletSummaryUseCase;
        this.culqiGateway = culqiGateway;
        this.milestoneRepository = milestoneRepository;
        this.paymentRepository = paymentRepository;
        this.escrowService = escrowService;
        this.auditService = auditService;
    }

    // === 1. Dashboard Overview ===
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<PaymentsOverviewResponse>> getOverview(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        PaymentsOverviewResponse overview = getPaymentsOverviewUseCase.execute(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success(overview, "Payments overview retrieved"));
    }

    // === 2. List Available Plans ===
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanOptionResponse>>> getAvailablePlans() {
        List<PlanOptionResponse> plans = getAvailablePlansUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(plans, "Available plans retrieved"));
    }

    // === 3. Current Company Plan ===
    @GetMapping("/plans/current")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<CurrentPlanResponse>> getCurrentPlan(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        CurrentPlanResponse plan = getCurrentPlanUseCase.execute(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success(plan, "Current plan retrieved"));
    }

    // === 4. Check Project Publishing Eligibility ===
    @GetMapping("/plans/eligibility/project-publishing")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<ProjectPublishingEligibilityResponse>> checkEligibility(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        ProjectPublishingEligibilityResponse eligibility = checkProjectPublishingEligibilityUseCase.execute(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success(eligibility, "Eligibility checked"));
    }

    // === 5. Subscribe to Plan ===
    @PostMapping("/plans/subscribe")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<String>> subscribeToPlan(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody SubscribePlanRequest request
    ) {
        String initPoint = createSubscriptionUseCase.execute(
                new CreateSubscriptionCommand(
                        PlanType.valueOf(request.plan()),
                        user.getUserId(),
                        request.companyEmail()
                )
        );
        return ResponseEntity.ok(ApiResponse.success(initPoint, "Subscription created. Redirect to payment."));
    }

    // === 6. Create Milestone Deposit Intent ===
    @PostMapping("/milestones/deposit-intent")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<MilestoneDepositIntentResponse>> createDepositIntent(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateMilestoneDepositIntentRequest request
    ) {
        MilestoneDepositIntentResponse response = createMilestoneDepositIntentUseCase.execute(
                new CreateMilestoneDepositIntentCommand(
                        request.projectId(),
                        user.getUserId(),
                        request.freelancerUserId(),
                        request.title(),
                        request.description(),
                        request.amount(),
                        request.clientEmail()
                )
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Deposit intent created"));
    }

    @PostMapping("/milestones/{milestoneId}/process-culqi-payment")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<String>> processCulqiPayment(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID milestoneId,
            @Valid @RequestBody CulqiProcessPaymentRequest request
    ) {
        Milestone milestone = milestoneRepository.findById(new MilestoneId(milestoneId))
                .orElseThrow(() -> new IllegalStateException("Milestone not found: " + milestoneId));

        if (!milestone.getClientUserId().equals(user.getUserId())) {
            return ResponseEntity.status(403).body(ApiResponse.error("You cannot pay this milestone"));
        }

        var charge = culqiGateway.createCharge(
                milestone.getAmount(),
                request.token(),
                request.email(),
                milestoneId.toString(),
                "Deposito en garantia Achanvear: " + milestone.getTitle()
        );

        if (charge == null || !charge.isApproved()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Culqi payment was not approved"));
        }

        if (paymentRepository.existsByMpPaymentId(charge.id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Payment already processed"));
        }

        escrowService.createEscrow(
                milestone.getId().value(),
                milestone.getProjectId(),
                milestone.getClientUserId(),
                milestone.getFreelancerUserId(),
                milestone.getAmount(),
                charge.id(),
                request.token()
        );

        milestone.fund(request.token(), charge.id());
        milestoneRepository.save(milestone);

        auditService.logPaymentFunded(
                milestone.getClientUserId(),
                milestone.getId().value().toString(),
                charge.id(),
                null
        );

        return ResponseEntity.ok(ApiResponse.success(charge.id(), "Culqi payment processed and held in escrow"));
    }

    // === 7. Get Milestone Payment Detail ===
    @GetMapping("/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestonePaymentDetailResponse>> getMilestoneDetail(
            @PathVariable UUID milestoneId
    ) {
        MilestonePaymentDetailResponse detail = getMilestonePaymentDetailUseCase.execute(milestoneId);
        return ResponseEntity.ok(ApiResponse.success(detail, "Milestone detail retrieved"));
    }

    // === 8. Release Milestone Payment ===
    @PostMapping("/milestones/{milestoneId}/release")
    @PreAuthorize("hasAuthority('COMPANY')")
    public ResponseEntity<ApiResponse<MilestoneReleasedResponse>> releaseMilestone(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID milestoneId,
            @Valid @RequestBody ReleaseMilestonePaymentRequest request
    ) {
        MilestoneReleasedResponse response = releaseMilestonePaymentUseCase.execute(
                new ReleaseMilestonePaymentCommand(milestoneId, user.getUserId(), request.comments())
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Payment released successfully"));
    }

    // === 9. Get Payment Transactions ===
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PaymentTransactionPageResponse>> getTransactions(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PaymentTransactionPageResponse transactions = getPaymentTransactionsUseCase.execute(user.getUserId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(transactions, "Transactions retrieved"));
    }

    // === 10. Freelancer Wallet Summary ===
    @GetMapping("/freelancer/wallet-summary")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerWalletSummaryResponse>> getFreelancerWallet(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        FreelancerWalletSummaryResponse summary = getFreelancerWalletSummaryUseCase.execute(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success(summary, "Freelancer wallet summary retrieved"));
    }
}
