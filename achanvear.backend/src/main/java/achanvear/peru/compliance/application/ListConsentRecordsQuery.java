package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.command.ConsentListQuery;
import achanvear.peru.compliance.application.dto.ConsentPageResponse;

public interface ListConsentRecordsQuery {

    ConsentPageResponse list(ConsentListQuery query);
}
