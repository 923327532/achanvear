package achanvear.peru.admin.application;

import achanvear.peru.admin.application.dto.AdminInterviewPageResponse;
import achanvear.peru.interview.application.query.AdminInterviewQuery;

public interface ListInterviewsUseCase {

    AdminInterviewPageResponse list(AdminInterviewQuery query);
}
