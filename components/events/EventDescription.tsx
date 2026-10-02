import { readMarkdownTokenText, readMarkdownTokens } from '@/lib/text/markdownText';
import type { MarkedToken, Token, Tokens } from 'marked';
import { Fragment, type ReactNode } from 'react';

/**
 * How much room an authored description is read in
 *
 * Note: A `block` description is the whole passage an administrator wrote, with its paragraphs, its lists and its
 *       links. An `inline` one is the very same words as one flowing excerpt, because the card a term is chosen with
 *       is a single button: block elements and destinations inside a button are neither valid nor clickable, and the
 *       compact card cuts the excerpt off after two lines anyway. Both read the same Markdown, so a term is never
 *       described in two different ways — only at two different lengths.
 */
export const EVENT_DESCRIPTION_SHAPES = ['block', 'inline'] as const;

export type EventDescriptionShape = (typeof EVENT_DESCRIPTION_SHAPES)[number];

/**
 * Protocols a description may lead out to, which leaves `javascript:` and `data:` addresses as plain labels
 */
const EVENT_DESCRIPTION_ALLOWED_LINK_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

/**
 * What an excerpt puts between two blocks of the description and in front of each item of a list
 */
const EVENT_DESCRIPTION_EXCERPT_BLOCK_SEPARATOR = ' ';
const EVENT_DESCRIPTION_EXCERPT_LIST_ITEM_MARKER = '• ';

