package achanvear.peru.identity.infrastructure.external;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseService.class);

    /**
     * Verifica un ID token de Firebase y devuelve la información del usuario.
     */
    public FirebaseToken verifyIdToken(String idToken) {
        if (FirebaseApp.getApps().isEmpty()) {
            log.error("Firebase is not initialized. Cannot verify token.");
            throw new IllegalArgumentException("Firebase is not configured. Google Login is disabled.");
        }
        try {
            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Firebase token: " + e.getMessage());
        }
    }
}
