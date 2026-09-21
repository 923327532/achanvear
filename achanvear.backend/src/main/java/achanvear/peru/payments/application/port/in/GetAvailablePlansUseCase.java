package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.PlanOptionResponse;

import java.util.List;

public interface GetAvailablePlansUseCase {
    List<PlanOptionResponse> execute();
}
