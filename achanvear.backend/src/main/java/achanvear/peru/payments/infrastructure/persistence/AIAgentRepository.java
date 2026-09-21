package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIAgentRepository extends JpaRepository<AIAgentJpaEntity, String> {

    @Query("SELECT a FROM AIAgentJpaEntity a WHERE a.isActive = true ORDER BY a.sortOrder ASC")
    List<AIAgentJpaEntity> findAllActiveOrdered();

    @Query("SELECT c FROM AIAgentCapabilityJpaEntity c WHERE c.agentId = :agentId")
    List<AIAgentCapabilityJpaEntity> findCapabilitiesByAgentId(String agentId);
}
