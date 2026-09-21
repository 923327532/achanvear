package achanvear.peru.identity.web;

import achanvear.peru.company.application.port.out.PeruvianDocumentValidationPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/integration/dni")
public class DniIntegrationController {

    private final PeruvianDocumentValidationPort peruvianDocumentValidationPort;

    public DniIntegrationController(PeruvianDocumentValidationPort peruvianDocumentValidationPort) {
        this.peruvianDocumentValidationPort = peruvianDocumentValidationPort;
    }

    @GetMapping("/{dni}")
    public ResponseEntity<DniValidationResponse> validateDni(@PathVariable String dni) {
        PeruvianDocumentValidationPort.DniValidationResult validation =
                peruvianDocumentValidationPort.validateDni(dni);

        DniValidationResponse response = new DniValidationResponse(
                validation.documentNumber(),
                validation.names(),
                validation.paternalSurname(),
                validation.maternalSurname(),
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        return ResponseEntity.ok(response);
    }

    public record DniValidationResponse(
            String numeroDocumento,
            String nombres,
            String apellidoPaterno,
            String apellidoMaterno,
            String direccion,
            String departamento,
            String provincia,
            String distrito,
            String ubigeo,
            String fechaNacimiento,
            String sexo
    ) {
    }
}
