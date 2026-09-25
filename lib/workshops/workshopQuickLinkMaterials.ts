import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';
import { escapeWorkshopMarkdownLinkTitle } from '@/lib/workshops/workshopMarkdownLink';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';

export const MAXIMAL_WORKSHOP_QUICK_LINK_COUNT = 12;
export const MAXIMAL_WORKSHOP_QUICK_LINK_URL_LENGTH = 2_048;
const MAXIMAL_WORKSHOP_MATERIAL_SORT_ORDER = 100_000;
const WORKSHOP_MATERIAL_SORT_ORDER_STEP = 10;

export type WorkshopQuickLinkInputRow = {
    readonly lineNumber: number;
    readonly value: string;
    readonly destination: string | null;
    readonly issue: 'invalid' | 'duplicate' | null;
};

/** Keeps the submitted query and fragment; the preview URL is only for scraping. */
export function parseWorkshopQuickLinkDestination(value: string): string | null {
    const trimmedValue = value.trim();
    if (
        trimmedValue.length === 0 ||
        trimmedValue.length > MAXIMAL_WORKSHOP_QUICK_LINK_URL_LENGTH ||
        /[\u0000-\u001f\u007f]/.test(trimmedValue) ||
        normalizePublicWebPageUrl(trimmedValue) === null
    ) {
        return null;
    }

    return new URL(trimmedValue).toString();
}

export function parseWorkshopQuickLinkInput(value: string): readonly WorkshopQuickLinkInputRow[] {
    const seenDestinations = new Set<string>();
    return value.split(/\r?\n/).flatMap((line, index): WorkshopQuickLinkInputRow[] => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return [];

        const destination = parseWorkshopQuickLinkDestination(trimmedLine);
        if (destination === null) {
            return [{ lineNumber: index + 1, value: trimmedLine, destination: null, issue: 'invalid' }];
        }
        if (seenDestinations.has(destination)) {
            return [{ lineNumber: index + 1, value: trimmedLine, destination, issue: 'duplicate' }];
        }
        seenDestinations.add(destination);
        return [{ lineNumber: index + 1, value: trimmedLine, destination, issue: null }];
    });
}

export function getWorkshopQuickLinkFallbackTitle(destination: string): string {
    return new URL(destination).hostname || destination;
}

/** One append point for the full editor and the quick-link batch. */
export function getWorkshopMaterialAppendSortOrders(
    contentBlocks: readonly Pick<WorkshopContentBlock, 'sortOrder'>[],
    count: number,
): readonly number[] | null {
    const maximalExistingOrder = Math.max(
        -WORKSHOP_MATERIAL_SORT_ORDER_STEP,
        ...contentBlocks.map((contentBlock) => contentBlock.sortOrder),
    );
    const step = maximalExistingOrder + count * WORKSHOP_MATERIAL_SORT_ORDER_STEP <= MAXIMAL_WORKSHOP_MATERIAL_SORT_ORDER
        ? WORKSHOP_MATERIAL_SORT_ORDER_STEP
        : 1;
    if (maximalExistingOrder + count * step > MAXIMAL_WORKSHOP_MATERIAL_SORT_ORDER) return null;
    return Array.from({ length: count }, (_, index) => maximalExistingOrder + (index + 1) * step);
}

export function createWorkshopQuickLinkMarkdown(title: string, destination: string): string {
    return `[${escapeWorkshopMarkdownLinkTitle(title)}](<${destination}>)`;
}
