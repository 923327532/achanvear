package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.command.PublishLegalDocumentVersionCommand;
import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;

public interface PublishLegalDocumentVersionUseCase {

    LegalDocumentVersionResponse publish(PublishLegalDocumentVersionCommand command);
}
