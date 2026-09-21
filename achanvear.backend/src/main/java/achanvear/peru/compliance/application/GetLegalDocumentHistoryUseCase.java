package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;
import achanvear.peru.compliance.domain.model.LegalDocumentType;

import java.util.List;

public interface GetLegalDocumentHistoryUseCase {

    List<LegalDocumentVersionResponse> history(LegalDocumentType type);
}
