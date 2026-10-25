package achanvear.peru.payments.web;
import achanvear.peru.payments.domain.model.CommissionPolicy;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.math.BigDecimal;
@RestController
@RequestMapping("/payments/commission-policy")
public class CommissionPolicyController {
    @GetMapping
    public ApiResponse<Map<String,Object>> policy() {
        return ApiResponse.success(Map.of("version", "2026-10-25", "currency", "PEN",
                "jobCommissionPercentage", BigDecimal.ZERO,
                "platformCommissionPercentage", CommissionPolicy.getPlatformCommissionPercentage(),
                "processorCommissionPercentage", CommissionPolicy.getMpCommissionPercentage(),
                "processorFixedFee", CommissionPolicy.calculateCommission(BigDecimal.ZERO).mpCommission(),
                "calculationBasis", "PER_MILESTONE", "escrowTermsDocument", "TERMS"), "Current commission policy");
    }
}
