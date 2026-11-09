import { DEFAULT_COMMUNITY_ID, type CommunityId } from '@/businesses/community/config';
import {
    COMMUNITY_MEMBERSHIP_TABLE_NAME,
    normalizeCommunityMemberEmail,
    type CommunityMembershipStatus,
    type StoredCommunityMembershipStatus,
} from '@/lib/community-membership/communityMembershipTypes';
import type { CommunityMembershipAdminQuery } from '@/lib/community-membership/communityMembershipAdminQuery';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { reportSupabaseError } from '@/lib/supabase/reportSupabaseError';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Note: This stays one literal, because the database client reads the requested columns out of the text itself.
 */
const COMMUNITY_MEMBERSHIP_COLUMNS =
    'id, email, fullname, plan_id, status, monthly_price_czk, discount_code, discount_percent, stripe_customer_id, stripe_subscription_id, stripe_checkout_session_id, is_test_payment, is_cancellation_scheduled, current_period_ends_at, activated_at, canceled_at, created_at, updated_at';

const COMMUNITY_MEMBERSHIP_ADMIN_PAGE_FUNCTION_NAME = 'get_scoped_community_membership_admin_page';

type CommunityMembershipRow = {
    readonly id: string;
    readonly email: string;
    readonly fullname: string;
    readonly plan_id: string;
    readonly status: string;
    readonly monthly_price_czk: number;
    readonly discount_code: string | null;
    readonly discount_percent: number;
    readonly stripe_customer_id: string | null;
    readonly stripe_subscription_id: string | null;
    readonly stripe_checkout_session_id: string | null;
    readonly is_test_payment: boolean;
    readonly is_cancellation_scheduled: boolean;
    readonly current_period_ends_at: string | null;
    readonly activated_at: string | null;
    readonly canceled_at: string | null;
    readonly created_at: string;
    readonly updated_at: string;
};

type CommunityMembershipAdminPageRow = Omit<CommunityMembershipRow, 'is_cancellation_scheduled'> & {
    readonly total_count: number | string;
};

/**
 * One stored membership, as everything but the payment gate reads it
 */
