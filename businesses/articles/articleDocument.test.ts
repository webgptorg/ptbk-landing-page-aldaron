import { describe, expect, it } from 'vitest';
import { getArticleBody, renderArticleCover, renderArticleDocument } from './articleDocument';

describe('article document rendering and narration word identity', () => {
    it('gives cover copy escaped, stable IDs without renumbering body words', () => {
        const cover = renderArticleCover('AI & <kód>', 'Co bude dál?');
        expect(cover.words.map((word) => word.id)).toEqual(['t0', 't1', 't2', 'p0', 'p1', 'p2']);
        expect(cover.titleHtml).toContain('&amp;');
        expect(cover.titleHtml).toContain('&lt;kód&gt;');
        expect(renderArticleDocument('Text.', '', '').words[0].id).toBe('w0');
    });
    it('removes matching cover copy while preserving all original body and biography', () => {
        const source = '# Titulek\n\nPodtitulek.\n\n## Kapitola\n\nText a nuance.\n\n## O autorovi.\n\nHistorické analogie jsou vysvětlením; anchoring je hypotéza.';
        const result = renderArticleDocument(source, 'Titulek', 'Podtitulek.');
        expect(result.html).not.toContain('Podtitulek.');
        expect(result.chapters.map((chapter) => chapter.title)).toEqual(['Kapitola', 'O autorovi.']);
        expect(result.words.map((word) => word.text).join(' ')).toBe('Kapitola Text a nuance. O autorovi. Historické analogie jsou vysvětlením; anchoring je hypotéza.');
        expect(result.words.every((word, index) => word.id === `w${index}`)).toBe(true);
        expect(result.sections).toHaveLength(2);
    });

    it('does not remove a different first paragraph or guess a subtitle', () => {
        expect(getArticleBody('# Jiný titul\n\nPůvodní text.', 'Titulek', 'Nový podtitulek.')).toBe('# Jiný titul\n\nPůvodní text.');
    });

    it('keeps formatting, code, links and deterministic words without accepting raw HTML or script links', () => {
        const source = '## Stejná kapitola\n\n**Silné slovo** a [odkaz](https://example.com). `const x`\n\n```ts\nconst value = 1;\n```\n\n## Stejná kapitola\n\n<script>alert(1)</script>\n\n[Útok](javascript:alert%281%29)';
        const result = renderArticleDocument(source, '', '');
        expect(result.chapters.map((chapter) => chapter.id)).toEqual(['stejna-kapitola', 'stejna-kapitola-2']);
        expect(result.html).toContain('<strong><span data-article-word=');
        expect(result.html).toContain('href="https://example.com"');
        expect(result.html).toContain('<pre><code class="language-ts">');
        expect(result.html).not.toContain('<script>');
        expect(result.html).not.toContain('href="javascript:');
        expect(renderArticleDocument(source, '', '').words).toEqual(result.words);
    });

    it('marks fenced Book blocks, including nested blocks, without changing source or narration words', () => {
        const source = [
            'Úvod.', '', '~~~book', 'AGENT Pomocník', 'GOAL Use <tag> & quotes.', '~~~', '',
            '> ```book', '> RULE Ask first.', '> ```', '',
            '```ts', 'const value = 1;', '```', '', '`book`', '',
            '    AGENT Indented', '', 'Závěr.',
        ].join('\n');
        const plain = renderArticleDocument(source, '', '');
        const enhanced = renderArticleDocument(source, '', '', undefined, { bookExamples: true });
        expect(plain.hasBookExamples).toBe(false);
        expect(enhanced.hasBookExamples).toBe(true);
        expect(enhanced.words).toEqual(plain.words);
        expect(enhanced.html.match(/data-article-book="\d+"/g)).toEqual(['data-article-book="0"', 'data-article-book="1"']);
        expect(enhanced.html).toContain('&lt;tag&gt;');
        expect(enhanced.html).toContain('<pre><code class="language-ts">');
        expect(enhanced.html).toContain('<blockquote>\n<div class="article-book-example">');
        expect(enhanced.html).not.toContain('<tag>');
        expect(renderArticleDocument('`book`', '', '', undefined, { bookExamples: true }).hasBookExamples).toBe(false);
    });

    it('escapes technical notation without changing the readable text', () => {
        const result = renderArticleDocument('`<value> & item`\n\nA & B.', '', '');
        expect(result.html).toContain('&lt;value&gt;');
        expect(result.html).not.toContain('<value>');
        expect(result.words.map((word) => word.text)).toEqual(['<value>', '&', 'item', 'A', '&', 'B.']);
    });

    it('resolves bounded article images to their shared public assets without changing narration words', () => {
        const source = 'Text.\n\n![Schéma](images/diagram-v2.png)\n\nDál.';
        const result = renderArticleDocument(source, '', '', 'https://ptbk.io/article-assets/article-cs/');
        expect(result.html).toContain('src="https://ptbk.io/article-assets/article-cs/images/diagram-v2.png"');
        expect(result.html).toContain('alt="Schéma"');
        expect(result.words).toEqual([{ id: 'w0', text: 'Text.' }, { id: 'w1', text: 'Dál.' }]);
    });

    it.each(['images/../secret.png', 'images/%2e%2e/secret.png', 'images/sub/../../secret.png', 'images/sub\\secret.png', 'https://user:password@example.com/image.png', '//example.com/image.png'])('rejects unsafe image paths: %s', (image) => {
        const result = renderArticleDocument(`![Popis](<${image}>)`, '', '', 'https://ptbk.io/article-assets/article-cs/');
        expect(result.html).not.toContain('<img');
    });

    it('previews article images, including linked originals, without creating nested links', () => {
        const source = [
            '![Obrázek](/diagram.webp)',
            '[![Náhled](/thumb.png)](/original.png?size=full)',
            '[![Logo](/logo.png)](https://example.com/ "Zdroj")',
            '[Celý obrázek](/original.png)',
        ].join('\n\n');
        const result = renderArticleDocument(source, '', '', undefined, { mediaLanguage: 'cs' });
        expect(result.html).toContain('href="/diagram.webp" data-article-image');
        expect(result.html).toContain('href="/original.png?size=full" data-article-image');
        expect(result.html).toContain('href="/logo.png" data-article-image');
        expect(result.html).toContain('</a><a class="article-image-destination" href="https://example.com/">Zdroj</a>');
        expect(result.html).toContain('href="/original.png" data-article-image');
        expect(result.words).toEqual(renderArticleDocument(source, '', '').words);
    });

    it('adds players to standalone video links and keeps contextual links and narration words', () => {
        const source = [
            '[Záznam](/terminal-tour/demo.mp4?download=1)',
            '[Video](https://youtu.be/dQw4w9WgXcQ?t=1m15s)',
            'Více v [pořadu](https://youtu.be/dQw4w9WgXcQ).',
        ].join('\n\n');
        const result = renderArticleDocument(source, '', '', undefined, { mediaLanguage: 'cs' });
        expect(result.html).toContain('<video controls playsinline preload="none" src="/terminal-tour/demo.mp4?download=1"');
        expect(result.html).toContain('data-article-youtube="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&amp;playsinline=1&amp;start=75"');
        expect(result.html.match(/data-article-youtube/g)).toHaveLength(1);
        expect(result.html).not.toContain('<iframe');
        expect(result.words).toEqual(renderArticleDocument(source, '', '').words);
    });
});
