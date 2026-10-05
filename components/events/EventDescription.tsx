import { readMarkdownListStart, readMarkdownTokenText, readMarkdownTokens } from '@/lib/text/markdownText';
import type { MarkedToken, Token, Tokens } from 'marked';
import { createElement, Fragment, type CSSProperties, type ReactNode } from 'react';

/**
 * What an authored description is built from
 *
 * Note: A `block` description is built from the elements a passage is ordinarily written in — paragraphs, lists, a
 *       quotation — and leads out through its links. A `phrasing` one is the very same passage, line for line and
 *       bullet for bullet, built from phrasing content alone, because the card a term is chosen with is a single
 *       button: block elements and destinations inside a button are neither valid nor clickable. Both are one walk
 *       through the same Markdown, so a term is never described in two different ways — only in two vocabularies.
 */
export const EVENT_DESCRIPTION_SHAPES = ['block', 'phrasing'] as const;

export type EventDescriptionShape = (typeof EVENT_DESCRIPTION_SHAPES)[number];

/**
 * Everything a description consists of besides the text which runs through it
 */
type EventDescriptionPart =
    | 'root'
    | 'paragraph'
    | 'heading'
    | 'unorderedList'
    | 'orderedList'
    | 'listItem'
    | 'quotation'
    | 'codeBlock'
    | 'rule'
    | 'table'
    | 'tableHead'
    | 'tableBody'
    | 'tableRow'
    | 'tableHeaderCell'
    | 'tableCell';

type EventDescriptionElement = {
    readonly tagName: string;
    readonly className?: string;
};

/**
 * The element each part of a description is made of in each of its shapes
 *
 * Note: A phrasing part is a `span` which is displayed as the block, the list item or the table cell it stands for, so
 *       both shapes keep the very same lines and differ only in what a button is allowed to contain.
 * Note: Neither shape brings a text colour of its own. What a block part does colour — the edge of a quotation, the
 *       ground of a block of code — is only ever read inside a room, so it wears the palette of the room; a phrasing
 *       part is read on a landing page as well, so it borrows the colour of the text around it.
 */
const EVENT_DESCRIPTION_ELEMENTS: Readonly<
    Record<EventDescriptionShape, Readonly<Record<EventDescriptionPart, EventDescriptionElement>>>
> = {
    block: {
        root: { tagName: 'div' },
        paragraph: { tagName: 'p', className: 'mt-3 first:mt-0' },
        heading: { tagName: 'p', className: 'mt-3 first:mt-0 font-semibold' },
        unorderedList: { tagName: 'ul', className: 'mt-3 first:mt-0 list-disc space-y-1 pl-5' },
        orderedList: { tagName: 'ol', className: 'mt-3 first:mt-0 list-decimal space-y-1 pl-5' },
        listItem: { tagName: 'li', className: '[&>*+*]:mt-1' },
        quotation: { tagName: 'blockquote', className: 'mt-3 first:mt-0 border-l-2 border-room-border/20 pl-3 italic' },
        codeBlock: {
            tagName: 'pre',
            className: 'mt-3 first:mt-0 max-w-full overflow-x-auto rounded bg-room-overlay/[0.06] p-2',
        },
        rule: { tagName: 'hr', className: 'mt-3 first:mt-0 border-room-border/20' },
        table: { tagName: 'table', className: 'mt-3 first:mt-0 block max-w-full overflow-x-auto' },
        tableHead: { tagName: 'thead' },
        tableBody: { tagName: 'tbody' },
        tableRow: { tagName: 'tr' },
        tableHeaderCell: { tagName: 'th', className: 'pr-4 text-left font-semibold' },
        tableCell: { tagName: 'td', className: 'pr-4 align-top' },
    },
    phrasing: {
        root: { tagName: 'span' },
        paragraph: { tagName: 'span', className: 'mt-1.5 first:mt-0 block' },
        heading: { tagName: 'span', className: 'mt-1.5 first:mt-0 block font-semibold' },
        unorderedList: { tagName: 'span', className: 'mt-1.5 first:mt-0 block list-disc pl-5' },
        orderedList: { tagName: 'span', className: 'mt-1.5 first:mt-0 block list-decimal pl-5' },
        listItem: { tagName: 'span', className: 'list-item [&>*+*]:mt-0' },
        quotation: { tagName: 'span', className: 'mt-1.5 first:mt-0 block border-l-2 border-current pl-3 italic' },
        codeBlock: { tagName: 'span', className: 'mt-1.5 first:mt-0 block whitespace-pre-wrap' },
        rule: { tagName: 'span', className: 'mt-1.5 first:mt-0 block border-t border-current opacity-30' },
        table: { tagName: 'span', className: 'mt-1.5 first:mt-0 table' },
        tableHead: { tagName: 'span', className: 'table-header-group' },
        tableBody: { tagName: 'span', className: 'table-row-group' },
        tableRow: { tagName: 'span', className: 'table-row' },
        tableHeaderCell: { tagName: 'span', className: 'table-cell pr-4 text-left font-semibold' },
        tableCell: { tagName: 'span', className: 'table-cell pr-4 align-top' },
    },
};

