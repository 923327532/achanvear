package achanvear.peru.compliance.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LegalDocumentVersionJpaRepository extends JpaRepository<LegalDocumentVersionJpaEntity, UUID> {

    List<LegalDocumentVersionJpaEntity> findByDocumentIdOrderByCreatedAtDesc(UUID documentId);

    List<LegalDocumentVersionJpaEntity> findByDocumentIdAndStatusOrderByCreatedAtDesc(UUID documentId, String status);
}
