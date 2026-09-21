package achanvear.peru.payments.infrastructure.external;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

public record CreateSubscriptionRequest(
        String reason,
        String external_reference,
        AutoRecurring auto_recurring,
        String payer_email,
        String back_url
) {
    public CreateSubscriptionRequest(String reason, String description, int monthlyPrice, String userId, String userEmail) {
        this(
                reason,
                userId,
                new AutoRecurring(monthlyPrice),
                userEmail,
                "http://localhost:8081/payment/success"
        );
    }

    public record AutoRecurring(
            String currency,
            int transaction_amount,
            int frequency,
            String frequency_type,
            String start_date
    ) {
        public AutoRecurring(int monthlyPrice) {
            this("PEN", monthlyPrice, 1, "months", OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }
    }
}
