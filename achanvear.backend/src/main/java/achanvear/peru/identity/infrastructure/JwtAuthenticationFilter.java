package achanvear.peru.identity.infrastructure;

import achanvear.peru.company.domain.model.CompanyCollaborator;
import achanvear.peru.company.domain.repository.CompanyCollaboratorRepository;
import achanvear.peru.company.domain.repository.CompanyRepository;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import achanvear.peru.shared.security.AuthenticatedUser;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;
    private final CompanyRepository companyRepository;
    private final CompanyCollaboratorRepository companyCollaboratorRepository;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtTokenProvider jwtTokenProvider,
            @Lazy CompanyRepository companyRepository,
            @Lazy CompanyCollaboratorRepository companyCollaboratorRepository,
            @Lazy UserRepository userRepository
    ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.companyRepository = companyRepository;
        this.companyCollaboratorRepository = companyCollaboratorRepository;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

        System.out.println("DEBUG JWT - Authorization Header: [" + authorizationHeader + "]");

        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            System.out.println("DEBUG JWT - No authorization header or invalid format");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());
        System.out.println("DEBUG JWT - Token extracted: [" + token.substring(0, Math.min(20, token.length())) + "...]");

        if (!jwtTokenProvider.isValidToken(token)) {
            System.out.println("DEBUG JWT - Token is invalid");
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("DEBUG JWT - Token is valid");

        String userId = jwtTokenProvider.extractUserId(token);
        String email = jwtTokenProvider.extractEmail(token);
        String role = jwtTokenProvider.extractRole(token);
        String status = null;
        UUID companyId = jwtTokenProvider.extractCompanyId(token);

        // Rol y estado en vivo desde la BD: un cambio de rol/estado en el panel
        // se aplica de inmediato en la autorización, sin esperar un nuevo login.
        // Los tokens temporales de 2FA no llevan claim "role" y se saltan este paso.
        if (role != null) {
            Optional<User> liveUser = userRepository.findById(UserId.from(userId));
            if (liveUser.isPresent()) {
                role = liveUser.get().getRole().name();
                status = liveUser.get().getStatus().name();
            }
        }

        // Si el token no tiene companyId pero el usuario es COMPANY o COMPANY_COLLABORATOR, buscar en BD
        if (companyId == null && ("COMPANY".equals(role) || "COMPANY_COLLABORATOR".equals(role))) {
            System.out.println("DEBUG JWT - companyId not in token, looking up in database...");
            if ("COMPANY".equals(role)) {
                companyId = companyRepository.findByOwnerUserId(UUID.fromString(userId))
                        .map(company -> company.getId().value())
                        .orElse(null);
            } else if ("COMPANY_COLLABORATOR".equals(role)) {
                companyId = companyCollaboratorRepository.findByUserId(UUID.fromString(userId))
                        .map(CompanyCollaborator::getCompanyId)
                        .orElse(null);
            }
            System.out.println("DEBUG JWT - companyId from DB: [" + companyId + "]");
        }

        // Debug log para verificar el rol
        System.out.println("DEBUG JWT - Role extracted: [" + role + "]");
        System.out.println("DEBUG JWT - Authority: [" + new SimpleGrantedAuthority(role) + "]");

        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                UUID.fromString(userId),
                email,
                null,
                role,
                status,
                companyId,
                authorities
        );

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(
                        authenticatedUser,
                        null,
                        authorities
                );

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        filterChain.doFilter(request, response);
    }
}
