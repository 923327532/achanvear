package achanvear.peru.payments.application.service;

import achanvear.peru.payments.infrastructure.persistence.CreditPackageJpaEntity;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageRepository;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PublicationCreditService {

    private final JdbcTemplate jdbcTemplate;
    private final CreditPackageRepository creditPackageRepository;

    public PublicationCreditService(JdbcTemplate jdbcTemplate, CreditPackageRepository creditPackageRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.creditPackageRepository = creditPackageRepository;
    }

    public int getBalance(UUID userId) {
        Integer balance = jdbcTemplate.query(
                "select balance from publication_credit_wallets where user_id = ?",
                rs -> rs.next() ? rs.getInt("balance") : null,
                userId
        );
        return balance != null ? balance : 0;
    }

    @Transactional
    public void consumeOne(UUID userId) {
        int updated = jdbcTemplate.update("""
                update publication_credit_wallets
                set balance = balance - 1, updated_at = current_timestamp
                where user_id = ? and balance > 0
                """, userId);

        if (updated == 0) {
            throw new BusinessRuleViolationException(
                    "No tienes publicaciones disponibles. Compra un paquete o activa un plan para publicar mas empleos."
            );
        }
    }

    @Transactional
    public UUID createPendingPurchase(UUID userId, String packageId) {
        CreditPackageJpaEntity pkg = creditPackageRepository.findById(packageId)
                .filter(CreditPackageJpaEntity::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Paquete de publicaciones no encontrado"));

        UUID purchaseId = UUID.randomUUID();
        jdbcTemplate.update("""
                insert into credit_package_purchases
                    (id, user_id, package_id, credits_granted, amount_paid, payment_method, status)
                values (?, ?, ?, ?, ?, ?, ?)
                """,
                purchaseId,
                userId,
                pkg.getId(),
                pkg.getCredits(),
                pkg.getPrice(),
                "MERCADO_PAGO",
                "PENDING"
        );
        return purchaseId;
    }

    @Transactional
    public boolean activatePendingPurchase(UUID purchaseId, String mpPaymentId) {
        Optional<PendingPurchase> purchase = findPendingPurchase(purchaseId);
        if (purchase.isEmpty()) {
            return false;
        }

        PendingPurchase pending = purchase.get();
        jdbcTemplate.update("""
                insert into publication_credit_wallets (user_id, balance)
                values (?, ?)
                on conflict (user_id)
                do update set balance = publication_credit_wallets.balance + excluded.balance,
                              updated_at = current_timestamp
                """, pending.userId(), pending.creditsGranted());

        jdbcTemplate.update("""
                update credit_package_purchases
                set status = 'COMPLETED', mp_payment_id = ?
                where id = ?
                """, mpPaymentId, purchaseId);

        return true;
    }

    @Transactional
    public UUID recordCompletedCulqiPurchase(UUID userId, String packageId, String culqiChargeId) {
        CreditPackageJpaEntity pkg = creditPackageRepository.findById(packageId)
                .filter(CreditPackageJpaEntity::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Paquete de publicaciones no encontrado"));

        UUID purchaseId = UUID.randomUUID();
        jdbcTemplate.update("""
                insert into credit_package_purchases
                    (id, user_id, package_id, credits_granted, amount_paid, payment_method, status, mp_payment_id)
                values (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                purchaseId,
                userId,
                pkg.getId(),
                pkg.getCredits(),
                pkg.getPrice(),
                "CULQI",
                "COMPLETED",
                culqiChargeId
        );

        jdbcTemplate.update("""
                insert into publication_credit_wallets (user_id, balance)
                values (?, ?)
                on conflict (user_id)
                do update set balance = publication_credit_wallets.balance + excluded.balance,
                              updated_at = current_timestamp
                """, userId, pkg.getCredits());

        return purchaseId;
    }

    private Optional<PendingPurchase> findPendingPurchase(UUID purchaseId) {
        return jdbcTemplate.query("""
                select user_id, credits_granted
                from credit_package_purchases
                where id = ? and status = 'PENDING'
                """, rs -> {
            if (!rs.next()) {
                return Optional.empty();
            }
            return Optional.of(new PendingPurchase(
                    (UUID) rs.getObject("user_id"),
                    rs.getInt("credits_granted")
            ));
        }, purchaseId);
    }

    private record PendingPurchase(UUID userId, int creditsGranted) {
    }
}
