package achanvear.peru;

import achanvear.peru.interview.application.*;
import achanvear.peru.interview.infrastructure.persistence.InterviewEvaluationStore;
import achanvear.peru.jobs.application.GetCandidateDrawerDetailUseCase;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class InterviewFinalReportTest {
    @Test void practicalResultEmailTargetsTheOwningCompanyAndNeverTheCandidate() {
        var mail = mock(achanvear.peru.notifications.infrastructure.external.BrevoEmailClient.class);
        var identities = mock(achanvear.peru.shared.application.port.IdentityCandidateLookupPort.class);
        var jobs = mock(achanvear.peru.jobs.domain.repository.JobPostRepository.class);
        var companies = mock(achanvear.peru.shared.application.port.CompanyLookupPort.class);
        var job = mock(achanvear.peru.jobs.domain.model.JobPost.class);
        var company = mock(achanvear.peru.shared.application.port.CompanyLookupPort.CompanySummary.class);
        UUID candidate = UUID.randomUUID(), owner = UUID.randomUUID(), companyId = UUID.randomUUID();
        when(jobs.findById(any())).thenReturn(Optional.of(job));
        when(job.getCompanyId()).thenReturn(companyId);
        when(companies.findById(companyId)).thenReturn(Optional.of(company));
        when(company.ownerUserId()).thenReturn(owner);
        when(identities.findById(candidate)).thenReturn(new achanvear.peru.shared.application.port.IdentityCandidateLookupPort.CandidateSummary(candidate,"candidate@test.invalid","FREELANCER","ACTIVE","Candidato"));
        when(identities.findById(owner)).thenReturn(new achanvear.peru.shared.application.port.IdentityCandidateLookupPort.CandidateSummary(owner,"company@test.invalid","COMPANY","ACTIVE","Empresa"));
        var handler = new achanvear.peru.hiring.infrastructure.event.TechnicalInterviewDoneHandler(mail, identities, jobs, companies);
        handler.handleTechnicalInterviewDone(new achanvear.peru.hiring.domain.event.TechnicalInterviewDoneEvent("process",UUID.randomUUID().toString(),candidate.toString(),85,true,java.time.Instant.now()));
        verify(mail).sendEmail(eq("company@test.invalid"),anyString(),anyString());
        verify(mail,never()).sendEmail(eq("candidate@test.invalid"),anyString(),anyString());
    }
    @Test void expiredSubscriptionDoesNotRollBackTheCompletedTheoryReport() {
        var access = mock(achanvear.peru.payments.application.CompanyAiAccess.class);
        var schedules = mock(GenerateScheduleUseCase.class);
        var identities = mock(achanvear.peru.shared.application.port.IdentityCandidateLookupPort.class);
        doThrow(new ForbiddenOperationException("Expired")).when(access).requireJob("job");
        var handler = new achanvear.peru.hiring.infrastructure.event.TheoryInterviewPassedHandler(identities, schedules, access);
        assertDoesNotThrow(() -> handler.handleTheoryInterviewPassed(new achanvear.peru.hiring.domain.event.TheoryInterviewPassedEvent(
                "process", "job", UUID.randomUUID().toString(), 85, java.time.Instant.now())));
        verifyNoInteractions(schedules, identities);
    }
    @Test void companyOwnershipIsCheckedBeforeReadingAnyEvidence() {
        var candidates = mock(GetCandidateDrawerDetailUseCase.class);
        var reports = mock(GetInterviewReportUseCase.class);
        var queries = mock(achanvear.peru.interview.application.port.InterviewReportQueryPort.class);
        var user = new AuthenticatedUser(UUID.randomUUID(), "local@test.invalid", "", "COMPANY", "ACTIVE", UUID.randomUUID(), List.of());
        when(candidates.execute("job", "application", user.getCompanyId().toString(), false))
                .thenThrow(new ForbiddenOperationException("Wrong company"));
        var service = new achanvear.peru.jobs.application.impl.CandidateInterviewReportsService(candidates, reports, queries);
        assertThrows(ForbiddenOperationException.class, () -> service.execute("job", "application", user.getCompanyId().toString(), false));
        verifyNoInteractions(queries, reports);
    }

    @Test void anonymousUserCannotReadInterviewReport() {
        var queries = mock(achanvear.peru.interview.application.port.InterviewReportQueryPort.class);
        var actors = mock(achanvear.peru.shared.application.port.CurrentActorPort.class);
        when(actors.current()).thenReturn(Optional.empty());
        assertThrows(ForbiddenOperationException.class, () -> new InterviewReportAccess(queries, actors).require("interview"));
        verifyNoInteractions(queries);
    }

    @Test @SuppressWarnings("unchecked") void persistedNarrativeAndEvidenceAreReturnedWithoutReconstruction() {
        var jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(RowMapper.class), eq("interview"))).thenReturn(List.of(
                "{\"score\":81,\"summary\":\"Evidencia concreta\",\"transcript\":[{\"role\":\"candidate\",\"content\":\"atomicidad\"}]}"));
        var report = new InterviewEvaluationStore(jdbc, new ObjectMapper()).find("interview");
        assertEquals(81, report.get("score"));
        assertEquals("Evidencia concreta", report.get("summary"));
        assertEquals(1, ((List<?>)report.get("transcript")).size());
    }
}
