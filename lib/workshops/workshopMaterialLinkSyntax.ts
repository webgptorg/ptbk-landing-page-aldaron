/**
 * The client-safe Markdown link syntax shared by the material renderer, public room exports, and server-side short
 * link materialization. It intentionally has no network or database imports.
 */

const WORKSHOP_MATERIAL_HASH_LINK_PREFIX = '#';
const WORKSHOP_MATERIAL_ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const WORKSHOP_MATERIAL_LINK_BASE_URL = 'https://www.promptbook.studio';
const WORKSHOP_MATERIAL_BARE_URL_PATTERN = /(^|\s)(https?:\/\/[^\s<>()\[\]"']+)/gm;
const WORKSHOP_MATERIAL_BARE_URL_TRAILING_PUNCTUATION_PATTERN = /[.,;:!?]+$/;

export type WorkshopMaterialLinkRange = {
    readonly destination: string;
    readonly start: number;
    readonly end: number;
    readonly isTitleRequired: boolean;
};

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
 * The shared Markdown renderer applies its `simplifiedAutoLink` rule to a bare HTTP(S) URL too. Link parsing must
 * therefore match that rendered anchor as well as explicit Markdown and HTML links.
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

export function collectWorkshopMaterialLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
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

export function getTrackableWorkshopMaterialUrl(destinationUrl: string): string | null {
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
 * Lists the HTTP(S) destinations written in a material, regardless of whether they use inline Markdown, HTML,
 * autolinks, or reference definitions. Images, anchors, e-mail links, and code samples are deliberately not click
 * links.
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

export function getWorkshopShortcodeLinkDestinationsRequiringTitle(bodyMarkdown: string): readonly string[] {
    return Array.from(
        new Set(
            collectWorkshopMaterialLinkRanges(bodyMarkdown)
                .filter((range) => range.isTitleRequired)
                .map((range) => range.destination)
                .filter((destination) => getTrackableWorkshopMaterialUrl(destination) !== null),
        ),
    );
}
