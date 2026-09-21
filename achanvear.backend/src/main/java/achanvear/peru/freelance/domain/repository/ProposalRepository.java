package achanvear.peru.freelance.domain.repository;

import achanvear.peru.freelance.domain.model.Proposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProposalRepository {

    Page<Proposal> findByFreelancerUserId(UUID freelancerUserId, Pageable pageable);
}