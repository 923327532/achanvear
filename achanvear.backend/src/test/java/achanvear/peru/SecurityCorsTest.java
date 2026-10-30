package achanvear.peru;
import achanvear.peru.identity.config.SecurityConfig;
import achanvear.peru.identity.infrastructure.JwtAuthenticationFilter;
import achanvear.peru.identity.infrastructure.DniRateLimitingFilter;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class SecurityCorsTest {
    @Test void configuredOriginsPermitDockerFrontendAndRejectOtherSites() {
        var configuration=new SecurityConfig(mock(JwtAuthenticationFilter.class),mock(DniRateLimitingFilter.class),
                " http://localhost:3001, http://localhost:3000,http://localhost:3001 ");
        var cors=configuration.corsConfigurationSource().getCorsConfiguration(new MockHttpServletRequest("OPTIONS","/auth/login"));
        assertNotNull(cors);
        assertEquals("http://localhost:3001",cors.checkOrigin("http://localhost:3001"));
        assertEquals("http://localhost:3000",cors.checkOrigin("http://localhost:3000"));
        assertNull(cors.checkOrigin("https://unconfigured.example"));
        assertEquals(Boolean.TRUE,cors.getAllowCredentials());
        assertEquals(2,cors.getAllowedOrigins().size());
    }
}
