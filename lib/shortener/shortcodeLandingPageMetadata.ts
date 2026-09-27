import { shortenText } from '@/lib/language/shortenText';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';

/** The longest title we place in a browser tab or a sharing card. */
const MAXIMUM_TITLE_LENGTH = 120;

/** The longest description we hand to search and social crawlers. */
const MAXIMUM_DESCRIPTION_LENGTH = 220;

const DEFAULT_SHORTCODE_TITLE = 'Shared link';
const DEFAULT_SHORTCODE_DESCRIPTION = 'Open this shared link from Promptbook.';

/**
 * The useful, public part of an administrator-authored Markdown or HTML
 * landing page. No private short-link fields are ever used as metadata.
 */
export type ShortcodeLandingPageMetadata = {
    readonly title: string | null;
    readonly description: string | null;
    readonly image: string | null;
};

/**
 * Reads an attribute from one HTML tag without treating the landing page as
 * executable HTML. It is intentionally tiny because it only handles metadata
 * we own, not general-purpose HTML parsing.
 */
function readHtmlAttribute(tag: string, attributeName: string): string | null {
    const attributeExpression = new RegExp(
        `\\b${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
        'i',
    );
    const attributeMatch = tag.match(attributeExpression);

    return attributeMatch?.[1] ?? attributeMatch?.[2] ?? attributeMatch?.[3] ?? null;
}

/** Decode attribute values without changing URL punctuation or executing the authored HTML. */
function decodeHtmlEntities(value: string): string {
    return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/&apos;|&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&');
}

/** Turns a Markdown or HTML fragment into one plain-text metadata value. */
function toPlainText(value: string): string {
    return decodeHtmlEntities(
        value
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/<[^>]*>/g, ' ')
            .replace(/[*_`~]/g, ''),
    )
        .replace(/\s+/g, ' ')
        .trim();
}

function getHtmlMetaContent(landingPage: string, expectedName: string): string | null {
    const metaTags = landingPage.match(/<meta\b[^>]*>/gi) ?? [];

    for (const metaTag of metaTags) {
        const metaName = readHtmlAttribute(metaTag, 'name') ?? readHtmlAttribute(metaTag, 'property');
        if (metaName?.toLocaleLowerCase() !== expectedName.toLocaleLowerCase()) {
            continue;
        }

        const content = readHtmlAttribute(metaTag, 'content');
        if (content !== null) {
            return content;
        }
    }

    return null;
}

function getHtmlTitle(landingPage: string): string | null {
    const titleMatch = landingPage.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    return titleMatch?.[1] ?? null;
}

function getMarkdownTitle(landingPage: string): string | null {
    const titleMatch = landingPage.match(/^\s*#\s+(.+?)\s*#*\s*$/m);
    return titleMatch?.[1] ?? null;
}

/**
 * The leading quote is the established short-link landing-page convention for
 * a concise summary. It has the same semantic value as the first paragraph.
 */
function getLeadingMarkdownQuote(landingPage: string): string | null {
    const quoteLines: string[] = [];

    for (const line of landingPage.replace(/\r\n/g, '\n').split('\n')) {
        const trimmedLine = line.trim();
        const quoteMatch = trimmedLine.match(/^>\s?(.*)$/);
        if (quoteMatch !== null) {
            quoteLines.push(quoteMatch[1]!);
            continue;
        }

        if (quoteLines.length > 0) {
            break;
        }

        // A title and blank lines may precede the concise introductory quote.
        // Once real body content starts, a later quotation is not a summary.
        if (trimmedLine !== '' && !/^#{1,6}\s/.test(trimmedLine)) {
            return null;
        }
    }

    return quoteLines.length === 0 ? null : quoteLines.join(' ');
}

function getFirstMarkdownParagraph(landingPage: string): string | null {
    const paragraphLines: string[] = [];
    const ignoredLine = /^(?:---|#{1,6}\s|!\[|\[[^\]]+\]:|[-*+]\s|\d+[.)]\s|>|```|<!--|<)/;

    for (const line of landingPage.replace(/\r\n/g, '\n').split('\n')) {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            if (paragraphLines.length > 0) {
                break;
            }
            continue;
        }

        if (ignoredLine.test(trimmedLine)) {
            if (paragraphLines.length > 0) {
                break;
            }
            continue;
        }

        paragraphLines.push(trimmedLine);
    }

    return paragraphLines.length === 0 ? null : paragraphLines.join(' ');
}

function getFirstHtmlImageSource(landingPage: string): string | null {
    const imageTag = landingPage.match(/<img\b[^>]*>/i)?.[0];
    return imageTag === undefined ? null : readHtmlAttribute(imageTag, 'src');
}

function getFirstMarkdownImageSource(landingPage: string): string | null {
    const imageMatch = landingPage.match(/!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))/);
    return imageMatch?.[1] ?? imageMatch?.[2] ?? null;
}

