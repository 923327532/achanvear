package achanvear.peru.freelance.infrastructure.external;

import achanvear.peru.freelance.application.port.out.DniValidationPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class DniValidationClient implements DniValidationPort {

    private final RestClient restClient;
    private final DniValidationApiProperties properties;

    public DniValidationClient(DniValidationApiProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(60000);  // 60 segundos
        requestFactory.setReadTimeout(60000);     // 60 segundos
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.token())
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public boolean isValidDni(String dni) {
        return false;
    }

    @Override
    public boolean existsDni(String dni) {
        return false;
    }

    @Override
    public DniValidationResult validate(String dni) {
        try {
            Map<String, String> requestBody = Map.of("dni", dni);

            DniValidationApiResponse response = restClient.post()
                    .uri("/dni")
                    .body(requestBody)
                    .retrieve()
                    .body(DniValidationApiResponse.class);

            boolean valid = response != null && response.valid();
            String fullName = response == null ? null : response.fullName();

            return new DniValidationResult(valid, fullName);
        } catch (Exception exception) {
            return new DniValidationResult(false, null);
        }
    }

    public record DniValidationApiResponse(
            boolean valid,
            String fullName
    ) {
    }
}
