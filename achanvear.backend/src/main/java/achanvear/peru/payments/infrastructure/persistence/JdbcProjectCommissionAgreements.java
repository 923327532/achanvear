package achanvear.peru.payments.infrastructure.persistence;
import achanvear.peru.payments.application.port.out.ProjectCommissionAgreements;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.UUID;
@Repository
public class JdbcProjectCommissionAgreements implements ProjectCommissionAgreements {
    private final jakarta.persistence.EntityManager entities;
    private final JdbcTemplate jdbc;
    public JdbcProjectCommissionAgreements(JdbcTemplate jdbc, jakarta.persistence.EntityManager entities) { this.jdbc=jdbc; this.entities=entities; }
    @org.springframework.context.event.EventListener
    @org.springframework.transaction.annotation.Transactional
    public void agree(achanvear.peru.freelance.domain.event.ProjectAcceptedEvent event) {
        entities.flush();
        jdbc.queryForObject("SELECT id FROM users WHERE id=? FOR UPDATE",UUID.class,event.freelancerId());
        if(Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM project_commission_agreements WHERE project_id=?)",Boolean.class,event.projectId()))) return;
        boolean first=!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM project_commission_agreements WHERE freelancer_user_id=?)",Boolean.class,event.freelancerId()));
        BigDecimal rate=achanvear.peru.payments.domain.model.CommissionPolicy.platformRateForProject(event.amount(),first);
        jdbc.update("INSERT INTO project_commission_agreements(project_id,freelancer_user_id,project_amount,platform_percentage,first_project_exempt) VALUES(?,?,?,?,?)",
                event.projectId(),event.freelancerId(),event.amount(),rate,first);
    }
    public BigDecimal platformPercentage(UUID projectId) {
        return jdbc.query("SELECT platform_percentage FROM project_commission_agreements WHERE project_id=?",(r,n)->r.getBigDecimal(1),projectId)
                .stream().findFirst().orElseThrow(()->new BusinessRuleViolationException("Project must have an accepted commission agreement before payment"));
    }
    public void assertPaymentAllowed(UUID projectId) {
        if(!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM freelance_projects WHERE id=? AND status='IN_PROGRESS')",Boolean.class,projectId)))
            throw new BusinessRuleViolationException("Project must be accepted and in progress before payment");
        platformPercentage(projectId);
    }
}
