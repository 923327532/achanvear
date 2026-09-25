package achanvear.peru.services.web;

import achanvear.peru.jobs.application.JobAiSuggestionService;
import achanvear.peru.services.infrastructure.persistence.ServiceJpaEntity;
import achanvear.peru.services.infrastructure.persistence.ServiceJpaRepository;
import achanvear.peru.services.infrastructure.persistence.ServicePlanJpaEntity;
import achanvear.peru.services.infrastructure.persistence.ServicePlanJpaRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/services")
public class ServiceController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServiceController.class);

    private final ServiceJpaRepository serviceRepository;
    private final ServicePlanJpaRepository planRepository;
    private final JobAiSuggestionService jobAiSuggestionService;

    public ServiceController(ServiceJpaRepository serviceRepository, ServicePlanJpaRepository planRepository, JobAiSuggestionService jobAiSuggestionService) {
        this.serviceRepository = serviceRepository;
        this.planRepository = planRepository;
        this.jobAiSuggestionService = jobAiSuggestionService;
    }

    // ─── GET /services/my ──────────────────────────────────────────────────────
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getMyServices(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID userId = user.getUserId();
        List<ServiceJpaEntity> entities = serviceRepository
                .findByFreelancerUserIdAndStatusNotOrderByCreatedAtDesc(userId, "DRAFT");
        List<ServiceResponse> response = entities.stream().map(this::toServiceResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(response, "Services retrieved successfully"));
    }

    // ─── GET /services/drafts ──────────────────────────────────────────────────
    @GetMapping("/drafts")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getDrafts(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID userId = user.getUserId();
        List<ServiceJpaEntity> entities = serviceRepository
                .findByFreelancerUserIdAndStatusOrderByCreatedAtDesc(userId, "DRAFT");
        List<ServiceResponse> response = entities.stream().map(this::toServiceResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(response, "Drafts retrieved successfully"));
    }

    // ─── GET /services/stats ───────────────────────────────────────────────────
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<ServiceStatsResponse>> getStats(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID userId = user.getUserId();
        long activeServices = serviceRepository.countByFreelancerUserIdAndStatus(userId, "ACTIVE");
        long totalSales = serviceRepository.sumSalesByFreelancerUserId(userId);
        double averageRating = serviceRepository.avgRatingByFreelancerUserId(userId);
        long totalViews = serviceRepository.sumViewsByFreelancerUserId(userId);

        ServiceStatsResponse stats = new ServiceStatsResponse(
                activeServices, totalSales, averageRating, totalViews
        );
        return ResponseEntity.ok(ApiResponse.success(stats, "Stats retrieved successfully"));
    }

    // ─── GET /services (explore) ───────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedServicesResponse>> explore(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String normalizedSearch = search != null && !search.isBlank() ? search.trim() : null;
        String pattern = normalizedSearch != null ? "%" + normalizedSearch.toLowerCase() + "%" : null;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ServiceJpaEntity> result = serviceRepository.findActiveServices(pattern, category, pageRequest);

        List<ExploreServiceResponse> items = result.getContent().stream()
                .map(this::toExploreResponse)
                .toList();

        PaginatedServicesResponse paginated = new PaginatedServicesResponse(
                items, result.getTotalElements(), result.getNumber(),
                result.getSize(), result.getTotalPages()
        );
        return ResponseEntity.ok(ApiResponse.success(paginated, "Services retrieved successfully"));
    }

    // ─── GET /services/{id} ────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceDetailResponse>> getServiceDetail(
            @PathVariable String id
    ) {
        UUID serviceId = UUID.fromString(id);
        ServiceJpaEntity entity = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        List<ServicePlanJpaEntity> plans = planRepository.findByServiceIdOrderBySortOrderAsc(serviceId);
        ServiceDetailResponse response = toServiceDetailResponse(entity, plans);
        return ResponseEntity.ok(ApiResponse.success(response, "Service detail retrieved"));
    }

    // ─── POST /services ────────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<ServiceResponse>> create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateServiceRequest request,
            @RequestParam(defaultValue = "false") boolean publish
    ) {
        ServiceJpaEntity entity = new ServiceJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setFreelancerUserId(user.getUserId());
        mapRequestToEntity(request, entity);
        entity.setStatus(publish ? "ACTIVE" : "DRAFT");
        entity.setViews(0);
        entity.setSales(0);
        entity.setRating(BigDecimal.ZERO);
        entity.setReviewCount(0);

        ServiceJpaEntity saved = serviceRepository.save(entity);

        // Save plans
        if (request.plans() != null) {
            for (int i = 0; i < request.plans().size(); i++) {
                PlanRequest plan = request.plans().get(i);
                ServicePlanJpaEntity planEntity = new ServicePlanJpaEntity();
                planEntity.setId(UUID.randomUUID());
                planEntity.setServiceId(saved.getId());
                planEntity.setName(plan.name());
                planEntity.setDescription(plan.description());
                planEntity.setPrice(plan.price());
                planEntity.setDeliveryDays(plan.deliveryDays());
                planEntity.setFeatures(plan.features() != null ? String.join("||", plan.features()) : null);
                planEntity.setSortOrder(i);
                planRepository.save(planEntity);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toServiceResponse(saved), "Service created successfully"));
    }

    // ─── PUT /services/{id} ────────────────────────────────────────────────────
    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpdateServiceRequest request
    ) {
        UUID serviceId = UUID.fromString(id);
        ServiceJpaEntity entity = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        if (!entity.getFreelancerUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("You can only update your own services"));
        }

        if (request.title() != null) entity.setTitle(request.title());
        if (request.shortDescription() != null) entity.setShortDescription(request.shortDescription());
        if (request.description() != null) entity.setDescription(request.description());
        if (request.category() != null) entity.setCategory(request.category());
        if (request.subcategory() != null) entity.setSubcategory(request.subcategory());
        if (request.tags() != null) entity.setTags(String.join(",", request.tags()));
        if (request.basePrice() != null) entity.setBasePrice(request.basePrice());
        if (request.deliveryDays() != null) entity.setDeliveryDays(request.deliveryDays());
        if (request.status() != null) entity.setStatus(request.status());
        if (request.imageUrls() != null) entity.setImageUrls(String.join(",", request.imageUrls()));
        if (request.videoUrls() != null) entity.setVideoUrls(String.join(",", request.videoUrls()));
        if (request.pdfUrls() != null) entity.setPdfUrls(String.join(",", request.pdfUrls()));
        if (request.certificateUrls() != null) entity.setCertificateUrls(String.join(",", request.certificateUrls()));
        if (request.modality() != null) entity.setModality(request.modality());
        if (request.coverageType() != null) entity.setCoverageType(request.coverageType());
        if (request.coverageDetails() != null) entity.setCoverageDetails(request.coverageDetails());
        if (request.schedule() != null) entity.setSchedule(request.schedule());
        if (request.billingType() != null) entity.setBillingType(request.billingType());
        if (request.currency() != null) entity.setCurrency(request.currency());
        if (request.whatsapp() != null) entity.setWhatsapp(request.whatsapp());
        if (request.phone() != null) entity.setPhone(request.phone());
        if (request.emailContact() != null) entity.setEmailContact(request.emailContact());
        if (request.faqs() != null) entity.setFaqs(request.faqs());
        if (request.warrantyInfo() != null) entity.setWarrantyInfo(request.warrantyInfo());
        if (request.cancellationPolicy() != null) entity.setCancellationPolicy(request.cancellationPolicy());
        if (request.supportInfo() != null) entity.setSupportInfo(request.supportInfo());
        if (request.responseTime() != null) entity.setResponseTime(request.responseTime());
        if (request.isFeatured() != null) entity.setIsFeatured(request.isFeatured());
        if (request.isPremium() != null) entity.setIsPremium(request.isPremium());
        if (request.isAvailable() != null) entity.setIsAvailable(request.isAvailable());
        if (request.availableImmediately() != null) entity.setAvailableImmediately(request.availableImmediately());

        // Update plans
        if (request.plans() != null) {
            planRepository.deleteByServiceId(serviceId);
            for (int i = 0; i < request.plans().size(); i++) {
                PlanRequest plan = request.plans().get(i);
                ServicePlanJpaEntity planEntity = new ServicePlanJpaEntity();
                planEntity.setId(UUID.randomUUID());
                planEntity.setServiceId(serviceId);
                planEntity.setName(plan.name());
                planEntity.setDescription(plan.description());
                planEntity.setPrice(plan.price());
                planEntity.setDeliveryDays(plan.deliveryDays());
                planEntity.setFeatures(plan.features() != null ? String.join("||", plan.features()) : null);
                planEntity.setSortOrder(i);
                planRepository.save(planEntity);
            }
        }

        ServiceJpaEntity saved = serviceRepository.save(entity);
        return ResponseEntity.ok(ApiResponse.success(toServiceResponse(saved), "Service updated successfully"));
    }

    // ─── POST /services/ai-suggest ─────────────────────────────────────────────
    @PostMapping("/ai-suggest")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<AiSuggestResponse>> aiSuggest(
            @Valid @RequestBody AiSuggestRequest request
    ) {
        String systemPrompt = """
            Eres un asistente experto en ayudar a freelancers a crear servicios profesionales.
            A partir de la descripción del usuario, genera una sugerencia completa para un servicio
            con los siguientes campos en formato JSON:

            {
              "title": "Título del servicio profesional (máx. 80 caracteres)",
              "shortDescription": "Descripción corta y atractiva (máx. 300 caracteres)",
              "description": "Descripción detallada del servicio, beneficios y experiencia (2-4 párrafos)",
              "category": "Categoría (TECHNOLOGY, MARKETING, DESIGN, LEGAL, ACCOUNTING, CONSULTING, HEALTH, EDUCATION, CONSTRUCTION, LOGISTICS)",
              "subcategory": "Especialidad específica (ej: Desarrollo Web, Diseño UX/UI)",
              "tags": ["etiqueta1", "etiqueta2", "etiqueta3"],
              "modality": "Modalidad (REMOTE, PRESENTIAL, HYBRID)",
              "coverageType": "Cobertura (LOCAL, NATIONAL, INTERNATIONAL)",
              "coverageDetails": "Detalles de cobertura geográfica",
              "schedule": "Horarios de atención (ej: Lunes a Viernes 9am - 6pm)",
              "deliveryDays": 7,
              "availableImmediately": true,
              "basePrice": 150,
              "billingType": "Tipo de cobro (PER_HOUR, PER_DAY, PER_PROJECT, MONTHLY, CUSTOM)",
              "currency": "PEN",
              "plans": [
                {
                  "name": "Básico",
                  "description": "Descripción del plan básico",
                  "price": 100,
                  "deliveryDays": 5,
                  "features": ["Característica 1", "Característica 2"]
                }
              ],
              "whatsapp": "",
              "phone": "",
              "emailContact": "",
              "responseTime": "Tiempo de respuesta (ej: En menos de 24 horas)",
              "faqs": "Preguntas frecuentes en formato JSON string",
              "warrantyInfo": "Información de garantía",
              "cancellationPolicy": "Políticas de cancelación",
              "supportInfo": "Información de soporte post-servicio"
            }

            REGLAS:
            - title: Máximo 80 caracteres, claro y específico.
            - shortDescription: Máximo 300 caracteres, atractivo.
            - description: Detallada, profesional, 2-4 párrafos.
            - category: Debe ser una de las categorías listadas.
            - tags: Entre 2 y 5 etiquetas relevantes.
            - deliveryDays: Número entero de días.
            - basePrice: Número entero, precio en soles.
            - plans: Puede tener 0 a 3 planes. Cada plan con name, description, price, deliveryDays, features.
            - Responde SOLO con el JSON, sin texto adicional, sin bloques markdown.
            - Todos los textos en español.
            """;

        AiSuggestResponse suggestion;
        try {
            suggestion = jobAiSuggestionService.suggest(
                    request.prompt(),
                    systemPrompt,
                    AiSuggestResponse.class
            );
        } catch (RuntimeException exception) {
            LOGGER.warn("AI service suggestion failed. Returning local fallback. Cause: {}", exception.getMessage());
            suggestion = buildFallbackServiceSuggestion(request.prompt());
        }

        return ResponseEntity.ok(ApiResponse.success(suggestion, "AI suggestion generated successfully"));
    }

    private AiSuggestResponse buildFallbackServiceSuggestion(String prompt) {
        String cleanPrompt = prompt == null ? "" : prompt.trim().replaceAll("\\s+", " ");
        String titleBase = cleanPrompt.isBlank() ? "Servicio profesional personalizado" : cleanPrompt;
        String title = titleBase.length() > 80 ? titleBase.substring(0, 77).trim() + "..." : titleBase;
        String lowerPrompt = titleBase.toLowerCase(Locale.ROOT);

        String category = inferServiceCategory(lowerPrompt);
        String subcategory = switch (category) {
            case "TECHNOLOGY" -> "Desarrollo y soporte digital";
            case "MARKETING" -> "Marketing digital";
            case "DESIGN" -> "Diseno grafico y branding";
            case "LEGAL" -> "Asesoria legal";
            case "ACCOUNTING" -> "Contabilidad y finanzas";
            case "EDUCATION" -> "Capacitacion personalizada";
            case "CONSTRUCTION" -> "Servicios tecnicos";
            case "LOGISTICS" -> "Operacion y logistica";
            case "HEALTH" -> "Bienestar y salud";
            default -> "Consultoria especializada";
        };

        List<String> tags = new ArrayList<>(List.of(subcategory, "Servicio profesional", "Freelance"));
        String description = """
                Ofrezco un servicio profesional orientado a resolver la necesidad indicada por el cliente: %s.

                La propuesta incluye levantamiento de requerimientos, ejecucion ordenada, comunicacion constante y entrega final con recomendaciones claras para que puedas continuar el trabajo sin fricciones.
                """.formatted(titleBase.isBlank() ? "un requerimiento especializado" : titleBase);

        AiPlanSuggestion basicPlan = new AiPlanSuggestion(
                "Basico",
                "Revision inicial, ejecucion del alcance principal y entrega final.",
                BigDecimal.valueOf(150),
                5,
                List.of("Analisis de requerimientos", "Entrega principal", "Una ronda de ajustes")
        );

        return new AiSuggestResponse(
                title,
                "Servicio profesional con alcance claro, entrega ordenada y comunicacion constante.",
                description,
                category,
                subcategory,
                tags,
                "REMOTE",
                "NATIONAL",
                "Atencion remota para clientes en Peru.",
                "Lunes a viernes de 9:00 a.m. a 6:00 p.m.",
                5,
                true,
                BigDecimal.valueOf(150),
                "PER_PROJECT",
                "PEN",
                List.of(basicPlan),
                "",
                "",
                "",
                "En menos de 24 horas",
                "[{\"question\":\"Que necesito para empezar?\",\"answer\":\"Una descripcion breve del objetivo, referencias y cualquier material disponible.\"}]",
                "Incluye una ronda de ajustes sobre el alcance acordado.",
                "La cancelacion se coordina segun el avance realizado.",
                "Soporte por mensaje durante la ejecucion del servicio."
        );
    }

    private String inferServiceCategory(String prompt) {
        if (prompt.contains("web") || prompt.contains("app") || prompt.contains("software") || prompt.contains("sistema") || prompt.contains("program")) {
            return "TECHNOLOGY";
        }
        if (prompt.contains("marketing") || prompt.contains("redes") || prompt.contains("publicidad") || prompt.contains("ventas")) {
            return "MARKETING";
        }
        if (prompt.contains("logo") || prompt.contains("diseno") || prompt.contains("diseño") || prompt.contains("marca") || prompt.contains("ux")) {
            return "DESIGN";
        }
        if (prompt.contains("legal") || prompt.contains("contrato") || prompt.contains("abogado")) {
            return "LEGAL";
        }
        if (prompt.contains("contable") || prompt.contains("contabilidad") || prompt.contains("tribut")) {
            return "ACCOUNTING";
        }
        if (prompt.contains("clase") || prompt.contains("curso") || prompt.contains("capacit")) {
            return "EDUCATION";
        }
        if (prompt.contains("obra") || prompt.contains("constru")) {
            return "CONSTRUCTION";
        }
        if (prompt.contains("logistica") || prompt.contains("logística") || prompt.contains("transporte")) {
            return "LOGISTICS";
        }
        if (prompt.contains("salud") || prompt.contains("nutric") || prompt.contains("psic")) {
            return "HEALTH";
        }
        return "CONSULTING";
    }
    
    // ─── DELETE /services/{id} ─────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        UUID serviceId = UUID.fromString(id);
        ServiceJpaEntity entity = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NoSuchElementException("Service not found"));

        if (!entity.getFreelancerUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("You can only delete your own services"));
        }

        serviceRepository.delete(entity);
        return ResponseEntity.ok(ApiResponse.success(null, "Service deleted successfully"));
    }

    // ─── Mappers ───────────────────────────────────────────────────────────────

    private void mapRequestToEntity(CreateServiceRequest request, ServiceJpaEntity entity) {
        entity.setTitle(request.title());
        entity.setShortDescription(request.shortDescription());
        entity.setDescription(request.description());
        entity.setCategory(request.category());
        entity.setSubcategory(request.subcategory());
        entity.setTags(request.tags() != null ? String.join(",", request.tags()) : null);
        entity.setBasePrice(request.basePrice());
        entity.setDeliveryDays(request.deliveryDays());
        entity.setImageUrls(request.imageUrls() != null ? String.join(",", request.imageUrls()) : null);
        entity.setVideoUrls(request.videoUrls() != null ? String.join(",", request.videoUrls()) : null);
        entity.setPdfUrls(request.pdfUrls() != null ? String.join(",", request.pdfUrls()) : null);
        entity.setCertificateUrls(request.certificateUrls() != null ? String.join(",", request.certificateUrls()) : null);
        entity.setModality(request.modality());
        entity.setCoverageType(request.coverageType());
        entity.setCoverageDetails(request.coverageDetails());
        entity.setSchedule(request.schedule());
        entity.setBillingType(request.billingType());
        entity.setCurrency(request.currency());
        entity.setWhatsapp(request.whatsapp());
        entity.setPhone(request.phone());
        entity.setEmailContact(request.emailContact());
        entity.setFaqs(request.faqs());
        entity.setWarrantyInfo(request.warrantyInfo());
        entity.setCancellationPolicy(request.cancellationPolicy());
        entity.setSupportInfo(request.supportInfo());
        entity.setResponseTime(request.responseTime());
        entity.setIsFeatured(request.isFeatured() != null ? request.isFeatured() : false);
        entity.setIsPremium(request.isPremium() != null ? request.isPremium() : false);
        entity.setIsAvailable(request.isAvailable() != null ? request.isAvailable() : true);
        entity.setAvailableImmediately(request.availableImmediately() != null ? request.availableImmediately() : false);
    }

    private ServiceResponse toServiceResponse(ServiceJpaEntity entity) {
        return new ServiceResponse(
                entity.getId().toString(),
                entity.getTitle(),
                entity.getShortDescription(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getSubcategory(),
                entity.getTags() != null ? Arrays.asList(entity.getTags().split(",")) : List.of(),
                entity.getStatus(),
                entity.getBasePrice(),
                entity.getDeliveryDays(),
                entity.getViews(),
                entity.getSales(),
                entity.getRating(),
                entity.getReviewCount(),
                entity.getImageUrls() != null ? Arrays.asList(entity.getImageUrls().split(",")) : List.of(),
                entity.getVideoUrls() != null ? Arrays.asList(entity.getVideoUrls().split(",")) : List.of(),
                entity.getPdfUrls() != null ? Arrays.asList(entity.getPdfUrls().split(",")) : List.of(),
                entity.getCertificateUrls() != null ? Arrays.asList(entity.getCertificateUrls().split(",")) : List.of(),
                entity.getModality(),
                entity.getCoverageType(),
                entity.getCoverageDetails(),
                entity.getSchedule(),
                entity.getBillingType(),
                entity.getCurrency(),
                entity.getWhatsapp(),
                entity.getPhone(),
                entity.getEmailContact(),
                entity.getFaqs(),
                entity.getWarrantyInfo(),
                entity.getCancellationPolicy(),
                entity.getSupportInfo(),
                entity.getResponseTime(),
                entity.getIsFeatured(),
                entity.getIsPremium(),
                entity.getIsAvailable(),
                entity.getAvailableImmediately(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private ExploreServiceResponse toExploreResponse(ServiceJpaEntity entity) {
        return new ExploreServiceResponse(
                entity.getId().toString(),
                entity.getTitle(),
                entity.getShortDescription(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getSubcategory(),
                entity.getTags() != null ? Arrays.asList(entity.getTags().split(",")) : List.of(),
                entity.getStatus(),
                entity.getBasePrice(),
                entity.getDeliveryDays(),
                entity.getViews(),
                entity.getSales(),
                entity.getRating(),
                entity.getReviewCount(),
                entity.getImageUrls() != null ? Arrays.asList(entity.getImageUrls().split(",")) : List.of(),
                entity.getModality(),
                entity.getCoverageType(),
                entity.getBillingType(),
                entity.getCurrency(),
                entity.getResponseTime(),
                entity.getIsFeatured(),
                entity.getIsPremium(),
                entity.getAvailableImmediately(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                new FreelancerInfo(
                        entity.getFreelancerUserId().toString(),
                        "", "", null, false,
                        entity.getPhone(),
                        entity.getWhatsapp()
                )
        );
    }

    private ServiceDetailResponse toServiceDetailResponse(ServiceJpaEntity entity, List<ServicePlanJpaEntity> plans) {
        List<PlanResponse> planResponses = plans.stream()
                .map(p -> new PlanResponse(
                        p.getId().toString(),
                        p.getName(),
                        p.getDescription(),
                        p.getPrice(),
                        p.getDeliveryDays(),
                        p.getFeatures() != null ? Arrays.asList(p.getFeatures().split("\\|\\|")) : List.of(),
                        p.getIsActive()
                ))
                .toList();

        return new ServiceDetailResponse(
                entity.getId().toString(),
                entity.getFreelancerUserId().toString(),
                entity.getTitle(),
                entity.getShortDescription(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getSubcategory(),
                entity.getTags() != null ? Arrays.asList(entity.getTags().split(",")) : List.of(),
                entity.getStatus(),
                entity.getBasePrice(),
                entity.getDeliveryDays(),
                entity.getViews(),
                entity.getSales(),
                entity.getRating(),
                entity.getReviewCount(),
                entity.getImageUrls() != null ? Arrays.asList(entity.getImageUrls().split(",")) : List.of(),
                entity.getVideoUrls() != null ? Arrays.asList(entity.getVideoUrls().split(",")) : List.of(),
                entity.getPdfUrls() != null ? Arrays.asList(entity.getPdfUrls().split(",")) : List.of(),
                entity.getCertificateUrls() != null ? Arrays.asList(entity.getCertificateUrls().split(",")) : List.of(),
                entity.getModality(),
                entity.getCoverageType(),
                entity.getCoverageDetails(),
                entity.getSchedule(),
                entity.getBillingType(),
                entity.getCurrency(),
                entity.getWhatsapp(),
                entity.getPhone(),
                entity.getEmailContact(),
                entity.getFaqs(),
                entity.getWarrantyInfo(),
                entity.getCancellationPolicy(),
                entity.getSupportInfo(),
                entity.getResponseTime(),
                entity.getIsFeatured(),
                entity.getIsPremium(),
                entity.getIsAvailable(),
                entity.getAvailableImmediately(),
                planResponses,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────

record ServiceResponse(
        String id, String title, String shortDescription, String description,
        String category, String subcategory, List<String> tags,
        String status, BigDecimal basePrice, Integer deliveryDays,
        Integer views, Integer sales, BigDecimal rating, Integer reviewCount,
        List<String> imageUrls, List<String> videoUrls, List<String> pdfUrls, List<String> certificateUrls,
        String modality, String coverageType, String coverageDetails, String schedule,
        String billingType, String currency,
        String whatsapp, String phone, String emailContact,
        String faqs, String warrantyInfo, String cancellationPolicy, String supportInfo,
        String responseTime,
        Boolean isFeatured, Boolean isPremium, Boolean isAvailable, Boolean availableImmediately,
        Instant createdAt, Instant updatedAt
) {}

record ExploreServiceResponse(
        String id, String title, String shortDescription, String description,
        String category, String subcategory, List<String> tags,
        String status, BigDecimal basePrice, Integer deliveryDays,
        Integer views, Integer sales, BigDecimal rating, Integer reviewCount,
        List<String> imageUrls,
        String modality, String coverageType, String billingType, String currency,
        String responseTime,
        Boolean isFeatured, Boolean isPremium, Boolean availableImmediately,
        Instant createdAt, Instant updatedAt,
        FreelancerInfo freelancer
) {}

record ServiceDetailResponse(
        String id, String freelancerUserId,
        String title, String shortDescription, String description,
        String category, String subcategory, List<String> tags,
        String status, BigDecimal basePrice, Integer deliveryDays,
        Integer views, Integer sales, BigDecimal rating, Integer reviewCount,
        List<String> imageUrls, List<String> videoUrls, List<String> pdfUrls, List<String> certificateUrls,
        String modality, String coverageType, String coverageDetails, String schedule,
        String billingType, String currency,
        String whatsapp, String phone, String emailContact,
        String faqs, String warrantyInfo, String cancellationPolicy, String supportInfo,
        String responseTime,
        Boolean isFeatured, Boolean isPremium, Boolean isAvailable, Boolean availableImmediately,
        List<PlanResponse> plans,
        Instant createdAt, Instant updatedAt
) {}

record PlanResponse(
        String id, String name, String description,
        BigDecimal price, Integer deliveryDays,
        List<String> features, Boolean isActive
) {}

record FreelancerInfo(String id, String name, String title, String avatarUrl, boolean verified, String phone, String whatsapp) {}

record ServiceStatsResponse(long activeServices, long totalSales, double averageRating, long totalViews) {}

record PaginatedServicesResponse(
        List<ExploreServiceResponse> items, long total, int page, int size, int totalPages
) {}

record PlanRequest(
        @NotBlank String name,
        String description,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        Integer deliveryDays,
        List<String> features
) {}

record CreateServiceRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 300) String shortDescription,
        @NotBlank @Size(max = 5000) String description,
        @NotBlank @Size(max = 50) String category,
        @Size(max = 100) String subcategory,
        List<String> tags,
        @NotNull @DecimalMin("0.01") BigDecimal basePrice,
        @NotNull @Min(1) Integer deliveryDays,
        List<String> imageUrls,
        List<String> videoUrls,
        List<String> pdfUrls,
        List<String> certificateUrls,
        String modality,
        String coverageType,
        String coverageDetails,
        String schedule,
        String billingType,
        String currency,
        String whatsapp,
        String phone,
        String emailContact,
        String faqs,
        String warrantyInfo,
        String cancellationPolicy,
        String supportInfo,
        String responseTime,
        Boolean isFeatured,
        Boolean isPremium,
        Boolean isAvailable,
        Boolean availableImmediately,
        List<PlanRequest> plans
) {}

record UpdateServiceRequest(
        String title,
        String shortDescription,
        String description,
        String category,
        String subcategory,
        List<String> tags,
        BigDecimal basePrice,
        Integer deliveryDays,
        String status,
        List<String> imageUrls,
        List<String> videoUrls,
        List<String> pdfUrls,
        List<String> certificateUrls,
        String modality,
        String coverageType,
        String coverageDetails,
        String schedule,
        String billingType,
        String currency,
        String whatsapp,
        String phone,
        String emailContact,
        String faqs,
        String warrantyInfo,
        String cancellationPolicy,
        String supportInfo,
        String responseTime,
        Boolean isFeatured,
        Boolean isPremium,
        Boolean isAvailable,
        Boolean availableImmediately,
        List<PlanRequest> plans
) {}

// ─── AI Suggest DTOs ────────────────────────────────────────────────────────────

record AiSuggestRequest(
        @NotBlank @Size(max = 2000) String prompt
) {}

// DTO separado para la respuesta de IA (sin validaciones para que Jackson deserialice bien)
record AiPlanSuggestion(
        String name,
        String description,
        BigDecimal price,
        Integer deliveryDays,
        List<String> features
) {}

record AiSuggestResponse(
        String title,
        String shortDescription,
        String description,
        String category,
        String subcategory,
        List<String> tags,
        String modality,
        String coverageType,
        String coverageDetails,
        String schedule,
        Integer deliveryDays,
        Boolean availableImmediately,
        BigDecimal basePrice,
        String billingType,
        String currency,
        List<AiPlanSuggestion> plans,
        String whatsapp,
        String phone,
        String emailContact,
        String responseTime,
        String faqs,
        String warrantyInfo,
        String cancellationPolicy,
        String supportInfo
) {}
