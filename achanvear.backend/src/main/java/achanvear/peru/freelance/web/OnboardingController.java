package achanvear.peru.freelance.web;

import achanvear.peru.freelance.application.CreateFreelancerProfileUseCase;
import achanvear.peru.freelance.application.command.CreateFreelancerProfileCommand;
import achanvear.peru.freelance.application.command.FreelancerCertificationCommand;
import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;
import achanvear.peru.freelance.infrastructure.persistence.IndustrySpecialtyRepository;
import achanvear.peru.payments.application.dto.PlanOptionResponse;
import achanvear.peru.payments.application.port.in.GetAvailablePlansUseCase;
import achanvear.peru.payments.infrastructure.persistence.AIAgentRepository;
import achanvear.peru.payments.infrastructure.persistence.PlanRepository;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/onboarding")
public class OnboardingController {

    private final CreateFreelancerProfileUseCase createFreelancerProfileUseCase;
    private final GetAvailablePlansUseCase getAvailablePlansUseCase;
    private final PlanRepository planRepository;
    private final AIAgentRepository aiAgentRepository;
    private final IndustrySpecialtyRepository industrySpecialtyRepository;

    public OnboardingController(
            CreateFreelancerProfileUseCase createFreelancerProfileUseCase,
            GetAvailablePlansUseCase getAvailablePlansUseCase,
            PlanRepository planRepository,
            AIAgentRepository aiAgentRepository,
            IndustrySpecialtyRepository industrySpecialtyRepository
    ) {
        this.createFreelancerProfileUseCase = createFreelancerProfileUseCase;
        this.getAvailablePlansUseCase = getAvailablePlansUseCase;
        this.planRepository = planRepository;
        this.aiAgentRepository = aiAgentRepository;
        this.industrySpecialtyRepository = industrySpecialtyRepository;
    }

    @GetMapping("/industries")
    public ResponseEntity<ApiResponse<List<String>>> getIndustries() {
        List<String> industries = industrySpecialtyRepository.findDistinctIndustries();
        return ResponseEntity.ok(ApiResponse.success(industries, "Industries retrieved"));
    }

    @GetMapping("/specialties/{industry}")
    public ResponseEntity<ApiResponse<List<String>>> getSpecialtiesByIndustry(
            @PathVariable String industry
    ) {
        List<String> specialties = industrySpecialtyRepository.findByIndustry(industry)
                .stream()
                .map(s -> s.getSpecialty())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(specialties, "Specialties retrieved"));
    }

    @PostMapping("/industry")
    public ResponseEntity<ApiResponse<Void>> saveIndustry(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody Map<String, String> body
    ) {
        String industry = body.get("industry");
        return ResponseEntity.ok(ApiResponse.success(null, "Industry saved"));
    }

    @PostMapping("/specialty")
    public ResponseEntity<ApiResponse<Void>> saveSpecialty(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody Map<String, String> body
    ) {
        String specialty = body.get("specialty");
        return ResponseEntity.ok(ApiResponse.success(null, "Specialty saved"));
    }

    @PatchMapping("/personalize")
    public ResponseEntity<ApiResponse<Void>> personalizeProfile(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody Map<String, Object> body
    ) {
        return ResponseEntity.ok(ApiResponse.success(null, "Profile personalized"));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        Map<String, Object> status = Map.of(
                "step", 0,
                "industry", false,
                "specialty", false,
                "profile", false,
                "personalize", false
        );
        return ResponseEntity.ok(ApiResponse.success(status, "Onboarding status"));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanOptionResponse>>> getPlans() {
        List<PlanOptionResponse> plans = getAvailablePlansUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(plans, "Plans retrieved"));
    }

    @PostMapping("/plan")
    public ResponseEntity<ApiResponse<Void>> selectPlan(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody Map<String, String> body
    ) {
        String planId = body.get("planId");
        String billingCycle = body.get("billingCycle");
        return ResponseEntity.ok(ApiResponse.success(null, "Plan selected"));
    }

    @PostMapping("/payment-method")
    public ResponseEntity<ApiResponse<Void>> savePaymentMethod(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody Map<String, String> body
    ) {
        String paymentMethod = body.get("paymentMethod");
        return ResponseEntity.ok(ApiResponse.success(null, "Payment method saved"));
    }

    @PostMapping("/ai-agent")
    public ResponseEntity<ApiResponse<Void>> saveAIAgent(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody Map<String, String> body
    ) {
        String agentId = body.get("agentId");
        return ResponseEntity.ok(ApiResponse.success(null, "AI Agent saved"));
    }

    @GetMapping("/ai-agents")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAIAgents() {
        var agents = aiAgentRepository.findAllActiveOrdered().stream()
            .map(agent -> {
                var capabilities = aiAgentRepository.findCapabilitiesByAgentId(agent.getId())
                    .stream()
                    .map(c -> c.getCapability())
                    .toList();
                return Map.<String, Object>of(
                    "id", agent.getId(),
                    "name", agent.getName(),
                    "description", agent.getDescription(),
                    "personality", agent.getPersonality(),
                    "capabilities", capabilities
                );
            })
            .toList();
        return ResponseEntity.ok(ApiResponse.success(agents, "AI Agents retrieved"));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<Void>> completeOnboarding(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        return ResponseEntity.ok(ApiResponse.success(null, "Onboarding completed"));
    }
}
