import { loadCommunityMembershipByEmail } from '@/lib/community-membership/communityMembershipDatabase';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';
import { SHORTCODE_LINK_PUBLIC_BASE_URL, SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import { WORKSHOP_CONTENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { loadWorkshopMaterialTrackedDestination } from '@/lib/workshops/workshopMaterialLinks';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { selectWorkshopVideoForMember } from '@/lib/workshops/workshopPaidMembersVideo';
import { createWorkshopVideoMaterialUrl } from '@/lib/workshops/workshopVideoMaterialUrl';
import type { WorkshopMaterialPreviewKind } from '@/lib/workshops/workshopMaterialPreviewTypes';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { mapWorkshopRow, type WorkshopRow } from '@/lib/workshops/workshopDatabase';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const MAXIMAL_SHORTCODE_PREVIEW_HOPS = 5;

type WorkshopMaterialPreviewTargetResult = {
    readonly targetUrl: string | null;
    readonly errorMessage: string | null;
};

type WorkshopContentPreviewAccessRow = {
    readonly id: string;
    readonly body_markdown: string;
    readonly unlock_at: string;
    readonly is_published: boolean;
    readonly is_paid_members_only: boolean;
};

type ShortcodePreviewRow = {
    readonly shortcode: string;
    readonly url: readonly string[] | null;
};

function getShortcodeFromPublicUrl(value: string): string | null {
    let parsedUrl: URL;
    let publicBaseUrl: URL;
    try {
        parsedUrl = new URL(value);
        publicBaseUrl = new URL(SHORTCODE_LINK_PUBLIC_BASE_URL);
    } catch {
        return null;
    }

    if (
        parsedUrl.origin !== publicBaseUrl.origin ||
        parsedUrl.username !== '' ||
        parsedUrl.password !== '' ||
        !parsedUrl.pathname.startsWith(publicBaseUrl.pathname)
    ) {
        return null;
    }

    const shortcode = parsedUrl.pathname.slice(publicBaseUrl.pathname.length);
    return shortcode !== '' && !shortcode.includes('/') ? shortcode : null;
}

/** Resolves our own short links by reading their stored target, never by requesting the click-tracking route. */
async function resolveShortcodeDestinationReadOnly(
    supabase: SupabaseClient,
    initialUrl: string,
): Promise<{ readonly targetUrl: string | null; readonly errorMessage: string | null }> {
    let currentUrl = initialUrl;
    const visitedShortcodes = new Set<string>();

    for (let redirectCount = 0; redirectCount <= MAXIMAL_SHORTCODE_PREVIEW_HOPS; redirectCount += 1) {
        const shortcode = getShortcodeFromPublicUrl(currentUrl);
        if (shortcode === null) {
            return { targetUrl: normalizePublicWebPageUrl(currentUrl), errorMessage: null };
        }
        if (visitedShortcodes.has(shortcode) || redirectCount === MAXIMAL_SHORTCODE_PREVIEW_HOPS) {
            return { targetUrl: null, errorMessage: null };
        }
        visitedShortcodes.add(shortcode);

        const { data, error } = await supabase
            .from(SHORTCODE_LINK_TABLE_NAME)
            .select('shortcode, url')
            .eq('shortcode', shortcode)
            .maybeSingle();
        if (error) {
            return { targetUrl: null, errorMessage: error.message };
        }

        const shortcodeLink = data as ShortcodePreviewRow | null;
        if (shortcodeLink === null || shortcodeLink.url?.length !== 1 || !shortcodeLink.url[0]) {
            return { targetUrl: null, errorMessage: null };
        }
        currentUrl = shortcodeLink.url[0];
    }

    return { targetUrl: null, errorMessage: null };
}

async function isPaidMemberOfWorkshopCommunity(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
): Promise<boolean> {
    if (!getWorkshopKindCapabilities(workshopRow.room_kind).isMembershipOffered) {
        return false;
    }

    const { membership, errorMessage } = await loadCommunityMembershipByEmail(supabase, participant.email);
    if (errorMessage !== null) {
        return false;
    }

    return membership !== null && isPaidCommunityMembershipStatus(membership.status);
}

async function loadOrdinaryMaterialPreviewTarget(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
    materialId: string,
    shortUrl: string,
): Promise<WorkshopMaterialPreviewTargetResult> {
    const { data, error } = await supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select('id, body_markdown, unlock_at, is_published, is_paid_members_only')
        .eq('id', materialId)
        .eq('workshop_id', workshopRow.id)
        .maybeSingle();
    if (error) {
        return { targetUrl: null, errorMessage: error.message };
    }

    const contentBlock = data as WorkshopContentPreviewAccessRow | null;
    if (
        contentBlock === null ||
        !contentBlock.is_published ||
        Date.parse(contentBlock.unlock_at) > Date.now() ||
        !Number.isFinite(Date.parse(contentBlock.unlock_at))
    ) {
        return { targetUrl: null, errorMessage: null };
    }
    if (contentBlock.is_paid_members_only && !(await isPaidMemberOfWorkshopCommunity(supabase, workshopRow, participant))) {
        return { targetUrl: null, errorMessage: null };
    }

    const trackedDestination = await loadWorkshopMaterialTrackedDestination(
        supabase,
        materialId,
        shortUrl,
        contentBlock.body_markdown,
    );
    if (trackedDestination.errorMessage !== null || trackedDestination.destinationUrl === null) {
        return { targetUrl: null, errorMessage: trackedDestination.errorMessage };
    }

    const resolvedDestination = await resolveShortcodeDestinationReadOnly(supabase, trackedDestination.destinationUrl);
    return resolvedDestination.targetUrl === null
        ? resolvedDestination
        : { targetUrl: resolvedDestination.targetUrl, errorMessage: null };
}

async function loadPresentationPreviewTarget(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    submittedUrl: string,
): Promise<WorkshopMaterialPreviewTargetResult> {
    if (!getWorkshopKindCapabilities(workshopRow.room_kind).isPresentationOffered) {
        return { targetUrl: null, errorMessage: null };
    }

    const configuredPresentationUrl = mapWorkshopRow(workshopRow).presentationUrl;
    if (configuredPresentationUrl === null || submittedUrl !== configuredPresentationUrl) {
        return { targetUrl: null, errorMessage: null };
    }

    return resolveShortcodeDestinationReadOnly(supabase, configuredPresentationUrl);
}

async function loadVideoPreviewTarget(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
    submittedUrl: string,
): Promise<WorkshopMaterialPreviewTargetResult> {
    const workshop = mapWorkshopRow(workshopRow);
    if (!getWorkshopKindCapabilities(workshopRow.room_kind).isStageOffered) {
        return { targetUrl: null, errorMessage: null };
    }

    const isPaidMember = await isPaidMemberOfWorkshopCommunity(supabase, workshopRow, participant);
    const isWorkshopPast = isWorkshopPhasePast(getWorkshopPhase(workshop, Date.now()));
    const { readableVideo } = selectWorkshopVideoForMember(workshop, {
        isWorkshopPast,
        isPaidMember,
        isMembershipOffered: getWorkshopKindCapabilities(workshopRow.room_kind).isMembershipOffered,
    });
    if (readableVideo.youtubeVideoId === null) {
        return { targetUrl: null, errorMessage: null };
    }

    const configuredUrl = createWorkshopVideoMaterialUrl(
        readableVideo.youtubeVideoId,
        isWorkshopPast ? readableVideo.recordingStartOffsetSeconds : 0,
    );
    if (submittedUrl !== configuredUrl) {
        return { targetUrl: null, errorMessage: null };
    }

    return resolveShortcodeDestinationReadOnly(supabase, configuredUrl);
}

/**
 * Checks the same material visibility rules as the room snapshot, then resolves only the link belonging to that
 * readable card. Special cards are matched against the room's current visible presentation or video setting.
 */
export async function loadWorkshopMaterialPreviewTarget(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
    materialId: string,
    kind: WorkshopMaterialPreviewKind,
    submittedUrl: string,
): Promise<WorkshopMaterialPreviewTargetResult> {
    if (kind === 'material') {
        return loadOrdinaryMaterialPreviewTarget(supabase, workshopRow, participant, materialId, submittedUrl);
    }
    if (kind === 'presentation' && materialId === 'presentation') {
        return loadPresentationPreviewTarget(supabase, workshopRow, submittedUrl);
    }
    if (kind === 'video' && materialId === 'workshop-video') {
        return loadVideoPreviewTarget(supabase, workshopRow, participant, submittedUrl);
    }

    return { targetUrl: null, errorMessage: null };
}
