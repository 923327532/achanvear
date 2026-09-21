package achanvear.peru.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.core.env.PropertySource;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvPropertySource extends PropertySource<Dotenv> {

    public DotenvPropertySource(String name, Dotenv dotenv) {
        super(name, dotenv);
    }

    @Override
    public Object getProperty(String name) {
        return getSource().get(name);
    }

    public static PropertySource<?> createPropertySource() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(".")
                    .filename(".env")
                    .ignoreIfMissing()
                    .load();
            
            Map<String, Object> properties = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                properties.put(entry.getKey(), entry.getValue());
                System.setProperty(entry.getKey(), entry.getValue());
                System.out.println("Loaded from .env: " + entry.getKey() + " = " + entry.getValue());
            });
            
            if (!properties.isEmpty()) {
                System.out.println(".env file loaded successfully with " + properties.size() + " properties");
            } else {
                System.out.println("No properties found in .env file or file not found");
            }
            
            return new MapPropertySource("dotenv", properties);
        } catch (Exception e) {
            System.err.println("Error loading .env file: " + e.getMessage());
            return new MapPropertySource("dotenv", new HashMap<>());
        }
    }
}
