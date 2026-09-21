package achanvear.peru.freelance.application.port.out;

public interface DniValidationPort {

    // TODO: Implementar con el servicio de validación de DNI cuando esté disponible
    boolean isValidDni(String dni);

    boolean existsDni(String dni);

    DniValidationResult validate(String dni);

    record DniValidationResult(
            boolean valid,
            String fullName
    ) {
    }
}