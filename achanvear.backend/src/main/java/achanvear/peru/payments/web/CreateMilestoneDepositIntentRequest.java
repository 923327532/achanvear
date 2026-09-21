package achanvear.peru.payments.web;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateMilestoneDepositIntentRequest(
        @NotNull(message = "Project ID is required")
        UUID projectId,

        @NotNull(message = "Freelancer user ID is required")
        UUID freelancerUserId,

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "10.00", message = "Minimum amount is 10.00")
        @DecimalMax(value = "50000.00", message = "Maximum amount is 50000.00")
        @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 integer and 2 decimal digits")
        BigDecimal amount,

        @NotBlank(message = "Client email is required")
        @Email(message = "Invalid email format")
        String clientEmail
) {
}
