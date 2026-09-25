package achanvear.peru.identity.web;

import achanvear.peru.compliance.application.RecordRegistrationConsentUseCase;
import achanvear.peru.compliance.application.command.RecordRegistrationConsentCommand;
import achanvear.peru.identity.application.ChangePasswordUseCase;
import achanvear.peru.identity.application.ForgotPasswordUseCase;
import achanvear.peru.identity.application.LoginUserUseCase;
import achanvear.peru.identity.application.RegisterUserUseCase;
import achanvear.peru.identity.application.ResetPasswordUseCase;
import achanvear.peru.identity.application.command.ChangePasswordCommand;
import achanvear.peru.identity.application.command.ForgotPasswordCommand;
import achanvear.peru.identity.application.command.LoginUserCommand;
import achanvear.peru.identity.application.command.RegisterUserCommand;
import achanvear.peru.identity.application.command.ResetPasswordCommand;
import achanvear.peru.identity.application.dto.LoginResponse;
import achanvear.peru.identity.application.dto.PasswordResetResponse;
import achanvear.peru.identity.application.dto.UserResponse;
import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.identity.domain.model.UserStatus;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.identity.infrastructure.JwtTokenProvider;
import achanvear.peru.identity.infrastructure.external.FirebaseService;
import achanvear.peru.identity.infrastructure.persistence.User2faJpaRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import achanvear.peru.shared.web.ApiResponse;
import com.google.firebase.auth.FirebaseToken;
import jakarta.validation.Valid;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final ForgotPasswordUseCase forgotPasswordUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final UserRepository userRepository;
    private final FirebaseService firebaseService;
    private final JwtTokenProvider jwtTokenProvider;
    private final User2faJpaRepository user2faJpaRepository;
    private final RecordRegistrationConsentUseCase recordRegistrationConsentUseCase;

    public AuthController(
            RegisterUserUseCase registerUserUseCase,
            LoginUserUseCase loginUserUseCase,
            ForgotPasswordUseCase forgotPasswordUseCase,
            ResetPasswordUseCase resetPasswordUseCase,
            ChangePasswordUseCase changePasswordUseCase,
            UserRepository userRepository,
            FirebaseService firebaseService,
            JwtTokenProvider jwtTokenProvider,
            User2faJpaRepository user2faJpaRepository,
            RecordRegistrationConsentUseCase recordRegistrationConsentUseCase
    ) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.userRepository = userRepository;
        this.firebaseService = firebaseService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.user2faJpaRepository = user2faJpaRepository;
        this.recordRegistrationConsentUseCase = recordRegistrationConsentUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        RegisterUserCommand command = new RegisterUserCommand(
                request.email(),
                request.fullName(),
                request.dni(),
                request.phone(),
                request.password(),
                request.role(),
                request.representanteDni(),
                request.representanteLegal(),
                request.ruc(),
                request.acceptTerms(),
                request.acceptPrivacy(),
                request.termsVersion(),
                request.privacyVersion()
        );

        UserResponse userResponse = registerUserUseCase.execute(command);
        User user = userRepository.findById(UserId.from(userResponse.id()))
                .orElseThrow(() -> new IllegalArgumentException("No se pudo iniciar la sesion despues del registro"));

        LoginResponse response = new LoginResponse(
                jwtTokenProvider.generateAccessToken(user, null),
                "Bearer",
                userResponse
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginUserCommand command = new LoginUserCommand(
                request.email(),
                request.password()
        );

        LoginResponse response = loginUserUseCase.execute(command);

        // Check if user has 2FA enabled from database
        UUID userId = UUID.fromString(response.user().id());
        boolean twoFAEnabled = user2faJpaRepository.findByUserId(userId)
                .map(e -> e.getEnabled() != null && e.getEnabled())
                .orElse(false);
        if (twoFAEnabled) {
            // Return temp token instead of full JWT
            String tempToken = jwtTokenProvider.generate2faTempToken(userId);
            LoginResponse twoFactorResponse = new LoginResponse(
                    tempToken,
                    "2FA_REQUIRED",
                    response.user()
            );
            return ResponseEntity.ok(ApiResponse.success(twoFactorResponse, "2FA verification required"));
        }

        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();
        UUID userId = authenticatedUser.getUserId();

        UserResponse response = userRepository.findById(UserId.from(userId.toString()))
                .map(UserResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("No se pudo identificar tu sesión. Vuelve a iniciar sesión"));

        return ResponseEntity.ok(ApiResponse.success(response, "Current user fetched successfully"));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        // Verificar el token de Firebase
        FirebaseToken firebaseToken = firebaseService.verifyIdToken(request.idToken());
        String email = firebaseToken.getEmail();
        String name = firebaseToken.getName();

        // Buscar si el usuario ya existe
        Optional<User> existingUser = userRepository.findByEmail(new Email(email));

        if (existingUser.isEmpty()) {
            // Usuario no existe - devolver 404 con los datos de Google para que el frontend redirija a registro
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No encontramos una cuenta con este correo. Regístrate primero."));
        }

        User user = existingUser.get();

        if (!user.isActive()) {
            throw new IllegalArgumentException("Tu cuenta no está activa. Contacta con soporte si crees que es un error");
        }

        // Generar JWT
        UUID companyId = null;
        String accessToken = jwtTokenProvider.generateAccessToken(user, companyId);

        LoginResponse response = new LoginResponse(
                accessToken,
                "Bearer",
                UserResponse.from(user)
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Google login successful"));
    }

    @PostMapping("/google/register")
    public ResponseEntity<ApiResponse<LoginResponse>> googleRegister(
            @Valid @RequestBody GoogleRegisterRequest request
    ) {
        // Verificar el token de Firebase
        FirebaseToken firebaseToken = firebaseService.verifyIdToken(request.idToken());
        String email = firebaseToken.getEmail();
        String name = firebaseToken.getName();

        // Verificar que el usuario no exista ya
        Optional<User> existingUser = userRepository.findByEmail(new Email(email));
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Ya existe una cuenta con este correo electrónico");
        }

        // Consentimientos obligatorios del registro
        if (!request.acceptTerms()) {
            throw new IllegalArgumentException("Debes aceptar los Términos y Condiciones para registrarte");
        }
        if (!request.acceptPrivacy()) {
            throw new IllegalArgumentException("Debes aceptar la Política de Privacidad para registrarte");
        }

        // Crear nuevo usuario con Google + datos del formulario
        UserId userId = UserId.generate();
        String tempPasswordHash = "$2a$10$google.auth.temporary.password.hash";
        UserRole role = request.role() != null ? UserRole.valueOf(request.role()) : UserRole.FREELANCER;

        // Seguridad: el registro con Google tampoco puede autoconferirse roles privilegiados.
        if (!role.canBeSelfRegistered()) {
            throw new ForbiddenOperationException("El rol " + role + " no puede asignarse mediante el registro público");
        }

        User user = User.restore(
                userId,
                new Email(email),
                name,
                request.dni(),
                request.phone(),
                tempPasswordHash,
                role,
                UserStatus.ACTIVE,
                null, // representanteDni
                null, // representanteLegal
                null  // ruc
        );
        userRepository.save(user);

        recordRegistrationConsentUseCase.record(new RecordRegistrationConsentCommand(
                user.getId().toString(),
                request.acceptTerms(),
                request.acceptPrivacy(),
                null,
                null
        ));

        // Generar JWT
        UUID companyId = null;
        String accessToken = jwtTokenProvider.generateAccessToken(user, companyId);

        LoginResponse response = new LoginResponse(
                accessToken,
                "Bearer",
                UserResponse.from(user)
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Google registration successful"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<PasswordResetResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        ForgotPasswordCommand command = new ForgotPasswordCommand(request.email());
        PasswordResetResponse response = forgotPasswordUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Password reset initiated"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        ResetPasswordCommand command = new ResetPasswordCommand(
                request.token(),
                request.newPassword()
        );
        resetPasswordUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();

        ChangePasswordCommand command = new ChangePasswordCommand(
                authenticatedUser.getUserId(),
                request.currentPassword(),
                request.newPassword()
        );
        changePasswordUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }
}
