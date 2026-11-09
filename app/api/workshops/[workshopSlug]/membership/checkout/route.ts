import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
} from '@/businesses/community/membership/communityMembershipConfig';
import { createCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { activateCommunityMembershipFromCheckoutSession } from '@/lib/community-membership/communityMembershipActivation';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    createCommunityMembershipCheckoutSession,
    createCommunityMembershipCheckoutUrls,
} from '@/lib/community-membership/communityMembershipCheckout';
import {
    loadCommunityMembershipByEmail,
    saveRequestedCommunityMembership,
} from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { redeemCommunityMembership } from '@/lib/community-membership/communityMembershipRedemption';
import { createCommunityMembershipRoomUrl } from '@/lib/community-membership/communityMembershipRoomPath';
import {
    getAuthenticatedMembershipRoomRequest,
    isAuthenticatedMembershipRoomRequest,
    type AuthenticatedMembershipRoomRequest,
} from '@/lib/community-membership/communityMembershipRoomRequest';
import { createCommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipRoomState';
import {
    isPaidCommunityMembershipStatus,
    type CommunityMembershipMember,
    type CommunityMembershipPurchaseResult,
} from '@/lib/community-membership/communityMembershipTypes';
import {
    isSubscriptionDiscountFullAndPermanent,
    normalizeDiscountCode,
    type ActiveDiscount,
} from '@/lib/discounts/discountCode';
import { MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH } from '@/lib/discounts/discountCodeConstants';
import { loadActiveDiscount } from '@/lib/discounts/discountCodeDatabase';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import { getStripeGatewayOrNull, type StripeGateway } from '@/lib/payments/stripeGateway';
import { NextRequest, NextResponse } from 'next/server';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const;

type CommunityMembershipCheckoutRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

type CommunityMembershipCheckoutRequest = {
    readonly discountCode: string;
};

/**
 * Everything both ways of taking the membership need: who is taking it, what they already have, and what their code
 * is worth here.
 */
type CommunityMembershipPurchaseAttempt = {
    readonly request: NextRequest;
    readonly authenticatedRequest: AuthenticatedMembershipRoomRequest;
    readonly gateway: StripeGateway;
    readonly member: CommunityMembershipMember;
    readonly existingMembershipId: string | null;
    readonly previousCheckoutSessionId: string | null;
    readonly discountCode: string;
};

function readCheckoutRequest(body: Readonly<Record<string, unknown>>): CommunityMembershipCheckoutRequest | null {
    const discountCode = body.discountCode ?? '';

    if (
        body.termsAccepted !== true ||
        typeof discountCode !== 'string' ||
        discountCode.length > MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH
    ) {
        return null;
    }

    return { discountCode };
}

function createPurchaseResponse(purchaseResult: CommunityMembershipPurchaseResult): NextResponse {
    return NextResponse.json(purchaseResult, { headers: NO_STORE_HEADERS });
}

/**
 * Hands a member the membership their code covers in full, which is nothing they pay for and nothing they need a card
 * for. Their room is answered with the membership itself rather than with a gate to go to.
 */
async function redeemCommunityMembershipVoucher(attempt: CommunityMembershipPurchaseAttempt): Promise<NextResponse> {
    const { status, membership } = await redeemCommunityMembership(
        attempt.authenticatedRequest.supabase,
        attempt.member,
        attempt.existingMembershipId,
        attempt.discountCode,
        attempt.gateway.configuration.isTestMode,
        attempt.authenticatedRequest.communityId,
        attempt.previousCheckoutSessionId,
    );

    if (status === 'discount-code-refused') {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.discountCodeNotActive }, { status: 409 });
    }
    if (status === 'not-redeemed') {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotRedeemed }, { status: 500 });
    }
    if (membership === null) {
        // The membership was granted, so the code is spent and their next visit finds it. Only reading it back failed.
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }

    return createPurchaseResponse({
        checkoutUrl: null,
        membership: createCommunityMembershipRoomState(membership, attempt.gateway.configuration),
    });
}

/**
 * Opens the payment gate for the connected member and remembers the offer they accepted.
 *
 * Note: Where the gate returns a member to is decided by the room they are buying from rather than by their browser,
 *       so a payment can never be turned into a way out of this site.
 */
