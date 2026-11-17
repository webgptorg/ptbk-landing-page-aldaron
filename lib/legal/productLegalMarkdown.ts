import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement, Fragment, type ReactNode } from 'react';
import { Lexer, type Token, type Tokens } from 'marked';
import type { LegalDocument, LegalDocumentSection } from './legalDocument';

/** Only repository-owned documents enter this loader; request paths are resolved by an explicit registry. */
const ROOT = join(process.cwd(), 'legal');
function textValue(text: string): string {
    return text.replace(/&#(\d+);/g, (_, value: string) => String.fromCodePoint(Number(value)))
        .replace(/&#x([\da-f]+);/gi, (_, value: string) => String.fromCodePoint(parseInt(value, 16)))
        .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&nbsp;/g, '\u00a0').replace(/&amp;/g, '&');
}
function inlineTokens(tokens: Token[]): ReactNode {
    const nodes = tokens.map((token, i): ReactNode => {
        if (token.type === 'text' || token.type === 'escape') return textValue((token as Tokens.Text).text);
        if (token.type === 'link') {
            const link = token as Tokens.Link;
            if (!/^(?:https?:|mailto:|\/|#)/i.test(link.href)) throw new Error('Unsupported legal link');
            return createElement('a', { key: i, href: link.href }, inlineTokens(link.tokens));
        }
        if (token.type === 'strong' || token.type === 'em' || token.type === 'del') {
            return createElement(token.type === 'strong' ? 'strong' : token.type === 'em' ? 'em' : 'del',
                { key: i }, inlineTokens((token as Tokens.Strong).tokens));
        }
        if (token.type === 'codespan') return createElement('code', { key: i }, (token as Tokens.Codespan).text);
        if (token.type === 'br') return createElement('br', { key: i });
        throw new Error(`Unsupported inline legal Markdown: ${token.type}`);
    });
    return nodes.every((node) => typeof node === 'string')
        ? nodes.join('')
        : createElement(Fragment, null, ...nodes);
}
export function legalInlineMarkdown(markdown: string): ReactNode {
    return inlineTokens(Lexer.lexInline(markdown, { gfm: false }));
}
export function readProductLegalMarkdown(relativePath: string): string {
    if (!/^[a-z0-9-]+\/(?:cs|en)\/[a-z0-9.-]+\.md$/.test(relativePath)) throw new Error('Unknown legal source');
    return readFileSync(join(ROOT, relativePath), 'utf8');
}
export function parseProductLegalMarkdown(markdown: string, publication?: LegalDocument['publication']): LegalDocument {
    const tokens = Lexer.lex(markdown, { gfm: false });
    let title = '';
    let perex: ReactNode = '';
    const sections: { heading: string; paragraphs: ReactNode[]; bullets?: ReactNode[] }[] = [];
    for (const token of tokens) {
        if (token.type === 'space') continue;
        if (token.type === 'heading') {
            const heading = token as Tokens.Heading;
            if (heading.depth === 1 && !title) title = heading.text;
            else if (heading.depth === 2) sections.push({ heading: heading.text.replace(/^\d+\.\s*/, ''), paragraphs: [] });
            else throw new Error('Legal Markdown uses one title and numbered level-two sections');
        } else if (token.type === 'paragraph') {
            const node = inlineTokens((token as Tokens.Paragraph).tokens);
            if (sections.length) sections[sections.length - 1].paragraphs.push(node);
            else if (!perex) perex = node;
            else throw new Error('Legal Markdown has more than one introduction');
        } else if (token.type === 'list' && sections.length) {
            const list = token as Tokens.List;
            if (list.ordered) throw new Error('Use explicit section numbering and unordered legal lists');
            sections[sections.length - 1].bullets = list.items.map((item) => legalInlineMarkdown(item.text));
        } else throw new Error(`Unsupported legal Markdown block: ${token.type}`);
    }
    if (!title || !perex || sections.length === 0) throw new Error('Incomplete legal document');
    return { title, perex, sections: sections as LegalDocumentSection[], ...(publication ? { publication } : {}) };
}
export function loadProductLegalMarkdown(relativePath: string): LegalDocument {
    const markdown = readProductLegalMarkdown(relativePath);
    const metadata = JSON.parse(readFileSync(join(ROOT, relativePath.replace(/\.md$/, '.meta.json')), 'utf8')) as {
        publication: LegalDocument['publication'] | null;
    };
    return parseProductLegalMarkdown(markdown, metadata.publication ?? undefined);
}
