package achanvear.peru.payments.application.dto;

import java.util.List;

public record PaymentTransactionPageResponse(
        List<PaymentTransactionResponse> transactions,
        int currentPage,
        int totalPages,
        long totalElements,
        boolean hasNext
) {
}
