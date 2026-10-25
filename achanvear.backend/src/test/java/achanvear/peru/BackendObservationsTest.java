package achanvear.peru;

import achanvear.peru.hiring.domain.model.*;
import achanvear.peru.hiring.domain.repository.HiringProcessRepository;
import achanvear.peru.hiring.infrastructure.event.InterviewResultHandler;
import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.*;
import achanvear.peru.interview.domain.event.InterviewCompletedEvent;
import achanvear.peru.jobs.domain.model.*;
import achanvear.peru.jobs.domain.repository.*;
import achanvear.peru.shared.application.EventPublisher;
import achanvear.peru.company.domain.model.*;
import achanvear.peru.company.domain.repository.*;
import achanvear.peru.company.application.usecase.CollaboratorUseCase;
import achanvear.peru.shared.application.port.*;
import achanvear.peru.payments.domain.model.*;
import achanvear.peru.identity.infrastructure.*;
import achanvear.peru.identity.domain.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.mock.web.*;
import java.util.*;
import java.math.BigDecimal;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BackendObservationsTest {
    @AfterEach void clearSecurity() { SecurityContextHolder.clearContext(); }

    @Test void A1PaymentMethodAcceptsEveryPublishedValueAndRejectsUnknown() {
        for (String value : List.of("CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "YAPE", "PLIN", "CARD"))
            assertEquals(value, PaymentMethodType.valueOf(value).name());
        assertThrows(IllegalArgumentException.class, () -> PaymentMethodType.valueOf("INVALID"));
    }
    @Test void A3PolicyEndpointMatchesActualCharge() {
        var data = new achanvear.peru.payments.web.CommissionPolicyController().policy().getData();
        assertEquals(new BigDecimal("5.00"), data.get("platformCommissionPercentage"));
        assertEquals(new BigDecimal("50.00"), CommissionPolicy.calculateCommission(new BigDecimal("1000")).platformCommission());
        assertEquals(new BigDecimal("0.50"), data.get("processorFixedFee"));
    }
    @Test void A12DeactivationCanBeReversedByOwningCompanyOnly() {
        var repo = mock(CompanyCollaboratorRepository.class);
        var companyId = UUID.randomUUID();
        var collaborator = CompanyCollaborator.create(UUID.randomUUID(), companyId, UUID.randomUUID(), "Colaborador prueba", "test@example.invalid");
        when(repo.findById(collaborator.getId())).thenReturn(Optional.of(collaborator));
        var service = new CollaboratorUseCase(repo, mock(CompanyRepository.class), mock(IdentityUserLookupPort.class), mock(NotificationPort.class), "http://localhost");
        service.deactivateCollaborator(companyId, collaborator.getId());
        assertEquals(CollaboratorStatus.INACTIVE, collaborator.getStatus());
        assertThrows(IllegalArgumentException.class, () -> service.activateCollaborator(UUID.randomUUID(), collaborator.getId()));
        service.activateCollaborator(companyId, collaborator.getId());
        assertEquals(CollaboratorStatus.ACTIVE, collaborator.getStatus());
    }
    @Test void A13OldTokenIsBlockedEvenWhenItContainsCompanyId() throws Exception {
        var tokens = mock(JwtTokenProvider.class); var repo = mock(CompanyCollaboratorRepository.class);
        var userId = UUID.randomUUID(); var companyId = UUID.randomUUID();
        when(tokens.isValidToken("old")).thenReturn(true);
        when(tokens.extractUserId("old")).thenReturn(userId.toString());
        when(tokens.extractRole("old")).thenReturn("COMPANY_COLLABORATOR");
        when(tokens.extractCompanyId("old")).thenReturn(companyId);
        var collaborator = CompanyCollaborator.create(UUID.randomUUID(),companyId,userId,"Colaborador prueba","test@example.invalid");
        collaborator.deactivate(); when(repo.findByUserId(userId)).thenReturn(Optional.of(collaborator));
        var filter = new JwtAuthenticationFilter(tokens,mock(CompanyRepository.class),repo,mock(UserRepository.class));
        var request = new MockHttpServletRequest(); request.addHeader("Authorization","Bearer old");
        var response = new MockHttpServletResponse(); var chain = new MockFilterChain();
        filter.doFilter(request,response,chain);
        assertEquals(403,response.getStatus()); assertNull(chain.getRequest());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
    @Test void A15FreeJobQuotaIsTwoDuringThirtyDays() {
        var created = Instant.now().minusSeconds(60);
        assertTrue(ProjectPublishingPolicy.canPublishJob(PlanType.FREE,1,false,created));
        assertFalse(ProjectPublishingPolicy.canPublishJob(PlanType.FREE,2,false,created));
        assertEquals(0,ProjectPublishingPolicy.remainingFreeJobs(2));
        assertFalse(ProjectPublishingPolicy.canPublishJob(PlanType.FREE,0,false,Instant.now().minusSeconds(31L*86400)));
    }
    private record Fixture(Interview interview, HiringProcess process, JobApplication application,
                           InterviewResultHandler handler, EventPublisher events, ApplicationRepository applications) {}
    private Fixture fixture(InterviewType type, int score) {
        String job = UUID.randomUUID().toString(), candidate = UUID.randomUUID().toString();
        var interview = new Interview(InterviewId.of(UUID.randomUUID().toString()),candidate,job,type);
        interview.start(); interview.complete(new InterviewScore(score));
        var process = new HiringProcess(HiringProcessId.newId(),job,candidate,
                type == InterviewType.THEORY ? HiringStage.THEORY_INTERVIEW : HiringStage.TECHNICAL_INTERVIEW,HiringConfig.defaultConfig());
        var application = JobApplication.create(UUID.fromString(job),UUID.fromString(candidate),null,"Carta de presentacion de prueba");
        application.changeStatus(ApplicationStatus.SHORTLISTED);
        var interviews = mock(InterviewRepository.class); var processes = mock(HiringProcessRepository.class);
        var applications = mock(ApplicationRepository.class); var events = mock(EventPublisher.class);
        when(interviews.findById(interview.getId())).thenReturn(Optional.of(interview));
        when(processes.findByJobIdAndCandidateId(job,candidate)).thenReturn(Optional.of(process));
        when(applications.findByCandidateUserId(UUID.fromString(candidate))).thenReturn(List.of(application));
        return new Fixture(interview,process,application,new InterviewResultHandler(interviews,processes,applications,events),events,applications);
    }
    private void complete(Fixture f) {
        f.handler.completed(new InterviewCompletedEvent(f.interview.getId(),f.interview.getType().name(),100,true));
    }
    @Test void A16TheoryResultPersistsActualScoreAndSchedulesTechnicalOnce() {
        var f = fixture(InterviewType.THEORY,85); complete(f); complete(f);
        assertEquals(85,f.application.getTheoryScore()); assertEquals(HiringStage.TECHNICAL_INTERVIEW,f.process.getStage());
        verify(f.events,times(1)).publish(isA(achanvear.peru.hiring.domain.event.TheoryInterviewPassedEvent.class));
        verify(f.applications,times(1)).save(f.application);
    }
    @Test void A18FailedTheoryRejectsApplication() {
        var f = fixture(InterviewType.THEORY,60); complete(f);
        assertEquals(60,f.application.getTheoryScore()); assertEquals(ApplicationStatus.REJECTED,f.application.getStatus());
        assertEquals(HiringStage.REJECTED,f.process.getStage()); verifyNoInteractions(f.events);
    }
    @Test void A18FailedTechnicalRejectsApplication() {
        var f = fixture(InterviewType.TECHNICAL,22); complete(f);
        assertEquals(22,f.application.getTechnicalScore()); assertEquals(ApplicationStatus.REJECTED,f.application.getStatus());
        assertEquals(HiringStage.REJECTED,f.process.getStage());
    }
    @Test void A19TechnicalPassRequiresFinalReviewAndSeparateHiringDecision() {
        var f = fixture(InterviewType.TECHNICAL,90); complete(f);
        assertEquals(90,f.application.getTechnicalScore()); assertEquals(HiringStage.UNDER_REVIEW,f.process.getStage());
        assertThrows(IllegalStateException.class,f.process::hire);
        f.process.approve(); assertEquals(HiringStage.APPROVED,f.process.getStage());
        f.process.hire(); assertEquals(HiringStage.HIRED,f.process.getStage());
    }
    @Configuration @EnableMethodSecurity static class SecurityTestConfig {
        @Bean achanvear.peru.hiring.application.EvaluateTheoryResultUseCase evaluator() {
            return mock(achanvear.peru.hiring.application.EvaluateTheoryResultUseCase.class);
        }
        @Bean achanvear.peru.hiring.web.HiringController controller(achanvear.peru.hiring.application.EvaluateTheoryResultUseCase evaluator) {
            return new achanvear.peru.hiring.web.HiringController(mock(achanvear.peru.hiring.application.StartScreeningUseCase.class),evaluator,
                    mock(achanvear.peru.hiring.application.GenerateFinalReportUseCase.class));
        }
    }
    @Test void A17ManualScoreIsForbiddenBeforeAnyStageCheckForEveryBrowserRole() {
        try (var context = new AnnotationConfigApplicationContext(SecurityTestConfig.class)) {
            var controller = context.getBean(achanvear.peru.hiring.web.HiringController.class);
            for (String role : List.of("FREELANCER","COMPANY","SUPERADMIN")) {
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("test","",List.of(new SimpleGrantedAuthority(role))));
                assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> controller.evaluateTheoryResult(
                        new achanvear.peru.hiring.web.request.EvaluateTheoryResultRequest(UUID.randomUUID().toString(),100)));
            }
            verifyNoInteractions(context.getBean(achanvear.peru.hiring.application.EvaluateTheoryResultUseCase.class));
        }
    }
    @Test void A16InfrastructurePublisherDeliversActualSpringEvent() {
        var spring = mock(org.springframework.context.ApplicationEventPublisher.class);
        var event = new InterviewCompletedEvent(InterviewId.of(UUID.randomUUID().toString()),"THEORY",85,true);
        new achanvear.peru.shared.infrastructure.impl.EventPublisherImpl(spring).publish(event);
        verify(spring).publishEvent(event);
    }

    @Test void A23SlotsUseExplicitUTCOffsetAndOfficeHoursInLima() {
        var schedules=mock(InterviewScheduleRepository.class);
        var service=new achanvear.peru.interview.application.impl.InterviewScheduleService(schedules,
                mock(InterviewRepository.class),mock(achanvear.peru.notifications.infrastructure.external.BrevoEmailClient.class),
                mock(IdentityCandidateLookupPort.class),"http://localhost");
        var result=service.execute(new achanvear.peru.interview.application.GenerateScheduleCommand(
                UUID.randomUUID().toString(),UUID.randomUUID().toString(),UUID.randomUUID().toString(),"THEORY","Test","HTML"));
        var nine=java.time.OffsetDateTime.parse(result.proposedSlots().get(1).dateTime());
        var ten=java.time.OffsetDateTime.parse(result.proposedSlots().get(2).dateTime());
        assertEquals(9,nine.atZoneSameInstant(java.time.ZoneId.of("America/Lima")).getHour());
        assertEquals(10,ten.atZoneSameInstant(java.time.ZoneId.of("America/Lima")).getHour());
        assertEquals(java.time.ZoneOffset.UTC,nine.getOffset());
    }
    @Test void A9RatingWithoutCompletedContractIsForbiddenAndCannotBePersisted() {
        var profiles=mock(achanvear.peru.profile.TalentProfileRepository.class);
        var jdbc=mock(org.springframework.jdbc.core.JdbcTemplate.class);
        var profile=achanvear.peru.profile.TalentProfile.createBasic(UUID.randomUUID(),"Profesional test");
        when(profiles.findById(profile.getId())).thenReturn(Optional.of(profile));
        var service=new achanvear.peru.profile.application.impl.ProfileApplicationService(profiles,
                mock(achanvear.peru.profile.domain.factory.TalentProfileFactory.class),
                new achanvear.peru.profile.application.impl.ProfileApplicationMapper(),
                mock(achanvear.peru.profile.application.port.out.ProfileValidationPort.class),mock(EventPublisher.class),jdbc);
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> service.execute(
                new achanvear.peru.profile.application.command.RateProfileCommand(profile.getId().toString(),UUID.randomUUID().toString(),"COMPANY",5,true,"Test")));
        assertEquals(0,profile.getRatings().size()); verify(profiles,never()).save(any());
    }
    @Test void A10RepeatRatingUpdatesTheExistingReview() {
        var profile=achanvear.peru.profile.TalentProfile.createBasic(UUID.randomUUID(),"Profesional test");
        var reviewer=UUID.randomUUID();
        profile.addRating(reviewer,achanvear.peru.profile.domain.model.RatingTargetType.COMPANY,3,true,"Inicial");
        profile.addRating(reviewer,achanvear.peru.profile.domain.model.RatingTargetType.COMPANY,5,true,"Actualizada");
        assertEquals(1,profile.getRatings().size());
        assertEquals(new BigDecimal("5.00"),profile.getReputationScore().averageStars());
    }
    @Test void A14FailedEmailStillReturnsTemporaryCredentialOnlyOnInvitation() {
        var companies=mock(CompanyRepository.class); var company=mock(Company.class);
        var id=UUID.randomUUID(); when(companies.findById(new CompanyId(id))).thenReturn(Optional.of(company));
        when(company.getBusinessName()).thenReturn("Empresa prueba");
        var users=mock(IdentityUserLookupPort.class); var notifications=mock(NotificationPort.class);
        when(users.createUser(anyString(),anyString(),anyString(),eq("COMPANY_COLLABORATOR"))).thenReturn(
                new IdentityUserLookupPort.IdentityUserSummary(UUID.randomUUID(),"test@example.invalid","Colaborador","COMPANY_COLLABORATOR","ACTIVE",null));
        var repo=mock(CompanyCollaboratorRepository.class);
        var service=new CollaboratorUseCase(repo,companies,users,notifications,"http://localhost");
        var result=service.inviteCollaborator(id,"test@example.invalid","Colaborador prueba");
        assertNotNull(result.tempPassword()); assertFalse(result.emailSent());
        var captor=org.mockito.ArgumentCaptor.forClass(CompanyCollaborator.class); verify(repo).save(captor.capture());
        assertNull(achanvear.peru.company.application.dto.CollaboratorResponse.from(captor.getValue()).tempPassword());
    }
    @Test void A20StatsKeepTheoryAndTechnicalSeparate() {
        var jobs=mock(achanvear.peru.jobs.infrastructure.persistence.JobPostJpaRepository.class);
        var applications=mock(achanvear.peru.jobs.infrastructure.persistence.ApplicationJpaRepository.class);
        var interviews=mock(achanvear.peru.interview.infrastructure.persistence.repository.InterviewJpaRepository.class);
        var processes=mock(achanvear.peru.hiring.infrastructure.persistence.HiringProcessJpaRepository.class);
        var company=UUID.randomUUID(); when(processes.countByCompanyAndStage(company,"THEORY_INTERVIEW")).thenReturn(2L);
        when(processes.countByCompanyAndStage(company,"TECHNICAL_INTERVIEW")).thenReturn(3L);
        var result=new achanvear.peru.jobs.infrastructure.persistence.CompanyHiringStatsQueryAdapter(jobs,applications,interviews,processes).getForCompany(company);
        assertEquals(2,result.theoryInterviewsInProgress()); assertEquals(3,result.technicalInterviewsInProgress());
    }
    @Test void A2ConsentRequiresAcceptanceAndCurrentVersionAndA4SavesSelectedAgent() {
        var company=mock(achanvear.peru.company.application.dto.CompanyResponse.class);
        String id=UUID.randomUUID().toString(), owner=UUID.randomUUID().toString();
        when(company.id()).thenReturn(id); when(company.ownerUserId()).thenReturn(owner);
        var lookup=mock(achanvear.peru.company.application.GetCompanyByUserIdUseCase.class);
        when(lookup.executeByUserId(owner)).thenReturn(company);
        var resolver=mock(achanvear.peru.company.web.security.AuthenticatedUserResolver.class);
        var auth=mock(org.springframework.security.core.Authentication.class);
        when(resolver.resolve(auth)).thenReturn(new achanvear.peru.company.web.security.AuthenticatedUser(owner,false,UUID.fromString(id)));
        var jdbc=mock(achanvear.peru.company.infrastructure.persistence.CompanyJpaRepository.class);
        var stored=new achanvear.peru.company.infrastructure.persistence.CompanyJpaEntity();
        when(jdbc.findById(UUID.fromString(id))).thenReturn(Optional.of(stored));
        var consents=mock(achanvear.peru.compliance.domain.repository.ConsentRecordRepository.class);
        var documents=mock(achanvear.peru.compliance.domain.repository.LegalDocumentRepository.class);
        var version=mock(achanvear.peru.compliance.domain.model.LegalDocumentVersion.class); when(version.getVersion()).thenReturn("v1");
        when(documents.findActiveVersionByType(achanvear.peru.compliance.domain.model.LegalDocumentType.TERMS)).thenReturn(Optional.of(version));
        var updater=mock(achanvear.peru.company.application.UpdateCompanyUseCase.class);
        var controller=new achanvear.peru.company.web.CompanyOnboardingController(mock(achanvear.peru.company.application.CreateCompanyUseCase.class),updater,lookup,resolver,jdbc,consents,documents);
        assertThrows(IllegalArgumentException.class,() -> controller.updatePaymentMethod(new achanvear.peru.company.web.CompanyOnboardingController.UpdatePaymentMethodRequest("CREDIT_CARD",false,"v1"),auth));
        assertThrows(IllegalArgumentException.class,() -> controller.updatePaymentMethod(new achanvear.peru.company.web.CompanyOnboardingController.UpdatePaymentMethodRequest("CREDIT_CARD",true,"old"),auth));
        verifyNoInteractions(consents);
        controller.updatePaymentMethod(new achanvear.peru.company.web.CompanyOnboardingController.UpdatePaymentMethodRequest("CREDIT_CARD",true,"v1"),auth);
        verify(consents).save(any());
        controller.completeOnboarding(new achanvear.peru.company.web.CompanyOnboardingController.CompleteOnboardingRequest(null,null,null,null,null,null,null,null,null,"agent-1"),auth);
        assertEquals("agent-1",stored.getAiAgentId()); verify(jdbc).save(stored);
    }

    @Test void A17CompleteIgnoresBrowserScoreAndLoadsPracticalScoreFromAgent() {
        var interview=new Interview(InterviewId.of(UUID.randomUUID().toString()),UUID.randomUUID().toString(),UUID.randomUUID().toString(),InterviewType.TECHNICAL);
        var interviews=mock(InterviewRepository.class); when(interviews.findById(interview.getId())).thenReturn(Optional.of(interview));
        var agent=mock(achanvear.peru.interview.infrastructure.external.impl.RealAiInterviewerClient.class);
        when(agent.getPracticalScore(interview.getId().toString())).thenReturn(22);
        var service=new achanvear.peru.interview.application.impl.InterviewApplicationService(interviews,
                mock(achanvear.peru.interview.domain.service.InterviewSlotManager.class),agent,
                mock(achanvear.peru.interview.infrastructure.external.TextToSpeechClient.class),
                mock(achanvear.peru.interview.infrastructure.external.S3RecordingClient.class),
                new achanvear.peru.interview.domain.service.ScoreCalculator(),
                mock(achanvear.peru.shared.infrastructure.EventPublisher.class),mock(JobPostRepository.class),
                mock(InterviewScheduleRepository.class),mock(achanvear.peru.compliance.application.ValidateInterviewConsentUseCase.class));
        service.execute(new achanvear.peru.interview.application.command.CompleteInterviewCommand(interview.getId().toString(),100,"Approved","Fake evidence"));
        assertEquals(22,interview.getScore().getValue()); assertEquals(InterviewStatus.COMPLETED,interview.getStatus());
        service.execute(new achanvear.peru.interview.application.command.CompleteInterviewCommand(interview.getId().toString(),100,null,null));
        assertEquals(22,interview.getScore().getValue()); verify(agent,times(1)).getPracticalScore(anyString());
    }
    @Test void A15OverviewAndCurrentPlanUseSameJobQuotaAsPublishing() {
        var user=UUID.randomUUID(); var companyId=UUID.randomUUID();
        var companies=mock(CompanyLookupPort.class);
        when(companies.findByOwnerUserId(user)).thenReturn(Optional.of(new CompanyLookupPort.CompanySummary(
                companyId,"Empresa","Empresa","Software","HTML","SMALL",null,"VALIDATED",user,"FREE",Instant.now(),0,0,0)));
        var jobs=mock(JobPostRepository.class); when(jobs.countByCompanyIdSince(eq(companyId),any())).thenReturn(2L);
        var subscriptions=mock(achanvear.peru.payments.domain.repository.SubscriptionRepository.class);
        var stats=mock(achanvear.peru.payments.domain.repository.CompanyProjectStatsRepository.class);
        when(stats.countPublishedProjectsByCompany(user)).thenReturn(0); // the stale freelance count must not be used
        var overview=new achanvear.peru.payments.application.impl.GetPaymentsOverviewUseCaseImpl(stats,subscriptions,
                mock(achanvear.peru.payments.domain.repository.MilestoneRepository.class),companies,jobs,
                mock(achanvear.peru.payments.application.service.PublicationCreditService.class)).execute(user);
        var plan=new achanvear.peru.payments.application.impl.GetCurrentPlanUseCaseImpl(subscriptions,stats,companies,jobs).execute(user);
        assertEquals(2,overview.publishedProjectsCount()); assertEquals(0,overview.remainingFreeProjects()); assertFalse(overview.canPublishMoreProjects());
        assertEquals(2,plan.projectsUsed()); assertEquals(2,plan.projectsLimit());
    }

    @Test void A13InactiveCollaboratorCannotLoginEvenWithCorrectPassword() {
        var users=mock(UserRepository.class);
        var user=mock(achanvear.peru.identity.domain.model.User.class);
        var id=UUID.randomUUID(); var collaborators=mock(CompanyCollaboratorRepository.class);
        when(user.getId()).thenReturn(new achanvear.peru.identity.domain.model.UserId(id));
        when(user.isActive()).thenReturn(true); when(user.getRole()).thenReturn(achanvear.peru.identity.domain.model.UserRole.COMPANY_COLLABORATOR);
        when(user.getPasswordHash()).thenReturn("hash");
        when(users.findByEmail(any())).thenReturn(Optional.of(user));
        var collaborator=CompanyCollaborator.create(UUID.randomUUID(),UUID.randomUUID(),id,"Colaborador prueba","test@example.invalid");
        collaborator.deactivate(); when(collaborators.findByUserId(id)).thenReturn(Optional.of(collaborator));
        var passwords=mock(org.springframework.security.crypto.password.PasswordEncoder.class);
        when(passwords.matches("correct-password","hash")).thenReturn(true);
        var tokens=mock(JwtTokenProvider.class);
        var service=new achanvear.peru.identity.application.impl.AuthApplicationService(users,mock(CompanyRepository.class),
                collaborators,passwords,mock(EventPublisher.class),mock(achanvear.peru.identity.application.factory.UserFactory.class),tokens,
                mock(achanvear.peru.compliance.application.RecordRegistrationConsentUseCase.class));
        assertThrows(org.springframework.security.access.AccessDeniedException.class,() -> service.execute(
                new achanvear.peru.identity.application.command.LoginUserCommand("test@example.invalid","correct-password")));
        verifyNoInteractions(tokens);
    }

    @Test void A4ProfileSavePreservesAgentAndPreferencesWhenCompletionOmitsAgent() {
        var repo=mock(achanvear.peru.company.infrastructure.persistence.CompanyJpaRepository.class);
        var mapper=mock(achanvear.peru.company.infrastructure.persistence.CompanyMapper.class);
        var company=mock(Company.class); var id=CompanyId.generate(); when(company.getId()).thenReturn(id);
        var stored=new achanvear.peru.company.infrastructure.persistence.CompanyJpaEntity();
        stored.setId(id.value()); stored.setAiAgentId("chosen-agent"); stored.setLanguage("es"); stored.setTimezone("America/Lima");
        var mapped=new achanvear.peru.company.infrastructure.persistence.CompanyJpaEntity(); mapped.setId(id.value());
        when(repo.findById(id.value())).thenReturn(Optional.of(stored)); when(mapper.toEntity(company)).thenReturn(mapped);
        new achanvear.peru.company.infrastructure.persistence.CompanyRepositoryImpl(repo,mapper).save(company);
        assertEquals("chosen-agent",mapped.getAiAgentId()); assertEquals("es",mapped.getLanguage()); assertEquals("America/Lima",mapped.getTimezone());
        verify(repo).save(mapped);
    }
}
