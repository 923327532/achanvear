package achanvear.peru.freelance.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProposalJpaRepository extends JpaRepository<ProposalJpaEntity, UUID> {

    Page<ProposalJpaEntity> findByFreelancerUserId(UUID freelancerUserId, Pageable pageable);
}
