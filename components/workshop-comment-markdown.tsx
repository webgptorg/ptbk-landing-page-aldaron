import React, { type ReactNode } from 'react';
import { SHORTCODE_LINK_PUBLIC_BASE_URL } from '@/lib/shortener/shortcodeLinkConstants';

type WorkshopCommentMarkdownProps = {
    readonly content: string;
    readonly className?: string;

    /**
     * Only messages which the room explicitly trusts may turn their persisted
     * shortcode URLs into anchors. Everybody else retains inert chat text.
     */
    readonly isLinksEnabled?: boolean;
};

const BASIC_MARKDOWN_TOKEN_PATTERN = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
const BARE_URL_TRAILING_PUNCTUATION_PATTERN = /[.,;:!?]+$/;

function escapeRegularExpression(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SHORTCODE_LINK_URL_PATTERN = `${escapeRegularExpression(SHORTCODE_LINK_PUBLIC_BASE_URL)}[^\\s<>()\\[\\]"']+`;
const ACTIVE_LINK_TOKEN_PATTERN = new RegExp(
    `\\[([^\\]\\n]+)\\]\\((${SHORTCODE_LINK_URL_PATTERN})\\)|<(${SHORTCODE_LINK_URL_PATTERN})>|(${SHORTCODE_LINK_URL_PATTERN})`,
    'g',
);

function createBasicMarkdownNode(token: string, key: string): ReactNode {
    if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={key}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('__') && token.endsWith('__')) {
        return <u key={key}>{token.slice(2, -2)}</u>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
        return (
            <code key={key} className="rounded bg-black/15 px-1 py-0.5 font-mono text-[0.9em]">
                {token.slice(1, -1)}
            </code>
        );
    }
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
        return <em key={key}>{token.slice(1, -1)}</em>;
    }

    return token;
}

function renderBasicMarkdown(content: string): readonly ReactNode[] {
    const nodes: ReactNode[] = [];
    let currentIndex = 0;
    BASIC_MARKDOWN_TOKEN_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = BASIC_MARKDOWN_TOKEN_PATTERN.exec(content)) !== null) {
        const matchedToken = match[0];
        const matchIndex = match.index;
        if (matchIndex > currentIndex) {
            nodes.push(content.slice(currentIndex, matchIndex));
        }
        nodes.push(createBasicMarkdownNode(matchedToken, `markdown-${matchIndex}`));
        currentIndex = matchIndex + matchedToken.length;
    }

    if (currentIndex < content.length) {
        nodes.push(content.slice(currentIndex));
    }

    return nodes;
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

function isInsideHtmlTag(markdown: string, position: number): boolean {
    const lineStart = markdown.lastIndexOf('\n', position - 1) + 1;
    const precedingLineText = markdown.slice(lineStart, position);

    return precedingLineText.lastIndexOf('<') > precedingLineText.lastIndexOf('>');
}

function getBareUrlWithoutTrailingPunctuation(url: string): string {
    return url.slice(0, url.length - (url.match(BARE_URL_TRAILING_PUNCTUATION_PATTERN)?.[0].length ?? 0));
}

function isPublicShortcodeLinkUrl(url: string): boolean {
    return url.startsWith(SHORTCODE_LINK_PUBLIC_BASE_URL) && url.length > SHORTCODE_LINK_PUBLIC_BASE_URL.length;
}

/**
 * Renders the small safe Markdown subset around an active public shortcode.
 * It never makes arbitrary HTML, images, code samples, or raw destinations
 * interactive, which keeps the ordinary chat safety model intact.
 */
function renderShortcodeLinkMarkdown(content: string): readonly ReactNode[] {
    const nodes: ReactNode[] = [];
    let currentIndex = 0;
    ACTIVE_LINK_TOKEN_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = ACTIVE_LINK_TOKEN_PATTERN.exec(content)) !== null) {
        const matchedToken = match[0];
        const matchIndex = match.index;
        const isBareUrl = match[4] !== undefined;
        const href = isBareUrl
            ? getBareUrlWithoutTrailingPunctuation(match[4])
            : (match[2] ?? match[3]);
        const isInertContent =
            isWithinFencedCodeBlock(content, matchIndex) ||
            isWithinInlineCode(content, matchIndex) ||
            isInsideHtmlTag(content, matchIndex) ||
            (matchIndex > 0 && content[matchIndex - 1] === '!');

        if (href === undefined || !isPublicShortcodeLinkUrl(href) || isInertContent) {
            continue;
        }

        if (matchIndex > currentIndex) {
            nodes.push(...renderBasicMarkdown(content.slice(currentIndex, matchIndex)));
        }

        const label = match[1] ?? href;
        nodes.push(
            <a
                key={`shortcode-link-${matchIndex}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-room-accent underline decoration-room-accent/50 underline-offset-2 transition hover:text-room-heading"
            >
                {label}
            </a>,
        );
        if (isBareUrl && href.length < matchedToken.length) {
            nodes.push(matchedToken.slice(href.length));
        }
        currentIndex = matchIndex + matchedToken.length;
    }

    if (currentIndex < content.length) {
        nodes.push(...renderBasicMarkdown(content.slice(currentIndex)));
    }

    return nodes;
}

/**
 * A deliberately small, safe Markdown subset for chat messages. It normally
 * renders only textual inline formatting; explicitly trusted sources may also
 * render the shortener URL which the server persisted for them.
 */
export function WorkshopCommentMarkdown({ content, className, isLinksEnabled = false }: WorkshopCommentMarkdownProps) {
    return <div className={className}>{isLinksEnabled ? renderShortcodeLinkMarkdown(content) : renderBasicMarkdown(content)}</div>;
}
