package achanvear.peru.profile.web;

import achanvear.peru.profile.application.*;
import achanvear.peru.profile.application.command.*;
import achanvear.peru.profile.application.dto.TalentProfilePageResponse;
import achanvear.peru.profile.application.dto.TalentProfileResponse;
import achanvear.peru.profile.application.port.out.ProfileStoragePort;
import achanvear.peru.profile.application.query.ProfileSearchQuery;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.List;


@RestController
@RequestMapping("/profiles")
public class ProfileController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileController.class);
    private static final byte[] FALLBACK_PROFILE_IMAGE = """
            <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
              <rect width="96" height="96" rx="18" fill="#e2e8f0"/>
              <circle cx="48" cy="36" r="16" fill="#94a3b8"/>
              <path d="M22 82c3.5-17 14-26 26-26s22.5 9 26 26" fill="#94a3b8"/>
            </svg>
            """.getBytes(StandardCharsets.UTF_8);

    private final CreateTalentProfileUseCase createTalentProfileUseCase;
    private final UpdateTalentProfileUseCase updateTalentProfileUseCase;
    private final RateProfileUseCase rateProfileUseCase;
    private final GetMyTalentProfileUseCase getMyTalentProfileUseCase;
    private final GetTalentProfileDetailUseCase getTalentProfileDetailUseCase;
    private final SearchTalentProfilesUseCase searchTalentProfilesUseCase;
    private final ProfileStoragePort profileStoragePort;

    public ProfileController(
            CreateTalentProfileUseCase createTalentProfileUseCase,
            UpdateTalentProfileUseCase updateTalentProfileUseCase,
            RateProfileUseCase rateProfileUseCase,
            GetMyTalentProfileUseCase getMyTalentProfileUseCase,
            GetTalentProfileDetailUseCase getTalentProfileDetailUseCase,
            SearchTalentProfilesUseCase searchTalentProfilesUseCase,
            ProfileStoragePort profileStoragePort
    ) {
        this.createTalentProfileUseCase = createTalentProfileUseCase;
        this.updateTalentProfileUseCase = updateTalentProfileUseCase;
        this.rateProfileUseCase = rateProfileUseCase;
        this.getMyTalentProfileUseCase = getMyTalentProfileUseCase;
        this.getTalentProfileDetailUseCase = getTalentProfileDetailUseCase;
        this.searchTalentProfilesUseCase = searchTalentProfilesUseCase;
        this.profileStoragePort = profileStoragePort;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<TalentProfileResponse>> getMyProfile(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        TalentProfileResponse response = getMyTalentProfileUseCase.getMyProfile(
                authenticatedUser.getUserId().toString()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Talent profile retrieved successfully"));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<TalentProfileResponse>> getByUserId(
            @PathVariable String userId
    ) {
        TalentProfileResponse response = getMyTalentProfileUseCase.getMyProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Talent profile retrieved successfully"));
    }

    @GetMapping("/{profileId}")
    public ResponseEntity<ApiResponse<TalentProfileResponse>> getById(
            @PathVariable String profileId
    ) {
        TalentProfileResponse response = getTalentProfileDetailUseCase.getById(profileId);
        return ResponseEntity.ok(ApiResponse.success(response, "Talent profile retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TalentProfileResponse>> createProfile(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateTalentProfileRequest request
    ) {
        TalentProfileResponse response = createTalentProfileUseCase.execute(
                new CreateTalentProfileCommand(
                        authenticatedUser.getUserId().toString(),
                        request.profileType(),
                        request.headline(),
                        request.biography(),
                        request.location(),
                        request.profilePhotoUrl(),
                        request.curriculumUrl(),
                        mapSkills(request.skills()),
                        mapPortfolioItems(request.portfolioItems())
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Talent profile created successfully"));
    }

    @PutMapping("/{profileId}")
    public ResponseEntity<ApiResponse<TalentProfileResponse>> updateProfile(
            @PathVariable String profileId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody UpdateTalentProfileRequest request
    ) {
        TalentProfileResponse response = updateTalentProfileUseCase.execute(
                new UpdateTalentProfileCommand(
                        profileId,
                        authenticatedUser.getUserId().toString(),
                        request.profileType(),
                        request.headline(),
                        request.biography(),
                        request.location(),
                        request.profilePhotoUrl(),
                        request.curriculumUrl(),
                        mapSkills(request.skills()),
                        mapPortfolioItems(request.portfolioItems())
                )
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Talent profile updated successfully"));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{profileId}/ratings")
    public ResponseEntity<ApiResponse<TalentProfileResponse>> rateProfile(
            @PathVariable String profileId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody RateProfileRequest request
    ) {
        TalentProfileResponse response = rateProfileUseCase.execute(
                new RateProfileCommand(
                        profileId,
                        authenticatedUser.getUserId().toString(),
                        request.reviewerType(),
                        request.stars(),
                        request.recommended(),
                        request.comment()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Profile rating created successfully"));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/rate-user/{targetUserId}")
    public ResponseEntity<ApiResponse<TalentProfileResponse>> rateByUserId(
            @PathVariable String targetUserId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody RateProfileRequest request
    ) {
        org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(getClass());
        log.info("rateByUserId called: targetUserId={}, reviewerUserId={}, reviewerType={}, stars={}",
                targetUserId, authenticatedUser.getUserId(), request.reviewerType(), request.stars());

        // Look up the profile by user ID, or create a basic one if it doesn't exist
        TalentProfileResponse profile;
        try {
            profile = getMyTalentProfileUseCase.getMyProfile(targetUserId);
            log.info("Profile found: profileId={}", profile.id());
        } catch (achanvear.peru.shared.domain.exception.ResourceNotFoundException e) {
            log.info("Profile not found for userId={}, creating basic profile", targetUserId);
            // Profile doesn't exist, create a basic one
            profile = createTalentProfileUseCase.execute(
                    new CreateTalentProfileCommand(
                            targetUserId,
                            "FREELANCER",
                            "Profesional",
                            "Perfil en construcción. Completa tu información profesional para que las empresas puedan conocerte mejor.",
                            "Por definir",
                            null,
                            null,
                            java.util.Collections.emptyList(),
                            java.util.Collections.emptyList()
                    )
            );
            log.info("Profile created: profileId={}", profile.id());
        }
        // Then rate using the profile ID
        log.info("Rating profile: profileId={}, reviewerUserId={}", profile.id(), authenticatedUser.getUserId());
        TalentProfileResponse response = rateProfileUseCase.execute(
                new RateProfileCommand(
                        profile.id(),
                        authenticatedUser.getUserId().toString(),
                        request.reviewerType(),
                        request.stars(),
                        request.recommended(),
                        request.comment()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Profile rating created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<TalentProfilePageResponse>> searchProfiles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String profileType,
            @RequestParam(required = false) String skill,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        TalentProfilePageResponse response = searchTalentProfilesUseCase.execute(
                new ProfileSearchQuery(
                        search,
                        profileType,
                        skill,
                        page,
                        size,
                        sortBy,
                        sortDirection
                )
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Talent profiles retrieved successfully"));
    }

    @PostMapping("/storage/presigned-url")
    public ResponseEntity<ApiResponse<ProfileStoragePort.PresignedUploadResponse>> generatePresignedUploadUrl(
            @Valid @RequestBody GenerateProfilePresignedUrlRequest request
    ) {
        ProfileStoragePort.PresignedUploadResponse response = profileStoragePort.generatePresignedUploadUrl(
                request.folder(),
                request.fileName(),
                request.contentType()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Presigned upload url generated successfully"));
    }

    @PostMapping(value = "/storage/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileStoragePort.UploadResponse>> uploadFile(
            @RequestParam("folder") String folder,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("El archivo esta vacio"));
        }

        try {
            ProfileStoragePort.UploadResponse response = profileStoragePort.uploadFile(
                    folder,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes()
            );
            ProfileStoragePort.UploadResponse browserReadableResponse = new ProfileStoragePort.UploadResponse(
                    response.fileKey(),
                    buildProfilePhotoProxyUrl(response.fileKey())
            );
            return ResponseEntity.ok(ApiResponse.success(browserReadableResponse, "File uploaded successfully"));
        } catch (java.io.IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("No se pudo leer el archivo enviado"));
        } catch (RuntimeException e) {
            LOGGER.error("Profile storage upload failed", e);
            return ResponseEntity.badRequest().body(ApiResponse.failure("No se pudo subir el archivo: " + e.getMessage()));
        }
    }

    @GetMapping("/photo-proxy")
    public ResponseEntity<Resource> serveProfilePhoto(
            @RequestParam String fileKey
    ) {
        try {
            byte[] fileBytes = profileStoragePort.downloadFile(fileKey);
            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            // Detectar content type por extensión
            String contentType = "image/jpeg";
            if (fileKey.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (fileKey.toLowerCase().endsWith(".webp")) {
                contentType = "image/webp";
            } else if (fileKey.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);
        } catch (Exception e) {
            LOGGER.warn("Profile photo proxy fallback for missing key {}", fileKey);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("image/svg+xml"))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                    .body(new ByteArrayResource(FALLBACK_PROFILE_IMAGE));
        }
    }

    private String buildProfilePhotoProxyUrl(String fileKey) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/profiles/photo-proxy")
                .queryParam("fileKey", fileKey)
                .build()
                .encode()
                .toUriString();
    }


    private List<SkillCommand> mapSkills(List<SkillRequest> skills) {
        if (skills == null) {
            return List.of();
        }

        return skills.stream()
                .map(skill -> new SkillCommand(
                        skill.name(),
                        skill.level(),
                        skill.yearsOfExperience()
                ))
                .toList();
    }

    private List<PortfolioItemCommand> mapPortfolioItems(List<PortfolioItemRequest> items) {
        if (items == null) {
            return List.of();
        }

        return items.stream()
                .map(item -> new PortfolioItemCommand(
                        item.title(),
                        item.description(),
                        item.assetUrl(),
                        item.projectUrl()
                ))
                .toList();
    }
}
