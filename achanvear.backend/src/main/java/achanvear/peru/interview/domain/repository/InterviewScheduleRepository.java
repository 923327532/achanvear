package achanvear.peru.interview.domain.repository;

import achanvear.peru.interview.domain.model.InterviewSchedule;

import java.util.List;
import java.util.Optional;

public interface InterviewScheduleRepository {

    void save(InterviewSchedule schedule);

    Optional<InterviewSchedule> findById(String id);

    Optional<InterviewSchedule> findByToken(String token);

    Optional<InterviewSchedule> findByHiringProcessIdAndType(String hiringProcessId, String interviewType);

    List<InterviewSchedule> findByCandidateId(String candidateId);
}
