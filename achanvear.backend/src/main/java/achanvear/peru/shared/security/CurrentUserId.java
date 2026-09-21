package achanvear.peru.shared.security;

import java.lang.annotation.*;

/**
 * Anotación para inyectar el ID del usuario autenticado en los controladores.
 * Se usa junto con {@link CurrentUserIdResolver} para extraer el userId
 * del {@link AuthenticatedUser} del contexto de seguridad.
 */
@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUserId {
}
