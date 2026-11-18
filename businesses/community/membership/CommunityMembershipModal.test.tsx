/**
 * @vitest-environment jsdom
 */

import { COMMUNITY_PATH, COMMUNITY_WORKSHOP_SLUG } from '@/businesses/community/config';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { InputHTMLAttributes } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The checkbox of the design system measures itself, which the test document cannot do.
vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        checked?: boolean;
        onCheckedChange?: (isChecked: boolean) => void;
    }) => (
        <input
            {...props}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        />
    ),
}));

const fetchCommunityMembership = vi.fn<(workshopSlug: string) => Promise<CommunityMembershipRoomState>>();
const confirmCommunityMembershipCheckout =
    vi.fn<(workshopSlug: string, checkoutSessionId: string) => Promise<CommunityMembershipRoomState>>();
const scheduleCommunityMembershipCancellation = vi.fn<(workshopSlug: string) => Promise<CommunityMembershipRoomState>>();
const reactivateCommunityMembership = vi.fn<(workshopSlug: string) => Promise<CommunityMembershipRoomState>>();
const openCommunityMembershipSubscriptionPortal =
    vi.fn<(workshopSlug: string) => Promise<{ readonly portalUrl: string }>>();
const startCommunityMembershipPurchase = vi.fn();
const validateDiscountCode = vi.fn<(discountCode: string, discountPlaceId: string) => Promise<unknown>>();

vi.mock('@/lib/discounts/discountCodeApi', () => ({
    validateDiscountCode: (discountCode: string, discountPlaceId: string) =>
        validateDiscountCode(discountCode, discountPlaceId),
}));

// Nothing is measured in a test document, and the real reporter keeps waiting for an analytics script which never
// arrives there, which would outlive the test which caused it.
vi.mock('@/lib/tracking/track-google-analytics-event', () => ({ trackGoogleAnalyticsEvent: () => undefined }));

vi.mock('@/businesses/community/membership/communityMembershipRoomApi', () => ({
    fetchCommunityMembership: (workshopSlug: string) => fetchCommunityMembership(workshopSlug),
    confirmCommunityMembershipCheckout: (workshopSlug: string, checkoutSessionId: string) =>
        confirmCommunityMembershipCheckout(workshopSlug, checkoutSessionId),
    openCommunityMembershipSubscriptionPortal: (workshopSlug: string) =>
        openCommunityMembershipSubscriptionPortal(workshopSlug),
    scheduleCommunityMembershipCancellation: (workshopSlug: string) =>
        scheduleCommunityMembershipCancellation(workshopSlug),
    reactivateCommunityMembership: (workshopSlug: string) => reactivateCommunityMembership(workshopSlug),
    startCommunityMembershipPurchase: (workshopSlug: string, values: unknown) =>
        startCommunityMembershipPurchase(workshopSlug, values),
}));

import { CommunityMembershipRoomProvider } from './CommunityMembershipRoomProvider';
import { CommunityMembershipBadge } from './CommunityMembershipBadge';
import { CommunityMembershipModal } from './CommunityMembershipModal';

const OFFERED_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isCancellationScheduled: false,
    isPurchaseOffered: true,
    isSubscriptionManagementOffered: false,
    isCoveredByDiscountCode: false,
    isPaymentInTestMode: false,
};

const CANCELLATION_SCHEDULED_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'active',
    monthlyPriceCzk: 199,
    currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
    isCancellationScheduled: true,
    isPurchaseOffered: false,
    isSubscriptionManagementOffered: true,
    isCoveredByDiscountCode: false,
    isPaymentInTestMode: false,
};

const ACTIVE_MANAGEABLE_MEMBERSHIP: CommunityMembershipRoomState = {
    ...CANCELLATION_SCHEDULED_MEMBERSHIP,
    isCancellationScheduled: false,
};

/**
 * The membership as it stands once a voucher gave it away: nothing is charged for it and no subscription stands
 * behind it, so there is nothing to cancel either.
 */
