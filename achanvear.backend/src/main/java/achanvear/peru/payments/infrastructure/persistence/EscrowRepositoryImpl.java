package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Escrow;
import achanvear.peru.payments.domain.model.EscrowId;
import achanvear.peru.payments.domain.model.EscrowStatus;
import achanvear.peru.payments.domain.repository.EscrowRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class EscrowRepositoryImpl implements EscrowRepository {

    private final EscrowJpaRepository jpaRepository;
    private final EscrowMapper mapper;

    public EscrowRepositoryImpl(EscrowJpaRepository jpaRepository, EscrowMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Escrow escrow) {
        jpaRepository.save(mapper.toEntity(escrow));
    }

    @Override
    public Optional<Escrow> findById(EscrowId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Escrow> findByMilestoneId(UUID milestoneId) {
        return jpaRepository.findByMilestoneId(milestoneId).map(mapper::toDomain);
    }

    @Override
    public Optional<Escrow> findByMpPaymentId(String mpPaymentId) {
        return jpaRepository.findByMpPaymentId(mpPaymentId).map(mapper::toDomain);
    }

    @Override
    public List<Escrow> findByClientUserId(UUID clientUserId) {
        return jpaRepository.findByClientUserId(clientUserId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Escrow> findByFreelancerUserId(UUID freelancerUserId) {
        return jpaRepository.findByFreelancerUserId(freelancerUserId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Escrow> findByStatus(EscrowStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Escrow> findByProjectId(UUID projectId) {
        return jpaRepository.findByProjectId(projectId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
