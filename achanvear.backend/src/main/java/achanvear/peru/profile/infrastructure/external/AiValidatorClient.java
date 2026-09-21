package achanvear.peru.profile.infrastructure.external;

import achanvear.peru.profile.application.port.out.ProfileValidationPort;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class AiValidatorClient implements ProfileValidationPort {

    private final RestClient restClient;
    private final AiValidatorProperties properties;

    public AiValidatorClient(
            RestClient.Builder restClientBuilder,
            AiValidatorProperties properties
    ) {
        this.restClient = restClientBuilder.baseUrl(properties.baseUrl()).build();
        this.properties = properties;
    }

    @Override
    public ValidationResult validateProfile(String profileId) {
        try {
            AiValidationResponse response = restClient.post()
                    .uri("/api/v1/validation/profile")
                    .body(new AiValidationRequest(profileId))
                    .retrieve()
                    .body(AiValidationResponse.class);

            if (response == null) {
                return new ValidationResult(false, "AI validator returned empty response");
            }

            return new ValidationResult(response.valid(), response.message());
        } catch (Exception exception) {
            return new ValidationResult(false, "AI validator unavailable");
        }
    }

    public record AiValidationRequest(String profileId) {
    }

    public record AiValidationResponse(boolean valid, String message) {
    }
}