package achanvear.peru.compliance.infrastructure.web;

import achanvear.peru.compliance.application.GetActiveLegalDocumentUseCase;
import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;
import achanvear.peru.compliance.domain.model.LegalDocumentType;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/legal-documents")
public class LegalDocumentController {

    private final GetActiveLegalDocumentUseCase getActiveLegalDocumentUseCase;

    public LegalDocumentController(GetActiveLegalDocumentUseCase getActiveLegalDocumentUseCase) {
        this.getActiveLegalDocumentUseCase = getActiveLegalDocumentUseCase;
    }

    @GetMapping("/{type}")
    public ResponseEntity<ApiResponse<LegalDocumentVersionResponse>> getDocument(
            @PathVariable String type
    ) {
        LegalDocumentType documentType = LegalDocumentType.valueOf(type.toUpperCase());
        LegalDocumentVersionResponse response = getActiveLegalDocumentUseCase.getActive(documentType);
        return ResponseEntity.ok(ApiResponse.success(response, "Document fetched successfully"));
    }
}
