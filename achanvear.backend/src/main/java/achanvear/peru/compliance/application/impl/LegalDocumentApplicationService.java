package achanvear.peru.compliance.application.impl;

import achanvear.peru.compliance.application.CreateLegalDocumentVersionUseCase;
import achanvear.peru.compliance.application.GetActiveLegalDocumentUseCase;
import achanvear.peru.compliance.application.GetLegalDocumentHistoryUseCase;
import achanvear.peru.compliance.application.ListLegalDocumentsUseCase;
import achanvear.peru.compliance.application.PublishLegalDocumentVersionUseCase;
import achanvear.peru.compliance.application.command.CreateLegalDocumentVersionCommand;
import achanvear.peru.compliance.application.command.PublishLegalDocumentVersionCommand;
import achanvear.peru.compliance.application.dto.LegalDocumentResponse;
import achanvear.peru.compliance.application.dto.LegalDocumentVersionResponse;
import achanvear.peru.compliance.domain.model.LegalDocument;
import achanvear.peru.compliance.domain.model.LegalDocumentId;
import achanvear.peru.compliance.domain.model.LegalDocumentType;
import achanvear.peru.compliance.domain.model.LegalDocumentVersion;
import achanvear.peru.compliance.domain.model.LegalDocumentVersionId;
import achanvear.peru.compliance.domain.repository.LegalDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class LegalDocumentApplicationService implements
        GetActiveLegalDocumentUseCase,
        ListLegalDocumentsUseCase,
        GetLegalDocumentHistoryUseCase,
        CreateLegalDocumentVersionUseCase,
        PublishLegalDocumentVersionUseCase {

    private final LegalDocumentRepository legalDocumentRepository;

    public LegalDocumentApplicationService(LegalDocumentRepository legalDocumentRepository) {
        this.legalDocumentRepository = legalDocumentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public LegalDocumentVersionResponse getActive(LegalDocumentType type) {
        // Prioriza la versión publicada; si no hay, devuelve el último borrador
        // para que la interfaz pueda previsualizarlo con el aviso correspondiente.
        LegalDocumentVersion version = legalDocumentRepository.findActiveVersionByType(type)
                .or(() -> legalDocumentRepository.findLatestVersionByType(type))
                .orElseThrow(() -> new IllegalStateException(
                        "El documento solicitado aún no está disponible"));
        return LegalDocumentVersionResponse.from(version, type.name());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LegalDocumentResponse> listAll() {
        return legalDocumentRepository.findAll().stream()
                .map(document -> {
                    LegalDocumentVersion current = document.getCurrentVersionId() != null
                            ? legalDocumentRepository.findVersionById(document.getCurrentVersionId()).orElse(null)
                            : null;
                    return new LegalDocumentResponse(
                            document.getType().name(),
                            document.getCurrentVersionId(),
                            document.getStatus(),
                            current != null
                                    ? LegalDocumentVersionResponse.from(current, document.getType().name())
                                    : null
                    );
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LegalDocumentVersionResponse> history(LegalDocumentType type) {
        return legalDocumentRepository.findVersionsByType(type).stream()
                .map(v -> LegalDocumentVersionResponse.from(v, type.name()))
                .toList();
    }

    @Override
    public LegalDocumentVersionResponse create(CreateLegalDocumentVersionCommand command) {
        LegalDocumentType type = LegalDocumentType.valueOf(command.type());
        LegalDocument document = legalDocumentRepository.findByType(type)
                .orElseThrow(() -> new IllegalArgumentException("Documento legal no encontrado: " + command.type()));

        boolean versionExists = legalDocumentRepository.findVersionsByType(type).stream()
                .anyMatch(v -> v.getVersion().equals(command.version()));
        if (versionExists) {
            throw new IllegalArgumentException("Ya existe una versión " + command.version()
                    + " para " + command.type());
        }

        LegalDocumentVersion version = LegalDocumentVersion.create(
                LegalDocumentVersionId.generate(),
                document.getId(),
                command.version(),
                command.title(),
                command.content()
        );
        legalDocumentRepository.saveVersion(version);
        return LegalDocumentVersionResponse.from(version, type.name());
    }

    @Override
    public LegalDocumentVersionResponse publish(PublishLegalDocumentVersionCommand command) {
        LegalDocumentType type = LegalDocumentType.valueOf(command.type());
        LegalDocument document = legalDocumentRepository.findByType(type)
                .orElseThrow(() -> new IllegalArgumentException("Documento legal no encontrado: " + command.type()));

        LegalDocumentVersion version = legalDocumentRepository.findVersionById(command.versionId())
                .orElseThrow(() -> new IllegalArgumentException("Versión no encontrada: " + command.versionId()));

        // Conservar como histórica la versión vigente anterior
        if (document.getCurrentVersionId() != null) {
            legalDocumentRepository.findVersionById(document.getCurrentVersionId())
                    .ifPresent(LegalDocumentVersion::archive);
        }

        version.publish(command.publishedBy());
        document.setCurrentVersion(version.getId().toString());

        legalDocumentRepository.saveVersion(version);
        legalDocumentRepository.save(document);

        return LegalDocumentVersionResponse.from(version, type.name());
    }
}
