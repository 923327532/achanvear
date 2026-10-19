package achanvear.peru.interview.infrastructure.external;

public class AiServiceUnavailableException extends RuntimeException {
    public AiServiceUnavailableException() {
        super("El servicio de entrevistas IA no esta disponible. Reintenta sin perder tu progreso; si persiste, revisa la configuracion del proveedor.");
    }
}
