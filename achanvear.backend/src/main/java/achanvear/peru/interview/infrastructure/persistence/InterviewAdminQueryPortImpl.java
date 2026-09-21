package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.application.port.out.InterviewAdminQueryPort;
import achanvear.peru.interview.application.query.AdminInterviewQuery;
import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.infrastructure.persistence.repository.InterviewJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InterviewAdminQueryPortImpl implements InterviewAdminQueryPort {

    private final InterviewJpaRepository interviewJpaRepository;
    private final InterviewMapper interviewMapper;

    public InterviewAdminQueryPortImpl(
            InterviewJpaRepository interviewJpaRepository,
            InterviewMapper interviewMapper
    ) {
        this.interviewJpaRepository = interviewJpaRepository;
        this.interviewMapper = interviewMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Interview> findForAdmin(AdminInterviewQuery query) {
        int page = Math.max(query.page(), 0);
        int size = Math.min(Math.max(query.size(), 1), 100);
        return interviewJpaRepository.searchInterviews(
                        normalize(query.status()),
                        normalize(query.interviewType()),
                        PageRequest.of(page, size))
                .map(interviewMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return interviewJpaRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        return interviewJpaRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByInterviewType(String type) {
        return interviewJpaRepository.countByInterviewType(type);
    }

    @Override
    @Transactional(readOnly = true)
    public long countApproved() {
        return interviewJpaRepository.countApproved();
    }

    @Override
    @Transactional(readOnly = true)
    public long countRejected() {
        return interviewJpaRepository.countRejected();
    }

    @Override
    @Transactional(readOnly = true)
    public long countWithPythonSession() {
        return interviewJpaRepository.countWithPythonSession();
    }

    @Override
    @Transactional(readOnly = true)
    public long countTotalViolations() {
        return interviewJpaRepository.countTotalViolations();
    }

    private String normalize(String value) {
        return value != null && value.isBlank() ? null : value;
    }
}
