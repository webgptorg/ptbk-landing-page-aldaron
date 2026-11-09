import {
    createAdminContactGroups,
    createAdminJoinedContacts,
    listCommunityParticipantsWithoutContacts,
    type AdminCommunityParticipant,
    type AdminContactGroup,
    type AdminJoinedContact,
    type AdminWorkshopFeedback,
    type AdminWorkshopParticipation,
} from '@/lib/admin/adminContactJoin';
import { CONTACT_TABLE_NAME, loadContacts } from '@/lib/contacts/contactsDatabase';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import {
    WORKSHOP_FEEDBACK_TABLE_NAME,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_TABLE_NAME,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const ADMIN_CONTACT_WORKSHOP_COLUMNS = 'id, room_kind, title, starts_at, ends_at';
const ADMIN_CONTACT_WORKSHOP_PARTICIPANT_COLUMNS =
    'id, workshop_id, fullname, email, connected_at, last_seen_at, active_duration_seconds, is_interaction_banned, is_trusted';
const ADMIN_CONTACT_WORKSHOP_FEEDBACK_COLUMNS =
    'id, workshop_id, participant_id, rating, what_was_good, what_was_bad, note, created_at, updated_at';

type AdminContactWorkshopRow = {
    readonly id: string;
    readonly room_kind: WorkshopKind;
    readonly title: string;
    readonly starts_at: string;
    readonly ends_at: string | null;
};

type AdminContactWorkshopParticipantRow = {
    readonly id: string;
    readonly workshop_id: string;
    readonly fullname: string;
    readonly email: string;
    readonly connected_at: string;
    readonly last_seen_at: string;
    readonly active_duration_seconds: number;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
};

type AdminContactWorkshopFeedbackRow = {
    readonly id: string;
    readonly workshop_id: string;
    readonly participant_id: string;
    readonly rating: number | string;
    readonly what_was_good: string | null;
    readonly what_was_bad: string | null;
    readonly note: string | null;
    readonly created_at: string;
    readonly updated_at: string;
};

type AdminContactWorkshopParticipantActivityTotalsRow = {
    readonly workshop_id: string;
    readonly participant_id: string;
    readonly comment_count: number | string;
    readonly reaction_count: number | string;
    readonly upvote_count: number | string;
};

type LoadedAdminContactGroups = {
    readonly groups: readonly AdminContactGroup[] | null;
    readonly errorMessage: string | null;
};

type LoadedAdminJoinedContacts = {
    readonly contacts: readonly AdminJoinedContact[] | null;
    readonly communityParticipants: readonly AdminCommunityParticipant[];
    readonly errorMessage: string | null;
};

type LoadAdminContactGroupsOptions = {
    readonly isLoadingAll: boolean;

    /**
     * Whether this screen needs the complete cross-workshop attendance history, rather than only Contact-table fields.
     */
    readonly isWorkshopParticipationsIncluded?: boolean;

    /**
     * Whether the contact projection should also carry post-workshop feedback from the same verified identity.
     */
    readonly isWorkshopFeedbackIncluded?: boolean;
};

function getNonNegativeWholeNumber(value: number | string | undefined): number {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isSafeInteger(numericValue) && numericValue >= 0 ? numericValue : 0;
}

function createWorkshopParticipantActivityTotalsKey(workshopId: string, participantId: string): string {
    return `${workshopId}:${participantId}`;
}

function mapAdminWorkshopParticipation(
    participantRow: AdminContactWorkshopParticipantRow,
    workshopById: ReadonlyMap<string, AdminContactWorkshopRow>,
    activityTotalsByParticipationKey: ReadonlyMap<string, AdminContactWorkshopParticipantActivityTotalsRow>,
): AdminWorkshopParticipation | null {
    const workshopRow = workshopById.get(participantRow.workshop_id);
    if (workshopRow === undefined) {
        return null;
    }

    const activityTotals = activityTotalsByParticipationKey.get(
        createWorkshopParticipantActivityTotalsKey(participantRow.workshop_id, participantRow.id),
    );

    return {
        participantId: participantRow.id,
        workshopId: workshopRow.id,
        workshopKind: workshopRow.room_kind,
        workshopTitle: workshopRow.title,
        workshopStartsAt: workshopRow.starts_at,
        workshopEndsAt: workshopRow.ends_at,
        fullname: participantRow.fullname,
        email: participantRow.email,
        connectedAt: participantRow.connected_at,
        lastSeenAt: participantRow.last_seen_at,
        activeDurationSeconds: participantRow.active_duration_seconds,
        commentCount: getNonNegativeWholeNumber(activityTotals?.comment_count),
        reactionCount: getNonNegativeWholeNumber(activityTotals?.reaction_count),
        upvoteCount: getNonNegativeWholeNumber(activityTotals?.upvote_count),
        isInteractionBanned: participantRow.is_interaction_banned,
        isTrusted: participantRow.is_trusted,
    };
}

function mapAdminWorkshopFeedback(
    feedbackRow: AdminContactWorkshopFeedbackRow,
    workshopById: ReadonlyMap<string, AdminContactWorkshopRow>,
    participantById: ReadonlyMap<string, AdminContactWorkshopParticipantRow>,
): AdminWorkshopFeedback | null {
    const workshopRow = workshopById.get(feedbackRow.workshop_id);
    const participantRow = participantById.get(feedbackRow.participant_id);
    if (workshopRow === undefined || participantRow === undefined) {
        return null;
    }

    return {
        id: feedbackRow.id,
        workshopId: workshopRow.id,
        workshopKind: workshopRow.room_kind,
        workshopTitle: workshopRow.title,
        workshopStartsAt: workshopRow.starts_at,
        workshopEndsAt: workshopRow.ends_at,
        participantId: participantRow.id,
        fullname: participantRow.fullname,
        email: participantRow.email,
        rating: Number(feedbackRow.rating),
        whatWasGood: feedbackRow.what_was_good,
        whatWasBad: feedbackRow.what_was_bad,
        note: feedbackRow.note,
        createdAt: feedbackRow.created_at,
        updatedAt: feedbackRow.updated_at,
    };
}

/**
 * Read the already-aggregated activity of every workshop participant in one stable, paged query.
 *
 * The workshop participant page uses the very same database aggregate for one workshop. This multi-workshop variant
 * lets the contact history stay complete without issuing a query for every workshop occurrence.
 */
async function loadAdminWorkshopParticipantActivityTotals(
    supabase: SupabaseClient,
    workshopIds: readonly string[],
): Promise<{
    readonly activityTotals: readonly AdminContactWorkshopParticipantActivityTotalsRow[] | null;
    readonly errorMessage: string | null;
}> {
    if (workshopIds.length === 0) {
        return { activityTotals: [], errorMessage: null };
    }

    const { rows, errorMessage } = await loadAllSupabaseRows<AdminContactWorkshopParticipantActivityTotalsRow>(
        (fromIndex, toIndex) =>
            supabase
                .rpc('get_workshop_participant_activity_totals_for_workshops', {
                    target_workshop_ids: workshopIds,
                })
                .order('workshop_id', { ascending: true })
                .order('participant_id', { ascending: true })
                .range(fromIndex, toIndex),
        '`get_workshop_participant_activity_totals_for_workshops`',
    );

    return { activityTotals: rows, errorMessage };
}

/**
 * Read the workshop source rows needed by the admin-only contact projection once, then compose both attendance and
 * feedback read models from them. The data remains in its own tables; grouping it by an e-mail is presentation only.
 *
 * The source records remain separate and are joined after both pages are read, because the requested normalization is
 * intentionally a presentation rule rather than a new database key.
 */
async function loadAdminWorkshopContactSources(
    supabase: SupabaseClient,
    options: {
        readonly isWorkshopParticipationsIncluded: boolean;
        readonly isWorkshopFeedbackIncluded: boolean;
    },
): Promise<{
    readonly workshopParticipations: readonly AdminWorkshopParticipation[] | null;
    readonly workshopFeedbacks: readonly AdminWorkshopFeedback[] | null;
    readonly errorMessage: string | null;
}> {
    const [workshopRowsResult, participantRowsResult, feedbackRowsResult] = await Promise.all([
        loadAllSupabaseRows<AdminContactWorkshopRow>(
            (fromIndex, toIndex) =>
                supabase
                    .from(WORKSHOP_TABLE_NAME)
                    .select(ADMIN_CONTACT_WORKSHOP_COLUMNS)
                    .order('starts_at', { ascending: false })
                    .range(fromIndex, toIndex),
            `the workshops of the contact join, from \`${WORKSHOP_TABLE_NAME}\``,
        ),
        loadAllSupabaseRows<AdminContactWorkshopParticipantRow>(
            (fromIndex, toIndex) =>
                supabase
                    .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
                    .select(ADMIN_CONTACT_WORKSHOP_PARTICIPANT_COLUMNS)
                    .order('connected_at', { ascending: false })
                    .range(fromIndex, toIndex),
            `the attendances of the contact join, from \`${WORKSHOP_PARTICIPANT_TABLE_NAME}\``,
        ),
        options.isWorkshopFeedbackIncluded
            ? loadAllSupabaseRows<AdminContactWorkshopFeedbackRow>(
                  (fromIndex, toIndex) =>
                      supabase
                          .from(WORKSHOP_FEEDBACK_TABLE_NAME)
                          .select(ADMIN_CONTACT_WORKSHOP_FEEDBACK_COLUMNS)
                          .order('updated_at', { ascending: false })
                          .range(fromIndex, toIndex),
                  `the feedback of the contact join, from \`${WORKSHOP_FEEDBACK_TABLE_NAME}\``,
              )
            : Promise.resolve({ rows: [], errorMessage: null }),
    ]);

    const sourceErrorMessage =
        workshopRowsResult.errorMessage ?? participantRowsResult.errorMessage ?? feedbackRowsResult.errorMessage;
    if (workshopRowsResult.rows === null || participantRowsResult.rows === null || feedbackRowsResult.rows === null) {
        return { workshopParticipations: null, workshopFeedbacks: null, errorMessage: sourceErrorMessage };
    }

    const workshopById = new Map<string, AdminContactWorkshopRow>(
        workshopRowsResult.rows.map((workshopRow) => [workshopRow.id, workshopRow] as const),
    );
    const participantById = new Map<string, AdminContactWorkshopParticipantRow>(
        participantRowsResult.rows.map((participantRow) => [participantRow.id, participantRow] as const),
    );
    const activityTotalsResult = options.isWorkshopParticipationsIncluded
        ? await loadAdminWorkshopParticipantActivityTotals(
              supabase,
              workshopRowsResult.rows.map((workshopRow) => workshopRow.id),
          )
        : { activityTotals: [], errorMessage: null };
    if (activityTotalsResult.activityTotals === null) {
        return { workshopParticipations: null, workshopFeedbacks: null, errorMessage: activityTotalsResult.errorMessage };
    }

    const activityTotalsByParticipationKey = new Map<string, AdminContactWorkshopParticipantActivityTotalsRow>(
        activityTotalsResult.activityTotals.map(
            (activityTotals) =>
                [
                    createWorkshopParticipantActivityTotalsKey(
                        activityTotals.workshop_id,
                        activityTotals.participant_id,
                    ),
                    activityTotals,
                ] as const,
        ),
    );
    const workshopParticipations = options.isWorkshopParticipationsIncluded
        ? participantRowsResult.rows
              .map((participantRow) =>
                  mapAdminWorkshopParticipation(participantRow, workshopById, activityTotalsByParticipationKey),
              )
              .filter(
                  (workshopParticipation): workshopParticipation is AdminWorkshopParticipation =>
                      workshopParticipation !== null,
              )
        : [];
    const workshopFeedbacks = feedbackRowsResult.rows
        .map((feedbackRow) => mapAdminWorkshopFeedback(feedbackRow, workshopById, participantById))
        .filter((workshopFeedback): workshopFeedback is AdminWorkshopFeedback => workshopFeedback !== null);

    return { workshopParticipations, workshopFeedbacks, errorMessage: null };
}

/**
 * Read the identity groups which every authenticated admin contact view shares.
 */
export async function loadAdminContactGroups(
    supabase: SupabaseClient,
    options: LoadAdminContactGroupsOptions = { isLoadingAll: true },
): Promise<LoadedAdminContactGroups> {
    const isWorkshopParticipationsIncluded = options.isWorkshopParticipationsIncluded !== false;
    const isWorkshopFeedbackIncluded = options.isWorkshopFeedbackIncluded === true;
    const isWorkshopSourceDataIncluded = isWorkshopParticipationsIncluded || isWorkshopFeedbackIncluded;
    const [loadedContacts, loadedWorkshopSources] = await Promise.all([
        loadContacts(supabase.from(CONTACT_TABLE_NAME), { isLoadingAll: options.isLoadingAll }),
        isWorkshopSourceDataIncluded
            ? loadAdminWorkshopContactSources(supabase, {
                  isWorkshopParticipationsIncluded,
                  isWorkshopFeedbackIncluded,
              })
            : Promise.resolve({ workshopParticipations: [], workshopFeedbacks: [], errorMessage: null }),
    ]);

    const errorMessage = loadedContacts.errorMessage ?? loadedWorkshopSources.errorMessage;
    if (
        loadedContacts.contacts === null ||
        loadedWorkshopSources.workshopParticipations === null ||
        loadedWorkshopSources.workshopFeedbacks === null
    ) {
        return { groups: null, errorMessage };
    }

    return {
        groups: createAdminContactGroups(
            loadedContacts.contacts,
            loadedWorkshopSources.workshopParticipations,
            loadedWorkshopSources.workshopFeedbacks,
        ),
        errorMessage: null,
    };
}

/**
 * Read the grouped Contact-table projection used by the contacts dashboard and its exports.
 */
export async function loadAdminJoinedContacts(
    supabase: SupabaseClient,
    options: LoadAdminContactGroupsOptions = { isLoadingAll: true },
): Promise<LoadedAdminJoinedContacts> {
    const { groups, errorMessage } = await loadAdminContactGroups(supabase, {
        ...options,
        isWorkshopFeedbackIncluded: options.isWorkshopFeedbackIncluded ?? true,
    });
    if (groups === null) {
        return { contacts: null, communityParticipants: [], errorMessage };
    }

    return {
        contacts: createAdminJoinedContacts(groups),
        // A partial lead list cannot tell whether an identity has a Contact row.
        communityParticipants: options.isLoadingAll ? listCommunityParticipantsWithoutContacts(groups) : [],
        errorMessage: null,
    };
}
