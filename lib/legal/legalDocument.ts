import type { ReactNode } from 'react';

/**
 * One numbered chapter of a legal document
 */
export type LegalDocumentSection = {
    /**
     * Headline of the chapter, without its number - the numbering follows from the order of the chapters
     */
    readonly heading: string;

    /**
     * Paragraphs of the chapter, rendered one after another
     */
    readonly paragraphs?: readonly ReactNode[];

    /**
     * Items listed by the chapter, rendered as a bullet list below its paragraphs
     */
    readonly bullets?: readonly ReactNode[];
};

/**
 * Complete text of a legal document in one language
 *
 * Note: The document is data, not markup, so both language variants stay comparable chapter by chapter and every
 *       legal page of the site looks the same.
 */
export type LegalDocument = {
    /** Versioned publication status; a draft never becomes binding just by being displayed. */
    readonly publication?: {
        readonly date: string;
        readonly isDraft: boolean;
        readonly notice?: string;
    };

    /**
     * Headline of the document
     */
    readonly title: string;

    /**
     * Short introduction telling the visitor what the document is about
     */
    readonly perex: ReactNode;

    /**
     * Chapters of the document, in the order they are meant to be read
     */
    readonly sections: readonly LegalDocumentSection[];
};
