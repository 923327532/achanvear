package achanvear.peru.jobs.application;

import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GetAppliedJobIdsUseCase {

    private final ApplicationRepository applicationRepository;

    public GetAppliedJobIdsUseCase(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public List<String> execute(UUID candidateUserId) {
        return applicationRepository.findByCandidateUserId(candidateUserId)
                .stream()
                .map(app -> app.getJobPostId().toString())
                .collect(Collectors.toList());
    }
}
