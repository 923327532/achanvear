package achanvear.peru;

import achanvear.peru.jobs.domain.model.*;
import achanvear.peru.freelance.domain.model.FreelancerProfile;
import achanvear.peru.freelance.domain.model.PaymentMethodType;
import achanvear.peru.freelance.domain.model.AvailabilityStatus;
import achanvear.peru.freelance.domain.model.CvVisibility;
import achanvear.peru.freelance.domain.repository.FreelancerProfileRepository;
import achanvear.peru.freelance.infrastructure.persistence.*;
import achanvear.peru.freelance.application.impl.FreelanceApplicationMapper;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.profile.ProfileType;
import achanvear.peru.profile.domain.model.RatingTargetType;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import achanvear.peru.interview.infrastructure.external.impl.RealAiInterviewerClient;
import achanvear.peru.interview.infrastructure.external.AiServiceUnavailableException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BackendRegressionTest {
    @Test void recordingFlagDefaultsToFalseAndNormalizesExplicitNull() {
        var entity = new achanvear.peru.interview.infrastructure.persistence.entity.InterviewJpaEntity();
        assertFalse(entity.getRecordingActive());
        entity.setRecordingActive(true);
        entity.setRecordingActive(null);
        assertFalse(entity.getRecordingActive());
    }

    private achanvear.peru.interview.infrastructure.persistence.entity.InterviewJpaEntity scheduledTheory() {
        var entity = new achanvear.peru.interview.infrastructure.persistence.entity.InterviewJpaEntity(
                UUID.randomUUID().toString(), UUID.randomUUID().toString(), UUID.randomUUID().toString(),
                "THEORY", "SCHEDULED");
        entity.setInterviewerCode("PROFILE_1");
        entity.setInterviewerName("Carlos Mendoza");
        entity.setInterviewerStyle("Formal");
        entity.setInterviewerVoice("MALE1");
        return entity;
    }

    @Test void startingScheduledTheoryWithoutRecordingMapsFalseAndPreservesInterviewer() {
        var mapper = new achanvear.peru.interview.infrastructure.persistence.InterviewMapper();
        var interview = mapper.toDomain(scheduledTheory());
        interview.start();
        interview.setPythonSessionId("python-session");
        var saved = mapper.toEntity(interview);
        assertEquals("IN_PROGRESS", saved.getStatus());
        assertFalse(saved.getRecordingActive());
        assertEquals("PROFILE_1", saved.getInterviewerCode());
        assertEquals("Formal", saved.getInterviewerStyle());
        assertEquals("python-session", saved.getPythonSessionId());
    }

    @Test void activeRecordingWithoutFileKeySurvivesRoundTrip() {
        var entity = scheduledTheory();
        entity.setRecordingActive(true);
        var mapper = new achanvear.peru.interview.infrastructure.persistence.InterviewMapper();
        assertTrue(mapper.toEntity(mapper.toDomain(entity)).getRecordingActive());
    }

    @Test void finishedRecordingKeepsFileAndInactiveFlag() {
        var entity = scheduledTheory();
        entity.setRecordingActive(false);
        entity.setRecordingFileKey("interviews/finished.webm");
        var mapper = new achanvear.peru.interview.infrastructure.persistence.InterviewMapper();
        var saved = mapper.toEntity(mapper.toDomain(entity));
        assertFalse(saved.getRecordingActive());
        assertEquals("interviews/finished.webm", saved.getRecordingFileKey());
    }

    private JobPost job() {
        return JobPost.create(JobPostId.generate(), UUID.randomUUID(), "Backend Java",
                "Desarrollo de aplicaciones empresariales", "Lima", JobType.FULL_TIME,
                BigDecimal.ONE, BigDecimal.TEN, "PEN", 1, "Java");
    }

    @Test void lastApplicantClosesJobWithoutScreeningAndRejectsNextApplicant() {
        var job = job();
        job.configureSelection(1, null, null, null, SelectionMode.MAX_APPLICANTS);
        job.apply(UUID.randomUUID(), null, "Tengo experiencia en Java y Spring");
        assertEquals(JobStatus.CLOSED, job.getStatus());
        assertEquals(1, job.getApplications().size());
        assertThrows(IllegalStateException.class, () -> job.apply(UUID.randomUUID(), null, "Tengo experiencia en Java y Spring"));
        assertEquals(1, job.getApplications().size());
    }

    private JobPost expired() {
        var j = job();
        return JobPost.restore(j.getId(), j.getCompanyId(), j.getTitle(), j.getDescription(),
                j.getLocation(), j.getType(), j.getSalaryMin(), j.getSalaryMax(), j.getCurrency(),
                j.getVacancies(), j.getRequirements(), JobStatus.PUBLISHED, List.of(), j.getCreatedAt(),
                null, Instant.now().minusSeconds(60), null, null, SelectionMode.FIXED_DATE);
    }

    @Test void expiredJobRejectsApplicationsBeforeSchedulerRuns() {
        var job = expired();
        assertThrows(IllegalStateException.class, () -> job.apply(UUID.randomUUID(), null, "Tengo experiencia en Java y Spring"));
        assertTrue(job.getApplications().isEmpty());
    }

    @Test void unchangedExpiredDateIsAllowedButNewPastDateIsRejected() {
        var job = expired();
        assertDoesNotThrow(() -> job.configureSelection(null, job.getClosingDate(), null, null, SelectionMode.FIXED_DATE));
        assertThrows(IllegalArgumentException.class, () -> job.configureSelection(null,
                Instant.now().minusSeconds(120), null, null, SelectionMode.FIXED_DATE));
        job.close();
        assertDoesNotThrow(() -> job.update("Backend Java editado", job.getDescription(), job.getLocation(),
                job.getType(), job.getSalaryMin(), job.getSalaryMax(), job.getCurrency(), 1));
        assertEquals(JobStatus.CLOSED, job.getStatus());
    }

    private FreelancerProfile freelancer() {
        return FreelancerProfile.create(UUID.randomUUID(), "Ana Torres", "Tecnologia", "Backend Java",
                "https://example.test/photo", "https://example.test/banner", "Desarrolladora con experiencia en Java",
                "Logros", "Lima", PaymentMethodType.YAPE, "12345678", "https://example.test/cv", List.of());
    }

    @Test void partialProfileUpdatePreservesPhotosSettingsAndIdentity() {
        var profile = freelancer();
        profile.updateProfile(null, null, null, null, null, null, null, null, null, null, null, null,
                null, AvailabilityStatus.FREELANCE_ONLY, CvVisibility.ALL_COMPANIES, null, null, "en-US", "UTC-5", "PRUEBA-1");
        profile.updateProfile("Ana Torres Editada", null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null);
        assertEquals("Ana Torres Editada", profile.getName());
        assertEquals("https://example.test/banner", profile.getBannerUrl());
        assertEquals("https://example.test/photo", profile.getProfilePhotoUrl());
        assertEquals(PaymentMethodType.YAPE, profile.getPaymentMethodType());
        assertEquals(AvailabilityStatus.FREELANCE_ONLY, profile.getAvailabilityStatus());
        assertEquals(CvVisibility.ALL_COMPANIES, profile.getCvVisibility());
        assertEquals("en-US", profile.getLanguage());
        assertEquals("PRUEBA-1", profile.getNotificationPreferences());
    }

    @Test void existingEntityPersistsNotificationPreferences() {
        var profile = freelancer();
        profile.updateProfile(null, null, null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, "PRUEBA-1");
        var jpa = mock(FreelancerProfileJpaRepository.class);
        var entity = new FreelancePersistenceMapper().toEntity(profile);
        entity.setCertifications(new ArrayList<>());
        entity.setNotificationPreferences(null);
        when(jpa.findById(profile.getId().value())).thenReturn(Optional.of(entity));
        new FreelancerProfileRepositoryImpl(jpa, new FreelancePersistenceMapper()).save(profile);
        assertEquals("PRUEBA-1", entity.getNotificationPreferences());
        verify(jpa).save(entity);
    }

    @Test void companyReviewsUpdateAverageWithoutDuplicatingReviewer() {
        var profile = TalentProfile.create(UUID.randomUUID(), ProfileType.COMPANY, "Empresa Demo",
                "Empresa dedicada al desarrollo de software", "Lima", null, null, List.of(), List.of());
        var reviewer = UUID.randomUUID();
        profile.addRating(reviewer, RatingTargetType.FREELANCER, 5, true, "Muy bien");
        profile.addRating(reviewer, RatingTargetType.FREELANCER, 3, false, "Actualizada");
        assertEquals(1, profile.getReputationScore().totalRatings());
        assertEquals(new BigDecimal("3.00"), profile.getReputationScore().averageStars());
        assertEquals("Actualizada", profile.getRatings().get(0).getComment());
        assertThrows(IllegalArgumentException.class, () -> profile.addRating(profile.getUserId(),
                RatingTargetType.FREELANCER, 5, true, "Propia"));
    }

    @Test void projectPagesResolveFreelancerNamesAndPhotosInOneBatch() {
        var lookup = mock(CompanyLookupPort.class);
        var profiles = mock(FreelancerProfileRepository.class);
        var user = UUID.randomUUID();
        when(profiles.findSummariesByUserIds(any())).thenReturn(Map.of(user,
                new FreelancerProfileRepository.Summary(user, "Ana Torres", "https://example.test/photo")));
        var project = mock(achanvear.peru.freelance.domain.model.FreelanceProject.class);
        when(project.getId()).thenReturn(achanvear.peru.freelance.domain.model.FreelanceProjectId.generate());
        when(project.getClientUserId()).thenReturn(UUID.randomUUID());
        when(lookup.findByOwnerUserId(any())).thenReturn(Optional.empty());
        when(project.getStatus()).thenReturn(achanvear.peru.freelance.domain.model.ProjectStatus.COMPLETED);
        when(project.getSelectedFreelancerUserId()).thenReturn(user);
        when(project.getProposals()).thenReturn(List.of());
        when(project.getMilestones()).thenReturn(List.of());
        var response = new FreelanceApplicationMapper(lookup, profiles)
                .toProjectPageResponse(new PageImpl<>(List.of(project, project)));
        assertEquals("Ana Torres", response.items().get(0).selectedFreelancerName());
        assertEquals("https://example.test/photo", response.items().get(1).selectedFreelancerPhotoUrl());
        verify(profiles, times(1)).findSummariesByUserIds(Set.of(user));
    }

    @Test void disconnectedAiNeverApprovesWithInventedPassingScore() {
        var client = new RealAiInterviewerClient(RestClient.builder(), "http://127.0.0.1:1");
        assertThrows(AiServiceUnavailableException.class, () -> client.completeTheoryInterview("missing"));
    }
}
