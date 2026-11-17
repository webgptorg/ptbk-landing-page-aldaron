import { createHash } from 'node:crypto';
import { createElement, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LegalDocument } from './legalDocument';

function decode(text: string) {
    return text.replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
        .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&nbsp;/g, '\u00a0').replace(/&amp;/g, '&');
}
function nodeData(node: ReactNode) {
    const html = renderToStaticMarkup(createElement(Fragment, null, node));
    return {
        text: decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim(),
        links: Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>/g)).map((m) => decode(m[1])),
    };
}
/** Frozen migration evidence: whitespace layout is ignored, wording, order, URLs and edition data are not. */
export function legalParityFingerprint(document: LegalDocument) {
    return createHash('sha256').update(JSON.stringify({
        title: document.title, perex: nodeData(document.perex), publication: document.publication ?? null,
        sections: document.sections.map((section) => ({
            heading: section.heading,
            paragraphs: section.paragraphs?.map(nodeData) ?? [],
            bullets: section.bullets?.map(nodeData) ?? [],
        })),
    })).digest('hex');
}
