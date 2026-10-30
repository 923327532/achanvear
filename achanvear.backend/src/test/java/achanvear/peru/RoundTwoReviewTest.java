package achanvear.peru;
import achanvear.peru.jobs.infrastructure.persistence.*;
import achanvear.peru.jobs.domain.model.ApplicationStatus;
import achanvear.peru.payments.domain.model.CommissionPolicy;
import achanvear.peru.freelance.domain.model.*;
import achanvear.peru.services.application.*;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoundTwoReviewTest {
    private FreelanceProject project(UUID client) {
        return FreelanceProject.create(client,"Servicio contratado","Descripcion de servicio contratado para una prueba", "DESIGN",null,
                new BigDecimal("5000"),7,null,List.of(),"FIXED","REMOTE","FREELANCER",List.of(),"PEN","ES",null,null,null,null);
    }
    @Test void mapsScalarJobIdWithoutLoadingRelationship() {
        var entity=new JobApplicationJpaEntity(); UUID job=UUID.randomUUID();
        entity.setId(UUID.randomUUID()); entity.setJobPostId(job); entity.setCandidateUserId(UUID.randomUUID());
        entity.setCoverLetter("Carta de presentacion de prueba"); entity.setStatus(ApplicationStatus.SUBMITTED.name()); entity.setAppliedAt(Instant.now());
        var mapper=new ApplicationMapper() {};
        var application=mapper.toDomain(entity);
        assertEquals(job,application.getJobPostId()); assertNull(entity.getJobPost());
        assertEquals(job,mapper.toDomain(mapper.toEntity(application)).getJobPostId());
    }
    @Test void tariffBoundariesUseProjectTotalAndFirstProjectWaivesOnlyPlatform() {
        assertEquals(new BigDecimal("5.00"),CommissionPolicy.platformRateForProject(new BigDecimal("4999.99"),false));
        assertEquals(new BigDecimal("4.00"),CommissionPolicy.platformRateForProject(new BigDecimal("5000"),false));
        assertEquals(new BigDecimal("4.00"),CommissionPolicy.platformRateForProject(new BigDecimal("15000"),false));
        assertEquals(new BigDecimal("3.00"),CommissionPolicy.platformRateForProject(new BigDecimal("15000.01"),false));
        var rate=CommissionPolicy.platformRateForProject(new BigDecimal("20000"),true);
        for(var amount:List.of(new BigDecimal("4000"),new BigDecimal("10000"),new BigDecimal("6000"))) {
            var commission=CommissionPolicy.calculateCommission(amount,rate);
            assertEquals(0,commission.platformCommission().signum()); assertTrue(commission.mpCommission().signum()>0);
            assertEquals(0,amount.compareTo(commission.freelancerAmount().add(commission.mpCommission())));
        }
    }
    @Test void onlyDesignatedProfessionalCanAcceptDirectOfferAndItEmitsAcceptance() {
        var p=project(UUID.randomUUID()); var professional=UUID.randomUUID(); p.offerDirectlyTo(professional);
        assertEquals(ProjectStatus.DRAFT,p.getStatus()); assertEquals(professional,p.getSelectedFreelancerUserId());
        assertThrows(IllegalStateException.class,()->p.acceptDirectOffer(UUID.randomUUID()));
        p.acceptDirectOffer(professional); assertEquals(ProjectStatus.IN_PROGRESS,p.getStatus());
        assertTrue(p.pullDomainEvents().stream().anyMatch(e->e instanceof achanvear.peru.freelance.domain.event.ProjectAcceptedEvent));
        assertThrows(IllegalStateException.class,()->p.acceptDirectOffer(professional));
    }
    @Test void companyStatsSumTheoryAndTechnicalProcesses() {
        var jobs=mock(JobPostJpaRepository.class); var applications=mock(ApplicationJpaRepository.class);
        var interviews=mock(achanvear.peru.interview.infrastructure.persistence.repository.InterviewJpaRepository.class);
        var hiring=mock(achanvear.peru.hiring.infrastructure.persistence.HiringProcessJpaRepository.class);
        var company=UUID.randomUUID(); when(hiring.countByCompanyAndStage(company,"THEORY_INTERVIEW")).thenReturn(2L);
        when(hiring.countByCompanyAndStage(company,"TECHNICAL_INTERVIEW")).thenReturn(3L);
        var stats=new CompanyHiringStatsQueryAdapter(jobs,applications,interviews,hiring).getForCompany(company);
        assertEquals(5,stats.interviewsInProgress()); verifyNoInteractions(interviews);
    }
    @Test void serviceReviewRequiresCompletedContractAndClientOwnership() {
        var store=mock(ServiceContractStore.class); var id=UUID.randomUUID(); var client=UUID.randomUUID();
        var contract=new ServiceContractStore.Contract(id,UUID.randomUUID(),UUID.randomUUID(),null,UUID.randomUUID(),client,
                UUID.randomUUID(),UUID.randomUUID(),"Servicio","Plan",new BigDecimal("100"),3,"PEN","ACCEPTED",UUID.randomUUID());
        when(store.lock(id)).thenReturn(contract);
        var service=new ServiceContractService(store,mock(achanvear.peru.freelance.domain.repository.FreelanceProjectRepository.class),
                mock(achanvear.peru.payments.domain.repository.MilestoneRepository.class),mock(achanvear.peru.shared.application.EventPublisher.class));
        assertThrows(ForbiddenOperationException.class,()->service.review(id,client,5,"Buena experiencia"));
        verify(store,never()).review(any(),any(),anyInt(),any());
    }
    @Test void createsOneSnapshotMilestoneAndRetriesReturnSameContract() {
        var store=mock(ServiceContractStore.class);
        var projects=mock(achanvear.peru.freelance.domain.repository.FreelanceProjectRepository.class);
        var milestones=mock(achanvear.peru.payments.domain.repository.MilestoneRepository.class);
        var client=UUID.randomUUID(); var professional=UUID.randomUUID(); var conversation=UUID.randomUUID(); var serviceId=UUID.randomUUID(); var key=UUID.randomUUID();
        var offer=new ServiceContractStore.Offer(serviceId,null,professional,"Servicio de prueba","Descripcion del servicio contratado para una prueba","DESIGN","Plan base",new BigDecimal("700"),4,"PEN");
        when(store.quote(serviceId,null)).thenReturn(offer);
        when(store.canFormalize(conversation,serviceId,client,professional)).thenReturn(true);
        var application=new ServiceContractService(store,projects,milestones,mock(achanvear.peru.shared.application.EventPublisher.class));
        var contract=application.create(client,conversation,serviceId,null,key);
        when(store.findByKey(client,key)).thenReturn(Optional.of(contract));
        assertEquals(contract,application.create(client,conversation,serviceId,null,key));
        var captured=org.mockito.ArgumentCaptor.forClass(achanvear.peru.payments.domain.model.Milestone.class);
        verify(milestones,times(1)).save(captured.capture());
        assertEquals(offer.amount(),captured.getValue().getAmount());
        assertEquals(contract.projectId(),captured.getValue().getProjectId());
        verify(store,times(1)).save(contract);
        assertThrows(IllegalArgumentException.class,()->application.create(client,conversation,UUID.randomUUID(),null,key));
    }
    @Test void releaseResponseUsesEscrowSnapshotRatherThanUnmodifiedMilestone() {
        var milestones=mock(achanvear.peru.payments.domain.repository.MilestoneRepository.class);
        var escrowService=mock(achanvear.peru.payments.application.service.EscrowService.class);
        var audit=mock(achanvear.peru.payments.application.service.AuditService.class);
        var id=UUID.randomUUID(); var client=UUID.randomUUID();
        var milestone=mock(achanvear.peru.payments.domain.model.Milestone.class);
        when(milestone.getId()).thenReturn(new achanvear.peru.payments.domain.model.MilestoneId(id));
        when(milestone.getClientUserId()).thenReturn(client); when(milestone.getAmount()).thenReturn(new BigDecimal("100"));
        when(milestone.getStatus()).thenReturn(achanvear.peru.payments.domain.model.MilestoneStatus.READY_FOR_REVIEW);
        when(milestones.findById(any())).thenReturn(Optional.of(milestone));
        var escrow=mock(achanvear.peru.payments.domain.model.Escrow.class);
        when(escrow.getStatus()).thenReturn(achanvear.peru.payments.domain.model.EscrowStatus.RELEASED);
        when(escrow.getReleasedAt()).thenReturn(Instant.parse("2026-10-29T12:00:00Z"));
        when(escrow.getPlatformCommission()).thenReturn(BigDecimal.ZERO);
        when(escrow.getMpCommission()).thenReturn(new BigDecimal("4.49")); when(escrow.getFreelancerAmount()).thenReturn(new BigDecimal("95.51"));
        when(escrowService.releaseFunds(id,client)).thenReturn(escrow);
        var result=new achanvear.peru.payments.application.impl.ReleaseMilestonePaymentUseCaseImpl(milestones,escrowService,audit).execute(
                new achanvear.peru.payments.application.command.ReleaseMilestonePaymentCommand(id,client,null));
        assertEquals("2026-10-29T12:00:00Z",result.releasedAt()); assertEquals(BigDecimal.ZERO,result.platformCommission());
        assertEquals(new BigDecimal("95.51"),result.freelancerNetAmount());
    }

    @Test void depositIntentReusesContractMilestoneAndRejectsTamperedPrice() {
        var repository=mock(achanvear.peru.payments.domain.repository.MilestoneRepository.class);
        var fraud=mock(achanvear.peru.payments.application.service.FraudDetectionService.class);
        var audit=mock(achanvear.peru.payments.application.service.AuditService.class);
        var project=UUID.randomUUID();var client=UUID.randomUUID();var professional=UUID.randomUUID();
        var milestone=achanvear.peru.payments.domain.model.Milestone.create(project,client,professional,"Hito unico","Descripcion del contrato",new BigDecimal("100"));
        when(repository.findByProjectId(project)).thenReturn(List.of(milestone));
        var application=new achanvear.peru.payments.application.impl.CreateMilestoneDepositIntentUseCaseImpl(repository,fraud,audit);
        var command=new achanvear.peru.payments.application.command.CreateMilestoneDepositIntentCommand(project,client,professional,"Hito unico","Descripcion del contrato",new BigDecimal("100"),"client@example.invalid");
        assertEquals(milestone.getId().value().toString(),application.execute(command).milestoneId());
        assertThrows(IllegalArgumentException.class,()->application.execute(new achanvear.peru.payments.application.command.CreateMilestoneDepositIntentCommand(project,client,professional,"Hito unico","Descripcion del contrato",new BigDecimal("1"),"client@example.invalid")));
        verify(repository,never()).save(any());verifyNoInteractions(fraud);
    }

}
