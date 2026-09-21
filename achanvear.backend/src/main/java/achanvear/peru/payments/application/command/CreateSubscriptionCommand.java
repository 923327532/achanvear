package achanvear.peru.payments.application.command;

import achanvear.peru.payments.domain.model.PlanType;

import java.util.UUID;

public record CreateSubscriptionCommand(
        PlanType plan,
        UUID companyUserId,
        String companyEmail
) {
}