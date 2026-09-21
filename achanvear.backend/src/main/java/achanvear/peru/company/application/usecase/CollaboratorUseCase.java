package achanvear.peru.company.application.usecase;

import achanvear.peru.company.application.dto.CollaboratorResponse;
import achanvear.peru.company.domain.model.Company;
import achanvear.peru.company.domain.model.CompanyCollaborator;
import achanvear.peru.company.domain.repository.CompanyCollaboratorRepository;
import achanvear.peru.company.domain.repository.CompanyRepository;
import achanvear.peru.shared.application.port.IdentityUserLookupPort;
import achanvear.peru.shared.application.port.NotificationPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CollaboratorUseCase {

    private final CompanyCollaboratorRepository collaboratorRepository;
    private final CompanyRepository companyRepository;
    private final IdentityUserLookupPort userLookupPort;
    private final NotificationPort notificationPort;
    private final String appBaseUrl;

    public CollaboratorUseCase(
            CompanyCollaboratorRepository collaboratorRepository,
            CompanyRepository companyRepository,
            IdentityUserLookupPort userLookupPort,
            NotificationPort notificationPort,
            @Value("${app.base-url}") String appBaseUrl
    ) {
        this.collaboratorRepository = collaboratorRepository;
        this.companyRepository = companyRepository;
        this.userLookupPort = userLookupPort;
        this.notificationPort = notificationPort;
        this.appBaseUrl = appBaseUrl;
    }

    public List<CollaboratorResponse> getCollaborators(UUID companyId) {
        return collaboratorRepository.findByCompanyId(companyId).stream()
                .map(CollaboratorResponse::from)
                .toList();
    }

    public CollaboratorResponse inviteCollaborator(UUID companyId, String email, String fullName) {
        // Validate company exists
        Company company = companyRepository.findById(new achanvear.peru.company.domain.model.CompanyId(companyId))
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        // Check if email already registered as collaborator
        if (collaboratorRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("This email is already registered as a collaborator");
        }

        // Find or create user via port
        IdentityUserLookupPort.IdentityUserSummary userSummary = userLookupPort.findByEmail(email).orElse(null);

        UUID userId;
        String tempPassword = null;
        if (userSummary == null) {
            // Create a new user with COMPANY_COLLABORATOR role
            tempPassword = UUID.randomUUID().toString().substring(0, 12);
            String passwordHash = new BCryptPasswordEncoder().encode(tempPassword);

            userSummary = userLookupPort.createUser(email, fullName, passwordHash, "COMPANY_COLLABORATOR");
            userId = userSummary.id();

            // Send welcome email with temp password
            notificationPort.sendEmail(
                    email,
                    "Has sido invitado a " + company.getBusinessName() + " en Achanvear",
                    """
                    <html>
                      <body>
                        <h2>Bienvenido a Achanvear</h2>
                        <p>Has sido invitado como colaborador de <strong>%s</strong>.</p>
                        <p>Tus credenciales de acceso son:</p>
                        <p><strong>Email:</strong> %s</p>
                        <p><strong>Contraseña temporal:</strong> %s</p>
                        <p>Por favor, inicia sesión y cambia tu contraseña.</p>
                        <a href="%s/login" style="display:inline-block;padding:12px 24px;background-color:#1e3a8a;color:white;text-decoration:none;border-radius:6px;">Iniciar sesión</a>
                      </body>
                    </html>
                    """.formatted(company.getBusinessName(), email, tempPassword, appBaseUrl)
            );
        } else {
            userId = userSummary.id();

            // Update user role to COMPANY_COLLABORATOR if needed
            if (!"COMPANY_COLLABORATOR".equals(userSummary.role())) {
                userLookupPort.updateRole(userSummary.id(), "COMPANY_COLLABORATOR");
            }

            // Send notification email
            notificationPort.sendEmail(
                    email,
                    "Has sido agregado como colaborador de " + company.getBusinessName() + " en Achanvear",
                    """
                    <html>
                      <body>
                        <h2>Colaborador de %s</h2>
                        <p>Has sido agregado como colaborador de <strong>%s</strong> en Achanvear.</p>
                        <p>Ahora puedes acceder a los proyectos y publicaciones de la empresa.</p>
                        <a href="%s/login" style="display:inline-block;padding:12px 24px;background-color:#1e3a8a;color:white;text-decoration:none;border-radius:6px;">Iniciar sesión</a>
                      </body>
                    </html>
                    """.formatted(company.getBusinessName(), company.getBusinessName(), appBaseUrl)
            );
        }

        // Create collaborator record
        CompanyCollaborator collaborator = CompanyCollaborator.create(
                UUID.randomUUID(),
                companyId,
                userId,
                fullName,
                email
        );
        collaboratorRepository.save(collaborator);

        // If a temp password was generated, include it in the response
        if (tempPassword != null) {
            return CollaboratorResponse.withTempPassword(collaborator, tempPassword);
        }
        return CollaboratorResponse.from(collaborator);
    }

    public void removeCollaborator(UUID companyId, UUID collaboratorId) {
        CompanyCollaborator collaborator = collaboratorRepository.findById(collaboratorId)
                .orElseThrow(() -> new IllegalArgumentException("Collaborator not found"));

        if (!collaborator.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("Collaborator does not belong to this company");
        }

        collaboratorRepository.delete(collaborator);
    }

    public void deactivateCollaborator(UUID companyId, UUID collaboratorId) {
        CompanyCollaborator collaborator = collaboratorRepository.findById(collaboratorId)
                .orElseThrow(() -> new IllegalArgumentException("Collaborator not found"));

        if (!collaborator.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("Collaborator does not belong to this company");
        }

        collaborator.deactivate();
        collaboratorRepository.save(collaborator);
    }
}
