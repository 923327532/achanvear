package achanvear.peru.jobs.domain.repository;

import achanvear.peru.jobs.application.query.JobSearchQuery;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface JobPostRepository {

    void save(JobPost jobPost);

    Optional<JobPost> findById(JobPostId id);

    Page<JobPost> search(JobSearchQuery query);

    boolean existsByTitleAndCompanyId(String title, UUID companyId);

    Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable);

    void deleteById(JobPostId id);
}
