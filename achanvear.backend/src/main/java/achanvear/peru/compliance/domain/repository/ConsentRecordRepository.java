package achanvear.peru.compliance.domain.repository;

import achanvear.peru.compliance.application.command.ConsentListQuery;
import achanvear.peru.compliance.domain.model.ConsentRecord;
import achanvear.peru.compliance.domain.model.ConsentRecordId;
import achanvear.peru.compliance.domain.model.ConsentType;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface ConsentRecordRepository {

    void save(ConsentRecord record);

    Optional<ConsentRecord> findById(ConsentRecordId id);

    List<ConsentRecord> findByUserId(String userId);

    List<ConsentRecord> findByInterviewId(String interviewId);

    Optional<ConsentRecord> findAcceptedByInterviewIdAndType(String interviewId, ConsentType type);

    Optional<ConsentRecord> findAcceptedByUserIdAndType(String userId, ConsentType type);

    Page<ConsentRecord> search(ConsentListQuery query);

    long count();
}
