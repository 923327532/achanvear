package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.command.ProcessPaymentCommand;
import achanvear.peru.shared.web.ApiResponse;

public interface ProcessPaymentUseCase {
    ApiResponse<String> execute(ProcessPaymentCommand command);
}
