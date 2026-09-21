package achanvear.peru.compliance.infrastructure.persistence;

import achanvear.peru.compliance.domain.model.LegalDocument;
import achanvear.peru.compliance.domain.model.LegalDocumentType;
import achanvear.peru.compliance.domain.model.LegalDocumentVersion;
import achanvear.peru.compliance.domain.model.LegalDocumentVersionStatus;
import achanvear.peru.compliance.domain.repository.LegalDocumentRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class LegalDocumentRepositoryImpl implements LegalDocumentRepository {

    private final LegalDocumentJpaRepository documentJpaRepository;
    private final LegalDocumentVersionJpaRepository versionJpaRepository;
    private final ComplianceMapper mapper;

    public LegalDocumentRepositoryImpl(
            LegalDocumentJpaRepository documentJpaRepository,
            LegalDocumentVersionJpaRepository versionJpaRepository,
            ComplianceMapper mapper
    ) {
        this.documentJpaRepository = documentJpaRepository;
        this.versionJpaRepository = versionJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<LegalDocument> findByType(LegalDocumentType type) {
        return documentJpaRepository.findByType(type.name()).map(mapper::toDomain);
    }

    @Override
    public Optional<LegalDocumentVersion> findActiveVersionByType(LegalDocumentType type) {
        return findByType(type)
                .flatMap(document -> document.getCurrentVersionId() != null
                        ? versionJpaRepository.findById(UUID.fromString(document.getCurrentVersionId())).map(mapper::toDomain)
                        : Optional.empty())
                .filter(v -> v.getStatus() == LegalDocumentVersionStatus.PUBLISHED);
    }

    @Override
    public Optional<LegalDocumentVersion> findLatestVersionByType(LegalDocumentType type) {
        return findByType(type)
                .flatMap(document -> versionJpaRepository
                        .findByDocumentIdOrderByCreatedAtDesc(document.getId().value())
                        .stream()
                        .findFirst())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<LegalDocumentVersion> findVersionById(String versionId) {
        return versionJpaRepository.findById(UUID.fromString(versionId)).map(mapper::toDomain);
    }

    @Override
    public List<LegalDocumentVersion> findVersionsByType(LegalDocumentType type) {
        return findByType(type)
                .map(document -> versionJpaRepository
                        .findByDocumentIdOrderByCreatedAtDesc(document.getId().value())
                        .stream()
                        .map(mapper::toDomain)
                        .toList())
                .orElse(List.of());
    }

    @Override
    public List<LegalDocument> findAll() {
        return documentJpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public void save(LegalDocument document) {
        documentJpaRepository.save(mapper.toEntity(document));
    }

    @Override
    public void saveVersion(LegalDocumentVersion version) {
        versionJpaRepository.save(mapper.toEntity(version));
    }
}