/**
 * Protocols a description may lead out to, which leaves `javascript:` and `data:` addresses as plain labels
 */
const EVENT_DESCRIPTION_ALLOWED_LINK_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

const EVENT_DESCRIPTION_CODE_CLASS_NAME = 'font-mono text-[0.95em]';

/**
 * What only one part of a description is told beyond what it is made of
 */
type EventDescriptionElementProperties = {
    readonly start?: number;
    readonly style?: CSSProperties;
};

/**
 * One part of a description as the element its shape makes that part of
 */
function createEventDescriptionElement(
    shape: EventDescriptionShape,
    part: EventDescriptionPart,
    key: string,
    children?: ReactNode,
    properties: EventDescriptionElementProperties = {},
): ReactNode {
    const { tagName, className } = EVENT_DESCRIPTION_ELEMENTS[shape][part];

    return createElement(tagName, { key, className, ...properties }, children);
}

/**
 * What makes an ordered list count from the number its first item was written with
 *
 * Note: A list which is a real list is simply told where to begin, and counts its own items from there.
 */
function createEventDescriptionOrderedListProperties(
    shape: EventDescriptionShape,
    firstItemNumber: number,
): EventDescriptionElementProperties {
    return shape === 'block' ? { start: firstItemNumber } : {};
}

/**
 * What makes one item of an ordered list carry the number it was written with
 *
 * Note: An item which is only displayed as an item of a list is counted by the browser together with whatever real
 *       list the page around its card happens to stand in, and no counter set on the phrasing list changes that. So
 *       such an item is not left to be counted at all: it is told the very number it wears.
 */
function createEventDescriptionOrderedListItemProperties(
    shape: EventDescriptionShape,
    itemNumber: number,
): EventDescriptionElementProperties {
    return shape === 'block' ? {} : { style: { listStyleType: `"${itemNumber}. "` } };
}

/**
 * The address of a link which may be opened, or `null` for one which stays a label
 *
 * Note: A site-relative address is kept as it was written, because a description has no page of its own to resolve it
 *       against. A protocol-relative `//host` one is refused, so it can never leave the site unnoticed.
 */
function resolveEventDescriptionHref(href: string): string | null {
    if (href.startsWith('/')) {
        return href.startsWith('//') ? null : href;
    }

    try {
        const url = new URL(href);

        return EVENT_DESCRIPTION_ALLOWED_LINK_PROTOCOLS.has(url.protocol) ? url.href : null;
    } catch {
        // An address which is not an address at all remains readable as a label.
        return null;
    }
}

function renderEventDescriptionLink(token: Tokens.Link, shape: EventDescriptionShape): ReactNode {
    const label = renderEventDescriptionInlineTokens(token.tokens, shape);
    const href = resolveEventDescriptionHref(token.href);

    if (shape === 'phrasing' || href === null) {
        return label;
    }

    // Note: A description is read on the way into a room, so its links open beside it rather than taking a
    //       participant out of the door they are standing in.
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-room-accent underline decoration-room-accent/50 underline-offset-2 transition hover:text-room-heading"
        >
            {label}
        </a>
    );
}

function renderEventDescriptionInlineToken(token: MarkedToken, shape: EventDescriptionShape): ReactNode {
    switch (token.type) {
        case 'strong':
            return <strong className="font-semibold">{renderEventDescriptionInlineTokens(token.tokens, shape)}</strong>;
        case 'em':
            return <em>{renderEventDescriptionInlineTokens(token.tokens, shape)}</em>;
        case 'del':
            return <del>{renderEventDescriptionInlineTokens(token.tokens, shape)}</del>;
        case 'codespan':
            return <code className={EVENT_DESCRIPTION_CODE_CLASS_NAME}>{token.text}</code>;
        case 'br':
            // A line which was ended stays ended, which a button is allowed to say as well.
            return <br />;
        case 'link':
            return renderEventDescriptionLink(token, shape);
        case 'image':
            // A description is a passage of text rather than a gallery, so an image is read by what it was called.
            return readMarkdownTokenText(token) || token.href;
        case 'text':
            return token.tokens === undefined
                ? readMarkdownTokenText(token)
                : renderEventDescriptionInlineTokens(token.tokens, shape);
        default:
            // Raw HTML and anything else contributes its text alone, so a description carries no markup of its own.
            return readMarkdownTokenText(token);
    }
}

function renderEventDescriptionInlineTokens(
    tokens: readonly Token[],
    shape: EventDescriptionShape,
): readonly ReactNode[] {
    return tokens.map((token, index) => (
        <Fragment key={`${token.type}-${index}`}>
            {renderEventDescriptionInlineToken(token as MarkedToken, shape)}
        </Fragment>
    ));
}

