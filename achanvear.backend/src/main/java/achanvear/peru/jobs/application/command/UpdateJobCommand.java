package achanvear.peru.jobs.application.command;

import java.math.BigDecimal;

public record UpdateJobCommand(
        String jobPostId,
        String requesterCompanyId,
        boolean superAdmin,
        String title,
        String description,
        String location,
        String type,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String currency,
        Integer vacancies
) {
}