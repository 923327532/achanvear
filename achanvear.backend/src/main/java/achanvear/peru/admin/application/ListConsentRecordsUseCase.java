package achanvear.peru.admin.application;

import achanvear.peru.compliance.application.command.ConsentListQuery;
import achanvear.peru.compliance.application.dto.ConsentPageResponse;

public interface ListConsentRecordsUseCase {

    ConsentPageResponse list(ConsentListQuery query);
}
