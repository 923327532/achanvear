package achanvear.peru.compliance.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LegalDocumentJpaRepository extends JpaRepository<LegalDocumentJpaEntity, UUID> {

    Optional<LegalDocumentJpaEntity> findByType(String type);
}
