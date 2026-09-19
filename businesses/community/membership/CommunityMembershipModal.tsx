'use client';

import type { CommunityMembershipPurchaseOutcome } from '@/businesses/community/membership/communityMembershipCheckoutReturn';
import { formatCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import { CommunityMembershipPurchasePanel } from '@/businesses/community/membership/CommunityMembershipPurchasePanel';
import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { CommunityMembershipSubscriptionManagement } from '@/businesses/community/membership/CommunityMembershipSubscriptionManagement';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    isPaidCommunityMembershipStatus,
    type CommunityMembershipRoomState,
} from '@/lib/community-membership/communityMembershipTypes';
import { formatCzechWorkshopDay } from '@/lib/workshops/workshopDate';
import { CheckCircle2, Crown, Info, LoaderCircle, Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * What the member is told about the way they have just taken the membership, said once for each of the ways there are
 */
const PAID_MEMBERSHIP_PURCHASE_OUTCOME_MESSAGES: Readonly<Record<CommunityMembershipPurchaseOutcome, string>> = {
    paid: 'Platba proběhla. Placené členství je vaše, díky!',
    redeemed: 'Slevový kód uplatněn. Placené členství je vaše zdarma, díky!',
    cancelled: 'Platba nebyla dokončena. Členství si můžete pořídit kdykoli později.',
};

function createPaidMembershipPriceDescription(membership: CommunityMembershipRoomState): string {
    // A membership a voucher covers is never charged for anything, so it is not described by what it costs a month.
    if (membership.isCoveredByDiscountCode) {
        return 'Členství máte díky slevovému kódu zdarma, nic se neplatí a kartu jsme po vás nechtěli.';
    }

    return membership.monthlyPriceCzk === null
        ? 'Členství je aktivní.'
        : `Platíte ${formatCommunityMembershipPrice(membership.monthlyPriceCzk)} měsíčně.`;
}

function createPaidMembershipDescription(membership: CommunityMembershipRoomState): string {
    const priceDescription = createPaidMembershipPriceDescription(membership);
    const periodDescription = membership.currentPeriodEndsAt === null ? '' : ` Zaplaceno do ${formatCzechWorkshopDay(membership.currentPeriodEndsAt)}.`;
    const cancellationDescription = membership.isCancellationScheduled ? ' Další platbu jste zrušili.' : '';
    const overdueDescription =
        membership.status === 'past-due'
            ? ' Poslední platba neprošla – zkontrolujte prosím kartu, přístup vám zatím zůstává.'
            : '';

    return `${priceDescription}${periodDescription}${cancellationDescription}${overdueDescription}`;
}

/**
 * The status, offer, and Stripe gate of one member's community membership.
 *
 * Note: This owns the only membership request in the connected room. The header badge deliberately only reflects the
 *       shared state, so opening a modal never creates a second identity or payment flow.
 */
export function CommunityMembershipModal() {
    const membershipRoom = useCommunityMembershipRoom();
    const ensureMembershipLoaded = membershipRoom?.ensureMembershipLoaded;

    useEffect(() => {
        ensureMembershipLoaded?.();
    }, [ensureMembershipLoaded]);

    if (membershipRoom === null) {
        return null;
    }

    const {
        membership,
        isMembershipLoading,
        isPurchaseStarting,
        isMembershipCancellationChanging,
        isMembershipPortalOpening,
        errorMessage,
        purchaseOutcome,
    } = membershipRoom;
    const isPaid = membership !== null && isPaidCommunityMembershipStatus(membership.status);
    const isCancellationScheduled = isPaid && membership?.isCancellationScheduled === true;
    const isPurchasePanelShown = membership !== null && !isPaid && membership.isPurchaseOffered;
    const isMembershipDetailsShown = isPaid || isPurchasePanelShown;

    return (
        <Dialog open={membershipRoom.isMembershipModalOpen} onOpenChange={membershipRoom.setIsMembershipModalOpen}>
            <DialogContent className="workshop-room max-h-[calc(100vh-2rem)] max-w-4xl gap-0 overflow-y-auto rounded-[2rem] border-room-accent/15 bg-room-surface p-0 text-room-heading shadow-[0_32px_100px_rgba(2,16,24,0.7)] [&>button]:right-5 [&>button]:top-5 [&>button]:z-20 [&>button]:rounded-full [&>button]:text-room-text [&>button]:hover:bg-room-overlay/10 [&>button]:hover:text-room-heading">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-28 -top-36 h-80 w-80 rounded-full bg-room-accent/[0.08] blur-3xl" />
                    <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-room-accent/[0.06] blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(180,245,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(180,245,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />
                </div>

                <div className="relative border-b border-room-border/10 bg-room-overlay/[0.015] px-5 py-5 pr-12 sm:px-7 sm:py-6">
                    <DialogHeader className="gap-2">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-room-accent/15 bg-room-accent/10 text-room-accent shadow-inner shadow-cyan-100/10">
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-room-accent">Členství</p>
                        </div>
                        <DialogTitle className="flex items-center gap-2 text-2xl tracking-tight text-room-heading">
                            <Crown className="h-5 w-5 text-room-warning" aria-hidden="true" />
                            {isPaid
                                ? isCancellationScheduled
                                    ? 'Placené členství končí'
                                    : 'Placené členství je aktivní'
                                : 'Placené členství komunity'}
                        </DialogTitle>
                        <DialogDescription className="max-w-2xl leading-6 text-room-muted">
                            {isPaid && membership !== null
                                ? createPaidMembershipDescription(membership)
                                : 'Živé webináře zůstávají zdarma. Placené členství přidává záznamy, archiv, praktické materiály a přednost pro vaše dotazy.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {purchaseOutcome !== null && (
                    <div
                        role="status"
                        className={`relative mx-5 mt-5 flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-slate-950/10 sm:mx-7 ${
                            purchaseOutcome === 'cancelled'
                                ? 'border-room-warning/25 bg-room-warning/[0.08] text-room-warning'
                                : 'border-room-success/25 bg-room-success/[0.09] text-room-success'
                        }`}
                    >
                        <span className="flex min-w-0 items-start gap-2">
                            {purchaseOutcome === 'cancelled' ? (
                                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            ) : (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            )}
                            <span className="min-w-0">
                                {PAID_MEMBERSHIP_PURCHASE_OUTCOME_MESSAGES[purchaseOutcome]}
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={membershipRoom.dismissPurchaseOutcome}
                            className="shrink-0 rounded-full p-1 transition hover:bg-room-overlay/10"
                            aria-label="Skrýt zprávu o platbě"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="relative px-5 pb-5 pt-5 sm:px-7 sm:pb-7">
                    {isMembershipLoading && membership === null && (
                        <div className="flex min-h-24 items-center justify-center text-sm text-room-muted">
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-room-accent" /> Načítám členství…
                        </div>
                    )}

                    {isPurchasePanelShown && membership !== null && (
                        <CommunityMembershipPurchasePanel
                            isPaymentInTestMode={membership.isPaymentInTestMode}
                            isPurchaseStarting={isPurchaseStarting}
                            errorMessage={errorMessage}
                            onPurchase={(discountCode) => void membershipRoom.startMembershipPurchase(discountCode)}
                        />
                    )}

                    {isPaid && membership !== null && (
                        <CommunityMembershipSubscriptionManagement
                            membership={membership}
                            isMembershipCancellationChanging={isMembershipCancellationChanging}
                            isMembershipPortalOpening={isMembershipPortalOpening}
                            errorMessage={errorMessage}
                            onScheduleCancellation={membershipRoom.scheduleCancellation}
                            onReactivate={membershipRoom.reactivateMembership}
                            onOpenMembershipPortal={membershipRoom.openMembershipPortal}
                        />
                    )}

                    {!isMembershipLoading && !isMembershipDetailsShown && errorMessage !== null && (
                        <p
                            role="alert"
                            className="rounded-xl border border-room-danger/25 bg-room-danger/10 px-3 py-2 text-sm text-room-danger"
                        >
                            {errorMessage}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
