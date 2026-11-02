package achanvear.peru;

import achanvear.peru.profile.application.ProfileCvAccess;
import achanvear.peru.profile.application.port.CvVisibilityPort;
import achanvear.peru.shared.application.port.CurrentActorPort;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileCvAccessTest {
    private final UUID owner = UUID.randomUUID();
    private final UUID viewer = UUID.randomUUID();
    private final UUID company = UUID.randomUUID();
    private final CvVisibilityPort visibility = mock(CvVisibilityPort.class);

    @Test void ownerReadsOwnCvWithoutConsultingCompanyData() {
        var policy = policy(owner, "FREELANCER");
        assertTrue(policy.canView(owner));
        verifyNoInteractions(visibility);
    }

    @Test void privateCvRemainsHiddenFromCompany() {
        when(visibility.visibility(owner)).thenReturn("PRIVATE");
        assertFalse(policy(viewer, "COMPANY").canView(owner));
        verify(visibility, never()).companyExists(any(), any(), anyBoolean());
    }

    @Test void verifiedOnlyRequiresValidatedCompany() {
        when(visibility.visibility(owner)).thenReturn("VERIFIED_COMPANIES_ONLY");
        when(visibility.companyExists(viewer, company, true)).thenReturn(false, true);
        var policy = policy(viewer, "COMPANY_COLLABORATOR");
        assertFalse(policy.canView(owner));
        assertTrue(policy.canView(owner));
    }

    @Test void allCompaniesStillRequiresACompanyAccount() {
        when(visibility.visibility(owner)).thenReturn("ALL_COMPANIES");
        when(visibility.companyExists(viewer, company, false)).thenReturn(true);
        assertTrue(policy(viewer, "COMPANY").canView(owner));
        assertFalse(policy(viewer, "FREELANCER").canView(owner));
    }

    private ProfileCvAccess policy(UUID userId, String role) {
        CurrentActorPort actors = () -> Optional.of(new CurrentActorPort.Actor(userId, company, role, false));
        return new ProfileCvAccess(visibility, actors);
    }
}
