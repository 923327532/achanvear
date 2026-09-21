package achanvear.peru.profile;

import achanvear.peru.profile.application.query.ProfileSearchQuery;
import achanvear.peru.profile.domain.model.TalentProfileId;
import org.springframework.data.domain.Page;

import java.util.Optional;
import java.util.UUID;

public interface TalentProfileRepository {

    void save(TalentProfile talentProfile);

    Optional<TalentProfile> findById(TalentProfileId id);

    Optional<TalentProfile> findByUserId(UUID userId);

    Page<TalentProfile> search(ProfileSearchQuery query);
}