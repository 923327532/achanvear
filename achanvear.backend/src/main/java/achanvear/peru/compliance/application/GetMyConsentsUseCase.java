package achanvear.peru.compliance.application;

import achanvear.peru.compliance.application.dto.ConsentRecordResponse;

import java.util.List;

public interface GetMyConsentsUseCase {

    List<ConsentRecordResponse> getMyConsents(String userId);
}
