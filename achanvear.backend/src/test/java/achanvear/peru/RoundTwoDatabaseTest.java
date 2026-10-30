package achanvear.peru;
import achanvear.peru.notifications.infrastructure.persistence.JdbcInAppNotifications;
import achanvear.peru.services.infrastructure.persistence.JdbcServiceContractStore;
import achanvear.peru.services.application.*;
import achanvear.peru.payments.infrastructure.persistence.JdbcProjectCommissionAgreements;
import achanvear.peru.freelance.domain.event.ProjectAcceptedEvent;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named="ROUND2_REVIEW_DB_URL",matches=".+")
class RoundTwoDatabaseTest {
    private final DriverManagerDataSource ds=new DriverManagerDataSource(System.getenv("ROUND2_REVIEW_DB_URL"),"postgres","review-local-only");
    private final JdbcTemplate jdbc=new JdbcTemplate(ds);
    private UUID user(String role) {
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO users(id,email,password_hash,role,status,created_at,updated_at) VALUES(?,?,? ,?,'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",id,id+"@example.invalid","local-test-hash",role);
        return id;
    }
    private UUID project(UUID client,UUID professional,String amount) {
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO freelance_projects(id,client_user_id,selected_freelancer_user_id,title,description,category,budget,estimated_days,status,created_at,updated_at) VALUES(?,?,?,'Contrato de prueba','Descripcion del contrato para pruebas locales','DESIGN',?,7,'IN_PROGRESS',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",id,client,professional,new BigDecimal(amount));
        return id;
    }
    @Test void simultaneousAcceptancesReserveExactlyOneExemptionAndKeepTariffSnapshot() throws Exception {
        var client=user("COMPANY"); var professional=user("FREELANCER");
        var first=project(client,professional,"5000"); var second=project(client,professional,"5000");
        var agreements=new JdbcProjectCommissionAgreements(jdbc,mock(EntityManager.class));
        var barrier=new CountDownLatch(1); var executor=Executors.newFixedThreadPool(2);
        try {
            var tasks=new ArrayList<Future<?>>();
            for(var id:List.of(first,second)) tasks.add(executor.submit(()->{
                try { assertTrue(barrier.await(5,TimeUnit.SECONDS)); } catch(InterruptedException e) { throw new RuntimeException(e); }
                new TransactionTemplate(new DataSourceTransactionManager(ds)).executeWithoutResult(status->
                    agreements.agree(new ProjectAcceptedEvent(id,professional,new BigDecimal("5000"),Instant.now())));
            }));
            barrier.countDown(); for(var task:tasks) task.get(15,TimeUnit.SECONDS);
        } finally { executor.shutdownNow(); }
        assertEquals(1,jdbc.queryForObject("SELECT COUNT(*) FROM project_commission_agreements WHERE freelancer_user_id=? AND first_project_exempt",Integer.class,professional));
        assertEquals(0,new BigDecimal("4").compareTo(agreements.platformPercentage(first).add(agreements.platformPercentage(second))));
        agreements.agree(new ProjectAcceptedEvent(first,professional,new BigDecimal("20000"),Instant.now()));
        assertEquals(0,new BigDecimal("4").compareTo(agreements.platformPercentage(first).add(agreements.platformPercentage(second))));
        var third=project(client,professional,"15000.01"); agreements.agree(new ProjectAcceptedEvent(third,professional,new BigDecimal("15000.01"),Instant.now()));
        assertEquals(0,new BigDecimal("3").compareTo(agreements.platformPercentage(third)));
    }
    @Test void completingEscrowCountsSaleOnceAndEnablesOnlyVerifiedServiceReviews() {
        var client=user("COMPANY"); var professional=user("FREELANCER"); var project=project(client,professional,"100");
        UUID service=UUID.randomUUID(), conversation=UUID.randomUUID(), milestone=UUID.randomUUID(), contractId=UUID.randomUUID(), escrow=UUID.randomUUID();
        jdbc.update("INSERT INTO services(id,freelancer_user_id,title,description,category,base_price,delivery_days,status) VALUES(?,?,'Servicio de prueba','Descripcion del servicio de prueba','DESIGN',100,7,'ACTIVE')",service,professional);
        jdbc.update("INSERT INTO chat_conversations(id,company_id,freelancer_id) VALUES(?,?,?)",conversation,client,professional);
        jdbc.update("INSERT INTO milestones(id,project_id,client_user_id,freelancer_user_id,title,amount) VALUES(?,?,?,?,'Hito unico',100)",milestone,project,client,professional);
        var store=new JdbcServiceContractStore(jdbc,mock(EntityManager.class));
        new TransactionTemplate(new DataSourceTransactionManager(ds)).executeWithoutResult(status->store.linkOrigin(conversation,service,client));
        assertTrue(store.canFormalize(conversation,service,client,professional));
        assertFalse(store.canFormalize(conversation,service,professional,client));
        assertTrue(store.offers(conversation,UUID.randomUUID()).isEmpty());
        var quote=store.quote(service,null); assertEquals(0,new BigDecimal("100").compareTo(quote.amount()));
        var contract=new ServiceContractStore.Contract(contractId,project,service,null,conversation,client,professional,milestone,"Servicio de prueba","Plan base",quote.amount(),7,"PEN","ACCEPTED",UUID.randomUUID());
        store.save(contract);
        jdbc.update("UPDATE services SET base_price=999 WHERE id=?",service);
        assertEquals(0,new BigDecimal("100").compareTo(store.list(conversation,client).get(0).amount()));
        var application=new ServiceContractService(store,mock(achanvear.peru.freelance.domain.repository.FreelanceProjectRepository.class),mock(achanvear.peru.payments.domain.repository.MilestoneRepository.class),mock(achanvear.peru.shared.application.EventPublisher.class));
        assertThrows(ForbiddenOperationException.class,()->application.review(contractId,client,5,"Excelente"));
        jdbc.update("INSERT INTO escrow(id,milestone_id,project_id,client_user_id,freelancer_user_id,amount,status) VALUES(?,?,?,?,?,100,'HELD')",escrow,milestone,project,client,professional);
        jdbc.update("UPDATE escrow SET status='RELEASED' WHERE id=?",escrow);
        jdbc.update("UPDATE escrow SET status='RELEASED' WHERE id=?",escrow);
        assertEquals("COMPLETED",store.lock(contractId).status());
        assertEquals("COMPLETED",jdbc.queryForObject("SELECT status FROM freelance_projects WHERE id=?",String.class,project));
        assertEquals(1,jdbc.queryForObject("SELECT sales FROM services WHERE id=?",Integer.class,service));
        new TransactionTemplate(new DataSourceTransactionManager(ds)).executeWithoutResult(status->application.review(contractId,client,5,"Excelente"));
        new TransactionTemplate(new DataSourceTransactionManager(ds)).executeWithoutResult(status->application.review(contractId,client,3,"Actualizada"));
        assertEquals(1,store.reviews(service).size()); assertEquals(3,store.reviews(service).get(0).stars());
        assertEquals(1,jdbc.queryForObject("SELECT review_count FROM services WHERE id=?",Integer.class,service));
        var inbox=new JdbcInAppNotifications(jdbc);
        assertEquals(2,inbox.unread(client));
        UUID notification=UUID.fromString(inbox.list(client).get(0).id());
        assertThrows(ResourceNotFoundException.class,()->inbox.markRead(professional,notification));
        inbox.markRead(client,notification); assertEquals(1,inbox.unread(client));
        inbox.markAllRead(client); assertEquals(0,inbox.unread(client));
    }
    @Test void interviewSchedulesNotifyAndCompletionHasActualTimestamp() {
        var candidate=user("FREELANCER"); var client=user("COMPANY"); var job=UUID.randomUUID(); var company=UUID.randomUUID();
        jdbc.update("INSERT INTO companies(id,owner_user_id,business_name,legal_name,industry,specialty,company_size,biography,payment_method_type,company_plan,representative_dni,status,created_at,updated_at) VALUES(?,?,?,'Empresa local','Software','Java','SMALL','Prueba local','CREDIT_CARD','FREE','12345678','VALIDATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",company,client,"Empresa "+company);
        jdbc.update("INSERT INTO job_posts(id,company_id,title,description,location,job_type,salary_min,salary_max,currency,vacancies,status,created_at,updated_at) VALUES(?,?,'Empleo de prueba','Descripcion de empleo de prueba','Lima','FULL_TIME',1000,2000,'PEN',1,'PUBLISHED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",job,company);
        UUID application=UUID.randomUUID();
        jdbc.update("INSERT INTO job_applications(id,job_post_id,candidate_user_id,cover_letter,applied_at,status) VALUES(?,?,?,'Postulacion de prueba',CURRENT_TIMESTAMP,'SUBMITTED')",application,job,candidate);
        var inbox=new JdbcInAppNotifications(jdbc);
        assertEquals(1,inbox.unread(client)); assertEquals(1,inbox.unread(candidate));
        jdbc.update("UPDATE job_applications SET screening_score=80,status='IN_REVIEW' WHERE id=?",application);
        jdbc.update("UPDATE job_applications SET status='SHORTLISTED' WHERE id=?",application);
        assertEquals(3,jdbc.queryForObject("SELECT COUNT(*) FROM hiring_stage_completions WHERE job_id=? AND candidate_id=?",Integer.class,job,candidate));
        var schedule=UUID.randomUUID().toString();
        jdbc.update("INSERT INTO interview_schedules(id,hiring_process_id,candidate_id,job_id,interview_type,status) VALUES(?,?,?,?,'THEORY','PENDING')",schedule,job.toString(),candidate.toString(),job.toString());
        assertEquals(2,inbox.unread(candidate));
        var interview=UUID.randomUUID().toString();
        jdbc.update("INSERT INTO interviews(id,hiring_process_id,candidate_id,interview_type,status,interviewer_name,interviewer_style,interviewer_voice,created_at) VALUES(?,?,?,'THEORY','IN_PROGRESS','Entrevistador de prueba','Formal','MALE1',CURRENT_TIMESTAMP)",interview,job.toString(),candidate.toString());
        jdbc.update("UPDATE interviews SET status='COMPLETED' WHERE id=?",interview);
        assertNotNull(jdbc.queryForObject("SELECT completed_at FROM hiring_stage_completions WHERE job_id=? AND candidate_id=? AND stage='THEORY_INTERVIEW'",java.sql.Timestamp.class,job,candidate));
    }
}
