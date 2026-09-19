import { createMarkdownPdfContent } from '@/lib/exports/markdownPdfContent';
import { extractMarkdownKeyPoints } from '@/lib/text/markdownText';
import { describe, expect, it } from 'vitest';

describe('Markdown in downloadable recaps', () => {
    it('preserves formatting, code, tables, reference links, relative links and image destinations without fetching them', () => {
        const markdown = [
            '# Příliš žluťoučký kůň',
            '**Tučné** a *kurzíva* &amp; další.',
            '1. První bod\n2. Druhý bod',
            '```js\nconst isReady = true;\n```',
            '| Vlastnost | Hodnota |\n| --- | --- |\n| Stav | Hotovo |',
            '[Dokumentace][reference] a [relativní](/material) a [nebezpečný](javascript:alert).',
            '![Diagram](https://example.com/image.png)',
            '[reference]: https://example.com/doc_(1)',
        ].join('\n\n');
        const content = createMarkdownPdfContent(markdown, 'https://example.com/room');
        const document = JSON.stringify(content);
        expect(document).toContain('Příliš žluťoučký kůň');
        expect(document).toContain('"bold":true');
        expect(document).toContain('"italics":true');
        expect(document).toContain('& další.');
        expect(document).toContain('const isReady = true;');
        expect(document).toContain('"table"');
        expect(document).toContain('"link":"https://example.com/doc_(1)"');
        expect(document).toContain('"link":"https://example.com/material"');
        expect(document).toContain('"link":"https://example.com/image.png"');
        expect(document).not.toContain('"image":');
        expect(document).not.toContain('javascript:');
    });

    it('extracts complete authored list points without merging nested words or treating code as lessons', () => {
        expect(
            extractMarkdownKeyPoints(
                'Úvod.\n\n- **Testujte** změny.\n  - Prověřte výsledek.\n- Opakujte.\n\n```\nsecretCode()\n```',
            ),
        ).toEqual(['Testujte změny. Prověřte výsledek.', 'Opakujte.']);
        expect(extractMarkdownKeyPoints('Shrnutí bez seznamu.')).toEqual(['Shrnutí bez seznamu.']);
        expect(
            extractMarkdownKeyPoints('[Dokumentace](https://example.com)\n\n![Obrázek](https://example.com/image.png)'),
        ).toEqual([]);
        expect(extractMarkdownKeyPoints('Popis tématu.', { isListRequired: true })).toEqual([]);
    });
});
