package achanvear.peru.identity.config;

import achanvear.peru.identity.infrastructure.DniRateLimitingFilter;
import achanvear.peru.identity.infrastructure.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:3000",
            "https://achanvear.site",
            "https://www.achanvear.site"
    );

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final DniRateLimitingFilter dniRateLimitingFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          DniRateLimitingFilter dniRateLimitingFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.dniRateLimitingFilter = dniRateLimitingFilter;
    }

    /**
     * web.ignoring() QUITA COMPLETAMENTE todos los filtros de seguridad 
     * para las rutas de DNI. Spring Security ni siquiera las procesa.
     * 
     * Se usan DOS patrones porque:
     * - request.getRequestURI() devuelve /api/v1/integration/dni/... (con context-path)
     * - request.getContextPath() devuelve /api/v1
     * - request.getRequestURI() sin getContextPath() da /integration/dni/...
     * 
     * Un patrón cubre con context-path (/api/v1/...) y otro sin él.
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/api/v1/integration/dni/**", "/integration/dni/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration configuration = new CorsConfiguration();
                    configuration.setAllowedOrigins(ALLOWED_ORIGINS);
                    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    configuration.setAllowedHeaders(List.of("*"));
                    configuration.setAllowCredentials(true);
                    return configuration;
                }))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/register").permitAll()
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/auth/forgot-password").permitAll()
                        .requestMatchers("/auth/reset-password").permitAll()
                        .requestMatchers("/auth/google/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        // Documentos legales públicos (Términos y Condiciones, Política de Privacidad)
                        .requestMatchers(HttpMethod.GET, "/legal-documents/terms", "/legal-documents/privacy").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Permitir /error para que no oculte errores reales detrás de un 403
                        .requestMatchers("/error").permitAll()
                        // Rutas públicas de onboarding
                        .requestMatchers(HttpMethod.GET, "/onboarding/industries").permitAll()
                        .requestMatchers(HttpMethod.GET, "/onboarding/specialties/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/onboarding/plans").permitAll()
                        .requestMatchers(HttpMethod.GET, "/onboarding/ai-agents").permitAll()
                        // Rutas públicas de catálogo
                        .requestMatchers(HttpMethod.GET, "/catalog/industries").permitAll()
                        .requestMatchers(HttpMethod.GET, "/catalog/specialties/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/catalog/plans").permitAll()
                        .requestMatchers(HttpMethod.GET, "/catalog/ai-agents").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(dniRateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write(
                                    "{\"success\":false,\"message\":\"Authentication required\",\"errors\":[],\"timestamp\":\"" + 
                                    java.time.Instant.now().toString() + "\"}"
                            );
                        })
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Filtro CORS global para que funcione incluso en rutas ignoradas por web.ignoring()
     * (como /integration/dni/**). Spring Security no aplica CORS a rutas ignoradas,
     * por lo que necesitamos este filtro a nivel de aplicación.
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(ALLOWED_ORIGINS);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
