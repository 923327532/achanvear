package achanvear.peru.payments.application.command;

/**
 * Comando para iniciar la compra de un paquete de créditos con Mercado Pago.
 */
public record CreateCreditPackageCheckoutCommand(
        String packageId,
        String companyUserId,
        String clientEmail
) {
}
