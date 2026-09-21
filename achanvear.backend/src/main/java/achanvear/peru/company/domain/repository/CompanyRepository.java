package achanvear.peru.company.domain.repository;

import achanvear.peru.company.domain.model.Company;
import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.company.application.query.CompanyListQuery;
import org.springframework.data.domain.Page;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository {

    void save(Company company);

    Optional<Company> findById(CompanyId companyId);

    Optional<Company> findByOwnerUserId(UUID ownerUserId);

    boolean existsByOwnerUserId(UUID ownerUserId);

    boolean existsByBusinessName(String businessName);

    Page<Company> search(CompanyListQuery query);
}