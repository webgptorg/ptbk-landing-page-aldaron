import { readMarkdownTokens, readMarkdownTokenText } from '@/lib/text/markdownText';
import type { MarkedToken, Token, Tokens } from 'marked';
import type { Content, ContentText } from 'pdfmake/interfaces';

const PDF_LINK_COLOR = '#08758a';
const PDF_ALLOWED_LINK_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

/** Keeps relative material links useful outside the site, without enabling script or local-file links. */
export function createPdfLink(text: string, destination: string, baseUrl: string): ContentText {
    try {
        const url = new URL(destination, baseUrl);
        if (PDF_ALLOWED_LINK_PROTOCOLS.has(url.protocol)) {
            return { text, link: url.href, color: PDF_LINK_COLOR, decoration: 'underline' };
        }
    } catch {
        // An invalid destination remains readable as a label.
    }
    return { text };
}

function renderInlineTokens(tokens: readonly Token[], baseUrl: string): Content[] {
    return tokens.map((token): Content => {
        const markdownToken = token as MarkedToken;
        switch (markdownToken.type) {
            case 'strong':
            case 'em':
            case 'del':
                return {
                    text: renderInlineTokens(markdownToken.tokens, baseUrl),
                    bold: markdownToken.type === 'strong' ? true : undefined,
                    italics: markdownToken.type === 'em' ? true : undefined,
                    decoration: markdownToken.type === 'del' ? 'lineThrough' : undefined,
                };
            case 'link':
            case 'image': {
                // Images stay as labelled links: generating a recap never fetches remote resources.
                const label = readMarkdownTokenText(markdownToken) || markdownToken.href;
                const link = createPdfLink(label, markdownToken.href, baseUrl);
                return {
                    ...link,
                    text: link.link !== undefined && label !== link.link ? `${label} (${link.link})` : label,
                };
            }
            case 'codespan':
                return { text: markdownToken.text, background: '#edf2f4' };
            case 'text':
                return markdownToken.tokens === undefined
                    ? readMarkdownTokenText(markdownToken)
                    : { text: renderInlineTokens(markdownToken.tokens, baseUrl) };
            default:
                return readMarkdownTokenText(markdownToken);
        }
    });
}

function renderTable(token: Tokens.Table, baseUrl: string): Content {
    const renderCell = (cell: Tokens.TableCell): Content => ({
        text: renderInlineTokens(cell.tokens, baseUrl),
        bold: cell.header,
        alignment: cell.align ?? 'left',
    });
    return {
        table: {
            headerRows: 1,
            widths: token.header.map(() => '*'),
            body: [token.header.map(renderCell), ...token.rows.map((row) => row.map(renderCell))],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 4, 0, 10],
    };
}

function renderBlockTokens(tokens: readonly Token[], baseUrl: string): Content[] {
    return tokens.flatMap((token): Content[] => {
        const markdownToken = token as MarkedToken;
        switch (markdownToken.type) {
            case 'space':
            case 'def':
                return [];
            case 'heading':
                return [
                    {
                        text: renderInlineTokens(markdownToken.tokens, baseUrl),
                        fontSize: Math.max(11, 17 - markdownToken.depth),
                        bold: true,
                        margin: [0, 10, 0, 5],
                    },
                ];
            case 'list': {
                const items = markdownToken.items.map(
                    (item): Content => ({
                        stack: [
                            ...(item.task ? [{ text: item.checked ? '[x]' : '[ ]' }] : []),
                            ...renderBlockTokens(item.tokens, baseUrl),
                        ],
                    }),
                );
                return [
                    markdownToken.ordered
                        ? { ol: items, start: Number(markdownToken.start) || 1, margin: [0, 0, 0, 8] }
                        : { ul: items, margin: [0, 0, 0, 8] },
                ];
            }
            case 'blockquote':
                return [
                    { stack: renderBlockTokens(markdownToken.tokens, baseUrl), margin: [12, 4, 0, 8], italics: true },
                ];
            case 'code':
                return [{ text: markdownToken.text, fontSize: 9, background: '#edf2f4', margin: [0, 4, 0, 10] }];
            case 'table':
                return [renderTable(markdownToken, baseUrl)];
            case 'hr':
                return [{ text: '—', color: '#718096', margin: [0, 4, 0, 4] }];
            default:
                return [
                    {
                        text:
                            'tokens' in markdownToken && markdownToken.tokens !== undefined
                                ? renderInlineTokens(markdownToken.tokens, baseUrl)
                                : readMarkdownTokenText(markdownToken),
                        margin: [0, 0, 0, 8],
                    },
                ];
        }
    });
}

/** Converts material Markdown into flowing, searchable PDF text with links, lists and tables. */
export function createMarkdownPdfContent(markdown: string, baseUrl: string): Content[] {
    return renderBlockTokens(readMarkdownTokens(markdown), baseUrl);
}
