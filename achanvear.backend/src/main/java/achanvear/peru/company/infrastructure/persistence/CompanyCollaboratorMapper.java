package achanvear.peru.company.infrastructure.persistence;

import achanvear.peru.company.domain.model.CollaboratorStatus;
import achanvear.peru.company.domain.model.CompanyCollaborator;
import org.springframework.stereotype.Component;

@Component
public class CompanyCollaboratorMapper {

    public CompanyCollaboratorJpaEntity toEntity(CompanyCollaborator domain) {
        CompanyCollaboratorJpaEntity entity = new CompanyCollaboratorJpaEntity();
        entity.setId(domain.getId());
        entity.setCompanyId(domain.getCompanyId());
        entity.setUserId(domain.getUserId());
        entity.setFullName(domain.getFullName());
        entity.setEmail(domain.getEmail());
        entity.setStatus(domain.getStatus().name());
        entity.setInvitedAt(domain.getInvitedAt());
        return entity;
    }

    public CompanyCollaborator toDomain(CompanyCollaboratorJpaEntity entity) {
        return CompanyCollaborator.restore(
                entity.getId(),
                entity.getCompanyId(),
                entity.getUserId(),
                entity.getFullName(),
                entity.getEmail(),
                CollaboratorStatus.valueOf(entity.getStatus()),
                entity.getInvitedAt()
        );
    }
}
