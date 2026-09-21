package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.command.CreateMilestoneDepositIntentCommand;
import achanvear.peru.payments.application.dto.MilestoneDepositIntentResponse;

public interface CreateMilestoneDepositIntentUseCase {
    MilestoneDepositIntentResponse execute(CreateMilestoneDepositIntentCommand command);
}
