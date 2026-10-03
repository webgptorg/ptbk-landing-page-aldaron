import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** The Czech source remains the authored whitepaper; only the translation is stored alongside the page. */
const WHITEPAPER_DOCUMENT_PATHS: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'prompts/2026-10-0000-whitepaper.md',
    en: 'businesses/whitepaper/whitepaper.en.md',
};

export async function readWhitepaperDocument(language: SupportedHomepageLanguage): Promise<string> {
    const markdown = await readFile(join(process.cwd(), WHITEPAPER_DOCUMENT_PATHS[language]), 'utf8');
    return markdown
        .replace(/^\[[^\]\r\n]*\]\s*\r?\n/, '')
        .replace(/<!--\s*pagebreak\s*-->/g, '')
        .trim();
}

export function splitWhitepaperChapters(markdown: string) {
    return markdown
        .split(/^## /m)
        .slice(1)
        .flatMap((section) => {
            const lineEnd = section.indexOf('\n');
            const title = section.slice(0, lineEnd).trim();
            const chapterNumber = title.match(/^(\d+)\. /)?.[1];
            const isAbstract = /^(Abstract|Abstrakt)$/.test(title);
            const isAppendix = /^(Appendix|Příloha):/.test(title);
            if (!chapterNumber && !isAbstract && !isAppendix) return [];
            return [
                {
                    id: chapterNumber
                        ? `chapter-${chapterNumber}`
                        : isAbstract
                          ? 'chapter-abstract'
                          : 'chapter-appendix',
                    number: chapterNumber?.padStart(2, '0') ?? (isAbstract ? '00' : '+'),
                    title: title.replace(/^\d+\. /, ''),
                    markdown: section.slice(lineEnd + 1).trim(),
                },
            ];
        });
}

export async function downloadWhitepaper(language: SupportedHomepageLanguage): Promise<Response> {
    return new Response(await readWhitepaperDocument(language), {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="promptbook-whitepaper-${language}.md"`,
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
