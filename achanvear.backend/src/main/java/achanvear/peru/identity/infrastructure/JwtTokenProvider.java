package achanvear.peru.identity.infrastructure;

import achanvear.peru.identity.domain.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpirationMinutes;
    private final String issuer;

    public JwtTokenProvider(
            @Value("${security.jwt.secret}") String jwtSecret,
            @Value("${security.jwt.access-token-expiration-minutes}") long accessTokenExpirationMinutes,
            @Value("${security.jwt.issuer}") String issuer
    ) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMinutes = accessTokenExpirationMinutes;
        this.issuer = issuer;
    }

    public String generateAccessToken(User user, UUID companyId) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(accessTokenExpirationMinutes * 60);

        return Jwts.builder()
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .id(UUID.randomUUID().toString())
                .claim("email", user.getEmail().value())
                .claim("fullName", user.getFullName())
                .claim("dni", user.getDni())
                .claim("role", user.getRole().name())
                .claim("status", user.getStatus().name())
                .claim("companyId", companyId != null ? companyId.toString() : null)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public boolean isValidToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException ex) {
            return false;
        }
    }

    public String extractUserId(String token) {
        Claims claims = extractClaims(token);
        return claims.getSubject();
    }

    public String extractEmail(String token) {
        Claims claims = extractClaims(token);
        return claims.get("email", String.class);
    }

    public String extractFullName(String token) {
        Claims claims = extractClaims(token);
        return claims.get("fullName", String.class);
    }

    public String extractDni(String token) {
        Claims claims = extractClaims(token);
        return claims.get("dni", String.class);
    }

    public String extractRole(String token) {
        Claims claims = extractClaims(token);
        return claims.get("role", String.class);
    }

    public UUID extractCompanyId(String token) {
        Claims claims = extractClaims(token);
        String companyId = claims.get("companyId", String.class);
        return companyId != null ? UUID.fromString(companyId) : null;
    }

    /**
     * Generate a short-lived temp token for 2FA login step
     */
    public String generate2faTempToken(UUID userId) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(300); // 5 minutes

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .id(UUID.randomUUID().toString())
                .claim("type", "2FA_TEMP")
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Validate and extract user from a 2FA temp token
     */
    public achanvear.peru.shared.security.AuthenticatedUser validate2faTempToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!"2FA_TEMP".equals(claims.get("type", String.class))) {
                return null;
            }

            String userId = claims.getSubject();
            if (userId == null) return null;

            return new achanvear.peru.shared.security.AuthenticatedUser(
                    java.util.UUID.fromString(userId),
                    null,
                    null,
                    null,
                    null,
                    null,
                    java.util.Collections.emptyList()
            );
        } catch (Exception e) {
            return null;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}