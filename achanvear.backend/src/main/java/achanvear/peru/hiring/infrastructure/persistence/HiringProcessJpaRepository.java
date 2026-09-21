package achanvear.peru.hiring.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HiringProcessJpaRepository extends JpaRepository<HiringProcessJpaEntity, String> {

    Optional<HiringProcessJpaEntity> findByJobIdAndCandidateId(String jobId, String candidateId);
}