package achanvear.peru.freelance.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FreelanceProjectJpaRepository extends JpaRepository<FreelanceProjectJpaEntity, UUID> {

    Optional<FreelanceProjectJpaEntity> findById(UUID id);

    Page<FreelanceProjectJpaEntity> findAll(Specification<FreelanceProjectJpaEntity> specification, Pageable pageable);

    List<FreelanceProjectJpaEntity> findByClientUserId(UUID clientUserId);

    List<FreelanceProjectJpaEntity> findBySelectedFreelancerUserId(UUID freelancerUserId);

    List<FreelanceProjectJpaEntity> findAll();

    @Query("SELECT DISTINCT p FROM FreelanceProjectJpaEntity p JOIN p.proposals prop WHERE prop.freelancerUserId = :freelancerUserId")
    Page<FreelanceProjectJpaEntity> findProjectsByFreelancerProposals(@Param("freelancerUserId") UUID freelancerUserId, Pageable pageable);
}
