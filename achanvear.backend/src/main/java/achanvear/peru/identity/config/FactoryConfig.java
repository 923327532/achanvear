package achanvear.peru.identity.config;

import achanvear.peru.identity.application.factory.UserFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FactoryConfig {

    @Bean
    public UserFactory userFactory() {
        return new UserFactory();
    }
}
