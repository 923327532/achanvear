package achanvear.peru.services.application;
import achanvear.peru.freelance.domain.model.FreelanceProject;
import achanvear.peru.freelance.domain.repository.FreelanceProjectRepository;
import achanvear.peru.payments.domain.model.Milestone;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import static achanvear.peru.services.application.ServiceContractStore.*;

@Service
@Transactional
public class ServiceContractService {
    private final achanvear.peru.shared.application.EventPublisher events;
    private final ServiceContractStore store;
    private final FreelanceProjectRepository projects;
    private final MilestoneRepository milestones;
    public ServiceContractService(ServiceContractStore store, FreelanceProjectRepository projects, MilestoneRepository milestones, achanvear.peru.shared.application.EventPublisher events) {
        this.events=events;
        this.store=store; this.projects=projects; this.milestones=milestones;
    }
    public Contract create(UUID clientId, UUID conversationId, UUID serviceId, UUID planId, UUID key) {
        var existing=store.findByKey(clientId,key);
        if(existing.isPresent()) {
            var c=existing.get();
            if(!c.conversationId().equals(conversationId)||!c.serviceId().equals(serviceId)||!Objects.equals(c.planId(),planId))
                throw new IllegalArgumentException("Idempotency key already used for another contract");
            return c;
        }
        var offer=store.quote(serviceId,planId);
        if(!"PEN".equals(offer.currency())) throw new IllegalArgumentException("Only PEN contracts are supported");
        if(!store.canFormalize(conversationId,serviceId,clientId,offer.freelancerId()))
            throw new ForbiddenOperationException("Only the client of this service conversation may formalize it");
        var project=FreelanceProject.create(clientId,offer.title(),offer.description(),offer.category(),null,
                offer.amount(),offer.deliveryDays(),null,List.of(),"FIXED","REMOTE","FREELANCER",List.of(),
                "PEN","ES",null,null,null,null);
        project.offerDirectlyTo(offer.freelancerId());
        projects.save(project);
        var milestone=Milestone.create(project.getId().value(),clientId,offer.freelancerId(),offer.planName(),offer.description(),offer.amount());
        milestones.save(milestone);
        var contract=new Contract(UUID.randomUUID(),project.getId().value(),serviceId,planId,conversationId,clientId,
                offer.freelancerId(),milestone.getId().value(),offer.title(),offer.planName(),offer.amount(),offer.deliveryDays(),
                "PEN","PENDING_ACCEPTANCE",key);
        store.save(contract);
        return contract;
    }
    public void accept(UUID id, UUID userId) {
        var c=store.lock(id);
        if(!c.freelancerId().equals(userId)) throw new ForbiddenOperationException("Only the selected professional may accept");
        if("ACCEPTED".equals(c.status())) return;
        if(!"PENDING_ACCEPTANCE".equals(c.status())) throw new IllegalStateException("Contract is not pending acceptance");
        var project=projects.findById(c.projectId().toString()).orElseThrow();
        project.acceptDirectOffer(userId); projects.save(project);
        project.pullDomainEvents().forEach(events::publish);
        store.setStatus(id,"ACCEPTED");
    }
    public void review(UUID id, UUID userId, int stars, String comment) {
        var c=store.lock(id);
        if(!c.clientId().equals(userId)||!"COMPLETED".equals(c.status()))
            throw new ForbiddenOperationException("Solo puedes calificar servicios con un contrato completado");
        if(stars<1||stars>5) throw new IllegalArgumentException("Stars must be between 1 and 5");
        store.review(c,userId,stars,comment);
    }
}
