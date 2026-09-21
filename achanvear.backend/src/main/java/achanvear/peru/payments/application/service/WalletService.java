package achanvear.peru.payments.application.service;

import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.*;
import achanvear.peru.payments.infrastructure.external.IzipayDispersalGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio para manejar wallets internas y recargas rápidas (Yape, Plin).
 * También gestiona los métodos de retiro (tarjeta tokenizada) y las solicitudes
 * de retiro (dispersión de fondos vía Izipay).
 */
@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final QuickRechargeRepository quickRechargeRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final PayoutMethodRepository payoutMethodRepository;
    private final PayoutRepository payoutRepository;
    private final IzipayDispersalGateway izipayDispersalGateway;
    private final AuditService auditService;

    public WalletService(
            WalletRepository walletRepository,
            QuickRechargeRepository quickRechargeRepository,
            WalletTransactionRepository walletTransactionRepository,
            PayoutMethodRepository payoutMethodRepository,
            PayoutRepository payoutRepository,
            IzipayDispersalGateway izipayDispersalGateway,
            AuditService auditService
    ) {
        this.walletRepository = walletRepository;
        this.quickRechargeRepository = quickRechargeRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.payoutMethodRepository = payoutMethodRepository;
        this.payoutRepository = payoutRepository;
        this.izipayDispersalGateway = izipayDispersalGateway;
        this.auditService = auditService;
    }

    /**
     * Obtiene o crea la wallet de un usuario.
     */
    @Transactional
    public Wallet getOrCreateWallet(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet wallet = Wallet.create(userId);
                    walletRepository.save(wallet);
                    auditService.logWalletCreated(userId, wallet.getId().value().toString(), null);
                    return wallet;
                });
    }

    /**
     * Obtiene la wallet de un usuario.
     */
    public Wallet getWallet(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));
    }

    /**
     * Procesa una recarga rápida (Yape, Plin, etc.).
     */
    @Transactional
    public QuickRecharge processQuickRecharge(
            UUID userId,
            BigDecimal amount,
            String method,
            String phoneNumber
    ) {
        // Validar método
        if (!List.of("YAPE", "PLIN", "MP_WALLET", "DEBIT_CARD", "CREDIT_CARD").contains(method)) {
            throw new IllegalArgumentException("Invalid recharge method: " + method);
        }

        // Validar monto mínimo
        if (amount.compareTo(new BigDecimal("5.00")) < 0) {
            throw new IllegalArgumentException("Minimum recharge amount is 5.00");
        }

        // Validar monto máximo
        if (amount.compareTo(new BigDecimal("5000.00")) > 0) {
            throw new IllegalArgumentException("Maximum recharge amount is 5000.00");
        }

        // Obtener o crear wallet
        Wallet wallet = getOrCreateWallet(userId);

        // Crear registro de recarga
        QuickRecharge recharge = QuickRecharge.create(
                userId,
                wallet.getId().value(),
                amount,
                method,
                phoneNumber
        );

        quickRechargeRepository.save(recharge);

        auditService.logQuickRechargeInitiated(userId, recharge.getId().value().toString(),
                method, amount.toString(), null);

        return recharge;
    }

    /**
     * Confirma una recarga rápida (completada exitosamente).
     */
    @Transactional
    public QuickRecharge confirmQuickRecharge(UUID rechargeId, String referenceCode) {
        QuickRecharge recharge = quickRechargeRepository.findById(new QuickRechargeId(rechargeId))
                .orElseThrow(() -> new IllegalArgumentException("Quick recharge not found: " + rechargeId));

        // Marcar como completada
        recharge.complete(referenceCode);
        quickRechargeRepository.save(recharge);

        // Depositar fondos en la wallet
        Wallet wallet = walletRepository.findById(new WalletId(recharge.getWalletId()))
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        BigDecimal balanceBefore = wallet.getBalance();
        wallet.deposit(recharge.getAmount());
        walletRepository.save(wallet);

        // Registrar transacción
        WalletTransaction transaction = WalletTransaction.createDeposit(
                wallet.getId().value(),
                wallet.getUserId(),
                recharge.getAmount(),
                balanceBefore,
                wallet.getBalance(),
                "QUICK_RECHARGE",
                recharge.getId().value().toString(),
                "Recarga vía " + recharge.getMethod()
        );
        walletTransactionRepository.save(transaction);

        auditService.logQuickRechargeCompleted(
                recharge.getUserId(),
                recharge.getId().value().toString(),
                recharge.getAmount().toString(),
                null
        );

        return recharge;
    }

    /**
     * Rechaza una recarga rápida (falló).
     */
    @Transactional
    public QuickRecharge failQuickRecharge(UUID rechargeId, String reason) {
        QuickRecharge recharge = quickRechargeRepository.findById(new QuickRechargeId(rechargeId))
                .orElseThrow(() -> new IllegalArgumentException("Quick recharge not found: " + rechargeId));

        recharge.fail(reason);
        quickRechargeRepository.save(recharge);

        auditService.logQuickRechargeFailed(
                recharge.getUserId(),
                recharge.getId().value().toString(),
                reason,
                null
        );

        return recharge;
    }

    /**
     * Obtiene el historial de recargas de un usuario.
     */
    public List<QuickRecharge> getRechargeHistory(UUID userId) {
        return quickRechargeRepository.findByUserId(userId);
    }

    /**
     * Obtiene las transacciones de wallet de un usuario.
     */
    public List<WalletTransaction> getWalletTransactions(UUID userId) {
        Wallet wallet = getWallet(userId);
        return walletTransactionRepository.findByWalletId(wallet.getId().value());
    }

    /**
     * Gasta fondos de la wallet para un pago.
     */
    @Transactional
    public void spendFromWallet(UUID userId, BigDecimal amount, String referenceType, String referenceId, String description) {
        Wallet wallet = getWallet(userId);
        BigDecimal balanceBefore = wallet.getBalance();
        wallet.spend(amount);
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.createPayment(
                wallet.getId().value(),
                userId,
                amount,
                balanceBefore,
                wallet.getBalance(),
                referenceType,
                referenceId,
                description
        );
        walletTransactionRepository.save(transaction);
    }

    /**
     * Reembolsa fondos a la wallet.
     */
    @Transactional
    public void refundToWallet(UUID userId, BigDecimal amount, String referenceType, String referenceId, String description) {
        Wallet wallet = getWallet(userId);
        BigDecimal balanceBefore = wallet.getBalance();
        wallet.refund(amount);
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.createRefund(
                wallet.getId().value(),
                userId,
                amount,
                balanceBefore,
                wallet.getBalance(),
                referenceType,
                referenceId,
                description
        );
        walletTransactionRepository.save(transaction);
    }

    // ─── Métodos de retiro (tarjeta tokenizada) ─────────────────────────────────

    /**
     * Registra una tarjeta como método de retiro.
     * Tiyuy solo almacena datos enmascarados y el token del proveedor (nunca el número completo ni CVV).
     */
    @Transactional
    public PayoutMethod registerPayoutMethod(
            UUID userId,
            String cardToken,
            String maskedCard,
            String cardBrand,
            String lastFourDigits,
            String accountHolderName
    ) {
        PayoutMethod method = PayoutMethod.create(
                userId, "IZIPAY", cardToken, maskedCard, cardBrand, lastFourDigits, accountHolderName
        );

        // El primer método registrado queda como principal
        if (payoutMethodRepository.findByUserId(userId).isEmpty()) {
            method.markAsDefault();
        }

        payoutMethodRepository.save(method);
        auditService.logPayoutMethodAdded(userId, method.getId().value().toString(), maskedCard, null);
        return method;
    }

    /**
     * Lista los métodos de retiro del usuario.
     */
    public List<PayoutMethod> listPayoutMethods(UUID userId) {
        return payoutMethodRepository.findByUserId(userId);
    }

    /**
     * Desactiva (no elimina físicamente) un método de retiro.
     */
    @Transactional
    public void removePayoutMethod(UUID userId, UUID methodId) {
        PayoutMethod method = findOwnedPayoutMethod(userId, methodId);
        method.deactivate();
        payoutMethodRepository.save(method);
        auditService.logPayoutMethodRemoved(userId, methodId.toString(), null);
    }

    /**
     * Marca un método de retiro como principal.
     */
    @Transactional
    public void setDefaultPayoutMethod(UUID userId, UUID methodId) {
        payoutMethodRepository.findDefaultByUserId(userId).ifPresent(currentDefault -> {
            currentDefault.unmarkAsDefault();
            payoutMethodRepository.save(currentDefault);
        });

        PayoutMethod method = findOwnedPayoutMethod(userId, methodId);
        method.markAsDefault();
        payoutMethodRepository.save(method);
    }

    private PayoutMethod findOwnedPayoutMethod(UUID userId, UUID methodId) {
        PayoutMethod method = payoutMethodRepository.findById(new PayoutMethodId(methodId))
                .orElseThrow(() -> new IllegalArgumentException("Método de retiro no encontrado"));
        if (!method.getUserId().equals(userId)) {
            throw new SecurityException("Acceso denegado");
        }
        return method;
    }

    // ─── Solicitud de retiro (dispersión) ───────────────────────────────────────

    /**
     * Solicita un retiro del saldo disponible.
     *
     * <p>Flujo: valida saldo y método activo -> reserva (descuenta) el saldo ->
     * crea el payout -> solicita la dispersión a Izipay -> registra el movimiento
     * WITHDRAWAL en el ledger. La operación es idempotente por idempotencyKey.
     */
    @Transactional
    public Payout requestPayout(UUID userId, BigDecimal amount, UUID payoutMethodId, String idempotencyKey) {
        String key = (idempotencyKey == null || idempotencyKey.isBlank())
                ? "payout-" + userId + "-" + UUID.randomUUID()
                : idempotencyKey.trim();

        // Idempotencia: si ya existe una solicitud con la misma clave, se devuelve.
        Optional<Payout> existing = payoutRepository.findByIdempotencyKey(key);
        if (existing.isPresent()) {
            return existing.get();
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Monto de retiro inválido");
        }
        if (amount.compareTo(new BigDecimal("1.00")) < 0) {
            throw new IllegalArgumentException("El monto mínimo de retiro es S/ 1.00");
        }

        Wallet wallet = getWallet(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Saldo insuficiente para el retiro");
        }

        PayoutMethod method = findOwnedPayoutMethod(userId, payoutMethodId);
        if (!method.isActive()) {
            throw new IllegalStateException("El método de retiro no está activo");
        }

        // 1) Reservar saldo disponible
        BigDecimal balanceBefore = wallet.getBalance();
        wallet.withdraw(amount);
        walletRepository.save(wallet);

        // 2) Crear el payout
        Payout payout = Payout.create(
                userId,
                wallet.getId().value(),
                method.getId().value(),
                amount,
                key
        );
        payoutRepository.save(payout);

        // 3) Solicitar dispersión a Izipay
        var result = izipayDispersalGateway.disperse(
                payout.getId().value(), amount, method.getMaskedCard(), method.getCardToken()
        );
        payout.markProcessing(result.externalDisbursementId());

        // 4) Si el proveedor reporta fallo inmediato, revertir la reserva
        if (result.status() == IzipayDispersalGateway.DisbursementStatus.FAILED) {
            payout.fail(result.message());
            wallet.refund(amount);
            walletRepository.save(wallet);
        }

        payoutRepository.save(payout);

        // 5) Registrar el movimiento en el ledger
        WalletTransaction transaction = WalletTransaction.createWithdrawal(
                wallet.getId().value(),
                userId,
                amount,
                balanceBefore,
                wallet.getBalance(),
                "PAYOUT",
                payout.getId().value().toString(),
                "Retiro a " + (method.getCardBrand() != null ? method.getCardBrand() : "tarjeta")
                        + " •••• " + method.getLastFourDigits(),
                payout.getStatus().name()
        );
        walletTransactionRepository.save(transaction);

        auditService.logPayoutRequested(
                userId,
                payout.getId().value().toString(),
                amount.toString(),
                method.getMaskedCard(),
                null
        );

        return payout;
    }

    /**
     * Consulta el estado del desembolso en el proveedor y actualiza el payout.
     * Si el desembolso falló, revierte la reserva del saldo.
     */
    @Transactional
    public Payout refreshPayout(UUID userId, UUID payoutId) {
        Payout payout = payoutRepository.findById(new PayoutId(payoutId))
                .orElseThrow(() -> new IllegalArgumentException("Retiro no encontrado"));
        if (!payout.getUserId().equals(userId)) {
            throw new SecurityException("Acceso denegado");
        }
        if (!payout.canRequestRefresh()) {
            return payout;
        }

        var status = izipayDispersalGateway.getDisbursementStatus(payout.getExternalDisbursementId());

        if (status == IzipayDispersalGateway.DisbursementStatus.COMPLETED) {
            payout.complete();
            payoutRepository.save(payout);
            auditService.logPayoutCompleted(userId, payoutId.toString(), payout.getExternalDisbursementId(), null);
        } else if (status == IzipayDispersalGateway.DisbursementStatus.FAILED) {
            payout.fail("El proveedor reportó un fallo en el desembolso");
            // Revertir la reserva del saldo
            Wallet wallet = getWallet(userId);
            wallet.refund(payout.getAmount());
            walletRepository.save(wallet);

            WalletTransaction reversal = WalletTransaction.createRefund(
                    wallet.getId().value(),
                    userId,
                    payout.getAmount(),
                    wallet.getBalance().subtract(payout.getAmount()),
                    wallet.getBalance(),
                    "PAYOUT_REVERSAL",
                    payout.getId().value().toString(),
                    "Reversión de retiro fallido"
            );
            walletTransactionRepository.save(reversal);

            payoutRepository.save(payout);
            auditService.logPayoutFailed(userId, payoutId.toString(), payout.getFailureReason(), null);
        }

        return payout;
    }

    /**
     * Historial de retiros del usuario.
     */
    public List<Payout> getPayoutHistory(UUID userId) {
        return payoutRepository.findByUserId(userId);
    }
}
