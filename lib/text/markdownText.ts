import { decodeXmlEntities } from '@/lib/xml/xmlTags';
import { Lexer, type MarkedToken, type Token, type Tokens } from 'marked';

/**
 * How authored Markdown is read
 *
 * Note: A line somebody ended stays ended. Whoever writes a description line by line means those lines, yet a line end
 *       left inside a run of text ends the line only in the PDF and in plain text, while a page reads it as a mere
 *       space. So the line breaks are read as breaks here, once, and every reader keeps the very same lines.
 */
const MARKDOWN_LEXER_OPTIONS = { gfm: true, breaks: true } as const;

/**
 * How far apart the blocks and the lines of flattened Markdown stand
 */
const MARKDOWN_PLAIN_TEXT_BLOCK_SEPARATOR = '\n\n';
const MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR = '\n';
const MARKDOWN_PLAIN_TEXT_CELL_SEPARATOR = ' · ';

/**
 * What stands in front of an item of a flattened list which is not numbered
 */
const MARKDOWN_PLAIN_TEXT_LIST_ITEM_MARKER = '• ';

/** Uses only Marked's built-in tokens, shared by text extraction, the page and the PDF renderer. */
export function readMarkdownTokens(markdown: string): readonly MarkedToken[] {
    // Note: The lexer keeps its tokenizer on the options it is given, so it is given options of its own.
    return Lexer.lex(markdown, { ...MARKDOWN_LEXER_OPTIONS }) as MarkedToken[];
}

/**
 * The number an ordered list counts from, which is the one its first item was written with
 */
export function readMarkdownListStart(list: Tokens.List): number {
    return typeof list.start === 'number' ? list.start : 1;
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
 * One list as plain text, which keeps what makes it a list: a bullet or a number in front of every item
 *
 * Note: Whatever an item goes on with — a second line, or a list of its own — is indented under its first line, so
 *       the items stay apart even where nothing but their text can be shown.
 */
function readMarkdownListPlainText(list: Tokens.List): string {
    const firstItemNumber = readMarkdownListStart(list);

    return list.items
        .map((item, itemIndex) => {
            const marker = list.ordered ? `${firstItemNumber + itemIndex}. ` : MARKDOWN_PLAIN_TEXT_LIST_ITEM_MARKER;
            const continuationIndent = ' '.repeat(marker.length);

            return readMarkdownBlockPlainTexts(item.tokens)
                .flatMap((text) => text.split(MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR))
                .map((line, lineIndex) => `${lineIndex === 0 ? marker : continuationIndent}${line}`)
                .join(MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR);
        })
        .filter((itemText) => itemText !== '')
        .join(MARKDOWN_PLAIN_TEXT_LINE_SEPARATOR);
}

/**
 * Every block of Markdown as plain text, in the order it was written
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
                    return [readMarkdownListPlainText(markdownToken)];
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
 * Note: Nothing is dropped on the way: emphasis simply loses its marks, a line which was ended stays ended, a list
 *       keeps a bullet or a number in front of each of its items, and a link keeps both its label and its destination.
 */
export function convertMarkdownToPlainText(markdown: string): string {
    return readMarkdownBlockPlainTexts(readMarkdownTokens(markdown)).join(MARKDOWN_PLAIN_TEXT_BLOCK_SEPARATOR);
}
