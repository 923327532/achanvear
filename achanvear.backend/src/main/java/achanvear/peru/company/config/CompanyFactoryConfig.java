package achanvear.peru.company.config;

import achanvear.peru.company.domain.factory.CompanyFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CompanyFactoryConfig {

    @Bean
    public CompanyFactory companyFactory() {
        return new CompanyFactory();
    }
}
