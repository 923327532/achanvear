package achanvear.peru.interview.infrastructure.persistence.repository;

import achanvear.peru.interview.infrastructure.persistence.entity.AnswerJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerJpaRepository extends JpaRepository<AnswerJpaEntity, String> {

    @Query("SELECT a FROM AnswerJpaEntity a WHERE a.interview.id = :interviewId ORDER BY a.id ASC")
    List<AnswerJpaEntity> findByInterviewIdOrderByIdAsc(@Param("interviewId") String interviewId);

    List<AnswerJpaEntity> findByQuestionId(String questionId);

    void deleteByInterview_Id(String interviewId);
}