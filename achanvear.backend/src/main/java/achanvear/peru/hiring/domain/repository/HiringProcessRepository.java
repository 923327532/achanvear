package achanvear.peru.hiring.domain.repository;

import achanvear.peru.hiring.domain.model.HiringProcess;
import achanvear.peru.hiring.domain.model.HiringProcessId;

import java.util.Optional;

public interface HiringProcessRepository {

    void save(HiringProcess hiringProcess);

    Optional<HiringProcess> findById(HiringProcessId hiringProcessId);

    Optional<HiringProcess> findByJobIdAndCandidateId(String jobId, String candidateId);
}