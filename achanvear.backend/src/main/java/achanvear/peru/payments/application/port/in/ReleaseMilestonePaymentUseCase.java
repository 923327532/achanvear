package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.command.ReleaseMilestonePaymentCommand;
import achanvear.peru.payments.application.dto.MilestoneReleasedResponse;

public interface ReleaseMilestonePaymentUseCase {
    MilestoneReleasedResponse execute(ReleaseMilestonePaymentCommand command);
}
