package achanvear.peru.admin.application;

import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;

import java.util.List;

public interface GetLegalDocumentHistoryUseCase {

    List<LegalDocumentVersionResponse> history(String type);
}
