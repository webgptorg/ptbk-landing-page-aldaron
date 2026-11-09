'use client';

import {
    createUrlWithoutCommunityMembershipCheckoutReturn,
    readCommunityMembershipCheckoutReturn,
    type CommunityMembershipCheckoutReturn,
    type CommunityMembershipPurchaseOutcome,
} from '@/businesses/community/membership/communityMembershipCheckoutReturn';
import {
    confirmCommunityMembershipCheckout,
    fetchCommunityMembership,
    openCommunityMembershipSubscriptionPortal,
    reactivateCommunityMembership,
    scheduleCommunityMembershipCancellation,
    startCommunityMembershipPurchase,
} from '@/businesses/community/membership/communityMembershipRoomApi';
import { JsonRequestError } from '@/lib/api/requestJson';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { isPaidCommunityMembershipStatus, type CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type CommunityMembershipRoomController = {
    readonly workshopSlug: string;
    /**
     * The membership of the connected member, or `null` while it is not known yet
     */
    readonly membership: CommunityMembershipRoomState | null;
    readonly isMembershipLoading: boolean;
    readonly isPurchaseStarting: boolean;
    readonly isMembershipCancellationChanging: boolean;
    readonly isMembershipPortalOpening: boolean;
    readonly errorMessage: string | null;

    /**
     * How taking the membership ended, either at the gate the member has just come back from or with a voucher which
     * needed no gate, until they close it
     */
    readonly purchaseOutcome: CommunityMembershipPurchaseOutcome | null;

    /**
     * Whether the member has opened the membership details from their room badge.
     */
    readonly isMembershipModalOpen: boolean;

    /**
     * Asks for the membership once, however many surfaces of the room want to know it
     */
    readonly ensureMembershipLoaded: () => void;
    readonly startMembershipPurchase: (discountCode: string) => Promise<void>;
    readonly scheduleCancellation: () => Promise<boolean>;
    readonly reactivateMembership: () => Promise<boolean>;
    readonly openMembershipPortal: () => Promise<void>;
    readonly dismissPurchaseOutcome: () => void;
    readonly openMembershipModal: () => void;
    readonly setIsMembershipModalOpen: (isMembershipModalOpen: boolean) => void;
};

const CommunityMembershipRoomContext = createContext<CommunityMembershipRoomController | null>(null);

const UNAUTHORIZED_STATUS = 401;

/**
 * What a room which is being rendered without a browser around it knows about a return from the gate, which is nothing
 */
const EMPTY_CHECKOUT_RETURN: CommunityMembershipCheckoutReturn = { result: null, checkoutSessionId: null };

function isConnectionRequiredError(error: unknown): boolean {
    return error instanceof JsonRequestError && error.status === UNAUTHORIZED_STATUS;
}

function getMembershipErrorMessage(error: unknown, fallbackMessage: string): string | null {
    // A member whose room session has expired is asked to connect by the room itself, so the membership says nothing.
    if (isConnectionRequiredError(error)) {
        return null;
    }

    return error instanceof Error ? error.message : fallbackMessage;
}

type CommunityMembershipRoomProviderProps = {
    /**
     * The room the member is connected to, which is what its membership is asked of
     */
    readonly workshopSlug: string;

    /**
     * Whether this kind of room offers the membership at all, see `workshopKindCapabilities`
     *
     * Note: A room which does not offer it holds no membership either, so its badge and its modal show nothing and
     *       nothing is ever asked about a member who was not offered anything.
     */
    readonly isMembershipOffered: boolean;
    readonly children: ReactNode;
};

/**
 * Holds the membership of the connected member for the whole room they are reading.
 *
 * Note: The badge in the header and the membership modal are two views of one membership, so they read one state and
 *       cause one request between them.
 * Note: The membership belongs to the address the member connected with, so the community and a workshop occurrence
 *       show, buy and manage one and the same membership through this one controller.
 */
export function CommunityMembershipRoomProvider({
    workshopSlug,
    isMembershipOffered,
    children,
}: CommunityMembershipRoomProviderProps) {
    // The address the gate returned with is read while the room is still being built, because the surfaces inside it
    // ask for the membership as soon as they appear and that request is what confirms the payment.
    const [checkoutReturn] = useState<CommunityMembershipCheckoutReturn>(() =>
        typeof window === 'undefined' || !isMembershipOffered
            ? EMPTY_CHECKOUT_RETURN
            : readCommunityMembershipCheckoutReturn(window.location.search),
    );
    const [membership, setMembership] = useState<CommunityMembershipRoomState | null>(null);
    const [isMembershipLoading, setIsMembershipLoading] = useState(false);
    const [isPurchaseStarting, setIsPurchaseStarting] = useState(false);
    const [isMembershipCancellationChanging, setIsMembershipCancellationChanging] = useState(false);
    const [isMembershipPortalOpening, setIsMembershipPortalOpening] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [purchaseOutcome, setPurchaseOutcome] = useState<CommunityMembershipPurchaseOutcome | null>(
        checkoutReturn.result === 'cancelled' ? 'cancelled' : null,
    );
    const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
    const isMembershipRequestedRef = useRef(false);
    const checkoutSessionIdRef = useRef<string | null>(checkoutReturn.checkoutSessionId);

    // What the gate added to the address is taken out of it again, so that reloading the room neither confirms the
    // same payment a second time nor keeps celebrating it.
    useEffect(() => {
        if (checkoutReturn.result === null) {
            return;
        }

        window.history.replaceState(
            window.history.state,
            '',
            createUrlWithoutCommunityMembershipCheckoutReturn(window.location.href),
        );
    }, [checkoutReturn.result]);

    // The result used to be visible in the in-page membership section. Opening the modal for a returning member keeps
    // that confirmation or cancellation visible after moving the surface out of the room layout.
    useEffect(() => {
        if (checkoutReturn.result !== null || purchaseOutcome !== null) {
            setIsMembershipModalOpen(true);
        }
    }, [checkoutReturn.result, purchaseOutcome]);

    const ensureMembershipLoaded = useCallback(() => {
        if (isMembershipRequestedRef.current) {
            return;
        }

        isMembershipRequestedRef.current = true;
        setIsMembershipLoading(true);
        const checkoutSessionId = checkoutSessionIdRef.current;
        checkoutSessionIdRef.current = null;

        // A member coming back from the gate has their payment confirmed in the very request which loads their
        // membership, so a paid membership is theirs immediately instead of when the webhook happens to arrive.
        const loadedMembership =
            checkoutSessionId === null
                ? fetchCommunityMembership(workshopSlug)
                : confirmCommunityMembershipCheckout(workshopSlug, checkoutSessionId).catch((error: unknown) => {
                      if (isConnectionRequiredError(error)) {
                          throw error;
                      }

                      console.error('Failed to confirm the community membership payment:', error);
                      return fetchCommunityMembership(workshopSlug);
                  });

        void loadedMembership
            .then((loadedState) => {
                setMembership(loadedState);
                if (checkoutSessionId !== null && isPaidCommunityMembershipStatus(loadedState.status)) {
                    setPurchaseOutcome('paid');
                }
                setErrorMessage(null);
            })
            .catch((error: unknown) => {
                // A member whose room session had expired is asked about again once they connect anew, because the
                // room brings its surfaces back and this is what they ask.
                isMembershipRequestedRef.current = !isConnectionRequiredError(error);
                setErrorMessage(getMembershipErrorMessage(error, COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded));
            })
            .finally(() => setIsMembershipLoading(false));
    }, [workshopSlug]);

    const startMembershipPurchase = useCallback(
        async (discountCode: string) => {
            setIsPurchaseStarting(true);
            setErrorMessage(null);

            try {
                const { checkoutUrl, membership: purchasedMembership } = await startCommunityMembershipPurchase(
                    workshopSlug,
                    { discountCode, termsAccepted: true },
                );

                if (checkoutUrl !== null) {
                    trackGoogleAnalyticsEvent('community_membership_checkout_started', {
                        has_discount_code: discountCode.trim() !== '',
                    });
                    window.location.assign(checkoutUrl);
                    return;
                }

                if (purchasedMembership === null) {
                    throw new Error(COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened);
                }

                if (purchasedMembership.isCoveredByDiscountCode) {
                    trackGoogleAnalyticsEvent('community_membership_voucher_redeemed');
                    setPurchaseOutcome('redeemed');
                } else {
                    setPurchaseOutcome('paid');
                }
                setMembership(purchasedMembership);
                setIsPurchaseStarting(false);
            } catch (error) {
                // A member who pressed the button is always answered, including when it was their room session which
                // expired, because a button which silently does nothing is the one thing they cannot act on.
                setErrorMessage(
                    isConnectionRequiredError(error)
                        ? COMMUNITY_MEMBERSHIP_MESSAGES.connectionExpired
                        : getMembershipErrorMessage(error, COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened),
                );
                setIsPurchaseStarting(false);
            }
        },
        [workshopSlug],
    );

    const changeMembershipCancellation = useCallback(
        async (isCancellationScheduled: boolean): Promise<boolean> => {
            setIsMembershipCancellationChanging(true);
            setErrorMessage(null);

            try {
                const updatedMembership = isCancellationScheduled
                    ? await scheduleCommunityMembershipCancellation(workshopSlug)
                    : await reactivateCommunityMembership(workshopSlug);
                setMembership(updatedMembership);
                return true;
            } catch (error) {
                const fallbackMessage = isCancellationScheduled
                    ? COMMUNITY_MEMBERSHIP_MESSAGES.membershipCancellationNotChanged
                    : COMMUNITY_MEMBERSHIP_MESSAGES.membershipReactivationNotChanged;
                setErrorMessage(
                    isConnectionRequiredError(error)
                        ? COMMUNITY_MEMBERSHIP_MESSAGES.connectionExpired
                        : getMembershipErrorMessage(error, fallbackMessage),
                );
                return false;
            } finally {
                setIsMembershipCancellationChanging(false);
            }
        },
        [workshopSlug],
    );

    const scheduleCancellation = useCallback(() => changeMembershipCancellation(true), [changeMembershipCancellation]);
    const reactivateMembership = useCallback(() => changeMembershipCancellation(false), [changeMembershipCancellation]);

    const openMembershipPortal = useCallback(async () => {
        setIsMembershipPortalOpening(true);
        setErrorMessage(null);

        try {
            const { portalUrl } = await openCommunityMembershipSubscriptionPortal(workshopSlug);
            window.location.assign(portalUrl);
        } catch (error) {
            setErrorMessage(
                isConnectionRequiredError(error)
                    ? COMMUNITY_MEMBERSHIP_MESSAGES.connectionExpired
                    : getMembershipErrorMessage(error, COMMUNITY_MEMBERSHIP_MESSAGES.membershipPortalNotOpened),
            );
            setIsMembershipPortalOpening(false);
        }
    }, [workshopSlug]);

    const dismissPurchaseOutcome = useCallback(() => setPurchaseOutcome(null), []);
    const openMembershipModal = useCallback(() => setIsMembershipModalOpen(true), []);

    // A room which does not offer the membership holds none, so its surfaces are given nothing to show rather than an
    // empty membership they would have to tell apart from one which is merely still loading.
    const membershipRoom: CommunityMembershipRoomController | null = !isMembershipOffered
        ? null
        : {
              workshopSlug,
              membership,
              isMembershipLoading,
              isPurchaseStarting,
              isMembershipCancellationChanging,
              isMembershipPortalOpening,
              errorMessage,
              purchaseOutcome,
              isMembershipModalOpen,
              ensureMembershipLoaded,
              startMembershipPurchase,
              scheduleCancellation,
              reactivateMembership,
              openMembershipPortal,
              dismissPurchaseOutcome,
              openMembershipModal,
              setIsMembershipModalOpen,
          };

    return (
        <CommunityMembershipRoomContext.Provider value={membershipRoom}>
            {children}
        </CommunityMembershipRoomContext.Provider>
    );
}

/**
 * The membership of the connected member, or `null` in a room which does not offer the membership at all
 */
export function useCommunityMembershipRoom(): CommunityMembershipRoomController | null {
    return useContext(CommunityMembershipRoomContext);
}
