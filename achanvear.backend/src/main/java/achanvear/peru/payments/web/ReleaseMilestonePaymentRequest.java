package achanvear.peru.payments.web;

import jakarta.validation.constraints.Size;

public record ReleaseMilestonePaymentRequest(
        @Size(max = 500, message = "Comments must not exceed 500 characters")
        String comments
) {
}