const EVENT_DESCRIPTION_CODE_CLASS_NAME = 'font-mono text-[0.95em]';
const EVENT_DESCRIPTION_BLOCK_CLASS_NAME = 'mt-3 first:mt-0';

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

    if (shape === 'inline' || href === null) {
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
            return shape === 'inline' ? EVENT_DESCRIPTION_EXCERPT_BLOCK_SEPARATOR : <br />;
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

function renderEventDescriptionBlockTokens(tokens: readonly Token[]): readonly ReactNode[] {
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
                    <p key={key} className={`${EVENT_DESCRIPTION_BLOCK_CLASS_NAME} font-semibold`}>
                        {renderEventDescriptionInlineTokens(markdownToken.tokens, 'block')}
                    </p>,
                ];
            case 'list': {
                const items = markdownToken.items.map((item, itemIndex) => (
                    <li key={`item-${itemIndex}`}>{renderEventDescriptionBlockTokens(item.tokens)}</li>
                ));

                return [
                    markdownToken.ordered ? (
                        <ol
                            key={key}
                            start={Number(markdownToken.start) || 1}
                            className={`${EVENT_DESCRIPTION_BLOCK_CLASS_NAME} list-decimal space-y-1 pl-5`}
                        >
                            {items}
                        </ol>
                    ) : (
                        <ul key={key} className={`${EVENT_DESCRIPTION_BLOCK_CLASS_NAME} list-disc space-y-1 pl-5`}>
                            {items}
                        </ul>
                    ),
                ];
            }
            case 'blockquote':
                return [
                    <blockquote
                        key={key}
                        className={`${EVENT_DESCRIPTION_BLOCK_CLASS_NAME} border-l-2 border-room-border/20 pl-3 italic`}
                    >
                        {renderEventDescriptionBlockTokens(markdownToken.tokens)}
                    </blockquote>,
                ];
            case 'code':
                return [
                    <pre
                        key={key}
                        className={`${EVENT_DESCRIPTION_BLOCK_CLASS_NAME} max-w-full overflow-x-auto rounded bg-room-overlay/[0.06] p-2`}
                    >
                        <code className={EVENT_DESCRIPTION_CODE_CLASS_NAME}>{markdownToken.text}</code>
                    </pre>,
                ];
            case 'hr':
                return [<hr key={key} className={`${EVENT_DESCRIPTION_BLOCK_CLASS_NAME} border-room-border/20`} />];
            case 'table':
                return [
                    <table
                        key={key}
                        className={`${EVENT_DESCRIPTION_BLOCK_CLASS_NAME} block max-w-full overflow-x-auto`}
                    >
                        <thead>
                            <tr>
                                {markdownToken.header.map((cell, cellIndex) => (
                                    <th key={`header-${cellIndex}`} className="pr-4 text-left font-semibold">
                                        {renderEventDescriptionInlineTokens(cell.tokens, 'block')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {markdownToken.rows.map((row, rowIndex) => (
                                <tr key={`row-${rowIndex}`}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={`cell-${cellIndex}`} className="pr-4 align-top">
                                            {renderEventDescriptionInlineTokens(cell.tokens, 'block')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>,
                ];
            default: {
                const paragraph =
                    'tokens' in markdownToken && markdownToken.tokens !== undefined
                        ? renderEventDescriptionInlineTokens(markdownToken.tokens, 'block')
                        : readMarkdownTokenText(markdownToken);

                // A token which is left with no text at all — a stripped tag, say — becomes no paragraph.
                return paragraph === ''
                    ? []
                    : [
                          <p key={key} className={EVENT_DESCRIPTION_BLOCK_CLASS_NAME}>
                              {paragraph}
                          </p>,
                      ];
            }
        }
    });
}

/**
 * Every block of a description as its own run of inline nodes, in the order it was written
 */
function createEventDescriptionExcerptRuns(tokens: readonly Token[]): readonly (readonly ReactNode[])[] {
    return tokens.flatMap((token): readonly (readonly ReactNode[])[] => {
        const markdownToken = token as MarkedToken;

        switch (markdownToken.type) {
            case 'space':
            case 'def':
            case 'hr':
                return [];
            case 'blockquote':
                return createEventDescriptionExcerptRuns(markdownToken.tokens);
            case 'heading':
                // An authored heading leads its paragraph in an excerpt exactly as it does in the whole passage.
                return [
                    [
                        <strong key="heading" className="font-semibold">
                            {renderEventDescriptionInlineTokens(markdownToken.tokens, 'inline')}
                        </strong>,
                    ],
                ];
            case 'list':
                // An excerpt has no bullets to indent, so each item says that it is one.
                return markdownToken.items.map((item) => [
                    EVENT_DESCRIPTION_EXCERPT_LIST_ITEM_MARKER,
                    ...joinEventDescriptionExcerptRuns(createEventDescriptionExcerptRuns(item.tokens)),
                ]);
            case 'code':
                return [
                    [
                        <code key="code" className={EVENT_DESCRIPTION_CODE_CLASS_NAME}>
                            {markdownToken.text}
                        </code>,
                    ],
                ];
            case 'table':
                return [markdownToken.header, ...markdownToken.rows].map((row) =>
                    joinEventDescriptionExcerptRuns(
                        row.map((cell) => renderEventDescriptionInlineTokens(cell.tokens, 'inline')),
                    ),
                );
            default: {
                if ('tokens' in markdownToken && markdownToken.tokens !== undefined) {
                    return [renderEventDescriptionInlineTokens(markdownToken.tokens, 'inline')];
                }

                // A token which is left with no text at all — a stripped tag, say — adds no separator of its own.
                const text = readMarkdownTokenText(markdownToken);

                return text === '' ? [] : [[text]];
            }
        }
    });
}

function joinEventDescriptionExcerptRuns(runs: readonly (readonly ReactNode[])[]): readonly ReactNode[] {
    return runs.flatMap((run, index) => [
        ...(index === 0 ? [] : [EVENT_DESCRIPTION_EXCERPT_BLOCK_SEPARATOR]),
        <Fragment key={`run-${index}`}>{run}</Fragment>,
    ]);
}

type EventDescriptionProps = {
    /**
     * The words an administrator wrote about one event, written as Markdown
     */
    readonly description: string;

    /**
     * How much room they are read in, see `EVENT_DESCRIPTION_SHAPES`
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
 * Note: The formatting takes no colours of its own and inherits the ones of the surface it is read on, so the fixed
 *       palette of a landing page and the appearance a member chose for their room both stay intact. What does need a
 *       colour — a link, a quotation, a block of code — only ever appears in the whole passage, which is read inside a
 *       room.
 */
export function EventDescription({ description, shape = 'block', className }: EventDescriptionProps) {
    const tokens = readMarkdownTokens(description);

    if (shape === 'inline') {
        return (
            <span className={className}>
                {joinEventDescriptionExcerptRuns(createEventDescriptionExcerptRuns(tokens))}
            </span>
        );
    }

    return <div className={className}>{renderEventDescriptionBlockTokens(tokens)}</div>;
}
