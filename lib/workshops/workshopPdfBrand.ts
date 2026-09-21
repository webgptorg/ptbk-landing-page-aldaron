import { SITE_THEME_COLOR } from '@/lib/metadata/site-config';
import type { Content, ContentText, CustomTableLayout } from 'pdfmake/interfaces';

/** The room's light palette on white paper, independent of a participant's device appearance. */
export const WORKSHOP_PDF_COLORS = {
    brand: SITE_THEME_COLOR,
    heading: '#0f172a',
    text: '#334155',
    muted: '#475569',
    accent: '#155e75',
    surface: '#f4f8fa',
    rule: '#d9e5ea',
    branches: ['#155e75', '#6d28d9', '#92400e', '#065f46', '#9f1239', '#be185d'],
} as const;
export const WORKSHOP_PDF_PAGE_MARGIN = 44;
export const WORKSHOP_PDF_CONTENT_WIDTH = 595.28 - WORKSHOP_PDF_PAGE_MARGIN * 2;
export const WORKSHOP_PDF_LOGO_PATH = '/logo/promptbook-logo-blue-transparent-256.png';
export const WORKSHOP_PDF_FONT_FILES = {
    Inter: { normal: 'Inter-Regular.ttf', bold: 'Inter-Bold.ttf', italics: 'Inter-Italic.ttf', bolditalics: 'Inter-BoldItalic.ttf' },
    Outfit: { normal: 'Outfit-Bold.ttf', bold: 'Outfit-Bold.ttf', italics: 'Outfit-Bold.ttf', bolditalics: 'Outfit-Bold.ttf' },
};
export const WORKSHOP_PDF_FONT_PATH = '/fonts/workshop/';

export const WORKSHOP_PDF_CARD_LAYOUT: CustomTableLayout = {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 14,
    paddingRight: () => 14,
    paddingTop: () => 12,
    paddingBottom: () => 12,
    fillColor: () => WORKSHOP_PDF_COLORS.surface,
};

export function createWorkshopPdfSection(title: string, number: string): ContentText {
    return {
        text: [{ text: `${number}  `, color: WORKSHOP_PDF_COLORS.accent }, title],
        font: 'Outfit', fontSize: 18, color: WORKSHOP_PDF_COLORS.heading,
        margin: [0, 20, 0, 10], headlineLevel: 1,
    };
}

/** A flowing card can split on paper; its heading is kept with its first content node. */
export function createWorkshopPdfCard(content: Content[]): Content {
    return { table: { widths: ['*'], body: [[{ stack: content }]] }, layout: WORKSHOP_PDF_CARD_LAYOUT, margin: [0, 0, 0, 8] };
}

export function shortenWorkshopPdfLabel(value: string, maximalLength: number): string {
    const normalizedValue = value.replace(/\s+/g, ' ').trim();
    return normalizedValue.length > maximalLength ? `${normalizedValue.slice(0, maximalLength - 1)}…` : normalizedValue;
}
