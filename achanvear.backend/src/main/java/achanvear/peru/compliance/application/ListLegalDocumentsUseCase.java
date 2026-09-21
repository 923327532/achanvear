package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.dto.LegalDocumentResponse;

import java.util.List;

public interface ListLegalDocumentsUseCase {

    List<LegalDocumentResponse> listAll();
}
