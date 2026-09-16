import { createAdHocShortcodeLink } from '@/lib/shortener/shortcodeLinkAdHoc';
import {
    createPublicShortcodeLinkUrl,
    type ShortcodeLinkSourceApp,
} from '@/lib/shortener/shortcodeLink';
import { SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import { fetchPublicWebPageTitle } from '@/lib/network/publicWebPagePreview';
import {
    WORKSHOP_COMMENT_SHORTCODE_LINK_TABLE_NAME,
    WORKSHOP_CONTENT_SHORTCODE_LINK_TABLE_NAME,
} from '@/lib/workshops/workshopConstants';
import {
    collectWorkshopMaterialLinkRanges,
    getTrackableWorkshopMaterialUrl,
    getWorkshopShortcodeLinkDestinations,
    getWorkshopShortcodeLinkDestinationsRequiringTitle,
} from '@/lib/workshops/workshopMaterialLinkSyntax';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export {
    getWorkshopMaterialLinkDestinations,
    getWorkshopShortcodeLinkDestinations,
} from '@/lib/workshops/workshopMaterialLinkSyntax';

const WORKSHOP_UTM_SOURCE = 'promptbook';
const WORKSHOP_UTM_MEDIUM = 'workshop';

type WorkshopShortcodeLinkMappingRow = {
    readonly destination_url: string;
    readonly destination_title?: string | null;
    readonly shortcode_link_id: number | string;
};

/**
 * One persisted source record whose URLs are handed out as public short links.
 * Materials and eligible chat messages differ only by this durable mapping;
 * parsing, UTM values, collision handling, and URL replacement stay shared.
 */
type WorkshopShortcodeLinkOwner = {
    readonly id: string;
    readonly mappingTableName: string;
    readonly mappingOwnerColumnName: string;
    readonly note: string;
};

type ShortcodeLinkReferenceRow = {
    readonly id: number | string;
    readonly shortcode: string;
};

export type WorkshopShortcodeLinkPresentation = {
    readonly shortUrl: string;
    readonly title: string;
};

type WorkshopShortcodeLinkReplacement = string | WorkshopShortcodeLinkPresentation;

type LoadedWorkshopShortcodeLink = WorkshopShortcodeLinkPresentation & {
    readonly isTitleStored: boolean;
};

type LoadedWorkshopShortcodeLinks =
    | {
          readonly shortcodeLinkByDestination: ReadonlyMap<string, LoadedWorkshopShortcodeLink>;
          readonly errorMessage: null;
      }
    | { readonly shortcodeLinkByDestination: null; readonly errorMessage: string };

/**
 * Keeps the source address of a workshop-owned link useful to its destination's
 * analytics. The public address is later handed out as a short link; this is
 * only the destination stored behind that short link.
 */
export function createWorkshopShortcodeLinkTrackingUrl(
    destinationUrl: string,
    workshopSlug: string,
    sourceRecordId: string,
): string {
    const trackableUrl = getTrackableWorkshopMaterialUrl(destinationUrl);
    if (trackableUrl === null) {
        return destinationUrl;
    }

    const parsedUrl = new URL(trackableUrl);
    parsedUrl.searchParams.set('utm_source', WORKSHOP_UTM_SOURCE);
    parsedUrl.searchParams.set('utm_medium', WORKSHOP_UTM_MEDIUM);
    parsedUrl.searchParams.set('utm_campaign', workshopSlug);
    parsedUrl.searchParams.set('utm_content', sourceRecordId);
    return parsedUrl.toString();
}

/**
 * The material-specific name remains available to callers which describe a
 * content block. Chat messages use the same tracking URL factory above.
 */
export function createWorkshopMaterialTrackingUrl(
    destinationUrl: string,
    workshopSlug: string,
    contentBlockId: string,
): string {
    return createWorkshopShortcodeLinkTrackingUrl(destinationUrl, workshopSlug, contentBlockId);
}

function escapeMarkdownLinkTitle(title: string): string {
    return title.replace(/[\\\[\]]/g, '\\$&');
}

function createMarkdownShortcodeLink(title: string, shortUrl: string): string {
    return `[${escapeMarkdownLinkTitle(title)}](${shortUrl})`;
}

function getWorkshopShortcodeLinkFallbackTitle(destinationUrl: string): string {
    const trackableUrl = getTrackableWorkshopMaterialUrl(destinationUrl);

    return trackableUrl === null ? destinationUrl : new URL(trackableUrl).hostname;
}

function getStoredWorkshopShortcodeLinkTitle(value: string | null | undefined): string | null {
    const title = value?.trim() ?? '';

    return title === '' ? null : title;
}

async function resolveWorkshopShortcodeLinkTitle(destinationUrl: string): Promise<string> {
    const trackableUrl = getTrackableWorkshopMaterialUrl(destinationUrl);
    if (trackableUrl === null) {
        return destinationUrl;
    }

    try {
        return await fetchPublicWebPageTitle(trackableUrl);
    } catch {
        // A remote page may reject our bounded metadata request, but that must
        // never prevent a room from handing out its already-safe short link.
        return getWorkshopShortcodeLinkFallbackTitle(destinationUrl);
    }
}

/**
 * Replaces a source address with its persisted short URL. An authored Markdown,
 * HTML, or reference label remains its author's wording; raw URLs and
 * autolinks receive the fetched page title in ordinary Markdown link syntax.
 */
export function replaceWorkshopShortcodeLinkDestinations(
    bodyMarkdown: string,
    shortcodeLinkByDestination: ReadonlyMap<string, WorkshopShortcodeLinkReplacement>,
): string {
    let replacedMarkdown = bodyMarkdown;
    const ranges = collectWorkshopMaterialLinkRanges(bodyMarkdown);

    for (const range of [...ranges].reverse()) {
        const shortcodeLink = shortcodeLinkByDestination.get(range.destination);
        if (shortcodeLink !== undefined) {
            const replacement =
                typeof shortcodeLink === 'string'
                    ? shortcodeLink
                    : range.isTitleRequired
                      ? createMarkdownShortcodeLink(shortcodeLink.title, shortcodeLink.shortUrl)
                      : shortcodeLink.shortUrl;
            replacedMarkdown =
                replacedMarkdown.slice(0, range.start) + replacement + replacedMarkdown.slice(range.end);
        }
    }

    return replacedMarkdown;
}

export function replaceWorkshopMaterialLinkDestinations(
    bodyMarkdown: string,
    shortcodeLinkByDestination: ReadonlyMap<string, WorkshopShortcodeLinkReplacement>,
): string {
    return replaceWorkshopShortcodeLinkDestinations(bodyMarkdown, shortcodeLinkByDestination);
}

export function getWorkshopShortcodeLinkSourceApp(workshopKind: WorkshopKind): ShortcodeLinkSourceApp {
    return workshopKind === 'workshop' ? 'online-workshop' : 'community';
}

export function getWorkshopMaterialShortcodeSourceApp(workshopKind: WorkshopKind): ShortcodeLinkSourceApp {
    return getWorkshopShortcodeLinkSourceApp(workshopKind);
}

function getShortcodeLinkId(value: number | string): number | null {
    const shortcodeLinkId = Number(value);

    return Number.isSafeInteger(shortcodeLinkId) && shortcodeLinkId > 0 ? shortcodeLinkId : null;
}

async function loadWorkshopShortcodeLinks(
    supabase: SupabaseClient,
    linkOwner: WorkshopShortcodeLinkOwner,
): Promise<LoadedWorkshopShortcodeLinks> {
    const { data: mappingData, error: mappingError } = await supabase
        .from(linkOwner.mappingTableName)
        .select('destination_url, destination_title, shortcode_link_id')
        .eq(linkOwner.mappingOwnerColumnName, linkOwner.id);
    if (mappingError) {
        return { shortcodeLinkByDestination: null, errorMessage: mappingError.message };
    }

    const mappings = (mappingData ?? []) as WorkshopShortcodeLinkMappingRow[];
    const shortcodeLinkIds = Array.from(
        new Set(
            mappings
                .map((mapping) => getShortcodeLinkId(mapping.shortcode_link_id))
                .filter((shortcodeLinkId): shortcodeLinkId is number => shortcodeLinkId !== null),
        ),
    );
    if (shortcodeLinkIds.length === 0) {
        return { shortcodeLinkByDestination: new Map(), errorMessage: null };
    }

    const { data: shortcodeLinkData, error: shortcodeLinkError } = await supabase
        .from(SHORTCODE_LINK_TABLE_NAME)
        .select('id, shortcode')
        .in('id', shortcodeLinkIds);
    if (shortcodeLinkError) {
        return { shortcodeLinkByDestination: null, errorMessage: shortcodeLinkError.message };
    }

    const shortcodeById = new Map<number, string>(
        ((shortcodeLinkData ?? []) as ShortcodeLinkReferenceRow[])
            .map((shortcodeLink) => {
                const shortcodeLinkId = getShortcodeLinkId(shortcodeLink.id);

                return shortcodeLinkId === null ? null : ([shortcodeLinkId, shortcodeLink.shortcode] as const);
            })
            .filter((shortcodeLink): shortcodeLink is readonly [number, string] => shortcodeLink !== null),
    );
    const shortcodeLinkByDestination = new Map<string, LoadedWorkshopShortcodeLink>();

    for (const mapping of mappings) {
        const shortcodeLinkId = getShortcodeLinkId(mapping.shortcode_link_id);
        const shortcode = shortcodeLinkId === null ? undefined : shortcodeById.get(shortcodeLinkId);
        if (shortcode !== undefined) {
            const storedTitle = getStoredWorkshopShortcodeLinkTitle(mapping.destination_title);
            shortcodeLinkByDestination.set(mapping.destination_url, {
                shortUrl: createPublicShortcodeLinkUrl(shortcode),
                title: storedTitle ?? getWorkshopShortcodeLinkFallbackTitle(mapping.destination_url),
                isTitleStored: storedTitle !== null,
            });
        }
    }

    return { shortcodeLinkByDestination, errorMessage: null };
}

async function persistWorkshopShortcodeLinkTitle(
    supabase: SupabaseClient,
    linkOwner: WorkshopShortcodeLinkOwner,
    destination: string,
    title: string,
): Promise<string | null> {
    const { error } = await supabase
        .from(linkOwner.mappingTableName)
        .update({ destination_title: title })
        .eq(linkOwner.mappingOwnerColumnName, linkOwner.id)
        .eq('destination_url', destination);

    return error?.message ?? null;
}

/**
 * Makes sure every trackable URL of one persisted workshop record has one ad
 * hoc short link, then returns a copy of its Markdown with public short URLs.
 * The original text remains in its source table, so a changed destination or a
 * deleted shortcode can be safely prepared again.
 */
async function materializeWorkshopShortLinks(
    supabase: SupabaseClient,
    context: {
        readonly workshopSlug: string;
        readonly workshopKind: WorkshopKind;
        readonly bodyMarkdown: string;
    },
    linkOwner: WorkshopShortcodeLinkOwner,
): Promise<{ readonly bodyMarkdown: string | null; readonly errorMessage: string | null }> {
    const destinations = getWorkshopShortcodeLinkDestinations(context.bodyMarkdown);
    if (destinations.length === 0) {
        return { bodyMarkdown: context.bodyMarkdown, errorMessage: null };
    }
    const destinationsRequiringTitle = new Set(getWorkshopShortcodeLinkDestinationsRequiringTitle(context.bodyMarkdown));

    const loadedShortcodeLinks = await loadWorkshopShortcodeLinks(supabase, linkOwner);
    if (loadedShortcodeLinks.shortcodeLinkByDestination === null) {
        return { bodyMarkdown: null, errorMessage: loadedShortcodeLinks.errorMessage };
    }

    const missingDestinations = destinations.filter(
        (destination) => !loadedShortcodeLinks.shortcodeLinkByDestination.has(destination),
    );
    for (const destination of missingDestinations) {
        const destinationTitle = destinationsRequiringTitle.has(destination)
            ? await resolveWorkshopShortcodeLinkTitle(destination)
            : null;
        const trackedDestination = createWorkshopShortcodeLinkTrackingUrl(
            destination,
            context.workshopSlug,
            linkOwner.id,
        );
        const createdShortcodeLink = await createAdHocShortcodeLink(supabase, {
            urls: [trackedDestination],
            note: linkOwner.note,
            sourceApp: getWorkshopShortcodeLinkSourceApp(context.workshopKind),
        });
        if (createdShortcodeLink.shortcodeLink === null) {
            return { bodyMarkdown: null, errorMessage: createdShortcodeLink.errorMessage };
        }

        // A room can be opened by many people at once. Upsert lets the source
        // record retain whichever equivalent shortcode reached the mapping
        // first, and a reload below makes every concurrent response use it.
        const { error: mappingError } = await supabase
            .from(linkOwner.mappingTableName)
            .upsert(
                {
                    [linkOwner.mappingOwnerColumnName]: linkOwner.id,
                    destination_url: destination,
                    shortcode_link_id: createdShortcodeLink.shortcodeLink.id,
                    ...(destinationTitle === null ? {} : { destination_title: destinationTitle }),
                },
                { onConflict: `${linkOwner.mappingOwnerColumnName},destination_url`, ignoreDuplicates: true },
            );
        if (mappingError) {
            return { bodyMarkdown: null, errorMessage: mappingError.message };
        }
    }

    const resolvedShortcodeLinks =
        missingDestinations.length === 0
            ? loadedShortcodeLinks
            : await loadWorkshopShortcodeLinks(supabase, linkOwner);
    const resolvedShortcodeLinkByDestination = resolvedShortcodeLinks.shortcodeLinkByDestination;
    if (resolvedShortcodeLinkByDestination === null) {
        return { bodyMarkdown: null, errorMessage: resolvedShortcodeLinks.errorMessage };
    }

    const destinationsWithoutStoredTitle = Array.from(destinationsRequiringTitle).filter(
        (destination) => !resolvedShortcodeLinkByDestination.get(destination)?.isTitleStored,
    );
    for (const destination of destinationsWithoutStoredTitle) {
        const titleErrorMessage = await persistWorkshopShortcodeLinkTitle(
            supabase,
            linkOwner,
            destination,
            await resolveWorkshopShortcodeLinkTitle(destination),
        );
        if (titleErrorMessage !== null) {
            return { bodyMarkdown: null, errorMessage: titleErrorMessage };
        }
    }

    let shortcodeLinkByDestination = resolvedShortcodeLinkByDestination;
    if (destinationsWithoutStoredTitle.length > 0) {
        const reloadedShortcodeLinks = await loadWorkshopShortcodeLinks(supabase, linkOwner);
        const reloadedShortcodeLinkByDestination = reloadedShortcodeLinks.shortcodeLinkByDestination;
        if (reloadedShortcodeLinkByDestination === null) {
            return { bodyMarkdown: null, errorMessage: reloadedShortcodeLinks.errorMessage };
        }
        shortcodeLinkByDestination = reloadedShortcodeLinkByDestination;
    }

    return {
        bodyMarkdown: replaceWorkshopShortcodeLinkDestinations(context.bodyMarkdown, shortcodeLinkByDestination),
        errorMessage: null,
    };
}

/**
 * Makes sure every trackable URL in one material has one ad hoc short link,
 * then returns a copy of its Markdown which contains the public short URLs.
 */
export async function materializeWorkshopMaterialShortLinks(
    supabase: SupabaseClient,
    context: {
        readonly workshopSlug: string;
        readonly workshopKind: WorkshopKind;
        readonly contentBlockId: string;
        readonly bodyMarkdown: string;
    },
): Promise<{ readonly bodyMarkdown: string | null; readonly errorMessage: string | null }> {
    return materializeWorkshopShortLinks(supabase, context, {
        id: context.contentBlockId,
        mappingTableName: WORKSHOP_CONTENT_SHORTCODE_LINK_TABLE_NAME,
        mappingOwnerColumnName: 'content_block_id',
        note: `Ad hoc material link for ${context.workshopSlug}`,
    });
}

/**
 * Materializes the links of an eligible chat message through the same persisted
 * ad hoc-shortcode path as materials. A normal participant never calls this:
 * their links deliberately stay inert text in the room.
 */
export async function materializeWorkshopCommentShortLinks(
    supabase: SupabaseClient,
    context: {
        readonly workshopSlug: string;
        readonly workshopKind: WorkshopKind;
        readonly commentId: string;
        readonly bodyMarkdown: string;
    },
): Promise<{ readonly bodyMarkdown: string | null; readonly errorMessage: string | null }> {
    return materializeWorkshopShortLinks(supabase, context, {
        id: context.commentId,
        mappingTableName: WORKSHOP_COMMENT_SHORTCODE_LINK_TABLE_NAME,
        mappingOwnerColumnName: 'comment_id',
        note: `Ad hoc chat link for ${context.workshopSlug}`,
    });
}

/**
 * Prepares a material as soon as an administrator saves it. Participant-facing
 * reads call the same materializer as a recovery path for links which existed
 * before this migration or whose first preparation was interrupted.
 */
export async function ensureWorkshopMaterialShortLinks(
    supabase: SupabaseClient,
    context: {
        readonly workshopSlug: string;
        readonly workshopKind: WorkshopKind;
        readonly contentBlockId: string;
        readonly bodyMarkdown: string;
    },
): Promise<string | null> {
    const { errorMessage } = await materializeWorkshopMaterialShortLinks(supabase, context);

    return errorMessage;
}

/**
 * Prepares a moderator or artificial message as soon as it is written. Public
 * state loading repeats this safely for old messages and interrupted writes.
 */
export async function ensureWorkshopCommentShortLinks(
    supabase: SupabaseClient,
    context: {
        readonly workshopSlug: string;
        readonly workshopKind: WorkshopKind;
        readonly commentId: string;
        readonly bodyMarkdown: string;
    },
): Promise<string | null> {
    const { errorMessage } = await materializeWorkshopCommentShortLinks(supabase, context);

    return errorMessage;
}
