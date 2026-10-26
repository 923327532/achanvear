package achanvear.peru;

import achanvear.peru.jobs.application.impl.CandidateDrawerDetailService;
import achanvear.peru.jobs.domain.model.*;
import achanvear.peru.jobs.domain.repository.*;
import achanvear.peru.hiring.domain.repository.HiringProcessRepository;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.infrastructure.persistence.InterviewEvaluationStore;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named="REVIEW_DB_URL", matches=".+")
class PipelineScoresDatabaseTest {
    static JdbcTemplate jdbc;
    UUID job, candidate, applicationId;
    CandidateDrawerDetailService service;
    @BeforeAll static void schema() throws Exception {
        String url=System.getenv("REVIEW_DB_URL");
        new JdbcTemplate(new DriverManagerDataSource(url,"postgres","review-local-only"))
                .execute("CREATE SCHEMA pipeline_scores");
        jdbc=new JdbcTemplate(new DriverManagerDataSource(url+"?currentSchema=pipeline_scores","postgres","review-local-only"));
        jdbc.execute("CREATE TABLE interviews(id VARCHAR(100) PRIMARY KEY, candidate_id TEXT, hiring_process_id TEXT, interview_type TEXT, status TEXT, score INTEGER, recording_file_key TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())");
        jdbc.execute("CREATE TABLE hiring_stage_completions(job_id UUID,candidate_id UUID,stage TEXT,completed_at TIMESTAMPTZ)");
        jdbc.execute(new String(PipelineScoresDatabaseTest.class.getResourceAsStream("/db/migration/V71__persist_interview_evaluation_details.sql").readAllBytes(),java.nio.charset.StandardCharsets.UTF_8));
    }
    @BeforeEach void setup() {
        job=UUID.randomUUID();candidate=UUID.randomUUID();applicationId=UUID.randomUUID();
        var jobs=mock(JobPostRepository.class);var applications=mock(ApplicationRepository.class);
        var application=mock(JobApplication.class);var post=mock(JobPost.class);
        when(jobs.findById(JobPostId.from(job.toString()))).thenReturn(Optional.of(post));
        when(applications.findById(applicationId)).thenReturn(Optional.of(application));
        when(application.getId()).thenReturn(new JobApplicationId(applicationId));when(application.getJobPostId()).thenReturn(job);
        when(application.getCandidateUserId()).thenReturn(candidate);when(application.getStatus()).thenReturn(ApplicationStatus.IN_REVIEW);
        when(application.getAppliedAt()).thenReturn(Instant.now());when(application.getScreeningScore()).thenReturn(88.0);
        when(application.getTheoryScore()).thenReturn(null);when(application.getTechnicalScore()).thenReturn(null);
        service=new CandidateDrawerDetailService(jobs,applications,mock(HiringProcessRepository.class),mock(InterviewRepository.class),mock(IdentityCandidateLookupPort.class),jdbc);
    }
    String interview(UUID forJob,String type,int score,String status) {
        String id=UUID.randomUUID().toString();
        jdbc.update("INSERT INTO interviews(id,candidate_id,hiring_process_id,interview_type,status,score) VALUES(?,?,?,?,?,?)",id,candidate.toString(),forJob.toString(),type,status,score);
        return id;
    }
    @Test void allScoresSurvivePersistenceAndOtherJobsDoNotLeak() {
        interview(job,"THEORY",82,"COMPLETED");
        String technical=interview(job,"TECHNICAL",91,"COMPLETED");
        var store=new InterviewEvaluationStore(jdbc,new com.fasterxml.jackson.databind.ObjectMapper());
        store.save(technical,Map.of("score",91,"communication_score",76,"summary","Evidence"));
        store.save(technical,Map.of("score",1,"communication_score",1)); // replay cannot replace accepted result
        interview(UUID.randomUUID(),"THEORY",10,"COMPLETED");
        interview(UUID.randomUUID(),"TECHNICAL",20,"COMPLETED");
        var result=service.execute(job.toString(),applicationId.toString(),null,true);
        assertEquals(88.0,result.screeningScore());assertEquals(82,result.theoryInterviewScore());
        assertEquals(91,result.technicalInterviewScore());assertEquals(76,result.softSkillsScore());
        assertTrue(jdbc.queryForObject("SELECT evaluation_json FROM interview_evaluation_details WHERE interview_id=?",String.class,technical).contains("Evidence"));
    }
    @Test void incompleteInterviewDoesNotBecomeAScoreAndZeroIsARealResult() {
        interview(job,"THEORY",0,"COMPLETED");interview(job,"TECHNICAL",99,"IN_PROGRESS");
        var result=service.execute(job.toString(),applicationId.toString(),null,true);
        assertEquals(0,result.theoryInterviewScore());assertNull(result.technicalInterviewScore());assertNull(result.softSkillsScore());
    }
}
