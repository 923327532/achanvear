package achanvear.peru;

import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.infrastructure.persistence.InterviewMapper;
import achanvear.peru.interview.application.CompanyInterviewer;
import achanvear.peru.company.infrastructure.persistence.*;
import achanvear.peru.jobs.domain.model.*;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.payments.application.CompanyAiAccess;
import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import achanvear.peru.services.application.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ManualFindingsRegressionTest {
    @Test void authenticatorSecretsUseBase32AndLegacySecretsStillDecode() {
        var bytes = "12345678901234567890".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        String encoded = achanvear.peru.identity.application.TotpSecretEncoding.encode(bytes);
        assertEquals("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ",encoded);
        assertArrayEquals(bytes,achanvear.peru.identity.application.TotpSecretEncoding.decodeStored("b32:"+encoded));
        assertArrayEquals(bytes,achanvear.peru.identity.application.TotpSecretEncoding.decodeStored(java.util.Base64.getEncoder().encodeToString(bytes)));
        for (int length=1; length<=40; length++) {
            byte[] random = new byte[length]; new java.security.SecureRandom().nextBytes(random);
            assertArrayEquals(random,achanvear.peru.identity.application.TotpSecretEncoding.decodeStored("b32:"+achanvear.peru.identity.application.TotpSecretEncoding.encode(random)));
        }
    }
    @Test void remindersAreOnlyCreatedForTheNextFifteenMinutes() {
        var schedules = mock(achanvear.peru.interview.domain.repository.InterviewScheduleRepository.class);
        var notifications = mock(achanvear.peru.notifications.application.NotificationWriter.class);
        var schedule = mock(InterviewSchedule.class);
        var candidate = UUID.randomUUID();
        when(schedule.getCandidateId()).thenReturn(candidate.toString());
        when(schedule.getId()).thenReturn("local-reminder-test");
        when(schedules.findReserved()).thenReturn(List.of(schedule));
        var service = new achanvear.peru.notifications.application.InterviewReminderService(schedules,notifications);
        when(schedule.getChosenSlot()).thenReturn(new InterviewSlot(java.time.LocalDateTime.now(java.time.ZoneOffset.UTC).plusMinutes(30), InterviewSlot.SlotStatus.RESERVED));
        service.remindUpcoming();
        verifyNoInteractions(notifications);
        when(schedule.getChosenSlot()).thenReturn(new InterviewSlot(java.time.LocalDateTime.now(java.time.ZoneOffset.UTC).plusMinutes(10), InterviewSlot.SlotStatus.RESERVED));
        service.remindUpcoming();
        verify(notifications).publish(eq(candidate), eq("INTERVIEW"), anyString(), anyString(),
                eq("reminder:local-reminder-test"));
    }
    @Test void cancellationReasonSurvivesPersistenceMapping() {
        var interview = new Interview(InterviewId.newId(), UUID.randomUUID().toString(), UUID.randomUUID().toString(), InterviewType.TECHNICAL);
        String reason = "Entrevista cancelada por permanecer fuera de la pantalla 30 segundos.";
        interview.abort(reason);
        var mapper = new InterviewMapper();
        var entity = mapper.toEntity(interview);
        assertEquals(reason, entity.getAbortReason());
        assertEquals(reason, mapper.toDomain(entity).getAbortReason());
        assertEquals(InterviewStatus.ABORTED, mapper.toDomain(entity).getStatus());
    }

    @Test void freeAndExpiredPlansCannotUseAiButActivePaidPlanCan() {
        var companies = mock(CompanyLookupPort.class);
        var subscriptions = mock(SubscriptionRepository.class);
        var jobs = mock(JobPostRepository.class);
        var company = mock(CompanyLookupPort.CompanySummary.class);
        UUID companyId = UUID.randomUUID(), owner = UUID.randomUUID();
        when(company.ownerUserId()).thenReturn(owner);
        when(companies.findById(companyId)).thenReturn(Optional.of(company));
        var policy = new CompanyAiAccess(companies, subscriptions, jobs);
        when(subscriptions.findActiveByCompanyUserId(owner)).thenReturn(Optional.empty());
        assertFalse(policy.forCompany(companyId));
        var subscription = mock(Subscription.class);
        when(subscriptions.findActiveByCompanyUserId(owner)).thenReturn(Optional.of(subscription));
        when(subscription.isActive()).thenReturn(true);
        when(subscription.getPlan()).thenReturn(PlanType.FREE);
        assertFalse(policy.forCompany(companyId));
        when(subscription.getPlan()).thenReturn(PlanType.BASIC);
        assertTrue(policy.forCompany(companyId));
        when(subscription.isActive()).thenReturn(false);
        assertFalse(policy.forCompany(companyId));
    }

    @Test void interviewUsesEveryCompanySelectedAgent() {
        var jobs = mock(JobPostRepository.class);
        var companies = mock(achanvear.peru.shared.application.port.CompanyInterviewSettingsPort.class);
        var job = mock(JobPost.class);
        var jobId = JobPostId.from(UUID.randomUUID().toString());
        UUID companyId = UUID.randomUUID();
        when(job.getCompanyId()).thenReturn(companyId);
        when(jobs.findById(jobId)).thenReturn(Optional.of(job));
        var selector = new CompanyInterviewer(jobs, companies, new achanvear.peru.interview.domain.service.InterviewerProfileSelector(), mock(CompanyAiAccess.class));
        String[] names = {"carlos", "ana", "diego", "sofia"};
        for (int index = 0; index < names.length; index++) {
            when(companies.selectedAgent(companyId)).thenReturn(names[index]);
            assertEquals("PROFILE_" + (index + 1), selector.forJob(jobId.toString()).getCode());
        }
    }

    @Test void dollarContractIsRejectedInSpanishBeforeCreatingProject() {
        var store = mock(ServiceContractStore.class);
        UUID client = UUID.randomUUID(), conversation = UUID.randomUUID(), serviceId = UUID.randomUUID(), key = UUID.randomUUID();
        when(store.quote(serviceId, null)).thenReturn(new ServiceContractStore.Offer(serviceId, null, UUID.randomUUID(),
                "Servicio", "Descripcion", "DESIGN", "Base", new BigDecimal("100"), 3, "USD"));
        var projects = mock(achanvear.peru.freelance.domain.repository.FreelanceProjectRepository.class);
        var service = new ServiceContractService(store, projects,
                mock(achanvear.peru.payments.domain.repository.MilestoneRepository.class), mock(achanvear.peru.shared.application.EventPublisher.class));
        var error = assertThrows(IllegalArgumentException.class, () -> service.create(client, conversation, serviceId, null, key));
        assertTrue(error.getMessage().contains("soles (PEN)"));
        verifyNoInteractions(projects);
    }
}
