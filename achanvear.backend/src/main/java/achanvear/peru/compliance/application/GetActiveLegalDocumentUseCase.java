package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;
import achanvear.peru.compliance.domain.model.LegalDocumentType;

public interface GetActiveLegalDocumentUseCase {

    /**
     * Devuelve la versión vigente (PUBLISHED) del documento. Si todavía no hay
     * una versión publicada, devuelve el último borrador con status DRAFT para
     * que la interfaz pueda previsualizarlo.
     */
    LegalDocumentVersionResponse getActive(LegalDocumentType type);
}
