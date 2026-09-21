package achanvear.peru.interview.infrastructure.persistence.repository;

import achanvear.peru.interview.infrastructure.persistence.entity.InterviewScheduleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewScheduleJpaRepository extends JpaRepository<InterviewScheduleJpaEntity, String> {

    Optional<InterviewScheduleJpaEntity> findByInterviewToken(String token);

    Optional<InterviewScheduleJpaEntity> findByHiringProcessIdAndInterviewType(String hiringProcessId, String interviewType);

    List<InterviewScheduleJpaEntity> findByCandidateId(String candidateId);
}
