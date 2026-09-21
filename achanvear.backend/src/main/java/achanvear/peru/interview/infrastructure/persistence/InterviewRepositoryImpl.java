package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.infrastructure.persistence.repository.InterviewJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class InterviewRepositoryImpl implements InterviewRepository {

    private final InterviewJpaRepository jpaRepository;
    private final InterviewMapper mapper;

    public InterviewRepositoryImpl(InterviewJpaRepository jpaRepository, InterviewMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Interview interview) {
        jpaRepository.save(mapper.toEntity(interview));
    }

    @Override
    public Optional<Interview> findById(InterviewId interviewId) {
        return jpaRepository.findDetailedById(interviewId.toString())
                .map(mapper::toDomain);
    }

    @Override
    public List<Interview> findByCandidateId(String candidateId) {
        return jpaRepository.findByCandidateId(candidateId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}
