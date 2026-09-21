package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Dispute;
import achanvear.peru.payments.domain.model.DisputeId;
import achanvear.peru.payments.domain.model.DisputeStatus;
import achanvear.peru.payments.domain.repository.DisputeRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class DisputeRepositoryImpl implements DisputeRepository {

    private final DisputeJpaRepository jpaRepository;
    private final DisputeMapper mapper;

    public DisputeRepositoryImpl(DisputeJpaRepository jpaRepository, DisputeMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Dispute dispute) {
        jpaRepository.save(mapper.toEntity(dispute));
    }

    @Override
    public Optional<Dispute> findById(DisputeId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Dispute> findByMilestoneId(UUID milestoneId) {
        return jpaRepository.findByMilestoneId(milestoneId).map(mapper::toDomain);
    }

    @Override
    public List<Dispute> findByProjectId(UUID projectId) {
        return jpaRepository.findByProjectId(projectId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Dispute> findByStatus(DisputeStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Dispute> findByRaisedByUserId(UUID userId) {
        return jpaRepository.findByRaisedByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