const VOUCHER_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'active',
    monthlyPriceCzk: 0,
    currentPeriodEndsAt: null,
    isCancellationScheduled: false,
    isPurchaseOffered: false,
    isSubscriptionManagementOffered: false,
    isCoveredByDiscountCode: true,
    isPaymentInTestMode: false,
};

const FULL_PERMANENT_DISCOUNT = {
    code: 'VOUCHER_FREE',
    percent: 100,
    remainingUseCount: null,
    subscriptionDiscountDurationMonths: null,
};

async function applyDiscountCode(discountCode: string) {
    fireEvent.change(await screen.findByLabelText('Slevový kód'), { target: { value: discountCode } });
}

function renderMembershipModal() {
    render(
        <CommunityMembershipRoomProvider workshopSlug={COMMUNITY_WORKSHOP_SLUG} isMembershipOffered>
            <CommunityMembershipBadge />
            <CommunityMembershipModal />
        </CommunityMembershipRoomProvider>,
    );
}

async function openFreeMembershipModal() {
    fireEvent.click(await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' }));
    return screen.findByRole('dialog');
}

async function openPaidMembershipModal() {
    fireEvent.click(await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' }));
    return screen.findByRole('dialog');
}

beforeEach(() => {
    window.history.replaceState({}, '', COMMUNITY_PATH);
    fetchCommunityMembership.mockResolvedValue(OFFERED_MEMBERSHIP);
    confirmCommunityMembershipCheckout.mockResolvedValue(OFFERED_MEMBERSHIP);
    scheduleCommunityMembershipCancellation.mockResolvedValue(CANCELLATION_SCHEDULED_MEMBERSHIP);
    reactivateCommunityMembership.mockResolvedValue(OFFERED_MEMBERSHIP);
    openCommunityMembershipSubscriptionPortal.mockResolvedValue({
        portalUrl: 'https://billing.stripe.com/p/session/test_Example',
    });
    validateDiscountCode.mockResolvedValue(null);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('community membership modal', () => {
    it('opens the in-room offer for its monthly price from the free membership badge', async () => {
        renderMembershipModal();

        await openFreeMembershipModal();

        expect(await screen.findByRole('button', { name: 'Zaplatit 199 Kč / měsíc' })).toBeDefined();
        expect(screen.getByText('Záznamy a archiv webinářů')).toBeDefined();
    });

    it('says nothing about a test card while the gate charges real money', async () => {
        renderMembershipModal();

        await openFreeMembershipModal();

        await screen.findByRole('button', { name: 'Zaplatit 199 Kč / měsíc' });
        expect(screen.queryByText(/Testovací režim/)).toBeNull();
    });

    it('names the test card while the gate is the test one', async () => {
        fetchCommunityMembership.mockResolvedValue({ ...OFFERED_MEMBERSHIP, isPaymentInTestMode: true });
        renderMembershipModal();

        await openFreeMembershipModal();

        expect(await screen.findByText(/Testovací režim platební brány/)).toBeDefined();
        expect(screen.getByText('4242 4242 4242 4242')).toBeDefined();
    });

    it('celebrates a paid membership instead of selling it again', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 149,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderMembershipModal();

        await openPaidMembershipModal();

        expect(await screen.findByText('Placené členství je aktivní')).toBeDefined();
        expect(screen.getByText(/Platíte 149 Kč měsíčně\. Zaplaceno do 30\. 9\. 2026\./)).toBeDefined();
        expect(screen.queryByRole('button', { name: /Zaplatit/ })).toBeNull();
    });

    it('asks before stopping renewal, keeps the paid benefits through the current period, and exposes reactivation', async () => {
        fetchCommunityMembership.mockResolvedValue(ACTIVE_MANAGEABLE_MEMBERSHIP);
        scheduleCommunityMembershipCancellation.mockResolvedValue(CANCELLATION_SCHEDULED_MEMBERSHIP);
        renderMembershipModal();

        await openPaidMembershipModal();
        fireEvent.click(screen.getByRole('button', { name: 'Zrušit placené členství' }));

        expect(scheduleCommunityMembershipCancellation).not.toHaveBeenCalled();
        expect(await screen.findByText('Opravdu chcete zrušit placené členství?')).toBeDefined();

        fireEvent.click(screen.getByRole('button', { name: 'Ano, zrušit obnovu' }));

        await vi.waitFor(() => expect(scheduleCommunityMembershipCancellation).toHaveBeenCalledOnce());
        expect(await screen.findByText('Ukončení je naplánované')).toBeDefined();
        expect(screen.getByText(/Placené výhody vám zůstanou do 30\. 9\. 2026/)).toBeDefined();
        expect(screen.getByRole('button', { name: 'Obnovit placené členství' })).toBeDefined();
    });

    it('offers Stripe payment management without replacing the in-room cancellation action', async () => {
        fetchCommunityMembership.mockResolvedValue(ACTIVE_MANAGEABLE_MEMBERSHIP);
        renderMembershipModal();

        await openPaidMembershipModal();

        expect(screen.getByRole('button', { name: 'Spravovat platbu ve Stripe' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Zrušit placené členství' })).toBeDefined();
    });

    it('restores automatic renewal directly from the scheduled-cancellation state', async () => {
        fetchCommunityMembership.mockResolvedValue(CANCELLATION_SCHEDULED_MEMBERSHIP);
        reactivateCommunityMembership.mockResolvedValue(ACTIVE_MANAGEABLE_MEMBERSHIP);
        renderMembershipModal();

        fireEvent.click(
            await screen.findByRole('button', {
                name: 'Placené členství končí 30. 9. 2026. Otevřít stav členství',
            }),
        );
        fireEvent.click(await screen.findByRole('button', { name: 'Obnovit placené členství' }));

        await vi.waitFor(() => expect(reactivateCommunityMembership).toHaveBeenCalledOnce());
        expect(await screen.findByText('Správa členství')).toBeDefined();
        expect(screen.getByRole('button', { name: 'Zrušit placené členství' })).toBeDefined();
    });

    it('says that a failed payment keeps the membership for now', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'past-due',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: null,
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderMembershipModal();

        await openPaidMembershipModal();

        expect(await screen.findByText(/Poslední platba neprošla/)).toBeDefined();
    });

    it('says nothing at all where the server has no payment gate', async () => {
        fetchCommunityMembership.mockResolvedValue({ ...OFFERED_MEMBERSHIP, isPurchaseOffered: false });
        renderMembershipModal();

        await vi.waitFor(() => expect(screen.queryByText('Placené členství komunity')).toBeNull());
        expect(fetchCommunityMembership).toHaveBeenCalled();
    });

    it('confirms the checkout a returning member came back from and celebrates it', async () => {
        window.history.replaceState({}, '', `${COMMUNITY_PATH}?membership=paid&checkoutSession=cs_test_Example`);
        confirmCommunityMembershipCheckout.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderMembershipModal();

        expect(await screen.findByRole('dialog')).toBeDefined();
        expect(await screen.findByText('Platba proběhla. Placené členství je vaše, díky!')).toBeDefined();
        expect(confirmCommunityMembershipCheckout).toHaveBeenCalledWith(COMMUNITY_WORKSHOP_SLUG, 'cs_test_Example');
        expect(fetchCommunityMembership).not.toHaveBeenCalled();
        // The address stops confirming that payment, so reloading the room does not celebrate it a second time.
        expect(window.location.search).toBe('');
    });

    it('asks for no card at all when a code covers the whole membership for as long as it lasts', async () => {
        validateDiscountCode.mockResolvedValue(FULL_PERMANENT_DISCOUNT);
        renderMembershipModal();

        await openFreeMembershipModal();
        await applyDiscountCode('VOUCHER_FREE');

        expect(await screen.findByRole('button', { name: 'Aktivovat členství zdarma' })).toBeDefined();
        expect(screen.getByText('Slevový kód pokrývá celé členství, takže neplatíte nic.')).toBeDefined();
        expect(screen.queryByRole('button', { name: /Zaplatit/ })).toBeNull();
        expect(screen.queryByText(/Platíte přes zabezpečenou bránu Stripe/)).toBeNull();
    });

    it('keeps asking for a card when a code covers the membership for its first months only', async () => {
        validateDiscountCode.mockResolvedValue({ ...FULL_PERMANENT_DISCOUNT, subscriptionDiscountDurationMonths: 3 });
        renderMembershipModal();

        await openFreeMembershipModal();
        await applyDiscountCode('VOUCHER_FREE');

        // The price returns to normal after those months, which is exactly what the card would then be charged.
        expect(await screen.findByRole('button', { name: 'Zaplatit 0 Kč / měsíc' })).toBeDefined();
        expect(screen.getByText(/Poté bude cena 199 Kč měsíčně/)).toBeDefined();
        expect(screen.getByText(/Platíte přes zabezpečenou bránu Stripe/)).toBeDefined();
    });

    it('names no test card for a membership which never reaches the gate', async () => {
        fetchCommunityMembership.mockResolvedValue({ ...OFFERED_MEMBERSHIP, isPaymentInTestMode: true });
        validateDiscountCode.mockResolvedValue(FULL_PERMANENT_DISCOUNT);
        renderMembershipModal();

        await openFreeMembershipModal();
        await applyDiscountCode('VOUCHER_FREE');

        await screen.findByRole('button', { name: 'Aktivovat členství zdarma' });
        expect(screen.queryByText(/Testovací režim platební brány/)).toBeNull();
    });

    it('hands over the membership a voucher covers without sending the member anywhere', async () => {
        validateDiscountCode.mockResolvedValue(FULL_PERMANENT_DISCOUNT);
        startCommunityMembershipPurchase.mockResolvedValue({ checkoutUrl: null, membership: VOUCHER_MEMBERSHIP });
        renderMembershipModal();

        await openFreeMembershipModal();
        await applyDiscountCode('VOUCHER_FREE');
        fireEvent.click(await screen.findByLabelText('Souhlasím s obchodními podmínkami'));
        fireEvent.click(await screen.findByRole('button', { name: 'Aktivovat členství zdarma' }));

        await vi.waitFor(() =>
            expect(startCommunityMembershipPurchase).toHaveBeenCalledWith(COMMUNITY_WORKSHOP_SLUG, {
                discountCode: 'VOUCHER_FREE',
                termsAccepted: true,
                expectedDiscount: { percent: 100, months: null },
            }),
        );
        expect(await screen.findByText('Slevový kód uplatněn. Placené členství je vaše zdarma, díky!')).toBeDefined();
        expect(screen.getByText('Placené členství je aktivní')).toBeDefined();
        expect(
            screen.getByText(/Členství máte díky slevovému kódu zdarma, nic se neplatí a kartu jsme po vás nechtěli\./),
        ).toBeDefined();
        // Such a membership is charged for nothing, so there is no renewal of it to cancel or to manage in Stripe.
        expect(screen.queryByRole('button', { name: 'Zrušit placené členství' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Spravovat platbu ve Stripe' })).toBeNull();
    });

    it('says that a member who came back without paying can buy the membership later', async () => {
        window.history.replaceState({}, '', `${COMMUNITY_PATH}?membership=cancelled`);
        renderMembershipModal();

        expect(await screen.findByRole('dialog')).toBeDefined();
        expect(
            await screen.findByText('Platba nebyla dokončena. Členství si můžete pořídit kdykoli později.'),
        ).toBeDefined();
        expect(confirmCommunityMembershipCheckout).not.toHaveBeenCalled();
    });
});
