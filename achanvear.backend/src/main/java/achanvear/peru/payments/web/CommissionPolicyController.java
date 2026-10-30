package achanvear.peru.payments.web;

import achanvear.peru.payments.domain.model.CommissionPolicy;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/payments/commission-policy")
public class CommissionPolicyController {
    @GetMapping
    public ApiResponse<PolicyResponse> policy() {
        return ApiResponse.success(new PolicyResponse("2026-10-29", "PEN", BigDecimal.ZERO,
                CommissionPolicy.getPlatformCommissionPercentage(), CommissionPolicy.getMpCommissionPercentage(),
                CommissionPolicy.getProcessorFixedFee(), "PROJECT_TOTAL_RATE_APPLIED_PER_MILESTONE", "TERMS", "/legal-documents/TERMS",
                true, true, "FREELANCER", "grossAmount - platformCommission - mpCommission",
                false, 5, "/payments/transactions", List.of("TOKENIZED_CARD"), achanvear.peru.payments.domain.model.PayoutPolicy.MINIMUM_AMOUNT,
                CommissionPolicy.getTiers(), "PER_FREELANCER_FIRST_ACCEPTED_PROJECT", true),
                "Current commission policy");
    }

    public record PolicyResponse(String version, String currency, BigDecimal jobCommissionPercentage,
            BigDecimal platformCommissionPercentage, BigDecimal processorCommissionPercentage,
            BigDecimal processorFixedFee, String calculationBasis, String escrowTermsDocument,
            String escrowTermsUrl, boolean tieredCommissionEnabled, boolean firstWorkExempt,
            String processorFeeBearer, String netAmountFormula, boolean currencyConversionSupported,
            int recentPaymentsLimit, String paymentHistoryEndpoint, List<String> payoutMethods,
            BigDecimal minimumPayoutAmount, List<CommissionPolicy.Tier> tiers, String exemptionScope, boolean includesServices) {}
}
