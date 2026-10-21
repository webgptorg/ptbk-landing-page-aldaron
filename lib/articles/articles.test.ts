import { describe, expect, it } from 'vitest';
import { createGeneratedSocialPreviewImagePath } from '@/lib/metadata/social-preview-image-path';
import { getAllArticles, getArticle, getArticleFilePath, getArticles, getPublicArticleAsset } from './load';
import { createArticleMetadata, createArticleStructuredData } from './metadata';
import { getArticlePodcastUrl } from './urls';

describe('committed article publication', () => {
    it('publishes the complete Czech variant on Promptbook and its author site only', () => {
        const article = getArticle('co-prichazi-po-generovani-kodu', 'cs');
        expect(article).toBeDefined();
        expect(getArticles('cs', 'personal').map((variant) => variant.id)).toContain(article!.id);
        expect(getArticles('en').map((variant) => variant.id)).not.toContain(article!.id);
        expect(getArticles('en', 'personal').map((variant) => variant.id)).not.toContain(article!.id);
        expect(article!.authorId).toBe('pavol-hejny');
        expect(article!.markdown.length).toBeGreaterThan(25000);
        expect(article!.markdown).toContain('nezávislý benchmark');
        expect(article!.markdown).toContain('O autorovi');
        expect(article!.translations.every((variant) => variant.language !== article!.language)).toBe(true);
    });

    it('advertises only actual media and actual translation counterparts', () => {
        for (const article of getAllArticles()) {
            const metadata = createArticleMetadata(article, 'promptbook');
            const structuredData = createArticleStructuredData(article);
            if (!article.audio) expect(structuredData).not.toHaveProperty('associatedMedia');
            else {
                expect(article.audio.byteLength).toBeGreaterThan(0);
                expect(article.audio.duration).toBeGreaterThan(0);
                expect(structuredData.associatedMedia?.contentUrl).toBe(article.audio.url);
            }
            if (article.translations.length === 0) {
                expect(metadata.alternates?.languages).toBeUndefined();
                expect(structuredData).not.toHaveProperty('workTranslation');
            }
            for (const translation of article.translations) {
                expect(getAllArticles().some((candidate) => candidate.canonicalUrl === translation.url
                    && candidate.translationGroupId === article.translationGroupId
                    && candidate.language === translation.language)).toBe(true);
            }
        }
    });

    it('loads timing JSON on each publication origin while retaining the shared narration URL', () => {
        const article = getArticles('cs')[0];
        expect(article.audio?.wordsUrl).toBe('/article-assets/spec-driven-anchoring-cs/audio/words.json');
        for (const origin of ['https://www.ptbk.io', 'https://www.pavolhejny.cz']) {
            expect(new URL(article.audio!.wordsUrl!, origin).origin).toBe(origin);
        }
        expect(article.audio?.url).toBe('https://ptbk.io/article-assets/spec-driven-anchoring-cs/audio/narration.mp3');
        expect(getPublicArticleAsset(article.id, 'audio/words.json')?.mimeType).toBe('application/json; charset=utf-8');
    });

    it('uses the author canonical on both publications and a real committed PDF', () => {
        const article = getArticles('cs')[0];
        const canonical = 'https://pavolhejny.cz/articles/co-prichazi-po-generovani-kodu';
        expect(createArticleMetadata(article, 'promptbook').alternates?.canonical).toBe(canonical);
        expect(createArticleMetadata(article, 'personal').alternates?.canonical).toBe(canonical);
        const metadata = createArticleMetadata(article, 'personal');
        expect(metadata.openGraph?.images).toEqual(metadata.twitter?.images);
        expect(metadata.openGraph?.images).toMatchObject([article.coverImage
            ? { url: article.coverImage }
            : { url: createGeneratedSocialPreviewImagePath(canonical), width: 1200, height: 630, type: 'image/png' }]);
        expect(article.pdfUrl).toBe('https://ptbk.io/article-assets/spec-driven-anchoring-cs/article.pdf');
        expect(getPublicArticleAsset(article.id, 'article.pdf')?.mimeType).toBe('application/pdf');
    });

    it('bounds downloads to published public assets and prevents path traversal or draft script disclosure', () => {
        expect(getArticleFilePath('spec-driven-anchoring-cs', '../README.md')).toBeUndefined();
        expect(getArticleFilePath('../spec-driven-anchoring-cs', 'content.md')).toBeUndefined();
        expect(getArticleFilePath('spec-driven-anchoring-cs', '/etc/passwd')).toBeUndefined();
        expect(getArticleFilePath('spec-driven-anchoring-cs', '..\\README.md')).toBeUndefined();
        expect(getPublicArticleAsset('spec-driven-anchoring-cs', 'audio/script.txt')).toBeUndefined();
        expect(getPublicArticleAsset('spec-driven-anchoring-cs', 'metadata.json')).toBeUndefined();
        expect(getPublicArticleAsset('nonexistent', 'article.pdf')).toBeUndefined();
    });

    it('exposes exactly four distinct feed URLs with separate author and language filters', () => {
        const urls = (['cs', 'en'] as const).flatMap((language) => (['promptbook', 'personal'] as const).map((publication) => getArticlePodcastUrl(language, publication)));
        expect(new Set(urls).size).toBe(4);
        expect(urls).toContain('https://pavolhejny.com/articles/podcast.xml');
    });
});