async function openCommunityMembershipCheckout(
    attempt: CommunityMembershipPurchaseAttempt,
    activeDiscount: ActiveDiscount | null,
): Promise<NextResponse> {
    const { authenticatedRequest, gateway, member } = attempt;
    const price = createCommunityMembershipPrice(
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
        activeDiscount,
    );

    let checkoutSession;
    try {
        checkoutSession = await createCommunityMembershipCheckoutSession(
            gateway,
            member,
            price,
            activeDiscount,
            createCommunityMembershipCheckoutUrls(
                createCommunityMembershipRoomUrl(attempt.request, authenticatedRequest.workshopRow),
            ),
            authenticatedRequest.communityId,
        );
    } catch (error) {
        console.error('Failed to open the community membership checkout:', error);
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 502 });
    }

    if (checkoutSession.url === null) {
        console.error('The community membership checkout was opened without an address to send the member to.');
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 502 });
    }

    const { errorMessage } = await saveRequestedCommunityMembership(
        authenticatedRequest.supabase,
        attempt.existingMembershipId,
        {
            communityId: authenticatedRequest.communityId,
            previousCheckoutSessionId: attempt.previousCheckoutSessionId,
            email: member.email,
            fullname: member.fullname,
            planId: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
            monthlyPriceCzk: price.finalMonthlyEquivalentCzk,
            discountCode: activeDiscount?.code ?? null,
            discountPercent: activeDiscount?.percent ?? 0,
            stripeCheckoutSessionId: checkoutSession.id,
            isTestPayment: gateway.configuration.isTestMode,
            requestedByParticipantId: member.participantId,
        },
    );
    if (errorMessage !== null) {
        try {
            await gateway.stripe.checkout.sessions.expire(checkoutSession.id);
        } catch (error) {
            console.error('Failed to expire an unused membership checkout:', error);
        }
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 500 });
    }

    return createPurchaseResponse({ checkoutUrl: checkoutSession.url, membership: null });
}

/**
 * Takes the paid membership for the connected member, which means one of two things.
 *
 * Note: A code which takes the whole price of the membership for as long as it lasts is a voucher: nothing is ever
 *       charged for such a membership, so no card is asked for and the gate is not opened at all. Every other code,
 *       including one which takes the whole price for a few months only, goes to the gate as before, because the card
 *       is exactly what the price returning to normal will be charged to.
 * Note: Neither the price nor the identity of the member is read from the request. The membership is charged for what
 *       this application says it costs, to the address the room session was opened with, so nothing a browser sends
 *       can buy a membership cheaper or for somebody else.
 */
export async function POST(request: NextRequest, context: CommunityMembershipCheckoutRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedMembershipRoomRequest(request, workshopSlug);
    if (!isAuthenticatedMembershipRoomRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }
    if (authenticatedRequest.requiresEmailVerification) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.emailVerificationRequired }, { status: 403 });
    }

    const body = await readJsonObjectOrNull(request);
    const checkoutRequest = body === null ? null : readCheckoutRequest(body);
    if (checkoutRequest === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.termsNotAccepted }, { status: 400 });
    }

    const gateway = getStripeGatewayOrNull();
    if (gateway === null) {
        console.error('The community membership cannot be bought without STRIPE_SECRET_KEY, see AGENT_MESSAGE.md.');
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentGateUnavailable }, { status: 503 });
    }

    const { participant, supabase, communityId } = authenticatedRequest;
    const currentMembership = await loadCommunityMembershipByEmail(supabase, participant.email, communityId);
    if (currentMembership.errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }
    if (currentMembership.membership !== null && isPaidCommunityMembershipStatus(currentMembership.membership.status)) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipAlreadyPaid }, { status: 409 });
    }

    const normalizedDiscountCode = normalizeDiscountCode(checkoutRequest.discountCode);
    const { activeDiscount, errorMessage: discountErrorMessage } = await loadActiveDiscount(
        checkoutRequest.discountCode,
        COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    );
    if (discountErrorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.discountCodeNotLoaded }, { status: 503 });
    }
    if (normalizedDiscountCode !== '' && activeDiscount === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.discountCodeNotActive }, { status: 409 });
    }

    const previousCheckoutSessionId = currentMembership.membership?.stripeCheckoutSessionId ?? null;
    if (currentMembership.membership?.status === 'pending' && previousCheckoutSessionId !== null) {
        try {
            const previousSession = await gateway.stripe.checkout.sessions.retrieve(previousCheckoutSessionId);
            // A complete session may still be settling. Stripe is the authority and that payment must retain its row.
            if (previousSession.status === 'complete') {
                const { membership, errorMessage } = await activateCommunityMembershipFromCheckoutSession(
                    gateway, supabase, previousSession,
                );
                if (errorMessage !== null) {
                    return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotConfirmed }, { status: 500 });
                }

                if (membership !== null && isPaidCommunityMembershipStatus(membership.status)) {
                    return createPurchaseResponse({
                        checkoutUrl: null,
                        membership: createCommunityMembershipRoomState(membership, gateway.configuration),
                    });
                }
                return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentStillProcessing }, { status: 409 });
            }
            if (previousSession.status === 'open') {
                await gateway.stripe.checkout.sessions.expire(previousCheckoutSessionId);
            } else if (previousSession.status !== 'expired') {
                return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 502 });
            }
        } catch (error) {
            console.error('Failed to close the previous membership checkout:', error);
            return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 502 });
        }
    }

    const purchaseAttempt: CommunityMembershipPurchaseAttempt = {
        request,
        authenticatedRequest,
        gateway,
        member: { participantId: participant.id, fullname: participant.fullname, email: participant.email },
        existingMembershipId: currentMembership.membership?.id ?? null,
        previousCheckoutSessionId,
        discountCode: checkoutRequest.discountCode,
    };

    return isSubscriptionDiscountFullAndPermanent(activeDiscount)
        ? redeemCommunityMembershipVoucher(purchaseAttempt)
        : openCommunityMembershipCheckout(purchaseAttempt, activeDiscount);
}
