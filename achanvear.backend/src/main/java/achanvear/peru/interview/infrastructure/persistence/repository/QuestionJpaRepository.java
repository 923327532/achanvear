package achanvear.peru.interview.infrastructure.persistence.repository;

import achanvear.peru.interview.infrastructure.persistence.entity.QuestionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionJpaRepository extends JpaRepository<QuestionJpaEntity, String> {

    @Query("SELECT q FROM QuestionJpaEntity q WHERE q.interview.id = :interviewId ORDER BY q.id ASC")
    List<QuestionJpaEntity> findByInterviewIdOrderByIdAsc(@Param("interviewId") String interviewId);

    List<QuestionJpaEntity> findByInterview_IdOrderByOrderNumberAsc(String interviewId);

    void deleteByInterview_Id(String interviewId);
}