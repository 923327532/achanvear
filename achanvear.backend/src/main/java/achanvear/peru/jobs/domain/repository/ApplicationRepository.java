package achanvear.peru.jobs.domain.repository;

import achanvear.peru.jobs.domain.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;
import java.util.Optional;
import java.util.List;

public interface ApplicationRepository {

    Page<JobApplication> findByCandidateUserId(UUID candidateUserId, Pageable pageable);

    List<JobApplication> findByCandidateUserId(UUID candidateUserId);


    Page<JobApplication> findByJobPostId(UUID jobPostId, Pageable pageable);

    Optional<JobApplication> findById(UUID applicationId);

    void save(JobApplication application);
}