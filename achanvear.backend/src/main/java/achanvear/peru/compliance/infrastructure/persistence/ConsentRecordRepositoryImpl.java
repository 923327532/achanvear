package achanvear.peru.compliance.infrastructure.persistence;

import achanvear.peru.compliance.application.command.ConsentListQuery;
import achanvear.peru.compliance.domain.model.ConsentRecord;
import achanvear.peru.compliance.domain.model.ConsentRecordId;
import achanvear.peru.compliance.domain.model.ConsentType;
import achanvear.peru.compliance.domain.repository.ConsentRecordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ConsentRecordRepositoryImpl implements ConsentRecordRepository {

    private final ConsentRecordJpaRepository jpaRepository;
    private final ComplianceMapper mapper;

    public ConsentRecordRepositoryImpl(
            ConsentRecordJpaRepository jpaRepository,
            ComplianceMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(ConsentRecord record) {
        jpaRepository.save(mapper.toEntity(record));
    }

    @Override
    public Optional<ConsentRecord> findById(ConsentRecordId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<ConsentRecord> findByUserId(String userId) {
        return jpaRepository.findByUserIdOrderByAcceptedAtDesc(UUID.fromString(userId))
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<ConsentRecord> findByInterviewId(String interviewId) {
        return jpaRepository.findByInterviewIdOrderByAcceptedAtDesc(interviewId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<ConsentRecord> findAcceptedByInterviewIdAndType(String interviewId, ConsentType type) {
        return jpaRepository.findTopByInterviewIdAndConsentTypeAndAcceptedTrueOrderByAcceptedAtDesc(
                        interviewId, type.name())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<ConsentRecord> findAcceptedByUserIdAndType(String userId, ConsentType type) {
        return jpaRepository.findTopByUserIdAndConsentTypeAndAcceptedTrueOrderByAcceptedAtDesc(
                        UUID.fromString(userId), type.name())
                .map(mapper::toDomain);
    }

    @Override
    public Page<ConsentRecord> search(ConsentListQuery query) {
        int page = Math.max(query.page(), 0);
        int size = Math.min(Math.max(query.size(), 1), 100);
        return jpaRepository.search(
                        query.type(),
                        query.userId() != null ? UUID.fromString(query.userId()) : null,
                        query.status(),
                        PageRequest.of(page, size))
                .map(mapper::toDomain);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }
}
