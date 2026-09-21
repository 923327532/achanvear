package achanvear.peru.jobs.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface ApplicationJpaRepository extends JpaRepository<JobApplicationJpaEntity, UUID> {

    Page<JobApplicationJpaEntity> findByCandidateUserId(UUID candidateUserId, Pageable pageable);

    List<JobApplicationJpaEntity> findByCandidateUserId(UUID candidateUserId);


    Page<JobApplicationJpaEntity> findByJobPostId(UUID jobPostId, Pageable pageable);
}