function renderEventDescriptionList(list: Tokens.List, shape: EventDescriptionShape, key: string): ReactNode {
    const firstItemNumber = readMarkdownListStart(list);
    const items = list.items.map((item, itemIndex) =>
        createEventDescriptionElement(
            shape,
            'listItem',
            `item-${itemIndex}`,
            renderEventDescriptionBlockTokens(item.tokens, shape),
            list.ordered ? createEventDescriptionOrderedListItemProperties(shape, firstItemNumber + itemIndex) : {},
        ),
    );

    return list.ordered
        ? createEventDescriptionElement(
              shape,
              'orderedList',
              key,
              items,
              createEventDescriptionOrderedListProperties(shape, firstItemNumber),
          )
        : createEventDescriptionElement(shape, 'unorderedList', key, items);
}

function renderEventDescriptionTableRow(
    cells: readonly Tokens.TableCell[],
    cellPart: 'tableHeaderCell' | 'tableCell',
    shape: EventDescriptionShape,
    key: string,
): ReactNode {
    return createEventDescriptionElement(
        shape,
        'tableRow',
        key,
        cells.map((cell, cellIndex) =>
            createEventDescriptionElement(
                shape,
                cellPart,
                `cell-${cellIndex}`,
                renderEventDescriptionInlineTokens(cell.tokens, shape),
            ),
        ),
    );
}

function renderEventDescriptionTable(table: Tokens.Table, shape: EventDescriptionShape, key: string): ReactNode {
    return createEventDescriptionElement(shape, 'table', key, [
        createEventDescriptionElement(
            shape,
            'tableHead',
            'head',
            renderEventDescriptionTableRow(table.header, 'tableHeaderCell', shape, 'header'),
        ),
        createEventDescriptionElement(
            shape,
            'tableBody',
            'body',
            table.rows.map((row, rowIndex) =>
                renderEventDescriptionTableRow(row, 'tableCell', shape, `row-${rowIndex}`),
            ),
        ),
    ]);
}

/**
 * Every block of a description as the part it is, in the order it was written
 */
function renderEventDescriptionBlockTokens(
    tokens: readonly Token[],
    shape: EventDescriptionShape,
): readonly ReactNode[] {
    return tokens.flatMap((token, index): readonly ReactNode[] => {
        const markdownToken = token as MarkedToken;
        const key = `${markdownToken.type}-${index}`;

        switch (markdownToken.type) {
            case 'space':
            case 'def':
                return [];
            case 'heading':
                // Note: A description is one passage rather than a document of its own, so an authored heading leads
                //       its paragraph instead of claiming a level in the outline of the page around it.
                return [
                    createEventDescriptionElement(
                        shape,
                        'heading',
                        key,
                        renderEventDescriptionInlineTokens(markdownToken.tokens, shape),
                    ),
                ];
            case 'list':
                return [renderEventDescriptionList(markdownToken, shape, key)];
            case 'blockquote':
                return [
                    createEventDescriptionElement(
                        shape,
                        'quotation',
                        key,
                        renderEventDescriptionBlockTokens(markdownToken.tokens, shape),
                    ),
                ];
            case 'code':
                return [
                    createEventDescriptionElement(
                        shape,
                        'codeBlock',
                        key,
                        <code className={EVENT_DESCRIPTION_CODE_CLASS_NAME}>{markdownToken.text}</code>,
                    ),
                ];
            case 'hr':
                return [createEventDescriptionElement(shape, 'rule', key)];
            case 'table':
                return [renderEventDescriptionTable(markdownToken, shape, key)];
            default: {
                const paragraph =
                    'tokens' in markdownToken && markdownToken.tokens !== undefined
                        ? renderEventDescriptionInlineTokens(markdownToken.tokens, shape)
                        : readMarkdownTokenText(markdownToken);

                // A token which is left with no text at all — a stripped tag, say — becomes no paragraph.
                return paragraph === '' ? [] : [createEventDescriptionElement(shape, 'paragraph', key, paragraph)];
            }
        }
    });
}

type EventDescriptionProps = {
    /**
     * The words an administrator wrote about one event, written as Markdown on as many lines as they took
     */
    readonly description: string;

    /**
     * What they are built from where they are read, see `EVENT_DESCRIPTION_SHAPES`
     */
    readonly shape?: EventDescriptionShape;
    readonly className?: string;
};

/**
 * The description of one event, read as the Markdown it was written in
 *
 * Note: This is the one place which decides how an authored description is read on a page, so the door of a room and
 *       the card a term is chosen with can never interpret the same words differently; the recap PDF reads the very
 *       same Markdown through `createMarkdownPdfContent`. The description carries no markup of its own: raw HTML only
 *       ever contributes its text, an image is read by its label, and only an address of a known protocol ever becomes
 *       a link.
 * Note: A description is written on as many lines as it takes, and it is read on those lines wherever it is read: a
 *       line which was ended stays ended, a paragraph stays a paragraph, and an item of a list stays on a line of its
 *       own behind its bullet or its number.
 */
export function EventDescription({ description, shape = 'block', className }: EventDescriptionProps) {
    return createElement(
        EVENT_DESCRIPTION_ELEMENTS[shape].root.tagName,
        { className },
        renderEventDescriptionBlockTokens(readMarkdownTokens(description), shape),
    );
}
