package achanvear.peru.chat.web;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.freelance.application.port.out.StoragePort;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named="REVIEW_DB_URL", matches=".+")
class ChatDatabaseTest {
    static JdbcTemplate jdbc;
    static DriverManagerDataSource ds;
    ChatController chat;
    AuthenticatedUser company, freelancer;
    UUID companyUser, freelancerUser;
    @BeforeAll static void database() throws Exception {
        ds = new DriverManagerDataSource(System.getenv("REVIEW_DB_URL"),"postgres","review-local-only");
        jdbc = new JdbcTemplate(ds);
        jdbc.execute("CREATE TABLE users(id UUID PRIMARY KEY, full_name TEXT, role TEXT)");
        jdbc.execute("CREATE TABLE companies(id UUID PRIMARY KEY, owner_user_id UUID REFERENCES users(id))");
        jdbc.execute("CREATE TABLE job_posts(id UUID PRIMARY KEY)");
        jdbc.execute("CREATE TABLE job_applications(job_post_id UUID, candidate_user_id UUID, applied_at TIMESTAMPTZ, screening_score NUMERIC, status TEXT)");
        jdbc.execute("CREATE TABLE hiring_processes(job_id TEXT, candidate_id TEXT, stage TEXT)");
        for (String migration : List.of("V33__create_chat_tables.sql","V34__create_chat_attachments.sql",
                "V67__chat_reads_and_unique_pairs.sql","V68__persist_hiring_stage_dates.sql")) {
            String sql = new String(ChatDatabaseTest.class.getResourceAsStream("/db/migration/"+migration).readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            try (var connection = ds.getConnection(); var statement = connection.createStatement()) {
                connection.setAutoCommit(false); statement.execute(sql); connection.commit();
            }
        }
    }
    private AuthenticatedUser principal(UUID id) { return new AuthenticatedUser(id,"test@example.invalid",null,"FREELANCER","ACTIVE",null,List.of()); }
    @BeforeEach void setup() {
        companyUser=UUID.randomUUID(); freelancerUser=UUID.randomUUID();
        jdbc.update("INSERT INTO users VALUES(?, 'Empresa prueba','COMPANY'),(?, 'Profesional prueba','FREELANCER')",companyUser,freelancerUser);
        jdbc.update("INSERT INTO companies VALUES(?,?)",UUID.randomUUID(),companyUser);
        company=principal(companyUser); freelancer=principal(freelancerUser);
        chat=new ChatController(ds,mock(StoragePort.class));
    }
    @Test void A5SimultaneousRequestsFromBothParticipantsReturnSameConversation() throws Exception {
        var pool=Executors.newFixedThreadPool(8); var gate=new CountDownLatch(1);
        try {
            var futures=new ArrayList<Future<String>>();
            for (int i=0;i<16;i++) {
                boolean fromCompany=i%2==0;
                futures.add(pool.submit(() -> {
                    gate.await();
                    var result=chat.startConversation(fromCompany?company:freelancer,
                            new StartConversationRequest((fromCompany?freelancerUser:companyUser).toString()));
                    assertTrue(result.getStatusCode().is2xxSuccessful(),result.getBody().getMessage());
                    return result.getBody().getData().id();
                }));
            }
            gate.countDown(); var ids=new HashSet<String>();
            for(var future:futures) ids.add(future.get(20,TimeUnit.SECONDS));
            assertEquals(1,ids.size());
        } finally { pool.shutdownNow(); }
    }
    @Test void A6ConversationIncludesPublicCompanyId() {
        chat.startConversation(company,new StartConversationRequest(freelancerUser.toString()));
        var result=chat.getConversations(freelancer).getBody().getData().get(0);
        assertEquals(companyUser.toString(),result.participantId()); assertNotNull(result.participantCompanyId());
    }
    @Test void A7FileOnlyPreviewAndA8UnreadCountResetAreReal() throws Exception {
        var id=chat.startConversation(company,new StartConversationRequest(freelancerUser.toString())).getBody().getData().id();
        var message=chat.sendMessage(company,new SendMessageRequest(id,"")).getBody().getData();
        jdbc.update("INSERT INTO chat_attachments(id,message_id,s3_key,original_name,mime_type,file_size) VALUES(?,?, 'key','photo.png','image/png',12)",UUID.randomUUID(),UUID.fromString(message.id()));
        var received=chat.getConversations(freelancer).getBody().getData().get(0);
        assertEquals("Imagen",received.lastMessage()); assertEquals(1,received.unreadCount());
        assertEquals(0,chat.getConversations(company).getBody().getData().get(0).unreadCount());
        chat.markRead(UUID.fromString(id),principal(UUID.randomUUID()));
        assertEquals(1,chat.getConversations(freelancer).getBody().getData().get(0).unreadCount());
        chat.markRead(UUID.fromString(id),freelancer);
        assertEquals(0,chat.getConversations(freelancer).getBody().getData().get(0).unreadCount());
        jdbc.update("UPDATE chat_attachments SET mime_type='application/pdf'");
        assertEquals("Archivo adjunto",chat.getConversations(freelancer).getBody().getData().get(0).lastMessage());
        chat.sendMessage(company,new SendMessageRequest(id,"Nuevo mensaje"));
        assertEquals(1,chat.getConversations(freelancer).getBody().getData().get(0).unreadCount());
    }
    @Test void A22StageDatesPersistAcrossQueriesAndUnrelatedUpdates() {
        var job=UUID.randomUUID(); jdbc.update("INSERT INTO job_posts VALUES(?)",job);
        jdbc.update("INSERT INTO job_applications VALUES(?,?, '2026-10-24T04:54:00Z',NULL,'SUBMITTED')",job,freelancerUser);
        jdbc.update("INSERT INTO hiring_processes VALUES(?,?,'THEORY_INTERVIEW')",job.toString(),freelancerUser.toString());
        jdbc.update("UPDATE hiring_processes SET stage='TECHNICAL_INTERVIEW' WHERE job_id=?",job.toString());
        var first=jdbc.queryForObject("SELECT completed_at FROM hiring_stage_completions WHERE job_id=? AND stage='THEORY_INTERVIEW'",java.sql.Timestamp.class,job);
        jdbc.update("UPDATE hiring_processes SET stage=stage WHERE job_id=?",job.toString());
        assertEquals(first,jdbc.queryForObject("SELECT completed_at FROM hiring_stage_completions WHERE job_id=? AND stage='THEORY_INTERVIEW'",java.sql.Timestamp.class,job));
        assertEquals(java.time.Instant.parse("2026-10-24T04:54:00Z"),jdbc.queryForObject("SELECT completed_at FROM hiring_stage_completions WHERE job_id=? AND stage='SUBMITTED'",java.sql.Timestamp.class,job).toInstant());
    }
}
