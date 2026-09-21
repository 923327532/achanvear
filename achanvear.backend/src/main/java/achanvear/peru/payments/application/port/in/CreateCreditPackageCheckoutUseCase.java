package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.command.CreateCreditPackageCheckoutCommand;

/**
 * Crea la preferencia de pago en Mercado Pago para un paquete de créditos
 * y devuelve la URL de checkout a la que debe redirigirse el usuario.
 */
public interface CreateCreditPackageCheckoutUseCase {

    String execute(CreateCreditPackageCheckoutCommand command);
}
