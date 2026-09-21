package achanvear.peru.company.infrastructure.external;

import achanvear.peru.company.application.port.out.PeruvianDocumentValidationPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class ApiPeruClient implements PeruvianDocumentValidationPort {

    private static final Logger log = LoggerFactory.getLogger(ApiPeruClient.class);

    private final RestClient restClient;

    public ApiPeruClient(ApiPeruProperties properties) {
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
    public DniValidationResult validateDni(String dni) {
        try {
            Map<String, String> requestBody = Map.of("dni", dni);

            ApiPeruDniResponse response = restClient.post()
                    .uri("/dni")
                    .body(requestBody)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError() || status.is5xxServerError(),
                            (req, res) -> {
                                String body = new String(res.getBody().readAllBytes());
                                log.warn("API Perú responded with error {} for DNI {}: {}", res.getStatusCode(), dni, body);
                            }
                    )
                    .body(ApiPeruDniResponse.class);

            if (response == null || !response.success() || response.data() == null) {
                return new DniValidationResult(false, false, true, dni, null, null, null, null);
            }

            return new DniValidationResult(
                    true,
                    true,
                    false,
                    response.data().numero(),
                    response.data().nombreCompleto(),
                    response.data().nombres(),
                    response.data().apellidoPaterno(),
                    response.data().apellidoMaterno()
            );

        } catch (Exception exception) {
            log.error("Error al validar DNI {}: {}", dni, exception.getMessage(), exception);
            return new DniValidationResult(false, false, true, dni, null, null, null, null);
        }
    }
}
