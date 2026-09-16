import { getWorkshopMaterialLinkDestinations } from '@/lib/workshops/workshopMaterialLinkSyntax';
import { formatCzechWorkshopDate, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
import type { WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';

const MAXIMAL_KEY_TAKEAWAY_COUNT = 8;
const PRESENTATION_MATERIAL_TITLE = 'Prezentace';
const UNTITLED_MATERIAL_TITLE = 'Materiál z workshopu';
const MARKDOWN_LINK_PATTERN = /!?\[([^\]]*)\]\((?:<[^>]*>|[^)]*)\)/g;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const MARKDOWN_DECORATION_PATTERN = /[`*_~]/g;
const MARKDOWN_PREFIX_PATTERN = /^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+[.)]\s+)/;
const MARKDOWN_HEADING_PATTERN = /^\s{0,3}#{1,6}\s+/;
const MARKDOWN_LIST_ITEM_PATTERN = /^\s{0,3}(?:[-*+]\s+|\d+[.)]\s+)/;
const HTML_ENTITY_BY_TEXT: Readonly<Record<string, string>> = {
    '&amp;': '&',
    '&gt;': '>',
    '&lt;': '<',
    '&nbsp;': ' ',
    '&quot;': '"',
};

export type WorkshopWrapUpMaterial = {
    readonly title: string;
    readonly body: string;
    readonly urls: readonly string[];
    readonly isFollowUp: boolean;
};

/**
 * The participant-safe data which a completed workshop hands over as a PDF.
 *
 * Note: Its materials come from the same already-filtered room state as the visible material cards. A member can
 * therefore never export the body or URL of a paid material which the room itself withheld from them.
 */
export type WorkshopWrapUpDocument = {
    readonly title: string;
    readonly dateAndTimeLabel: string;
    readonly summary: string;
    readonly keyTakeaways: readonly string[];
    readonly materials: readonly WorkshopWrapUpMaterial[];
};

type WorkshopWrapUpDocumentInput = {
    readonly workshop: Pick<WorkshopDetails, 'slug' | 'title' | 'description' | 'startsAt' | 'endsAt' | 'presentationUrl'>;
    readonly contentBlocks: readonly WorkshopContentBlock[];
};

function decodeHtmlEntities(text: string): string {
    return text.replace(/&(amp|gt|lt|nbsp|quot);/g, (entity) => HTML_ENTITY_BY_TEXT[entity] ?? entity);
}

function removeMarkdownLinePrefix(line: string): string {
    return line.replace(MARKDOWN_PREFIX_PATTERN, '');
}

/**
 * Makes authored Markdown readable in a document without trying to become a second Markdown renderer.
 *
 * Note: Links keep their authored label here and their public URLs are supplied separately from the shared material
 * link parser, so a reader gets both the explanation and an address they can open.
 */
export function extractWorkshopWrapUpPlainText(markdown: string): string {
    return decodeHtmlEntities(
        markdown
            .replace(MARKDOWN_LINK_PATTERN, '$1')
            .replace(HTML_TAG_PATTERN, ' ')
            .split(/\r?\n/)
            .map(removeMarkdownLinePrefix)
            .map((line) => line.replace(MARKDOWN_DECORATION_PATTERN, '').replace(/\s+/g, ' ').trim())
            .filter((line) => line !== '')
            .join('\n'),
    );
}

function getWorkshopWrapUpMaterialTitle(contentBlock: Pick<WorkshopContentBlock, 'title'>): string {
    return contentBlock.title.trim() || UNTITLED_MATERIAL_TITLE;
}

function createWorkshopWrapUpMaterial(contentBlock: WorkshopContentBlock): WorkshopWrapUpMaterial {
    return {
        title: getWorkshopWrapUpMaterialTitle(contentBlock),
        body: extractWorkshopWrapUpPlainText(contentBlock.bodyMarkdown),
        urls: getWorkshopMaterialLinkDestinations(contentBlock.bodyMarkdown),
        isFollowUp: contentBlock.isFollowUp,
    };
}

function createWorkshopPresentationMaterial(presentationUrl: string): WorkshopWrapUpMaterial {
    return {
        title: PRESENTATION_MATERIAL_TITLE,
        body: '',
        urls: [presentationUrl],
        isFollowUp: false,
    };
}

function getMaterialKeyTakeaways(contentBlock: WorkshopContentBlock): readonly string[] {
    const authoredTakeaways = contentBlock.bodyMarkdown
        .split(/\r?\n/)
        .filter((line) => MARKDOWN_HEADING_PATTERN.test(line) || MARKDOWN_LIST_ITEM_PATTERN.test(line))
        .map(removeMarkdownLinePrefix)
        .map((line) => extractWorkshopWrapUpPlainText(line))
        .filter((line) => line !== '');

    return [
        ...(contentBlock.isFollowUp ? [getWorkshopWrapUpMaterialTitle(contentBlock)] : []),
        ...authoredTakeaways,
    ];
}

function getUniqueKeyTakeaways(values: readonly string[]): readonly string[] {
    const normalizedValues = new Set<string>();
    const keyTakeaways: string[] = [];

    for (const value of values) {
        const trimmedValue = value.trim();
        const normalizedValue = trimmedValue.toLocaleLowerCase('cs-CZ');
        const isNewValue = trimmedValue !== '' && !normalizedValues.has(normalizedValue);

        if (isNewValue) {
            normalizedValues.add(normalizedValue);
            keyTakeaways.push(trimmedValue);
        }

        if (keyTakeaways.length === MAXIMAL_KEY_TAKEAWAY_COUNT) {
            break;
        }
    }

    return keyTakeaways;
}

function getWorkshopWrapUpKeyTakeaways(
    workshop: Pick<WorkshopDetails, 'title' | 'description'>,
    contentBlocks: readonly WorkshopContentBlock[],
): readonly string[] {
    const materialKeyTakeaways = getUniqueKeyTakeaways([
        ...contentBlocks.flatMap(getMaterialKeyTakeaways),
        ...contentBlocks.map(getWorkshopWrapUpMaterialTitle),
    ]);

    return materialKeyTakeaways.length > 0
        ? materialKeyTakeaways
        : getUniqueKeyTakeaways([workshop.description.trim(), workshop.title.trim()]);
}

/**
 * Builds the data of the wrap-up from fields which the participant room already owns.
 *
 * Note: It does not infer new advice or call a service. The summary is the workshop's authored description, key
 * takeaways are headings, list items and titles already shared with the attendee, and every listed material is one
 * that the existing room state made readable.
 */
export function createWorkshopWrapUpDocument({
    workshop,
    contentBlocks,
}: WorkshopWrapUpDocumentInput): WorkshopWrapUpDocument {
    const materials = [
        ...contentBlocks.map(createWorkshopWrapUpMaterial),
        ...(workshop.presentationUrl === null ? [] : [createWorkshopPresentationMaterial(workshop.presentationUrl)]),
    ];

    return {
        title: workshop.title,
        dateAndTimeLabel: `${formatCzechWorkshopDate(workshop.startsAt)} · ${formatCzechWorkshopTimeRange(
            workshop.startsAt,
            workshop.endsAt,
        )}`,
        summary: workshop.description.trim() || workshop.title,
        keyTakeaways: getWorkshopWrapUpKeyTakeaways(workshop, contentBlocks),
        materials,
    };
}

/**
 * Keeps the browser download name stable and safe while making every selected occurrence easy to recognize later.
 */
export function createWorkshopWrapUpPdfFileName(workshopSlug: string): string {
    return `${workshopSlug}-shrnuti-workshopu.pdf`;
}
