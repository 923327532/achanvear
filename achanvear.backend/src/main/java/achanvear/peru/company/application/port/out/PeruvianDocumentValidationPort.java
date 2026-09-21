package achanvear.peru.company.application.port.out;

public interface PeruvianDocumentValidationPort {

    DniValidationResult validateDni(String dni);

    record DniValidationResult(
            boolean success,
            boolean valid,
            boolean uncertain,
            String documentNumber,
            String fullName,
            String names,
            String paternalSurname,
            String maternalSurname
    ) {
    }
}