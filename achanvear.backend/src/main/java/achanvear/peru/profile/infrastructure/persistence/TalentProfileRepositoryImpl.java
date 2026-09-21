package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.application.query.ProfileSearchQuery;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.profile.domain.model.TalentProfileId;
import achanvear.peru.profile.TalentProfileRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class TalentProfileRepositoryImpl implements TalentProfileRepository {

    private final TalentProfileJpaRepository jpaRepository;
    private final TalentProfileMapper mapper;

    public TalentProfileRepositoryImpl(
            TalentProfileJpaRepository jpaRepository,
            TalentProfileMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(TalentProfile talentProfile) {
        jpaRepository.save(mapper.toEntity(talentProfile));
    }

    @Override
    public Optional<TalentProfile> findById(TalentProfileId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<TalentProfile> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).map(mapper::toDomain);
    }

    @Override
    public Page<TalentProfile> search(ProfileSearchQuery query) {
        Sort sort = Sort.by(
                Sort.Direction.fromString(query.sortDirection()),
                query.sortBy()
        );

        Pageable pageable = PageRequest.of(query.page(), query.size(), sort);

        Page<TalentProfileJpaEntity> page = jpaRepository.findAll(
                TalentProfileSpecifications.withFilters(
                        query.search(),
                        query.profileType(),
                        query.skill()
                ),
                pageable
        );

        return page.map(mapper::toDomain);
    }
}