package achanvear.peru.identity.web;

import achanvear.peru.identity.application.dto.LoginResponse;
import achanvear.peru.identity.application.dto.UserResponse;
import achanvear.peru.identity.domain.model.*;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.identity.infrastructure.JwtTokenProvider;
import achanvear.peru.identity.infrastructure.persistence.User2faJpaEntity;
import achanvear.peru.identity.infrastructure.persistence.User2faJpaRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/auth/2fa")
public class TwoFactorController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final User2faJpaRepository user2faJpaRepository;

    public TwoFactorController(UserRepository userRepository, JwtTokenProvider jwtTokenProvider, User2faJpaRepository user2faJpaRepository) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.user2faJpaRepository = user2faJpaRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<TwoFactorStatusResponse>> getStatus(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        UUID userId = authenticatedUser.getUserId();
        Optional<User2faJpaEntity> opt = user2faJpaRepository.findByUserId(userId);
        boolean enabled = opt.isPresent() && opt.get().getEnabled();
        User2faJpaEntity entity = opt.orElse(null);

        return ResponseEntity.ok(ApiResponse.success(
                new TwoFactorStatusResponse(enabled, enabled ? entity.getMethod() : null, enabled ? entity.getSetupAt() : null),
                "2FA status retrieved"
        ));
    }

    @PostMapping("/enable")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> enable(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        UUID userId = authenticatedUser.getUserId();
        User user = userRepository.findById(UserId.from(userId.toString()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SecureRandom random = new SecureRandom();
        byte[] secretBytes = new byte[20];
        random.nextBytes(secretBytes);
        String secret = Base64.getEncoder().encodeToString(secretBytes);

        User2faJpaEntity entity = user2faJpaRepository.findByUserId(userId).orElse(new User2faJpaEntity());
        entity.setUserId(userId);
        entity.setEnabled(true);
        entity.setSecret(secret);
        entity.setMethod("TOTP");
        entity.setSetupAt(Instant.now());
        user2faJpaRepository.save(entity);

        String issuer = "Achanvear";
        String label = user.getEmail().value();
        String otpAuthUrl = String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                issuer, label, secret, issuer
        );

        return ResponseEntity.ok(ApiResponse.success(
                new TwoFactorSetupResponse(secret, otpAuthUrl, issuer, label),
                "2FA enabled successfully"
        ));
    }

    @PostMapping("/disable")
    public ResponseEntity<ApiResponse<Void>> disable(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        UUID userId = authenticatedUser.getUserId();
        user2faJpaRepository.findByUserId(userId).ifPresent(e -> {
            e.setEnabled(false);
            e.setSecret(null);
            user2faJpaRepository.save(e);
        });
        return ResponseEntity.ok(ApiResponse.success(null, "2FA disabled successfully"));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<TwoFactorVerifyResponse>> verify(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody TwoFactorVerifyRequest request
    ) {
        UUID userId = authenticatedUser.getUserId();
        Optional<User2faJpaEntity> opt = user2faJpaRepository.findByUserId(userId);
        if (opt.isEmpty() || !opt.get().getEnabled()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("2FA is not enabled for this account"));
        }

        boolean verified = validateTotpCode(opt.get().getSecret(), request.code());

        return ResponseEntity.ok(ApiResponse.success(
                new TwoFactorVerifyResponse(verified, Instant.now()),
                verified ? "2FA verification successful" : "Invalid verification code"
        ));
    }

    @PostMapping("/complete-login")
    public ResponseEntity<ApiResponse<LoginResponse>> completeLogin(
            @RequestBody CompleteLoginRequest request
    ) {
        if (request.tempToken() == null || request.code() == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Missing tempToken or code"));
        }

        UUID userId;
        try {
            AuthenticatedUser tempUser = jwtTokenProvider.validate2faTempToken(request.tempToken());
            if (tempUser == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.failure("La sesión expiró o el código no es válido. Vuelve a iniciar sesión"));
            }
            userId = tempUser.getUserId();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("La sesión expiró o el código no es válido. Vuelve a iniciar sesión"));
        }

        Optional<User2faJpaEntity> opt = user2faJpaRepository.findByUserId(userId);
        if (opt.isEmpty() || !opt.get().getEnabled()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("La verificación en dos pasos no está activa en esta cuenta"));
        }

        if (!validateTotpCode(opt.get().getSecret(), request.code())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("El código de verificación no es válido"));
        }

        User user = userRepository.findById(UserId.from(userId.toString()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UUID companyId = null;
        String accessToken = jwtTokenProvider.generateAccessToken(user, companyId);

        LoginResponse response = new LoginResponse(
                accessToken,
                "Bearer",
                UserResponse.from(user)
        );

        return ResponseEntity.ok(ApiResponse.success(response, "2FA verification successful"));
    }

    private boolean validateTotpCode(String secretB64, String code) {
        if (code == null || code.length() != 6 || secretB64 == null) return false;
        try {
            byte[] secretBytes = Base64.getDecoder().decode(secretB64);
            long timeWindow = Instant.now().getEpochSecond() / 30;
            for (long offset = -1; offset <= 1; offset++) {
                if (generateTOTP(secretBytes, timeWindow + offset).equals(code)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Invalid secret
        }
        return false;
    }

    private String generateTOTP(byte[] secret, long time) throws Exception {
        byte[] data = ByteBuffer.allocate(8).putLong(time).array();
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(secret, "HmacSHA1"));
        byte[] hash = mac.doFinal(data);
        int offset = hash[hash.length - 1] & 0xF;
        int binary = ((hash[offset] & 0x7F) << 24)
                | ((hash[offset + 1] & 0xFF) << 16)
                | ((hash[offset + 2] & 0xFF) << 8)
                | (hash[offset + 3] & 0xFF);
        int otp = binary % 1000000;
        return String.format("%06d", otp);
    }

    public static boolean is2FAEnabledStatic(UUID userId) {
        // This method cannot be static anymore since we use DB
        // The AuthController should inject this bean instead
        return false;
    }
}

record TwoFactorStatusResponse(boolean enabled, String method, Instant setupAt) {}
record TwoFactorSetupResponse(String secret, String otpAuthUrl, String issuer, String label) {}
record TwoFactorVerifyRequest(String code) {}
record TwoFactorVerifyResponse(boolean verified, Instant verifiedAt) {}
record CompleteLoginRequest(String tempToken, String code) {}