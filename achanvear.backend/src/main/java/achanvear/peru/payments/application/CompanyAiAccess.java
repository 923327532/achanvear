package achanvear.peru.payments.application;

import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import achanvear.peru.shared.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("companyAiAccess")
public class CompanyAiAccess {
    private final CompanyLookupPort companies;
    private final SubscriptionRepository subscriptions;
    private final JobPostRepository jobs;

    public CompanyAiAccess(CompanyLookupPort companies, SubscriptionRepository subscriptions, JobPostRepository jobs) {
        this.companies = companies; this.subscriptions = subscriptions; this.jobs = jobs;
    }

    public boolean forCompany(java.util.UUID companyId) {
        return companies.findById(companyId).map(company ->
                subscriptions.findActiveByCompanyUserId(company.ownerUserId())
                        .filter(subscription -> subscription.isActive() && subscription.getPlan() != achanvear.peru.payments.domain.model.PlanType.FREE)
                        .isPresent()).orElse(false);
    }

    public boolean allowed(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) return false;
        if (user.isSuperAdmin()) return true;
        return user.getCompanyId() != null ? forCompany(user.getCompanyId()) :
                companies.findByOwnerUserId(user.getUserId()).map(company -> forCompany(company.id())).orElse(false);
    }

    public void requireJob(String jobId) {
        var job = jobs.findById(JobPostId.from(jobId)).orElseThrow();
        if (!forCompany(job.getCompanyId())) throw new ForbiddenOperationException(
                "El plan gratuito permite selección manual. Las funciones de IA y entrevistas requieren un plan de pago activo.");
    }
}
