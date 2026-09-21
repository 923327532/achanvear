package achanvear.peru.shared.config;

import achanvear.peru.company.infrastructure.external.ApiPeruProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ApiPeruProperties.class)
public class ExternalClientsConfig {
}
