package achanvear.peru.freelance.web;

import achanvear.peru.freelance.application.*;
import achanvear.peru.freelance.application.command.*;
import achanvear.peru.freelance.application.dto.FreelanceProjectPageResponse;
import achanvear.peru.freelance.application.dto.FreelanceProjectResponse;
import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;
import achanvear.peru.freelance.application.dto.ProjectAiSuggestionResponse;
import achanvear.peru.freelance.application.dto.ProposalAiSuggestionResponse;
import achanvear.peru.freelance.application.port.out.StoragePort;
import achanvear.peru.freelance.application.query.FreelanceProjectSearchQuery;
import achanvear.peru.jobs.application.JobAiSuggestionService;
import achanvear.peru.jobs.web.request.JobAiSuggestionRequest;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/freelance")
public class FreelanceController {

    private final CreateFreelancerProfileUseCase createFreelancerProfileUseCase;
    private final UpdateFreelancerProfileUseCase updateFreelancerProfileUseCase;
    private final GetMyFreelancerProfileUseCase getMyFreelancerProfileUseCase;
    private final GetFreelancerProfileByIdUseCase getFreelancerProfileByIdUseCase;
    private final SubmitProposalUseCase submitProposalUseCase;
    private final SearchFreelanceProjectsUseCase searchFreelanceProjectsUseCase;
    private final GetFreelanceProjectDetailUseCase getFreelanceProjectDetailUseCase;
    private final CreateFreelanceProjectUseCase createFreelanceProjectUseCase;
    private final UpdateFreelanceProjectUseCase updateFreelanceProjectUseCase;
    private final AcceptProposalUseCase acceptProposalUseCase;
    private final GetMyProposalsUseCase getMyProposalsUseCase;
    private final PauseResumeProjectUseCase pauseResumeProjectUseCase;
    private final StoragePort storagePort;
    private final JobAiSuggestionService jobAiSuggestionService;

    public FreelanceController(
            CreateFreelancerProfileUseCase createFreelancerProfileUseCase,
            UpdateFreelancerProfileUseCase updateFreelancerProfileUseCase,
            GetMyFreelancerProfileUseCase getMyFreelancerProfileUseCase,
            GetFreelancerProfileByIdUseCase getFreelancerProfileByIdUseCase,
            SubmitProposalUseCase submitProposalUseCase,
            SearchFreelanceProjectsUseCase searchFreelanceProjectsUseCase,
            GetFreelanceProjectDetailUseCase getFreelanceProjectDetailUseCase,
            CreateFreelanceProjectUseCase createFreelanceProjectUseCase,
            UpdateFreelanceProjectUseCase updateFreelanceProjectUseCase,
            AcceptProposalUseCase acceptProposalUseCase,
            GetMyProposalsUseCase getMyProposalsUseCase,
            PauseResumeProjectUseCase pauseResumeProjectUseCase,
            StoragePort storagePort,
            JobAiSuggestionService jobAiSuggestionService
    ) {
        this.createFreelancerProfileUseCase = createFreelancerProfileUseCase;
        this.updateFreelancerProfileUseCase = updateFreelancerProfileUseCase;
        this.getMyFreelancerProfileUseCase = getMyFreelancerProfileUseCase;
        this.getFreelancerProfileByIdUseCase = getFreelancerProfileByIdUseCase;
        this.submitProposalUseCase = submitProposalUseCase;
        this.searchFreelanceProjectsUseCase = searchFreelanceProjectsUseCase;
        this.getFreelanceProjectDetailUseCase = getFreelanceProjectDetailUseCase;
        this.createFreelanceProjectUseCase = createFreelanceProjectUseCase;
        this.updateFreelanceProjectUseCase = updateFreelanceProjectUseCase;
        this.acceptProposalUseCase = acceptProposalUseCase;
        this.getMyProposalsUseCase = getMyProposalsUseCase;
        this.pauseResumeProjectUseCase = pauseResumeProjectUseCase;
        this.storagePort = storagePort;
        this.jobAiSuggestionService = jobAiSuggestionService;
    }

