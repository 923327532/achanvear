package achanvear.peru.compliance.domain.repository;

import achanvear.peru.compliance.domain.model.LegalDocument;
import achanvear.peru.compliance.domain.model.LegalDocumentType;
import achanvear.peru.compliance.domain.model.LegalDocumentVersion;

import java.util.List;
import java.util.Optional;

public interface LegalDocumentRepository {

    Optional<LegalDocument> findByType(LegalDocumentType type);

    Optional<LegalDocumentVersion> findActiveVersionByType(LegalDocumentType type);

    Optional<LegalDocumentVersion> findLatestVersionByType(LegalDocumentType type);

    Optional<LegalDocumentVersion> findVersionById(String versionId);

    List<LegalDocumentVersion> findVersionsByType(LegalDocumentType type);

    List<LegalDocument> findAll();

    void save(LegalDocument document);

    void saveVersion(LegalDocumentVersion version);
}
