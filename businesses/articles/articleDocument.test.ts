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
});
