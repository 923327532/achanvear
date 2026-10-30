package achanvear.peru.payments.application.service;
import achanvear.peru.payments.application.dto.EscrowStatusResponse;
import achanvear.peru.payments.application.port.out.PaymentProjectLookup;
import achanvear.peru.payments.domain.model.Escrow;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.List;

@Component
public class EscrowResponseMapper {
    private final PaymentProjectLookup projects;
    public EscrowResponseMapper(PaymentProjectLookup projects) { this.projects = projects; }
    public List<EscrowStatusResponse> toResponses(List<Escrow> escrows) {
        var titles = projects.findTitles(escrows.stream().map(Escrow::getProjectId).distinct().toList());
        return escrows.stream().map(e -> new EscrowStatusResponse(e.getId().value().toString(),
                e.getMilestoneId().toString(), e.getProjectId().toString(), e.getAmount(),
                e.getPlatformCommission(), e.getMpCommission(), e.getFreelancerAmount(), e.getStatus().name(),
                timestamp(e.getHeldAt()), timestamp(e.getReleasedAt()), timestamp(e.getRefundedAt()),
                timestamp(e.getDisputedAt()), e.getDisputeReason(), titles.get(e.getProjectId()))).toList();
    }
    public EscrowStatusResponse toResponse(Escrow escrow) { return toResponses(List.of(escrow)).get(0); }
    private String timestamp(Instant value) { return value == null ? null : value.toString(); }
}
