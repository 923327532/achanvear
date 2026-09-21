package achanvear.peru.freelance.domain.repository;

import achanvear.peru.freelance.domain.model.FreelancerProfile;

import java.util.Optional;
import java.util.UUID;

public interface FreelancerProfileRepository {

    void save(FreelancerProfile freelancerProfile);

    Optional<FreelancerProfile> findById(String freelancerId);

    Optional<FreelancerProfile> findByUserId(UUID userId);

    boolean existsByDni(String dni);
}