export type CommunityMembershipRecord = {
    readonly id: string;
    readonly email: string;
    readonly fullname: string;
    readonly planId: string;
    readonly status: StoredCommunityMembershipStatus;
    readonly monthlyPriceCzk: number;
    readonly discountCode: string | null;
    readonly discountPercent: number;
    readonly stripeCustomerId: string | null;
    readonly stripeSubscriptionId: string | null;
    readonly stripeCheckoutSessionId: string | null;
    readonly isTestPayment: boolean;
    readonly isCancellationScheduled: boolean;
    readonly currentPeriodEndsAt: string | null;
    readonly activatedAt: string | null;
    readonly canceledAt: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

/**
 * The payment-record projection the administrator needs. Subscription-management state is intentionally private to
 * the member-facing room, while Stripe remains the administration's source of truth for those changes.
 */
export type CommunityMembershipAdminRecord = Omit<CommunityMembershipRecord, 'isCancellationScheduled'>;

export type CommunityMembershipLoadResult = {
    readonly membership: CommunityMembershipRecord | null;
    readonly errorMessage: string | null;
};

/**
 * A server-paged slice of payment records. It deliberately represents only people who opened a paid checkout; a
 * member with the free membership has no payment record to manage.
 */
export type CommunityMembershipAdminPage = {
    readonly memberships: readonly CommunityMembershipAdminRecord[];
    readonly totalCount: number;
};

/**
 * What one member accepted, however they came by their membership
 */
export type AcceptedCommunityMembershipValues = {
    readonly communityId?: CommunityId;
    readonly previousCheckoutSessionId?: string | null;
    readonly email: string;
    readonly fullname: string;
    readonly planId: string;
    readonly monthlyPriceCzk: number;
    readonly discountCode: string | null;
    readonly discountPercent: number;
    readonly isTestPayment: boolean;
    readonly requestedByParticipantId: string;
};

/**
 * What one member agreed to when they opened a checkout
 */
export type RequestedCommunityMembershipValues = AcceptedCommunityMembershipValues & {
    readonly stripeCheckoutSessionId: string;
};

/**
 * What the payment gate reported about a membership it now charges for
 */
export type PaidCommunityMembershipValues = {
    readonly status: StoredCommunityMembershipStatus;
    readonly stripeCustomerId: string | null;
    readonly stripeSubscriptionId: string | null;
    readonly isCancellationScheduled: boolean;
    readonly currentPeriodEndsAt: string | null;
};

/**
 * Memberships are readable only through the service role, because the table says what somebody paid for.
 */
export function getCommunityMembershipDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

function mapCommunityMembershipValues(
    row: CommunityMembershipRow | CommunityMembershipAdminPageRow,
): CommunityMembershipAdminRecord {
    return {
        id: row.id,
        email: row.email,
        fullname: row.fullname,
        planId: row.plan_id,
        status: row.status as StoredCommunityMembershipStatus,
        monthlyPriceCzk: row.monthly_price_czk,
        discountCode: row.discount_code,
        discountPercent: row.discount_percent,
        stripeCustomerId: row.stripe_customer_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        stripeCheckoutSessionId: row.stripe_checkout_session_id,
        isTestPayment: row.is_test_payment,
        currentPeriodEndsAt: row.current_period_ends_at,
        activatedAt: row.activated_at,
        canceledAt: row.canceled_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapCommunityMembershipRow(row: CommunityMembershipRow): CommunityMembershipRecord {
    return {
        ...mapCommunityMembershipValues(row),
        isCancellationScheduled: row.is_cancellation_scheduled,
    };
}

function getNonNegativeWholeNumber(value: number | string | undefined): number {
    const numberValue = Number(value);
    return Number.isSafeInteger(numberValue) && numberValue >= 0 ? numberValue : 0;
}

async function loadCommunityMembershipBy(
    supabase: SupabaseClient,
    column: string,
    value: string,
    operationName: string,
    communityId?: CommunityId,
): Promise<CommunityMembershipLoadResult> {
    let query = supabase.from(COMMUNITY_MEMBERSHIP_TABLE_NAME).select(COMMUNITY_MEMBERSHIP_COLUMNS).eq(column, value);
    if (communityId !== undefined) {
        query = query.eq('community_id', communityId);
    }
    const { data, error } = await query.maybeSingle();

    if (error) {
        return { membership: null, errorMessage: reportSupabaseError(operationName, error) };
    }

    return {
        membership: data === null ? null : mapCommunityMembershipRow(data as CommunityMembershipRow),
        errorMessage: null,
    };
}

export function loadCommunityMembershipByEmail(
    supabase: SupabaseClient,
    email: string,
    communityId: CommunityId = DEFAULT_COMMUNITY_ID,
): Promise<CommunityMembershipLoadResult> {
    return loadCommunityMembershipBy(
        supabase,
        'email',
        normalizeCommunityMemberEmail(email),
        'the membership of a community member',
        communityId,
    );
}

export function loadCommunityMembershipByCheckoutSession(
    supabase: SupabaseClient,
    stripeCheckoutSessionId: string,
): Promise<CommunityMembershipLoadResult> {
    return loadCommunityMembershipBy(
        supabase,
        'stripe_checkout_session_id',
        stripeCheckoutSessionId,
        'the membership of a checkout session',
    );
}

/**
 * Loads all paid-membership states needed by one page of community participants in one query. The membership is keyed
 * by normalized e-mail because a person can open more than one community-room session.
 */
export async function loadCommunityMembershipStatusesByEmails(
    supabase: SupabaseClient,
    emails: readonly string[],
    communityId: CommunityId = DEFAULT_COMMUNITY_ID,
): Promise<{
    readonly statusesByEmail: ReadonlyMap<string, StoredCommunityMembershipStatus>;
    readonly errorMessage: string | null;
}> {
    const normalizedEmails = Array.from(
        new Set(emails.map(normalizeCommunityMemberEmail).filter((email) => email !== '')),
    );
    if (normalizedEmails.length === 0) {
        return { statusesByEmail: new Map(), errorMessage: null };
    }

    const { data, error } = await supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .select('email, status')
        .eq('community_id', communityId)
        .in('email', normalizedEmails);
    if (error) {
        return {
            statusesByEmail: new Map(),
            errorMessage: reportSupabaseError('the membership statuses of community participants', error),
        };
    }

    const statusesByEmail = new Map<string, StoredCommunityMembershipStatus>();
    for (const row of (data ?? []) as readonly { readonly email: string; readonly status: string }[]) {
        statusesByEmail.set(normalizeCommunityMemberEmail(row.email), row.status as StoredCommunityMembershipStatus);
    }

    return { statusesByEmail, errorMessage: null };
}

/**
 * Answers the shared status badge for an e-mail, including the free state which has no row in the payment table.
 */
export function getCommunityMembershipStatusByEmail(
    statusesByEmail: ReadonlyMap<string, StoredCommunityMembershipStatus>,
    email: string,
): CommunityMembershipStatus {
    return statusesByEmail.get(normalizeCommunityMemberEmail(email)) ?? 'none';
}

/**
 * Loads one filtered, sorted page of paid memberships. The database does filtering and paging before private payment
 * data leaves it, which keeps the administration responsive as the community grows.
 */
export async function loadCommunityMembershipAdminPage(
    supabase: SupabaseClient,
    query: CommunityMembershipAdminQuery,
    communityId: CommunityId = DEFAULT_COMMUNITY_ID,
): Promise<{ readonly page: CommunityMembershipAdminPage | null; readonly errorMessage: string | null }> {
    const pageParameters = {
        target_community_id: communityId,
        target_search_query: query.searchQuery,
        target_status: query.status,
        target_is_test_payment: query.isTestPayment,
        target_sort_by: query.sortBy,
        target_sort_direction: query.sortDirection,
        target_limit: query.pageSize,
        target_offset: (query.page - 1) * query.pageSize,
    };
    const { data, error } = await supabase.rpc(COMMUNITY_MEMBERSHIP_ADMIN_PAGE_FUNCTION_NAME, pageParameters);
    if (error) {
        return {
            page: null,
            errorMessage: reportSupabaseError(
                `\`${COMMUNITY_MEMBERSHIP_ADMIN_PAGE_FUNCTION_NAME}\``,
                error,
                pageParameters,
            ),
        };
    }

    const membershipRows = (data ?? []) as CommunityMembershipAdminPageRow[];
    return {
        page: {
            memberships: membershipRows.map(mapCommunityMembershipValues),
            totalCount: getNonNegativeWholeNumber(membershipRows[0]?.total_count),
        },
        errorMessage: null,
    };
}

/**
 * The membership of one member as it stands the moment they accepted the offer.
 *
 * Note: A membership which is being taken again describes that attempt alone, so nothing the gate decides about the
 *       subscription somebody left behind can be mistaken for a decision about the new one.
 */
function createAcceptedCommunityMembershipValues(values: AcceptedCommunityMembershipValues) {
    return {
        community_id: values.communityId ?? DEFAULT_COMMUNITY_ID,
        email: normalizeCommunityMemberEmail(values.email),
        fullname: values.fullname,
        plan_id: values.planId,
        monthly_price_czk: values.monthlyPriceCzk,
        discount_code: values.discountCode,
        discount_percent: values.discountPercent,
        is_test_payment: values.isTestPayment,
        is_cancellation_scheduled: false,
        requested_by_participant_id: values.requestedByParticipantId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_ends_at: null,
        canceled_at: null,
    };
}

/**
 * Writes the one membership of a member, whether they never had one or are taking it anew.
 */
async function saveCommunityMembership(
    supabase: SupabaseClient,
    existingMembershipId: string | null,
    membershipValues: Readonly<Record<string, unknown>>,
    previousCheckoutSessionId: string | null,
    operationName: string,
): Promise<{ readonly errorMessage: string | null }> {
    if (existingMembershipId === null) {
        const { error } = await supabase.from(COMMUNITY_MEMBERSHIP_TABLE_NAME).insert(membershipValues);
        return { errorMessage: error ? reportSupabaseError(operationName, error) : null };
    }

    const update = supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .update(membershipValues)
        .eq('id', existingMembershipId)
        .eq('community_id', membershipValues.community_id)
        .eq('email', membershipValues.email)
        .in('status', ['pending', 'canceled']);
    const { data, error } = await (previousCheckoutSessionId === null
        ? update.is('stripe_checkout_session_id', null)
        : update.eq('stripe_checkout_session_id', previousCheckoutSessionId)
    ).select('id');

    return {
        errorMessage: error ? reportSupabaseError(operationName, error)
            : data?.length === 1 ? null : 'The community membership changed during checkout.',
    };
}

/**
 * Records the offer a member accepted before they are sent to the payment gate.
 *
 * Note: The membership is written before the Checkout URL is returned, so a payment confirmed by a webhook long
 *       after the browser was closed still finds the member, the plan and the price it belongs to.
 */
export function saveRequestedCommunityMembership(
    supabase: SupabaseClient,
    existingMembershipId: string | null,
    values: RequestedCommunityMembershipValues,
): Promise<{ readonly errorMessage: string | null }> {
    return saveCommunityMembership(
        supabase,
        existingMembershipId,
        {
            ...createAcceptedCommunityMembershipValues(values),
            status: 'pending' satisfies StoredCommunityMembershipStatus,
            stripe_checkout_session_id: values.stripeCheckoutSessionId,
            activated_at: null,
        },
        values.previousCheckoutSessionId ?? null,
        'the requested community membership',
    );
}

/**
 * Gives a member the membership their voucher pays for, which is theirs the moment it is written.
 *
 * Note: Such a membership is active without ever having been through the payment gate, so it carries neither a
 *       checkout nor a subscription. There is nothing for the gate to decide about it later and nothing to cancel:
 *       the discount code took its whole price for as long as it lasts.
 */
export function saveRedeemedCommunityMembership(
    supabase: SupabaseClient,
    existingMembershipId: string | null,
    values: AcceptedCommunityMembershipValues,
): Promise<{ readonly errorMessage: string | null }> {
    return saveCommunityMembership(
        supabase,
        existingMembershipId,
        {
            ...createAcceptedCommunityMembershipValues(values),
            status: 'active' satisfies StoredCommunityMembershipStatus,
            stripe_checkout_session_id: null,
            activated_at: new Date().toISOString(),
        },
        values.previousCheckoutSessionId ?? null,
        'the redeemed community membership',
    );
}

/**
 * Turns a membership which was only requested into one which is being paid for.
 *
 * Note: Only a membership which is not paid for yet is changed, and the answer says whether this call is the one which
 *       changed it. The return from the gate and its webhook therefore both confirm the very same payment, while
 *       whatever must happen exactly once happens exactly once.
 */
export async function markCommunityMembershipPaid(
    supabase: SupabaseClient,
    membershipId: string,
    stripeCheckoutSessionId: string,
    values: PaidCommunityMembershipValues,
): Promise<{ readonly isNewlyPaid: boolean; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .update({
            status: values.status,
            stripe_customer_id: values.stripeCustomerId,
            stripe_subscription_id: values.stripeSubscriptionId,
            is_cancellation_scheduled: values.isCancellationScheduled,
            current_period_ends_at: values.currentPeriodEndsAt,
            activated_at: new Date().toISOString(),
        })
        .eq('id', membershipId)
        .eq('stripe_checkout_session_id', stripeCheckoutSessionId)
        .eq('status', 'pending' satisfies StoredCommunityMembershipStatus)
        .select('id');

    if (error) {
        return { isNewlyPaid: false, errorMessage: reportSupabaseError('the paid community membership', error) };
    }

    return { isNewlyPaid: (data ?? []).length > 0, errorMessage: null };
}

/** Releases a pending attempt after Stripe confirms its asynchronous payment failed. */
export async function cancelFailedCommunityMembershipCheckout(
    supabase: SupabaseClient,
    stripeCheckoutSessionId: string,
): Promise<{ readonly errorMessage: string | null }> {
    const { error } = await supabase.from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .update({ status: 'canceled', canceled_at: new Date().toISOString() })
        .eq('stripe_checkout_session_id', stripeCheckoutSessionId)
        .eq('status', 'pending');

    return { errorMessage: error ? reportSupabaseError('the failed community membership checkout', error) : null };
}

/**
 * Follows a membership the gate keeps deciding about, such as one which was cancelled or whose card stopped working.
 */
export async function saveCommunityMembershipSubscriptionState(
    supabase: SupabaseClient,
    stripeSubscriptionId: string,
    values: {
        readonly status: StoredCommunityMembershipStatus;
        readonly isCancellationScheduled: boolean;
        readonly currentPeriodEndsAt: string | null;
    },
): Promise<{ readonly isMembershipFound: boolean; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(COMMUNITY_MEMBERSHIP_TABLE_NAME)
        .update({
            status: values.status,
            is_cancellation_scheduled: values.isCancellationScheduled,
            current_period_ends_at: values.currentPeriodEndsAt,
            canceled_at: values.status === 'canceled' ? new Date().toISOString() : null,
        })
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .select('id');

    if (error) {
        return {
            isMembershipFound: false,
            errorMessage: reportSupabaseError('the community membership of a subscription', error),
        };
    }

    return { isMembershipFound: (data ?? []).length > 0, errorMessage: null };
}
