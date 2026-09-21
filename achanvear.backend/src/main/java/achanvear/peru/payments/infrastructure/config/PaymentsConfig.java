package achanvear.peru.payments.infrastructure.config;

import achanvear.peru.payments.infrastructure.external.MercadoPagoProperties;
import achanvear.peru.payments.infrastructure.external.CulqiProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({MercadoPagoProperties.class, CulqiProperties.class})
public class PaymentsConfig {
}
