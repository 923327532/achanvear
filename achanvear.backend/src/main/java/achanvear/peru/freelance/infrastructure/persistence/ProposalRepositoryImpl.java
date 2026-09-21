package achanvear.peru.freelance.infrastructure.persistence;

import achanvear.peru.freelance.domain.model.Proposal;
import achanvear.peru.freelance.domain.repository.ProposalRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class ProposalRepositoryImpl implements ProposalRepository {

    private final ProposalJpaRepository jpaRepository;
    private final FreelancePersistenceMapper mapper;

    public ProposalRepositoryImpl(ProposalJpaRepository jpaRepository, FreelancePersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Page<Proposal> findByFreelancerUserId(UUID freelancerUserId, Pageable pageable) {
        return jpaRepository.findByFreelancerUserId(freelancerUserId, pageable)
                .map(mapper::toProposal);
    }
}
