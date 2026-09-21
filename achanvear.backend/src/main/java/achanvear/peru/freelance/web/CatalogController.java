package achanvear.peru.freelance.web;

import achanvear.peru.freelance.infrastructure.persistence.IndustrySpecialtyRepository;
import achanvear.peru.payments.application.dto.PlanOptionResponse;
import achanvear.peru.payments.application.port.in.GetAvailablePlansUseCase;
import achanvear.peru.payments.infrastructure.persistence.AIAgentRepository;
import achanvear.peru.payments.infrastructure.persistence.PlanRepository;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

    private final GetAvailablePlansUseCase getAvailablePlansUseCase;
    private final PlanRepository planRepository;
    private final AIAgentRepository aiAgentRepository;
    private final IndustrySpecialtyRepository industrySpecialtyRepository;

    public CatalogController(
            GetAvailablePlansUseCase getAvailablePlansUseCase,
            PlanRepository planRepository,
            AIAgentRepository aiAgentRepository,
            IndustrySpecialtyRepository industrySpecialtyRepository
    ) {
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

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanOptionResponse>>> getPlans() {
        List<PlanOptionResponse> plans = getAvailablePlansUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(plans, "Plans retrieved"));
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
}