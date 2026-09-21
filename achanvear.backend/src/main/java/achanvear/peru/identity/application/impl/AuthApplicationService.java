package achanvear.peru.identity.application.impl;

import achanvear.peru.company.domain.model.Company;
import achanvear.peru.company.domain.model.CompanyCollaborator;
import achanvear.peru.company.domain.repository.CompanyCollaboratorRepository;
import achanvear.peru.company.domain.repository.CompanyRepository;
import achanvear.peru.compliance.application.RecordRegistrationConsentUseCase;
import achanvear.peru.compliance.application.command.RecordRegistrationConsentCommand;
import achanvear.peru.identity.application.LoginUserUseCase;
import achanvear.peru.identity.application.RegisterUserUseCase;
import achanvear.peru.identity.application.command.LoginUserCommand;
import achanvear.peru.identity.application.command.RegisterUserCommand;
import achanvear.peru.identity.application.dto.LoginResponse;
import achanvear.peru.identity.application.dto.UserResponse;
import achanvear.peru.identity.application.factory.UserFactory;
import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.identity.infrastructure.JwtTokenProvider;
import achanvear.peru.shared.application.EventPublisher;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AuthApplicationService implements RegisterUserUseCase, LoginUserUseCase {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyCollaboratorRepository companyCollaboratorRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventPublisher eventPublisher;
    private final UserFactory userFactory;
    private final JwtTokenProvider jwtTokenProvider;
    private final RecordRegistrationConsentUseCase recordRegistrationConsentUseCase;

    public AuthApplicationService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            CompanyCollaboratorRepository companyCollaboratorRepository,
            PasswordEncoder passwordEncoder,
            EventPublisher eventPublisher,
            UserFactory userFactory,
            JwtTokenProvider jwtTokenProvider,
            RecordRegistrationConsentUseCase recordRegistrationConsentUseCase
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.companyCollaboratorRepository = companyCollaboratorRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
        this.userFactory = userFactory;
        this.jwtTokenProvider = jwtTokenProvider;
        this.recordRegistrationConsentUseCase = recordRegistrationConsentUseCase;
    }

    @Override
    public UserResponse execute(RegisterUserCommand command) {
        if (!command.acceptTerms()) {
            throw new IllegalArgumentException("Debes aceptar los Términos y Condiciones para registrarte");
        }
        if (!command.acceptPrivacy()) {
            throw new IllegalArgumentException("Debes aceptar la Política de Privacidad para registrarte");
        }

        Email email = new Email(command.email());

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User already exists with email: " + email.value());
        }

        UserRole role = UserRole.valueOf(command.role().trim().toUpperCase());

        // Seguridad: el registro público no puede autoconferirse roles privilegiados.
        // Los roles administrativos (SUPERADMIN, ADMIN, SUPPORT, SUBADMIN) solo se
        // asignan desde el panel por un SUPERADMIN.
        if (!role.canBeSelfRegistered()) {
            throw new ForbiddenOperationException("El rol " + role + " no puede asignarse mediante el registro público");
        }

        if (role == UserRole.FREELANCER) {
            if (command.dni() == null || command.dni().isBlank()) {
                throw new IllegalArgumentException("Para registrarte como profesional necesitas ingresar tu DNI");
            }
            if (userRepository.existsByDni(command.dni())) {
                throw new IllegalArgumentException("Ya existe una cuenta con este DNI");
            }
        }

        if (role == UserRole.COMPANY) {
            if (command.representanteDni() == null || command.representanteDni().isBlank()) {
                throw new IllegalArgumentException("Para registrarte como empresa necesitas el DNI del representante legal");
            }
        }

        String passwordHash = passwordEncoder.encode(command.rawPassword());

        User user;
        if (role == UserRole.COMPANY) {
            user = userFactory.create(
                    email, command.fullName(), command.dni(), command.phone(),
                    passwordHash, role,
                    command.representanteDni(), command.representanteLegal(), command.ruc()
            );
        } else {
            user = userFactory.create(email, command.fullName(), command.dni(), command.phone(), passwordHash, role);
        }
        userRepository.save(user);

        // Registrar las evidencias de aceptación antes de publicar el evento de usuario creado.
        // Si el registro de consentimientos falla, la transacción revierte y no se crea el usuario.
        recordRegistrationConsentUseCase.record(new RecordRegistrationConsentCommand(
                user.getId().toString(),
                command.acceptTerms(),
                command.acceptPrivacy(),
                command.termsVersion(),
                command.privacyVersion()
        ));

        user.pullDomainEvents().forEach(eventPublisher::publish);

        return UserResponse.from(user);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse execute(LoginUserCommand command) {
        Email email = new Email(command.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive()) {
            throw new BusinessRuleViolationException("Tu cuenta no está activa. Contacta con soporte si crees que es un error");
        }

        boolean passwordMatches = passwordEncoder.matches(
                command.rawPassword(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // Buscar companyId si el usuario es COMPANY o COMPANY_COLLABORATOR
        UUID companyId = null;
        if (user.getRole() == UserRole.COMPANY) {
            Optional<Company> company = companyRepository.findByOwnerUserId(user.getId().value());
            if (company.isPresent()) {
                companyId = company.get().getId().value();
            }
        } else if (user.getRole() == UserRole.COMPANY_COLLABORATOR) {
            Optional<CompanyCollaborator> collaborator = companyCollaboratorRepository.findByUserId(user.getId().value());
            if (collaborator.isPresent()) {
                companyId = collaborator.get().getCompanyId();
            }
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user, companyId);

        return new LoginResponse(
                accessToken,
                "Bearer",
                UserResponse.from(user)
        );
    }
}