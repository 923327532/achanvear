package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.command.CreateLegalDocumentVersionCommand;
import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;

public interface CreateLegalDocumentVersionUseCase {

    LegalDocumentVersionResponse create(CreateLegalDocumentVersionCommand command);
}
