package achanvear.peru.payments.application.dto;

public record CreditPackageResponse(
        String id,
        String name,
        String description,
        Integer credits,
        Integer price,
        Double pricePerCredit,
        Integer savingsPercentage,
        Boolean isPopular,
        Boolean isActive
) {
}
