package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.PaymentTransactionPageResponse;
import achanvear.peru.payments.application.dto.PaymentTransactionResponse;
import achanvear.peru.payments.application.port.in.GetPaymentTransactionsUseCase;
import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class GetPaymentTransactionsUseCaseImpl implements GetPaymentTransactionsUseCase {

    private final MilestoneRepository milestoneRepository;

    public GetPaymentTransactionsUseCaseImpl(MilestoneRepository milestoneRepository) {
        this.milestoneRepository = milestoneRepository;
    }

    @Override
    public PaymentTransactionPageResponse execute(UUID userId, int page, int size) {
        // Obtener milestones donde el usuario es cliente o freelancer
        var asClient = milestoneRepository.findByClientUserId(userId);
        var asFreelancer = milestoneRepository.findByFreelancerUserId(userId);

        List<PaymentTransactionResponse> allTransactions = new ArrayList<>();
        var formatter = DateTimeFormatter.ISO_INSTANT;

        // Transacciones como cliente (depósitos)
        asClient.forEach(m -> {
            String type = m.getStatus() == MilestoneStatus.PENDING ? "DEPOSIT_PENDING" : "DEPOSIT";
            allTransactions.add(new PaymentTransactionResponse(
                    m.getId().value().toString(),
                    type,
                    "Depósito milestone: " + m.getTitle(),
                    m.getAmount(),
                    m.getStatus().name(),
                    m.getCreatedAt() != null ? formatter.format(m.getCreatedAt()) : null,
                    m.getId().value(),
                    "MILESTONE"
            ));
        });

        // Transacciones como freelancer (ganancias)
        asFreelancer.forEach(m -> {
            if (m.getStatus() == MilestoneStatus.RELEASED) {
                allTransactions.add(new PaymentTransactionResponse(
                        m.getId().value().toString(),
                        "EARNING",
                        "Ganancia milestone: " + m.getTitle(),
                        m.getAmount(),
                        "COMPLETED",
                        m.getReleasedAt() != null ? formatter.format(m.getReleasedAt()) : null,
                        m.getId().value(),
                        "MILESTONE"
                ));
            } else if (m.getStatus() == MilestoneStatus.READY_FOR_REVIEW) {
                allTransactions.add(new PaymentTransactionResponse(
                        m.getId().value().toString(),
                        "PENDING_RELEASE",
                        "Pendiente liberación: " + m.getTitle(),
                        m.getAmount(),
                        "PENDING",
                        m.getFundedAt() != null ? formatter.format(m.getFundedAt()) : null,
                        m.getId().value(),
                        "MILESTONE"
                ));
            }
        });

        // Ordenar por fecha descendente
        allTransactions.sort(Comparator.comparing(
                PaymentTransactionResponse::createdAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        // Paginar
        int total = allTransactions.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, total);

        List<PaymentTransactionResponse> pagedList = (fromIndex < total)
                ? allTransactions.subList(fromIndex, toIndex)
                : List.of();

        int totalPages = (int) Math.ceil((double) total / size);

        return new PaymentTransactionPageResponse(
                pagedList,
                page,
                totalPages,
                total,
                page < totalPages - 1
        );
    }
}
