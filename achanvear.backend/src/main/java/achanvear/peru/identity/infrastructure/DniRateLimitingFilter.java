package achanvear.peru.identity.infrastructure;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DniRateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:3000",
            "https://achanvear.site",
            "https://www.achanvear.site"
    );
    private final Map<String, RateLimitInfo> attemptHistory = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        // Agregar headers CORS a todas las respuestas de este filtro
        String origin = request.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // Manejar preflight OPTIONS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        if (!isDniEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);
        long now = System.currentTimeMillis();

        RateLimitInfo updated = attemptHistory.compute(clientKey, (key, info) -> {
            if (info == null || now - info.firstAttemptMillis >= WINDOW.toMillis()) {
                return new RateLimitInfo(now, 1);
            }
            return new RateLimitInfo(info.firstAttemptMillis, info.count + 1);
        });

        if (updated.count > MAX_ATTEMPTS) {
            long elapsed = now - updated.firstAttemptMillis;
            long remainingMillis = WINDOW.toMillis() - elapsed;
            if (remainingMillis <= 0) {
                attemptHistory.put(clientKey, new RateLimitInfo(now, 1));
                filterChain.doFilter(request, response);
                return;
            }

            long remainingMinutes = Duration.ofMillis(remainingMillis).toMinutes();
            long hours = remainingMinutes / 60;
            long minutes = remainingMinutes % 60;
            String retryAfter = hours > 0 ? String.format("%dh %02dm", hours, minutes) : String.format("%02dm", minutes);

            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(Duration.ofMillis(remainingMillis).toSeconds()));
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Demasiados intentos. Intenta de nuevo en " + retryAfter + ".\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isDniEndpoint(String path) {
        // request.getRequestURI() devuelve la ruta completa incluyendo context-path
        // ej: /api/v1/integration/dni/72432182
        return path.contains("/integration/dni");
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record RateLimitInfo(long firstAttemptMillis, int count) {
    }
}
