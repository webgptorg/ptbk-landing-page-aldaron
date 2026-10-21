import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { z } from 'zod';
import { getArticleAuthor } from './authors';
import type { Article, ArticleLanguage, ArticlePublication, ArticleTechnicalMetadata } from './types';
import { getArticleAssetPath, getArticleAssetUrl } from './urls';

const editorialSchema = z.object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    translationGroupId: z.string().min(1),
    authorId: z.string().min(1),
    language: z.enum(['cs', 'en']),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    perex: z.string().min(1),
    publishedAt: z.string().refine((value) => Number.isFinite(Date.parse(value)), 'A quoted ISO publication date is required'),
    updatedAt: z.string().refine((value) => Number.isFinite(Date.parse(value))).optional(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    status: z.enum(['published', 'draft']).default('published'),
});

export const ARTICLES_DIRECTORY = join(process.cwd(), 'articles');

/** Only assets inside the selected article may be read; URLs cannot escape the committed article directory. */
export function getArticleFilePath(id: string, file: string): string | undefined {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || file.includes('\\') || file.startsWith('/')) return undefined;
    const articleDirectory = resolve(ARTICLES_DIRECTORY, id);
    const candidate = resolve(articleDirectory, file);
    const relativePath = relative(articleDirectory, candidate);
    if (!relativePath || relativePath.startsWith(`..${sep}`) || relativePath === '..' || relativePath.startsWith('/')) return undefined;
    return candidate;
}

/** Technical hashes remain passive provenance. Loading and building never compare them or call a TTS provider. */
function loadArticle(id: string): Article | undefined {
    const directory = join(ARTICLES_DIRECTORY, id);
    const metadataPath = join(directory, 'metadata.yaml');
    if (!existsSync(metadataPath)) return undefined;
    const metadata = editorialSchema.parse(loadYaml(readFileSync(metadataPath, 'utf8')));
    if (metadata.id !== id) throw new Error(`Article folder ${id} must match its stable metadata ID`);
    if (metadata.status !== 'published') return undefined;
    const author = getArticleAuthor(metadata.authorId);
    if (!author) throw new Error(`Unknown article author ${metadata.authorId}`);
    const canonicalOrigin = author.domains[metadata.language];
    if (!canonicalOrigin) throw new Error(`Author ${author.id} needs a canonical ${metadata.language} domain`);
    const technicalPath = join(directory, 'metadata.json');
    const technical = existsSync(technicalPath)
        ? JSON.parse(readFileSync(technicalPath, 'utf8')) as ArticleTechnicalMetadata
        : undefined;
    const recording = technical?.audio;
    const recordingFile = recording?.file ? getArticleFilePath(id, recording.file) : undefined;
    const recordingIsReady = recording?.status === 'ready'
        && typeof recording.durationSeconds === 'number'
        && Number.isFinite(recording.durationSeconds)
        && recording.durationSeconds > 0
        && recordingFile && existsSync(recordingFile);
    const optionalAsset = (file?: string, sameOrigin = false) => {
        const path = file ? getArticleFilePath(id, file) : undefined;
        return file && path && existsSync(path) ? (sameOrigin ? getArticleAssetPath(id, file) : getArticleAssetUrl(id, file)) : undefined;
    };
    return {
        ...metadata,
        author,
        markdown: readFileSync(join(directory, 'content.md'), 'utf8'),
        canonicalUrl: `${canonicalOrigin.replace(/\/$/, '')}/articles/${metadata.slug}`,
        pdfUrl: getArticleAssetUrl(id, 'article.pdf'),
        coverImage: metadata.coverImage
            ? /^https?:\/\//.test(metadata.coverImage) ? metadata.coverImage : getArticleAssetUrl(id, metadata.coverImage)
            : undefined,
        audio: recordingIsReady ? {
            url: getArticleAssetUrl(id, recording!.file!),
            duration: recording!.durationSeconds!,
            byteLength: statSync(recordingFile).size,
            mimeType: 'audio/mpeg',
            wordsUrl: optionalAsset(recording!.wordsFile, true),
            subtitlesUrl: optionalAsset(recording!.subtitlesFile),
        } : undefined,
        translations: [],
    };
}

/** A build reads committed variants; publication depends on explicit metadata, never a database or the build clock. */
export function getAllArticles(): Article[] {
    if (!existsSync(ARTICLES_DIRECTORY)) return [];
    const articles = readdirSync(ARTICLES_DIRECTORY, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^[a-z0-9][a-z0-9-]*$/.test(entry.name))
        .map((entry) => loadArticle(entry.name))
        .filter((article): article is Article => article !== undefined)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
    const variants = new Set<string>();
    for (const article of articles) {
        const key = `${article.language}/${article.slug}`;
        if (variants.has(key)) throw new Error(`Duplicate article URL ${key}`);
        variants.add(key);
    }
    return articles.map((article) => ({
        ...article,
        translations: articles
            .filter((candidate) => candidate.translationGroupId === article.translationGroupId && candidate.language !== article.language)
            .map((candidate) => ({ language: candidate.language, url: candidate.canonicalUrl, title: candidate.title })),
    }));
}

export function getArticles(language: ArticleLanguage, publication: ArticlePublication = 'promptbook'): Article[] {
    return getAllArticles().filter((article) => article.language === language
        && (publication === 'promptbook' || article.authorId === 'pavol-hejny'));
}

export function getArticle(slug: string, language: ArticleLanguage, publication: ArticlePublication = 'promptbook'): Article | undefined {
    return getArticles(language, publication).find((article) => article.slug === slug);
}

const publicAssetPattern = /^(?:content\.md|article\.pdf|images\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|svg|avif)|audio\/(?:narration\.mp3|subtitles\.vtt|words\.json))$/;

/** Enumerate only published static downloads; technical provenance and draft speech scripts stay in Git. */
export function getArticleAssetParams(): { id: string; file: string[] }[] {
    const walk = (directory: string, prefix = ''): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const file = `${prefix}${entry.name}`;
        return entry.isDirectory() ? walk(join(directory, entry.name), `${file}/`) : [file];
    });
    return getAllArticles().flatMap((article) => walk(join(ARTICLES_DIRECTORY, article.id))
        .filter((file) => publicAssetPattern.test(file))
        .map((file) => ({ id: article.id, file: file.split('/') })));
}

export function getPublicArticleAsset(id: string, file: string): { path: string; mimeType: string } | undefined {
    if (!publicAssetPattern.test(file) || !getAllArticles().some((article) => article.id === id)) return undefined;
    const path = getArticleFilePath(id, file);
    if (!path || !existsSync(path) || !statSync(path).isFile()) return undefined;
    const extension = file.split('.').pop();
    const mimeTypes: Record<string, string> = {
        md: 'text/markdown; charset=utf-8', pdf: 'application/pdf', mp3: 'audio/mpeg',
        vtt: 'text/vtt; charset=utf-8', json: 'application/json; charset=utf-8',
        svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
        webp: 'image/webp', avif: 'image/avif',
    };
    return { path, mimeType: mimeTypes[extension ?? ''] ?? 'application/octet-stream' };
}
