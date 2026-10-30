package achanvear.peru.services.web;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.data.domain.PageImpl;
import achanvear.peru.services.infrastructure.persistence.*;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named="REVIEW_DB_URL",matches=".+")
class ServiceDatabaseTest {
    @Test void cardsReturnIdentityAndDoNotPresentProfileRatingsAsVerifiedServiceReviews() {
        var admin=new JdbcTemplate(new DriverManagerDataSource(System.getenv("REVIEW_DB_URL"),"postgres","review-local-only"));
        admin.execute("CREATE SCHEMA services_review");
        var jdbc=new JdbcTemplate(new DriverManagerDataSource(System.getenv("REVIEW_DB_URL")+"?currentSchema=services_review","postgres","review-local-only"));
        jdbc.execute("CREATE TABLE users(id UUID,full_name TEXT)");
        jdbc.execute("CREATE TABLE freelancer_profiles(user_id UUID,name TEXT,specialty TEXT,profile_photo_url TEXT,status TEXT)");
        jdbc.execute("CREATE TABLE talent_profiles(id UUID,user_id UUID,headline TEXT)");
        jdbc.execute("CREATE TABLE profile_ratings(profile_id UUID,stars INTEGER)");
        var user=UUID.randomUUID(); var profile=UUID.randomUUID();
        jdbc.update("INSERT INTO users VALUES(?,'Arnold Test')",user);
        jdbc.update("INSERT INTO freelancer_profiles VALUES(?,'Arnold','HTML','photo.png','ACTIVE')",user);
        jdbc.update("INSERT INTO talent_profiles VALUES(?,?,'Desarrollador HTML')",profile,user);
        var entity=new ServiceJpaEntity(); entity.setId(UUID.randomUUID()); entity.setFreelancerUserId(user);
        var repo=mock(ServiceJpaRepository.class);
        when(repo.findActiveServices(any(),any(),any(),any())).thenReturn(new PageImpl<>(List.of(entity)));
        var controller=new ServiceController(repo,mock(ServicePlanJpaRepository.class),
                mock(achanvear.peru.jobs.application.JobAiSuggestionService.class),
                mock(achanvear.peru.freelance.application.port.out.StoragePort.class),jdbc);
        var initial=controller.explore(null,null,0,10,null).getBody().getData().items().get(0);
        assertEquals("Arnold Test",initial.freelancer().name());
        assertEquals("Desarrollador HTML",initial.freelancer().title()); assertTrue(initial.freelancer().verified());
        assertEquals(0,initial.reviewCount());
        jdbc.update("INSERT INTO profile_ratings VALUES(?,5),(?,3)",profile,profile);
        var rated=controller.explore(null,null,0,10,null).getBody().getData().items().get(0);
        assertEquals(0,rated.reviewCount()); assertEquals(0,BigDecimal.ZERO.compareTo(rated.rating()));
        jdbc.update("UPDATE freelancer_profiles SET status='PENDING_VALIDATION'");
        assertFalse(controller.explore(null,null,0,10,null).getBody().getData().items().get(0).freelancer().verified());
    }
}
