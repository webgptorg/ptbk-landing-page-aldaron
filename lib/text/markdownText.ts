import { decodeXmlEntities } from '@/lib/xml/xmlTags';
import { Lexer, type MarkedToken, type Token } from 'marked';

/** Uses only Marked's built-in tokens, shared by text extraction and the PDF renderer. */
export function readMarkdownTokens(markdown: string): readonly MarkedToken[] {
    return Lexer.lex(markdown) as MarkedToken[];
}

export function readMarkdownTokenText(token: Token): string {
    const markdownToken = token as MarkedToken;
    if (markdownToken.type === 'code' || markdownToken.type === 'codespan') {
        return markdownToken.text;
    }
    if (markdownToken.type === 'space' || markdownToken.type === 'br' || markdownToken.type === 'hr') {
        return '\n';
    }
    if (markdownToken.type === 'def') {
        return '';
    }
    if (markdownToken.type === 'list') {
        return markdownToken.items.map(readMarkdownTokenText).join('\n');
    }
    if (markdownToken.type === 'list_item') {
        return markdownToken.tokens.map(readMarkdownTokenText).join('\n');
    }
    if ('tokens' in markdownToken && markdownToken.tokens !== undefined) {
        return markdownToken.tokens.map(readMarkdownTokenText).join('');
    }
    if (!('text' in markdownToken)) {
        return '';
    }

    const text = markdownToken.type === 'html' ? markdownToken.text.replace(/<[^>]*>/g, '') : markdownToken.text;
    try {
        return decodeXmlEntities(text);
    } catch {
        // Malformed numeric entities must not prevent the rest of a material from being downloaded.
        return text;
    }
}

function hasKeyPointText(token: Token): boolean {
    if (['link', 'image', 'code', 'codespan', 'html'].includes(token.type)) {
        return false;
    }
    return !('tokens' in token) || token.tokens === undefined
        ? readMarkdownTokenText(token).trim().length > 0
        : token.tokens.some(hasKeyPointText);
}

/** Extracts authored prose; a download label or code block alone is not a takeaway. */
export function extractMarkdownKeyPoints(
    markdown: string,
    { isListRequired = false }: { readonly isListRequired?: boolean } = {},
): readonly string[] {
    const tokens = readMarkdownTokens(markdown);
    const listItems = tokens.flatMap((token) => (token.type === 'list' ? token.items : []));
    const candidates =
        listItems.length > 0 || isListRequired ? listItems : tokens.filter((token) => token.type === 'paragraph');

    return candidates
        .filter(hasKeyPointText)
        .map(readMarkdownTokenText)
        .map((text) => text.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
}
