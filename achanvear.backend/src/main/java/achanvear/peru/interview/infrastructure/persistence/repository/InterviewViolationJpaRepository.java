package achanvear.peru.interview.infrastructure.persistence.repository;

import achanvear.peru.interview.infrastructure.persistence.entity.InterviewViolationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewViolationJpaRepository extends JpaRepository<InterviewViolationJpaEntity, String> {

    List<InterviewViolationJpaEntity> findByInterviewIdOrderByOccurredAtAsc(String interviewId);
}