    @GetMapping("/profiles/me")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileResponse>> getMyProfile(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        FreelancerProfileResponse response = getMyFreelancerProfileUseCase.getMyProfile(
                authenticatedUser.getUserId().toString()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Freelancer profile retrieved successfully"));
    }

    @GetMapping("/profiles/{freelancerId}")
    public ResponseEntity<ApiResponse<FreelancerProfileResponse>> getFreelancerProfileById(
            @PathVariable String freelancerId
    ) {
        FreelancerProfileResponse response = getFreelancerProfileByIdUseCase.getFreelancerProfileById(freelancerId);
        return ResponseEntity.ok(ApiResponse.success(response, "Freelancer profile retrieved successfully"));
    }

    @PostMapping("/profiles")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileResponse>> createProfile(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateFreelancerProfileRequest request
    ) {
        FreelancerProfileResponse response = createFreelancerProfileUseCase.execute(
                new CreateFreelancerProfileCommand(
                        authenticatedUser.getUserId().toString(),
                        request.name(),
                        request.industry(),
                        request.specialty(),
                        request.profilePhotoUrl(),
                        request.biography(),
                        request.achievements(),
                        request.address(),
                        request.paymentMethodType(),
                        request.dni(),
                        request.curriculumUrl(),
                        request.certifications() == null ? java.util.List.of() :
                                request.certifications().stream()
                                        .map(certification -> new FreelancerCertificationCommand(
                                                certification.name(),
                                                certification.issuingOrganization(),
                                                certification.credentialUrl()
                                        ))
                                        .toList(),
                        request.skills() == null ? java.util.List.of() :
                                request.skills().stream()
                                        .map(skill -> new SkillCommand(
                                                skill.name(),
                                                skill.level(),
                                                skill.yearsOfExperience()
                                        ))
                                        .toList(),
                        request.portfolioItems() == null ? java.util.List.of() :
                                request.portfolioItems().stream()
                                        .map(item -> new PortfolioItemCommand(
                                                item.title(),
                                                item.description(),
                                                item.assetUrl(),
                                                item.projectUrl()
                                        ))
                                        .toList()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Freelancer profile created successfully"));
    }

    @PutMapping("/profiles/{freelancerId}")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileResponse>> updateProfile(
            @PathVariable String freelancerId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody UpdateFreelancerProfileRequest request
    ) {
        FreelancerProfileResponse response = updateFreelancerProfileUseCase.execute(
                new UpdateFreelancerProfileCommand(
                        freelancerId,
                        authenticatedUser.getUserId().toString(),
                        request.name(),
                        request.industry(),
                        request.specialty(),
                        request.profilePhotoUrl(),
                        request.biography(),
                        request.achievements(),
                        request.address(),
                        request.paymentMethodType(),
                        request.dni(),
                        request.curriculumUrl(),
                        request.cvData(),
                        request.certifications() == null ? java.util.List.of() :
                                request.certifications().stream()
                                        .map(certification -> new FreelancerCertificationCommand(
                                                certification.name(),
                                                certification.issuingOrganization(),
                                                certification.credentialUrl()
                                        ))
                                        .toList(),
                        request.skills() == null ? java.util.List.of() :
                                request.skills().stream()
                                        .map(skill -> new SkillCommand(
                                                skill.name(),
                                                skill.level(),
                                                skill.yearsOfExperience()
                                        ))
                                        .toList(),
                        request.portfolioItems() == null ? java.util.List.of() :
                                request.portfolioItems().stream()
                                        .map(item -> new PortfolioItemCommand(
                                                item.title(),
                                                item.description(),
                                                item.assetUrl(),
                                                item.projectUrl()
                                        ))
                                        .toList(),
                        request.availabilityStatus(),
                        request.cvVisibility(),
                        request.preferredCurrency(),
                        request.preferredPaymentMethod(),
                        request.language(),
                        request.timezone(),
                        request.notificationPreferences()
                )
        );


        return ResponseEntity.ok(ApiResponse.success(response, "Freelancer profile updated successfully"));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<FreelanceProjectResponse>> getProjectById(
            @PathVariable String projectId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        UUID authUserId = authenticatedUser != null ? authenticatedUser.getUserId() : null;
        FreelanceProjectResponse response = getFreelanceProjectDetailUseCase.getById(projectId, authUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Freelance project retrieved successfully"));
    }

    @PostMapping("/projects")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<FreelanceProjectResponse>> createProject(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateFreelanceProjectRequest request
    ) {
        FreelanceProjectResponse response = createFreelanceProjectUseCase.execute(
                new CreateFreelanceProjectCommand(
                        authenticatedUser.getUserId().toString(),
                        request.title(),
                        request.description(),
                        request.category(),
                        request.subcategory(),
                        request.budget(),
                        request.estimatedDays(),
                        request.experienceLevel(),
                        request.skills() == null ? java.util.List.of() : request.skills(),
                        request.budgetType(),
                        request.modality(),
                        request.providerType(),
                        request.attachments() == null ? java.util.List.of() : request.attachments(),
                        request.currency(),
                        request.language(),
                        request.minBudget(),
                        request.maxBudget(),
                        request.hourlyRateMin(),
                        request.hourlyRateMax()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Freelance project created successfully"));
    }

    @PutMapping("/projects/{projectId}")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<FreelanceProjectResponse>> updateProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody UpdateFreelanceProjectRequest request
    ) {
        FreelanceProjectResponse response = updateFreelanceProjectUseCase.execute(
                new UpdateFreelanceProjectCommand(
                        projectId,
                        authenticatedUser.getUserId().toString(),
                        request.title(),
                        request.description(),
                        request.category(),
                        request.subcategory(),
                        request.budget(),
                        request.estimatedDays(),
                        request.experienceLevel(),
                        request.skills() == null ? java.util.List.of() : request.skills(),
                        request.budgetType(),
                        request.modality(),
                        request.providerType(),
                        request.attachments() == null ? java.util.List.of() : request.attachments(),
                        request.currency(),
                        request.language(),
                        request.minBudget(),
                        request.maxBudget(),
                        request.hourlyRateMin(),
                        request.hourlyRateMax()
                )
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Freelance project updated successfully"));
    }

    @PostMapping("/projects/{projectId}/proposals")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelanceProjectResponse>> submitProposal(
            @PathVariable String projectId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody SubmitProposalRequest request
    ) {
        FreelanceProjectResponse response = submitProposalUseCase.execute(
                new SubmitProposalCommand(
                        projectId,
                        authenticatedUser.getUserId().toString(),
                        request.coverLetter(),
                        request.proposedBudget(),
                        request.estimatedDays(),
                        request.portfolioUrl()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Proposal submitted successfully"));
    }

    @PostMapping("/projects/{projectId}/proposals/{proposalId}/accept")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<FreelanceProjectResponse>> acceptProposal(
            @PathVariable String projectId,
            @PathVariable String proposalId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        FreelanceProjectResponse response = acceptProposalUseCase.execute(
                new AcceptProposalCommand(
                        projectId,
                        proposalId,
                        authenticatedUser.getUserId().toString()
                )
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Proposal accepted successfully"));
    }

    @GetMapping("/projects/my-proposals")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelanceProjectPageResponse>> getMyProposals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        FreelanceProjectPageResponse response = getMyProposalsUseCase.execute(
                authenticatedUser.getUserId().toString(),
                page,
                size,
                sortBy,
                sortDirection
        );

        return ResponseEntity.ok(ApiResponse.success(response, "My proposals retrieved successfully"));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<FreelanceProjectPageResponse>> searchProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        // Si el usuario autenticado es COMPANY o COMPANY_COLLABORATOR, filtrar solo sus propios proyectos
        String clientUserId = null;
        if (authenticatedUser != null && ("COMPANY".equalsIgnoreCase(authenticatedUser.getRole()) || "COMPANY_COLLABORATOR".equalsIgnoreCase(authenticatedUser.getRole()))) {
            clientUserId = authenticatedUser.getUserId().toString();
        }

        UUID authUserId = authenticatedUser != null ? authenticatedUser.getUserId() : null;

        FreelanceProjectPageResponse response = searchFreelanceProjectsUseCase.execute(
                new FreelanceProjectSearchQuery(
                        search,
                        category,
                        status,
                        page,
                        size,
                        sortBy,
                        sortDirection,
                        clientUserId
                ),
                authUserId
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Freelance projects retrieved successfully"));
    }

    @PostMapping("/storage/presigned-url")
    public ResponseEntity<ApiResponse<StoragePort.PresignedUploadResponse>> generatePresignedUploadUrl(
            @Valid @RequestBody GeneratePresignedUrlRequest request
    ) {
        StoragePort.PresignedUploadResponse response = storagePort.generatePresignedUploadUrl(
                request.folder(),
                request.fileName(),
                request.contentType()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Presigned upload url generated successfully"));
    }

    @GetMapping("/storage/presigned-download")
    public ResponseEntity<ApiResponse<StoragePort.PresignedDownloadResponse>> generatePresignedDownloadUrl(
            @RequestParam String fileKey
    ) {
        StoragePort.PresignedDownloadResponse response = storagePort.generatePresignedDownloadUrl(fileKey);
        return ResponseEntity.ok(ApiResponse.success(response, "Presigned download url generated successfully"));
    }

    @PostMapping(value = "/storage/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StoragePort.UploadResponse>> uploadFile(
            @RequestParam("folder") String folder,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            StoragePort.UploadResponse response = storagePort.uploadFile(
                    folder,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes()
            );
            return ResponseEntity.ok(ApiResponse.success(response, "File uploaded successfully"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @PostMapping("/projects/ai-suggest")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<ProjectAiSuggestionResponse>> aiSuggest(
            @Valid @RequestBody JobAiSuggestionRequest request
    ) {
        String systemPrompt = """
            Eres un asistente experto en crear proyectos freelance. A partir de la descripción del usuario,
            genera una sugerencia completa para un proyecto freelance con los siguientes campos en formato JSON:
            {
              "title": "Título del proyecto",
              "category": "Categoría (TECHNOLOGY, MARKETING, DESIGN, LEGAL, ACCOUNTING, CONSULTING, HEALTH, EDUCATION, CONSTRUCTION, LOGISTICS)",
              "subcategory": "Especialidad específica",
              "description": "Descripción detallada del proyecto",
              "skills": "Habilidades requeridas separadas por comas",
              "experienceLevel": "Nivel de experiencia (JUNIOR, INTERMEDIATE, SENIOR, EXPERT)",
              "budgetType": "Tipo de presupuesto (FIXED, HOURLY)",
              "budget": 5000,
              "minBudget": 3000,
              "maxBudget": 7000,
              "hourlyRateMin": null,
              "hourlyRateMax": null,
              "currency": "PEN",
              "language": "SPANISH",
              "estimatedDays": 30,
              "modality": "Modalidad (REMOTE, PRESENTIAL, HYBRID)",
              "providerType": "Tipo de proveedor (INDIVIDUAL, AGENCY, BOTH)"
            }
            Importante: Responde SOLO con el JSON, sin explicaciones adicionales.
            """;

        ProjectAiSuggestionResponse suggestion = jobAiSuggestionService.suggest(
                request.prompt(),
                systemPrompt,
                ProjectAiSuggestionResponse.class
        );

        return ResponseEntity.ok(ApiResponse.success(suggestion, "AI suggestion generated successfully"));
    }

    @PostMapping("/proposals/ai-suggest")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<ProposalAiSuggestionResponse>> aiSuggestProposal(
            @Valid @RequestBody JobAiSuggestionRequest request
    ) {
        String systemPrompt = """
            Eres un asistente experto en ayudar a freelancers a crear propuestas ganadoras para proyectos.
            A partir de la descripción del proyecto que el freelancer quiere responder, genera una sugerencia
            de propuesta con los siguientes campos en formato JSON:

            {
              "coverLetter": "Carta de presentación profesional y persuasiva (mínimo 150 caracteres, máximo 1000). Explica por qué el freelancer es ideal para el proyecto, qué experiencia aporta y cómo planea ejecutarlo.",
              "proposedBudget": numero entero del presupuesto sugerido en soles,
              "estimatedDays": numero entero de días estimados para la entrega
            }

            REGLAS:
            - coverLetter: Debe ser profesional, específica y persuasiva. Entre 150 y 1000 caracteres.
            - proposedBudget: Debe ser un número razonable para el proyecto descrito en Perú.
            - estimatedDays: Debe ser un número realista de días hábiles.
            - Responde SOLO con el JSON, sin texto adicional, sin bloques markdown.
            - Todos los textos en español.

            Devuelve SOLO el JSON, sin explicaciones adicionales.
            """;

        ProposalAiSuggestionResponse suggestion = jobAiSuggestionService.suggest(
                request.prompt(),
                systemPrompt,
                ProposalAiSuggestionResponse.class
        );

        return ResponseEntity.ok(ApiResponse.success(suggestion, "AI proposal suggestion generated successfully"));
    }

    @PatchMapping("/projects/{projectId}/pause")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<Void>> pauseProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        pauseResumeProjectUseCase.pauseProject(
                projectId,
                authenticatedUser.getUserId().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "Project paused successfully"));
    }

    @PatchMapping("/projects/{projectId}/resume")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<Void>> resumeProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        pauseResumeProjectUseCase.resumeProject(
                projectId,
                authenticatedUser.getUserId().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "Project resumed successfully"));
    }

    @DeleteMapping("/projects/{projectId}")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable String projectId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        pauseResumeProjectUseCase.deleteProject(
                projectId,
                authenticatedUser.getUserId().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }
}
