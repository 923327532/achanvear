package achanvear.peru.company.web;

import jakarta.validation.constraints.NotBlank;

public record ChangeCompanyStatusRequest(
        @NotBlank String status
) {
}