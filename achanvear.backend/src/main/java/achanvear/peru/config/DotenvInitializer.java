package achanvear.peru.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.PropertySource;

public class DotenvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        System.err.println("=== DOTENV INITIALIZER STARTING ===");
        PropertySource<?> dotenvPropertySource = DotenvPropertySource.createPropertySource();
        applicationContext.getEnvironment().getPropertySources().addFirst(dotenvPropertySource);
        System.err.println("=== DOTENV INITIALIZER COMPLETED ===");
    }
}
