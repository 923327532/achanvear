package achanvear.peru.compliance.infrastructure.persistence;

import achanvear.peru.compliance.domain.model.ConsentRecord;
import achanvear.peru.compliance.domain.model.ConsentRecordId;
import achanvear.peru.compliance.domain.model.ConsentType;
import achanvear.peru.compliance.domain.model.LegalDocument;
import achanvear.peru.compliance.domain.model.LegalDocumentId;
import achanvear.peru.compliance.domain.model.LegalDocumentType;
import achanvear.peru.compliance.domain.model.LegalDocumentVersion;
import achanvear.peru.compliance.domain.model.LegalDocumentVersionId;
import achanvear.peru.compliance.domain.model.LegalDocumentVersionStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ComplianceMapper {

    // ── LegalDocument ──

    public LegalDocumentJpaEntity toEntity(LegalDocument document) {
        LegalDocumentJpaEntity entity = new LegalDocumentJpaEntity();
        entity.setId(document.getId().value());
        entity.setType(document.getType().name());
        entity.setStatus(document.getStatus());
        if (document.getCurrentVersionId() != null) {
            entity.setCurrentVersionId(UUID.fromString(document.getCurrentVersionId()));
        }
        return entity;
    }

    public LegalDocument toDomain(LegalDocumentJpaEntity entity) {
        return new LegalDocument(
                new LegalDocumentId(entity.getId()),
                LegalDocumentType.valueOf(entity.getType()),
                entity.getStatus(),
                entity.getCurrentVersionId() != null ? entity.getCurrentVersionId().toString() : null
        );
    }

    // ── LegalDocumentVersion ──

    public LegalDocumentVersionJpaEntity toEntity(LegalDocumentVersion version) {
        LegalDocumentVersionJpaEntity entity = new LegalDocumentVersionJpaEntity();
        entity.setId(version.getId().value());
        entity.setDocumentId(version.getDocumentId().value());
        entity.setVersion(version.getVersion());
        entity.setTitle(version.getTitle());
        entity.setContent(version.getContent());
        entity.setStatus(version.getStatus().name());
        entity.setPublishedAt(version.getPublishedAt());
        entity.setPublishedBy(version.getPublishedBy() != null ? UUID.fromString(version.getPublishedBy()) : null);
        entity.setCreatedAt(version.getCreatedAt());
        return entity;
    }

    public LegalDocumentVersion toDomain(LegalDocumentVersionJpaEntity entity) {
        return new LegalDocumentVersion(
                new LegalDocumentVersionId(entity.getId()),
                new LegalDocumentId(entity.getDocumentId()),
                entity.getVersion(),
                entity.getTitle(),
                entity.getContent(),
                LegalDocumentVersionStatus.valueOf(entity.getStatus()),
                entity.getPublishedAt(),
                entity.getPublishedBy() != null ? entity.getPublishedBy().toString() : null,
                entity.getCreatedAt()
        );
    }

    // ── ConsentRecord ──

    public ConsentRecordJpaEntity toEntity(ConsentRecord record) {
        ConsentRecordJpaEntity entity = new ConsentRecordJpaEntity();
        entity.setId(record.getId().value());
        entity.setUserId(UUID.fromString(record.getUserId()));
        entity.setInterviewId(record.getInterviewId());
        entity.setConsentType(record.getType().name());
        entity.setDocumentVersion(record.getDocumentVersion());
        entity.setAccepted(record.isAccepted());
        entity.setAcceptedAt(record.getAcceptedAt());
        entity.setWithdrawnAt(record.getWithdrawnAt());
        return entity;
    }

    public ConsentRecord toDomain(ConsentRecordJpaEntity entity) {
        return ConsentRecord.restore(
                new ConsentRecordId(entity.getId()),
                entity.getUserId().toString(),
                entity.getInterviewId(),
                ConsentType.valueOf(entity.getConsentType()),
                entity.getDocumentVersion(),
                entity.isAccepted(),
                entity.getAcceptedAt(),
                entity.getWithdrawnAt()
        );
    }
}
