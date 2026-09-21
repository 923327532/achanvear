package achanvear.peru.freelance.domain.factory;

import achanvear.peru.freelance.domain.model.FreelancerCertification;
import achanvear.peru.freelance.domain.model.FreelancerProfile;
import achanvear.peru.freelance.domain.model.PaymentMethodType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class FreelancerProfileFactory {

    public FreelancerProfile create(
            UUID userId,
            String name,
            String industry,
            String specialty,
            String profilePhotoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            String dni,
            String curriculumUrl,
            List<FreelancerCertification> certifications
    ) {
        return FreelancerProfile.create(
                userId,
                name,
                industry,
                specialty,
                profilePhotoUrl,
                biography,
                achievements,
                address,
                paymentMethodType,
                dni,
                curriculumUrl,
                certifications
        );
    }
}