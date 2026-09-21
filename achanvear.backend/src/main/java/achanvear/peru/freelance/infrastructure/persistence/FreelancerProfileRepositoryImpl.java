package achanvear.peru.freelance.infrastructure.persistence;

import achanvear.peru.freelance.domain.model.FreelancerProfile;
import achanvear.peru.freelance.domain.repository.FreelancerProfileRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class FreelancerProfileRepositoryImpl implements FreelancerProfileRepository {

    private final FreelancerProfileJpaRepository jpaRepository;
    private final FreelancePersistenceMapper mapper;

    public FreelancerProfileRepositoryImpl(
            FreelancerProfileJpaRepository jpaRepository,
            FreelancePersistenceMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(FreelancerProfile freelancerProfile) {
        // Buscar entidad existente para que JPA maneje correctamente @ElementCollection
        jpaRepository.findById(freelancerProfile.getId().value())
                .ifPresentOrElse(
                        existingEntity -> {
                            // Actualizar campos de la entidad existente
                            existingEntity.setUserId(freelancerProfile.getUserId());
                            existingEntity.setName(freelancerProfile.getName());
                            existingEntity.setIndustry(freelancerProfile.getIndustry());
                            existingEntity.setSpecialty(freelancerProfile.getSpecialty());
                            existingEntity.setProfilePhotoUrl(freelancerProfile.getProfilePhotoUrl());
                            existingEntity.setBiography(freelancerProfile.getBiography());
                            existingEntity.setAchievements(freelancerProfile.getAchievements());
                            existingEntity.setAddress(freelancerProfile.getAddress());
                            existingEntity.setPaymentMethodType(freelancerProfile.getPaymentMethodType());
                            existingEntity.setDni(freelancerProfile.getDni());
                            existingEntity.setCurriculumUrl(freelancerProfile.getCurriculumUrl());
                            existingEntity.setCvData(freelancerProfile.getCvData());
                            existingEntity.setStatus(freelancerProfile.getStatus());

                            // Campos de Configuración
                            existingEntity.setAvailabilityStatus(freelancerProfile.getAvailabilityStatus());
                            existingEntity.setCvVisibility(freelancerProfile.getCvVisibility());
                            existingEntity.setPreferredCurrency(freelancerProfile.getPreferredCurrency());
                            existingEntity.setPreferredPaymentMethod(freelancerProfile.getPreferredPaymentMethod());
                            existingEntity.setLanguage(freelancerProfile.getLanguage());
                            existingEntity.setTimezone(freelancerProfile.getTimezone());

                            // Reemplazar completamente la colección @ElementCollection
                            existingEntity.getCertifications().clear();
                            existingEntity.getCertifications().addAll(
                                    freelancerProfile.getCertifications().stream()
                                            .map(mapper::toEmbeddable)
                                            .toList()
                            );
                            jpaRepository.save(existingEntity);
                        },
                        () -> jpaRepository.save(mapper.toEntity(freelancerProfile))
                );
    }

    @Override
    public Optional<FreelancerProfile> findById(String freelancerId) {
        return jpaRepository.findById(UUID.fromString(freelancerId)).map(mapper::toFreelancerProfileDomain);
    }

    @Override
    public Optional<FreelancerProfile> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).map(mapper::toFreelancerProfileDomain);
    }

    @Override
    public boolean existsByDni(String dni) {
        return jpaRepository.existsByDni(dni);
    }
}