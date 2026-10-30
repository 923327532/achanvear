package achanvear.peru;

import achanvear.peru.payments.application.service.PaymentFinancialQueryService;
import achanvear.peru.payments.application.service.EscrowResponseMapper;
import achanvear.peru.payments.application.port.out.PaymentProjectLookup;
import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.*;
import achanvear.peru.payments.application.impl.GetPaymentTransactionsUseCaseImpl;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentReviewTest {
    private final EscrowRepository escrows = mock(EscrowRepository.class);
    private final WalletRepository wallets = mock(WalletRepository.class);
    private final PaymentFinancialQueryService finances = new PaymentFinancialQueryService(escrows, wallets);

    private Escrow escrow(EscrowStatus status, String amount, String platform, String processor, String net) {
        Escrow e = mock(Escrow.class);
        when(e.getStatus()).thenReturn(status);
        when(e.getAmount()).thenReturn(new BigDecimal(amount));
        when(e.getPlatformCommission()).thenReturn(new BigDecimal(platform));
        when(e.getMpCommission()).thenReturn(new BigDecimal(processor));
        when(e.getFreelancerAmount()).thenReturn(new BigDecimal(net));
        return e;
    }

    @Test void usesHistoricalCommissionsAndWalletBalanceAfterWithdrawals() {
        UUID user = UUID.randomUUID();
        var settled = escrow(EscrowStatus.RELEASED, "100", "0", "7", "93");
        when(escrows.findByFreelancerUserId(user)).thenReturn(List.of(settled));
        Wallet wallet = Wallet.create(user); wallet.deposit(new BigDecimal("93")); wallet.withdraw(new BigDecimal("80"));
        when(wallets.findByUserId(user)).thenReturn(Optional.of(wallet));
        var result = finances.freelancerSummary(user);
        assertEquals(new BigDecimal("13"), result.available());
        assertEquals(new BigDecimal("0"), result.platform());
        assertEquals(new BigDecimal("7"), result.commissions());
        assertEquals(new BigDecimal("93"), result.net());
    }

    @Test void onlyHeldAndDisputedEscrowsArePendingAndRefundsAreExcluded() {
        UUID user = UUID.randomUUID();
        var records = List.of(
                escrow(EscrowStatus.HELD, "100", "5", "4", "91"),
                escrow(EscrowStatus.DISPUTED, "50", "2", "2", "46"),
                escrow(EscrowStatus.REFUNDED, "200", "10", "8", "182"),
                escrow(EscrowStatus.PENDING, "300", "15", "12", "273"));
        when(escrows.findByClientUserId(user)).thenReturn(records);
        var result = finances.clientSummary(user);
        assertEquals(new BigDecimal("150"), result.pending());
        assertEquals(BigDecimal.ZERO, result.commissions());
        assertEquals(BigDecimal.ZERO, result.available());
    }

    @Test void escrowTitlesAreResolvedInOneBatch() {
        UUID project = UUID.randomUUID();
        Escrow first = escrow(EscrowStatus.HELD, "100", "5", "4", "91");
        Escrow second = escrow(EscrowStatus.HELD, "200", "10", "8", "182");
        for (var e : List.of(first, second)) {
            when(e.getProjectId()).thenReturn(project);
            when(e.getMilestoneId()).thenReturn(UUID.randomUUID());
            when(e.getId()).thenReturn(new EscrowId(UUID.randomUUID()));
        }
        var projects = mock(PaymentProjectLookup.class);
        when(projects.findTitles(List.of(project))).thenReturn(Map.of(project, "Proyecto real"));
        var response = new EscrowResponseMapper(projects).toResponses(List.of(first, second));
        assertEquals("Proyecto real", response.get(0).projectTitle());
        assertEquals("Proyecto real", response.get(1).projectTitle());
        verify(projects, times(1)).findTitles(List.of(project));
    }

    @Test void historyRejectsInvalidPaginationAndHandlesLargeOffsets() {
        var milestones = mock(MilestoneRepository.class);
        var history = new GetPaymentTransactionsUseCaseImpl(milestones);
        UUID user = UUID.randomUUID();
        assertThrows(IllegalArgumentException.class, () -> history.execute(user, -1, 10));
        assertThrows(IllegalArgumentException.class, () -> history.execute(user, 0, 0));
        assertThrows(IllegalArgumentException.class, () -> history.execute(user, 0, 101));
        assertTrue(history.execute(user, Integer.MAX_VALUE, 100).transactions().isEmpty());
    }

    @Test void professionalOverviewHasNoCompanyPlanOrUpgradeMessage() {
        UUID user = UUID.randomUUID();
        var overview = new achanvear.peru.payments.application.impl.GetPaymentsOverviewUseCaseImpl(
                mock(SubscriptionRepository.class),
                mock(achanvear.peru.shared.application.port.CompanyLookupPort.class),
                mock(achanvear.peru.jobs.domain.repository.JobPostRepository.class),
                mock(achanvear.peru.payments.application.service.PublicationCreditService.class), finances).execute(user);
        assertNull(overview.currentPlan()); assertNull(overview.planExpirationDate());
        assertNull(overview.upgradeMessage()); assertNull(overview.publishedProjectsCount());
        assertFalse(overview.canPublishMoreProjects());
    }
}
