package achanvear.peru.freelance.domain.repository;

import achanvear.peru.freelance.application.query.FreelanceProjectSearchQuery;
import achanvear.peru.freelance.domain.model.FreelanceProject;
import achanvear.peru.freelance.domain.model.FreelanceProjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FreelanceProjectRepository {

    void save(FreelanceProject freelanceProject);

    Optional<FreelanceProject> findById(FreelanceProjectId id);

    Page<FreelanceProject> search(FreelanceProjectSearchQuery query);

    Optional<FreelanceProject> findById(String projectId);

    List<FreelanceProject> findByClientId(UUID clientId);

    List<FreelanceProject> findByFreelancerId(UUID freelancerId);

    List<FreelanceProject> findAll();

    Page<FreelanceProject> findProjectsByFreelancerProposals(UUID freelancerUserId, Pageable pageable);
}
