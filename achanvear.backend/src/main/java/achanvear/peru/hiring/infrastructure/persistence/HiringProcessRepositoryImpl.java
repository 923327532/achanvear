package achanvear.peru.hiring.infrastructure.persistence;

import achanvear.peru.hiring.domain.model.HiringProcess;
import achanvear.peru.hiring.domain.model.HiringProcessId;
import achanvear.peru.hiring.domain.repository.HiringProcessRepository;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class HiringProcessRepositoryImpl implements HiringProcessRepository {

    private final HiringProcessJpaRepository jpaRepository;
    private final HiringProcessMapper mapper;

    public HiringProcessRepositoryImpl(HiringProcessJpaRepository jpaRepository, HiringProcessMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(HiringProcess hiringProcess) {
        jpaRepository.save(mapper.toEntity(hiringProcess));
    }

    @Override
    public Optional<HiringProcess> findById(HiringProcessId hiringProcessId) {
        return jpaRepository.findById(hiringProcessId.toString())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<HiringProcess> findByJobIdAndCandidateId(String jobId, String candidateId) {
        return jpaRepository.findByJobIdAndCandidateId(jobId, candidateId)
                .map(mapper::toDomain);
    }
}