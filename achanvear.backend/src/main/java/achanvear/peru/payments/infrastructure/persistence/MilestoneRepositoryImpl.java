package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Milestone;
import achanvear.peru.payments.domain.model.MilestoneId;
import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class MilestoneRepositoryImpl implements MilestoneRepository {

    private final MilestoneJpaRepository jpaRepository;
    private final MilestoneMapper mapper;

    public MilestoneRepositoryImpl(MilestoneJpaRepository jpaRepository, MilestoneMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Milestone milestone) {
        jpaRepository.save(mapper.toEntity(milestone));
    }

    @Override
    public Optional<Milestone> findById(MilestoneId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<Milestone> findByProjectId(UUID projectId) {
        return jpaRepository.findByProjectId(projectId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Milestone> findByFreelancerUserId(UUID freelancerUserId) {
        return jpaRepository.findByFreelancerUserId(freelancerUserId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Milestone> findByClientUserId(UUID clientUserId) {
        return jpaRepository.findByClientUserId(clientUserId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Milestone> findByStatus(MilestoneStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Milestone> findByMpPaymentId(String mpPaymentId) {
        return jpaRepository.findByMpPaymentId(mpPaymentId).map(mapper::toDomain);
    }

    @Override
    public boolean existsByMpPaymentId(String mpPaymentId) {
        return jpaRepository.existsByMpPaymentId(mpPaymentId);
    }
}
