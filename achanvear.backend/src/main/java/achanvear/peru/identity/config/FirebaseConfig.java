package achanvear.peru.identity.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config.path:classpath:firebase-service-account.json}")
    private Resource firebaseConfigResource;

    @PostConstruct
    public void initialize() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                if (!firebaseConfigResource.exists()) {
                    log.warn("Firebase service account file not found at {}. Google Login will be disabled.",
                            firebaseConfigResource.getDescription());
                    return;
                }
                InputStream serviceAccount = firebaseConfigResource.getInputStream();
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized successfully");
            } catch (Exception e) {
                log.warn("Failed to initialize Firebase. Google Login will be disabled: {}", e.getMessage());
            }
        }
    }
}
