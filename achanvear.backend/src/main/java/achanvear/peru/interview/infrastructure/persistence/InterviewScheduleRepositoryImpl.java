package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.domain.model.InterviewSchedule;
import achanvear.peru.interview.domain.repository.InterviewScheduleRepository;
import achanvear.peru.interview.infrastructure.persistence.entity.InterviewScheduleJpaEntity;
import achanvear.peru.interview.infrastructure.persistence.repository.InterviewScheduleJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class InterviewScheduleRepositoryImpl implements InterviewScheduleRepository {

    private final InterviewScheduleJpaRepository jpaRepository;
    private final InterviewScheduleMapper mapper;

    public InterviewScheduleRepositoryImpl(
            InterviewScheduleJpaRepository jpaRepository,
            InterviewScheduleMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(InterviewSchedule schedule) {
        InterviewScheduleJpaEntity entity = mapper.toEntity(schedule);
        jpaRepository.save(entity);
    }

    @Override
    public Optional<InterviewSchedule> findById(String id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<InterviewSchedule> findByToken(String token) {
        return jpaRepository.findByInterviewToken(token)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<InterviewSchedule> findByHiringProcessIdAndType(String hiringProcessId, String interviewType) {
        return jpaRepository.findByHiringProcessIdAndInterviewType(hiringProcessId, interviewType)
                .map(mapper::toDomain);
    }

    @Override
    public List<InterviewSchedule> findByCandidateId(String candidateId) {
        return jpaRepository.findByCandidateId(candidateId)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
