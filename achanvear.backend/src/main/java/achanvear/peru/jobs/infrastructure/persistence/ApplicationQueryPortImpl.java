package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.application.port.out.ApplicationQueryPort;
import org.springframework.stereotype.Component;

@Component
public class ApplicationQueryPortImpl implements ApplicationQueryPort {

    private final ApplicationJpaRepository applicationJpaRepository;

    public ApplicationQueryPortImpl(ApplicationJpaRepository applicationJpaRepository) {
        this.applicationJpaRepository = applicationJpaRepository;
    }

    @Override
    public long countAll() {
        return applicationJpaRepository.count();
    }
}
