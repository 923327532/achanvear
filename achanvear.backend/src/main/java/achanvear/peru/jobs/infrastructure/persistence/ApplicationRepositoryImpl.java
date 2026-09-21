package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Repository
public class ApplicationRepositoryImpl implements ApplicationRepository {

    private final ApplicationJpaRepository applicationJpaRepository;
    private final ApplicationMapper applicationMapper;

    public ApplicationRepositoryImpl(
            ApplicationJpaRepository applicationJpaRepository,
            ApplicationMapper applicationMapper
    ) {
        this.applicationJpaRepository = applicationJpaRepository;
        this.applicationMapper = applicationMapper;
    }

    @Override
    public Page<JobApplication> findByCandidateUserId(UUID candidateUserId, Pageable pageable) {
        return applicationJpaRepository.findByCandidateUserId(candidateUserId, pageable)
                .map(applicationMapper::toDomain);
    }

    @Override
    public List<JobApplication> findByCandidateUserId(UUID candidateUserId) {
        return applicationJpaRepository.findByCandidateUserId(candidateUserId)
                .stream()
                .map(applicationMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<JobApplication> findByJobPostId(UUID jobPostId, Pageable pageable) {

        return applicationJpaRepository.findByJobPostId(jobPostId, pageable)
                .map(applicationMapper::toDomain);
    }

    @Override
    public Optional<JobApplication> findById(UUID applicationId) {
        return applicationJpaRepository.findById(applicationId)
                .map(applicationMapper::toDomain);
    }

    @Override
    public void save(JobApplication application) {
        applicationJpaRepository.save(applicationMapper.toEntity(application));
    }
}