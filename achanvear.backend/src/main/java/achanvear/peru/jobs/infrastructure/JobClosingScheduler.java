package achanvear.peru.jobs.infrastructure;

import achanvear.peru.jobs.infrastructure.persistence.JobPostJpaRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@EnableScheduling
public class JobClosingScheduler {
    private final JobPostJpaRepository repository;

    public JobClosingScheduler(JobPostJpaRepository repository) {
        this.repository = repository;
    }

    @Scheduled(fixedDelayString = "${jobs.closing-check-ms:15000}")
    @Transactional
    public void closeExpiredJobs() {
        repository.closeExpiredJobs();
    }
}
