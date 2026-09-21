package achanvear.peru.company.infrastructure.persistence;

import achanvear.peru.company.application.port.out.CompanyQueryPort;
import org.springframework.stereotype.Component;

@Component
public class CompanyQueryPortImpl implements CompanyQueryPort {

    private final CompanyJpaRepository companyJpaRepository;

    public CompanyQueryPortImpl(CompanyJpaRepository companyJpaRepository) {
        this.companyJpaRepository = companyJpaRepository;
    }

    @Override
    public long countAll() {
        return companyJpaRepository.count();
    }
}
