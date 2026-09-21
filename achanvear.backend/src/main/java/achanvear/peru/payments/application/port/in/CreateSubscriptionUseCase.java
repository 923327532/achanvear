package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.command.CreateSubscriptionCommand;

public interface CreateSubscriptionUseCase {
    String execute(CreateSubscriptionCommand command);
}
