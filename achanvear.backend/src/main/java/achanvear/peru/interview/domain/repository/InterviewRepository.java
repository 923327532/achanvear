package achanvear.peru.interview.domain.repository;

import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.InterviewId;

import java.util.List;
import java.util.Optional;

public interface InterviewRepository {

    void save(Interview interview);

    Optional<Interview> findById(InterviewId interviewId);

    List<Interview> findByCandidateId(String candidateId);
}
