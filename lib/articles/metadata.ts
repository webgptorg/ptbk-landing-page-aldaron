import { createPageMetadata } from '@/lib/metadata/create-page-metadata';
import { createSocialPreviewOptions } from '@/lib/metadata/create-social-preview-options';
import type { PageMetadataDefinition } from '@/lib/metadata/page-metadata-definition';
import type { Metadata } from 'next';
import type { Article, ArticleLanguage, ArticlePublication } from './types';
import { getArticleIndexUrl, getArticlePodcastUrl } from './urls';

function getArticleInternalPath(language: ArticleLanguage, publication: ArticlePublication, slug?: string): string {
    return `/${language}${publication === 'personal' ? '/pavol' : ''}/articles${slug ? `/${slug}` : ''}`;
}

export function createArticlePageDefinition(article: Article, publication: ArticlePublication): PageMetadataDefinition {
    return {
        path: getArticleInternalPath(article.language, publication, article.slug),
        language: article.language,
        title: article.title,
        description: article.perex,
        brand: { name: publication === 'personal' ? article.author.name : 'Promptbook' },
        openGraphType: 'article',
        isSocialPreviewImageGenerated: true,
        socialPreviewImagePath: article.coverImage,
    };
}

export function createArticleMetadata(article: Article, publication: ArticlePublication): Metadata {
    const base = createPageMetadata(createArticlePageDefinition(article, publication));
    const languageAlternates = article.translations.length > 0
        ? Object.fromEntries([[article.language, article.canonicalUrl], ...article.translations.map((variant) => [variant.language, variant.url])])
        : undefined;
    return {
        ...base,
        title: { absolute: `${article.title} | ${publication === 'personal' ? article.author.name : 'Promptbook'}` },
        authors: [{ name: article.author.name, url: article.author.domains[article.language] }],
        creator: article.author.name,
        keywords: [...article.tags],
        // Next resolves this whole alternates object at this segment; undefined languages clears inherited ones.
        alternates: { canonical: article.canonicalUrl, languages: languageAlternates, types: { 'application/rss+xml': getArticlePodcastUrl(article.language, publication) } },
        openGraph: {
            ...base.openGraph,
            type: 'article', url: article.canonicalUrl,
            publishedTime: article.publishedAt, modifiedTime: article.updatedAt ?? article.publishedAt,
            authors: [article.author.name], tags: [...article.tags],
        },
    };
}

export function createArticleIndexPageDefinition(language: ArticleLanguage, publication: ArticlePublication): PageMetadataDefinition {
    const brand = publication === 'personal' ? 'Pavol Hejný' : 'Promptbook';
    return {
        path: getArticleInternalPath(language, publication), language,
        title: language === 'cs' ? `Články | ${brand}` : `Articles | ${brand}`,
        socialTitle: language === 'cs' ? 'Myšlenky za kódem' : 'The thinking behind the code',
        description: language === 'cs'
            ? 'O vývoji softwaru, AI agentech a myšlenkách, které stojí za kódem.'
            : 'On software development, AI agents and the thinking behind the code.',
        brand: { name: brand }, isSocialPreviewImageGenerated: true,
        languageAlternates: { cs: getArticleIndexUrl('cs', publication), en: getArticleIndexUrl('en', publication) },
    };
}

export function createArticleIndexMetadata(language: ArticleLanguage, publication: ArticlePublication): Metadata {
    const base = createPageMetadata(createArticleIndexPageDefinition(language, publication));
    return { ...base, title: { absolute: language === 'cs' ? `Články | ${publication === 'personal' ? 'Pavol Hejný' : 'Promptbook'}` : `Articles | ${publication === 'personal' ? 'Pavol Hejný' : 'Promptbook'}` },
        alternates: { ...base.alternates, types: { 'application/rss+xml': getArticlePodcastUrl(language, publication) } } };
}

export function createArticleSocialPreviewOptions(definition: PageMetadataDefinition, publication: ArticlePublication) {
    return createSocialPreviewOptions(definition, {
        brandKind: publication === 'personal' ? 'personal' : 'promptbook',
        eyebrow: definition.language === 'cs' ? 'Články · AI a programování' : 'Articles · AI and programming',
        artwork: publication === 'personal' ? 'person' : 'knowledge',
        paletteSeed: publication === 'personal'
            ? { backgroundStart: '#143d33', backgroundEnd: '#244d40', accent: '#d7b375', accentSoft: '#e9ddc6' }
            : { backgroundStart: '#080c35', backgroundEnd: '#163a81', accent: '#8eb8ff', accentSoft: '#c8d9ff' },
    });
}

export function createArticleStructuredData(article: Article) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${article.canonicalUrl}#article`,
        url: article.canonicalUrl,
        mainEntityOfPage: article.canonicalUrl,
        identifier: article.id,
        headline: article.title,
        description: article.perex,
        inLanguage: article.language,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article.publishedAt,
        author: {
            '@type': 'Person', name: article.author.name,
            url: article.author.domains[article.language], image: article.author.photoUrl,
            sameAs: article.author.socialLinks.map((link) => link.url),
        },
        image: article.coverImage ?? article.author.photoUrl,
        ...(article.translations.length ? {
            workTranslation: article.translations.map((variant) => ({ '@type': 'Article', url: variant.url, inLanguage: variant.language, name: variant.title })),
        } : {}),
        ...(article.audio ? { associatedMedia: { '@type': 'AudioObject', contentUrl: article.audio.url, encodingFormat: article.audio.mimeType, duration: `PT${Math.round(article.audio.duration)}S`, inLanguage: article.language } } : {}),
    };
}
