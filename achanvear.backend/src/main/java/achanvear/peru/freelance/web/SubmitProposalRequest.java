package achanvear.peru.freelance.web;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SubmitProposalRequest(
        @NotBlank
        @Size(min = 10, max = 2000)
        String coverLetter,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal proposedBudget,

        @NotNull
        Integer estimatedDays,

        String portfolioUrl
) {
}
