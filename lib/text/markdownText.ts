import { decodeXmlEntities } from '@/lib/xml/xmlTags';
import { Lexer, type MarkedToken, type Token, type Tokens } from 'marked';

/**
 * How far apart the blocks and the lines of flattened Markdown stand
 */
const MARKDOWN_PLAIN_TEXT_BLOCK_SEPARATOR = '\n\n';
const MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR = '\n';
const MARKDOWN_PLAIN_TEXT_CELL_SEPARATOR = ' · ';

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

/**
 * One link as plain text, which keeps the destination unless the label already names it
 *
 * Note: Flattened text is read where nothing can be clicked, so a link which only says `Materiály` would otherwise
 *       lose the very address it was written for.
 */
function readMarkdownLinkPlainText(token: Tokens.Link | Tokens.Image): string {
    const label = readMarkdownTokenText(token).trim();

    return label === '' || label === token.href ? token.href : `${label} (${token.href})`;
}

function readMarkdownInlinePlainText(tokens: readonly Token[]): string {
    return tokens
        .map((token) => {
            const markdownToken = token as MarkedToken;
            if (markdownToken.type === 'link' || markdownToken.type === 'image') {
                return readMarkdownLinkPlainText(markdownToken);
            }

            return 'tokens' in markdownToken && markdownToken.tokens !== undefined
                ? readMarkdownInlinePlainText(markdownToken.tokens)
                : readMarkdownTokenText(markdownToken);
        })
        .join('');
}

/**
 * Every block of Markdown as one line of plain text, in the order it was written
 */
function readMarkdownBlockPlainTexts(tokens: readonly Token[]): readonly string[] {
    return tokens
        .flatMap((token): readonly string[] => {
            const markdownToken = token as MarkedToken;
            switch (markdownToken.type) {
                case 'space':
                case 'def':
                case 'hr':
                    return [];
                case 'code':
                    return [markdownToken.text];
                case 'blockquote':
                    return readMarkdownBlockPlainTexts(markdownToken.tokens);
                case 'list':
                    return [
                        markdownToken.items
                            .map((item) =>
                                readMarkdownBlockPlainTexts(item.tokens).join(MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR),
                            )
                            .join(MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR),
                    ];
                case 'table':
                    return [
                        [markdownToken.header, ...markdownToken.rows]
                            .map((row) =>
                                row
                                    .map((cell) => readMarkdownInlinePlainText(cell.tokens))
                                    .join(MARKDOWN_PLAIN_TEXT_CELL_SEPARATOR),
                            )
                            .join(MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR),
                    ];
                default:
                    return [
                        'tokens' in markdownToken && markdownToken.tokens !== undefined
                            ? readMarkdownInlinePlainText(markdownToken.tokens)
                            : readMarkdownTokenText(markdownToken),
                    ];
            }
        })
        .map((text) => text.trim())
        .filter((text) => text !== '');
}

/**
 * Turns authored Markdown into the plain text read wherever formatting cannot be shown at all, such as the description
 * of a calendar entry
 *
 * Note: Nothing is dropped on the way: emphasis simply loses its marks, a list becomes one line per item, and a link
 *       keeps both its label and its destination.
 */
export function convertMarkdownToPlainText(markdown: string): string {
    return readMarkdownBlockPlainTexts(readMarkdownTokens(markdown)).join(MARKDOWN_PLAIN_TEXT_BLOCK_SEPARATOR);
}
