package achanvear.peru.freelance.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface IndustrySpecialtyRepository extends JpaRepository<IndustrySpecialtyJpaEntity, UUID> {
    List<IndustrySpecialtyJpaEntity> findByIndustry(String industry);

    @Query("SELECT DISTINCT i.industry FROM IndustrySpecialtyJpaEntity i ORDER BY i.industry")
    List<String> findDistinctIndustries();
}
