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
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const WORKSHOP_UTM_SOURCE = 'promptbook';
const WORKSHOP_UTM_MEDIUM = 'workshop';
const WORKSHOP_MATERIAL_HASH_LINK_PREFIX = '#';
const WORKSHOP_MATERIAL_ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const WORKSHOP_MATERIAL_LINK_BASE_URL = 'https://www.promptbook.studio';
const WORKSHOP_MATERIAL_BARE_URL_PATTERN = /(^|\s)(https?:\/\/[^\s<>()\[\]"']+)/gm;
const WORKSHOP_MATERIAL_BARE_URL_TRAILING_PUNCTUATION_PATTERN = /[.,;:!?]+$/;

type WorkshopMaterialLinkRange = {
    readonly destination: string;
    readonly start: number;
    readonly end: number;
    readonly isTitleRequired: boolean;
};

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

function getWorkshopMaterialLinkBaseUrl(): string {
    return WORKSHOP_MATERIAL_LINK_BASE_URL;
}

function isEscaped(text: string, index: number): boolean {
    let precedingBackslashCount = 0;

    for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor--) {
        precedingBackslashCount++;
    }

    return precedingBackslashCount % 2 === 1;
}

function isWithinFencedCodeBlock(markdown: string, position: number): boolean {
    const precedingText = markdown.slice(0, position);
    const fenceCount = Array.from(precedingText.matchAll(/^ {0,3}(?:`{3,}|~{3,})/gm)).length;

    return fenceCount % 2 === 1;
}

function isWithinInlineCode(markdown: string, position: number): boolean {
    const lineStart = markdown.lastIndexOf('\n', position - 1) + 1;
    const precedingLineText = markdown.slice(lineStart, position);
    let unescapedBacktickCount = 0;

    for (let cursor = 0; cursor < precedingLineText.length; cursor++) {
        if (precedingLineText[cursor] === '`' && !isEscaped(precedingLineText, cursor)) {
            unescapedBacktickCount++;
        }
    }

    return unescapedBacktickCount % 2 === 1;
}

function isInsideCode(markdown: string, position: number): boolean {
    return isWithinFencedCodeBlock(markdown, position) || isWithinInlineCode(markdown, position);
}

function findUnescapedCharacter(text: string, character: string, start: number): number {
    for (let cursor = start; cursor < text.length; cursor++) {
        if (text[cursor] === character && !isEscaped(text, cursor)) {
            return cursor;
        }
    }

    return -1;
}

function collectMarkdownInlineLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const ranges: WorkshopMaterialLinkRange[] = [];

    for (let openingBracket = markdown.indexOf('['); openingBracket !== -1; openingBracket = markdown.indexOf('[', openingBracket + 1)) {
        if (
            (openingBracket > 0 && markdown[openingBracket - 1] === '!') ||
            isEscaped(markdown, openingBracket) ||
            isInsideCode(markdown, openingBracket)
        ) {
            continue;
        }

        const closingBracket = findUnescapedCharacter(markdown, ']', openingBracket + 1);
        if (closingBracket === -1 || markdown[closingBracket + 1] !== '(') {
            continue;
        }

        let destinationStart = closingBracket + 2;
        while (/\s/.test(markdown[destinationStart] ?? '')) {
            destinationStart++;
        }

        if (markdown[destinationStart] === '<') {
            const closingAngleBracket = findUnescapedCharacter(markdown, '>', destinationStart + 1);
            if (closingAngleBracket === -1) {
                continue;
            }

            const destination = markdown.slice(destinationStart + 1, closingAngleBracket);
            if (destination !== '') {
                ranges.push({
                    destination,
                    start: destinationStart + 1,
                    end: closingAngleBracket,
                    isTitleRequired: false,
                });
            }
            continue;
        }

        let parenthesisDepth = 0;
        let destinationEnd = destinationStart;
        for (; destinationEnd < markdown.length; destinationEnd++) {
            const character = markdown[destinationEnd];
            if (isEscaped(markdown, destinationEnd)) {
                continue;
            }
            if (character === '(') {
                parenthesisDepth++;
                continue;
            }
            if (character === ')') {
                if (parenthesisDepth === 0) {
                    break;
                }
                parenthesisDepth--;
                continue;
            }
            if (parenthesisDepth === 0 && /\s/.test(character)) {
                break;
            }
        }

        const destination = markdown.slice(destinationStart, destinationEnd);
        if (destination !== '') {
            ranges.push({ destination, start: destinationStart, end: destinationEnd, isTitleRequired: false });
        }
    }

    return ranges;
}

function collectHtmlLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const ranges: WorkshopMaterialLinkRange[] = [];
    const openingAnchorPattern = /<a\b[^>]*>/gi;
    const hrefPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

    for (const openingAnchorMatch of Array.from(markdown.matchAll(openingAnchorPattern))) {
        const openingAnchor = openingAnchorMatch[0];
        const openingAnchorIndex = openingAnchorMatch.index ?? 0;
        if (isInsideCode(markdown, openingAnchorIndex)) {
            continue;
        }

        const hrefMatch = hrefPattern.exec(openingAnchor);
        if (hrefMatch === null) {
            continue;
        }

        const destination = hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3];
        if (!destination) {
            continue;
        }

        const hrefText = hrefMatch[0];
        const destinationIndexInHref = hrefText.lastIndexOf(destination);
        if (destinationIndexInHref === -1) {
            continue;
        }

        const hrefIndexInAnchor = hrefMatch.index;
        ranges.push({
            destination,
            start: openingAnchorIndex + hrefIndexInAnchor + destinationIndexInHref,
            end: openingAnchorIndex + hrefIndexInAnchor + destinationIndexInHref + destination.length,
            isTitleRequired: false,
        });
    }

    return ranges;
}

function collectAutolinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const ranges: WorkshopMaterialLinkRange[] = [];
    const autolinkPattern = /<(https?:\/\/[^<>\s]+)>/gi;

    for (const autolinkMatch of Array.from(markdown.matchAll(autolinkPattern))) {
        const destination = autolinkMatch[1];
        const matchIndex = autolinkMatch.index ?? 0;
        if (destination !== undefined && !isInsideCode(markdown, matchIndex)) {
            ranges.push({
                destination,
                start: matchIndex,
                end: matchIndex + autolinkMatch[0].length,
                isTitleRequired: true,
            });
        }
    }

    return ranges;
}

/**
 * The shared Markdown renderer applies its `simplifiedAutoLink` rule to a
 * bare HTTP(S) URL too. Materialization must therefore match that rendered
 * anchor as well as explicit Markdown and HTML links.
 */
function collectBareUrlRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const ranges: WorkshopMaterialLinkRange[] = [];

    for (const bareUrlMatch of Array.from(markdown.matchAll(WORKSHOP_MATERIAL_BARE_URL_PATTERN))) {
        const leadingWhitespace = bareUrlMatch[1] ?? '';
        const rawDestination = bareUrlMatch[2];
        const matchIndex = bareUrlMatch.index ?? 0;
        const trailingPunctuation = rawDestination.match(WORKSHOP_MATERIAL_BARE_URL_TRAILING_PUNCTUATION_PATTERN)?.[0] ?? '';
        const destination = rawDestination.slice(0, rawDestination.length - trailingPunctuation.length);
        const start = matchIndex + leadingWhitespace.length;

        if (destination !== '' && !isInsideCode(markdown, start)) {
            ranges.push({ destination, start, end: start + destination.length, isTitleRequired: true });
        }
    }

    return ranges;
}

function collectReferenceDefinitionRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const ranges: WorkshopMaterialLinkRange[] = [];
    const referenceDefinitionPattern = /^ {0,3}\[[^\]\n]+\]:\s*(?:<([^>\n]+)>|(\S+))/gm;

    for (const definitionMatch of Array.from(markdown.matchAll(referenceDefinitionPattern))) {
        const destination = definitionMatch[1] ?? definitionMatch[2];
        if (!destination) {
            continue;
        }

        const matchIndex = definitionMatch.index ?? 0;
        if (isInsideCode(markdown, matchIndex)) {
            continue;
        }

        const destinationIndexInDefinition = definitionMatch[0].lastIndexOf(destination);
        ranges.push({
            destination,
            start: matchIndex + destinationIndexInDefinition,
            end: matchIndex + destinationIndexInDefinition + destination.length,
            isTitleRequired: false,
        });
    }

    return ranges;
}

function collectWorkshopMaterialLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const sortedRanges = [
        ...collectMarkdownInlineLinkRanges(markdown),
        ...collectHtmlLinkRanges(markdown),
        ...collectAutolinkRanges(markdown),
        ...collectReferenceDefinitionRanges(markdown),
        ...collectBareUrlRanges(markdown),
    ].sort(
        (firstRange, secondRange) =>
            firstRange.start - secondRange.start ||
            firstRange.end - secondRange.end ||
            Number(firstRange.isTitleRequired) - Number(secondRange.isTitleRequired),
    );

    const nonOverlappingRanges: WorkshopMaterialLinkRange[] = [];
    for (const range of sortedRanges) {
        const precedingRange = nonOverlappingRanges[nonOverlappingRanges.length - 1];
        if (precedingRange === undefined || range.start >= precedingRange.end) {
            nonOverlappingRanges.push(range);
        }
    }

    return nonOverlappingRanges;
}

function getTrackableWorkshopMaterialUrl(destinationUrl: string): string | null {
    if (!destinationUrl || destinationUrl.startsWith(WORKSHOP_MATERIAL_HASH_LINK_PREFIX)) {
        return null;
    }

    try {
        const parsedUrl = new URL(destinationUrl, getWorkshopMaterialLinkBaseUrl());

        return WORKSHOP_MATERIAL_ALLOWED_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.toString() : null;
    } catch {
        return null;
    }
}

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

/**
 * Lists the HTTP(S) destinations written in a material, regardless of whether
 * they use inline Markdown, HTML, autolinks, or reference definitions. Images,
 * anchors, e-mail links, and code samples are deliberately not click links.
 */
export function getWorkshopShortcodeLinkDestinations(bodyMarkdown: string): readonly string[] {
    return Array.from(
        new Set(
            collectWorkshopMaterialLinkRanges(bodyMarkdown)
                .map((range) => range.destination)
                .filter((destination) => getTrackableWorkshopMaterialUrl(destination) !== null),
        ),
    );
}

export function getWorkshopMaterialLinkDestinations(bodyMarkdown: string): readonly string[] {
    return getWorkshopShortcodeLinkDestinations(bodyMarkdown);
}

function getWorkshopShortcodeLinkDestinationsRequiringTitle(bodyMarkdown: string): readonly string[] {
    return Array.from(
        new Set(
            collectWorkshopMaterialLinkRanges(bodyMarkdown)
                .filter((range) => range.isTitleRequired)
                .map((range) => range.destination)
                .filter((destination) => getTrackableWorkshopMaterialUrl(destination) !== null),
        ),
    );
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