/** Avoids handing a crawler an unsupported or unsafe image URL. */
function getSocialPreviewImagePath(value: string | null): string | null {
    const trimmedValue = value?.trim() ?? '';

    return /^(?:https?:\/\/|\/)/i.test(trimmedValue) ? trimmedValue : null;
}

/**
 * Extracts a semantic heading, summary, and first image from a short-link
 * landing page. HTML metadata wins when a fully custom landing page provides
 * it; Markdown remains the friendly default in the administration.
 */
export function extractShortcodeLandingPageMetadata(landingPage: string): ShortcodeLandingPageMetadata {
    const title = toPlainText(
        getHtmlMetaContent(landingPage, 'og:title') ??
            getHtmlMetaContent(landingPage, 'twitter:title') ??
            getHtmlTitle(landingPage) ??
            getMarkdownTitle(landingPage) ??
            '',
    );
    const description = toPlainText(
        getHtmlMetaContent(landingPage, 'og:description') ??
            getHtmlMetaContent(landingPage, 'twitter:description') ??
            getHtmlMetaContent(landingPage, 'description') ??
            getLeadingMarkdownQuote(landingPage) ??
            getFirstMarkdownParagraph(landingPage) ??
            '',
    );

    return {
        title: title === '' ? null : shortenText(title, MAXIMUM_TITLE_LENGTH),
        description: description === '' ? null : shortenText(description, MAXIMUM_DESCRIPTION_LENGTH),
        image:
            getSocialPreviewImagePath(decodeHtmlEntities(getHtmlMetaContent(landingPage, 'og:image') ?? '')) ??
            getSocialPreviewImagePath(decodeHtmlEntities(getHtmlMetaContent(landingPage, 'twitter:image') ?? '')) ??
            getSocialPreviewImagePath(getFirstMarkdownImageSource(landingPage)) ??
            getSocialPreviewImagePath(decodeHtmlEntities(getFirstHtmlImageSource(landingPage) ?? '')),
    };
}

/**
 * Creates the complete metadata of a public landing-page short link.
 *
 * Shortcodes are useful sharing and measurement URLs, not independent search
 * documents, so they receive a canonical URL and rich social preview while
 * staying out of the sitemap and search index.
 */
export function createShortcodeLandingPageDefinition(shortcode: string, landingPage: string): PageMetadataDefinition {
    const extractedMetadata = extractShortcodeLandingPageMetadata(landingPage);
    const socialTitle = extractedMetadata.title ?? DEFAULT_SHORTCODE_TITLE;

    return {
        path: `/${shortcode}`,
        language: 'en',
        title: `${socialTitle} | Promptbook`,
        socialTitle,
        description: extractedMetadata.description ?? DEFAULT_SHORTCODE_DESCRIPTION,
        socialDescription: extractedMetadata.description ?? DEFAULT_SHORTCODE_DESCRIPTION,
        socialPreviewImageAlt: socialTitle,
        isSocialPreviewImageGenerated: true,
        ...(extractedMetadata.image === null ? {} : { socialPreviewImagePath: extractedMetadata.image }),
        isIndexed: false,
    };
}

export function createShortcodeLandingPageMetadata(shortcode: string, landingPage: string): Metadata {
    return createPageMetadata(createShortcodeLandingPageDefinition(shortcode, landingPage));
}
