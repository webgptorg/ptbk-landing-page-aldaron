import type { Article, ArticleLanguage } from '@/lib/articles/types';
import { getArticlePodcastDefinition } from '@/lib/articles/podcast';
import { getArticleUrl } from '@/lib/articles/urls';
import type { PavolPodcast } from './pavolPodcasts';

const xml = (value: string | number) => String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const publicUrl = (value: string | null | undefined) => { try { return Boolean(value && ['https:', 'http:'].includes(new URL(value).protocol)); } catch { return false; } };

/** One existing subscription address per language; source GUIDs and recordings remain unchanged. */
export function createPavolFeed(articles: readonly Article[], podcasts: readonly PavolPodcast[], language: ArticleLanguage): string {
    const definition = getArticlePodcastDefinition(language, 'personal');
    const items = [
        ...articles.filter(article => article.authorId === 'pavol-hejny' && article.language === language).map(article => ({
            id: article.id, title: article.title, href: getArticleUrl(article, 'personal'), description: article.perex,
            publishedAt: article.publishedAt, language: article.language, author: article.author.name,
            audioUrl: article.audio?.url, byteLength: article.audio?.byteLength, duration: article.audio?.duration,
        })),
        ...podcasts.map(podcast => ({
            id: podcast.id, title: podcast.title, href: podcast.href, description: podcast.description,
            publishedAt: podcast.publishedAt, language: podcast.language, author: podcast.source,
            audioUrl: podcast.audioUrl, byteLength: podcast.audioByteLength, duration: podcast.durationInSeconds,
        })),
    ].filter(item => publicUrl(item.href)).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
    const seen = new Set<string>();
    const unique = items.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel><title>${xml(definition.title)}</title><link>${xml(new URL(definition.websiteUrl).origin)}</link><language>${language}</language>
<description>${language === 'cs' ? 'Články, jejich audioverze a podcasty s Pavolem Hejným.' : 'Articles, narrated articles, and podcast appearances with Pavol Hejný. Original recording languages are marked.'}</description>
<atom:link href="${xml(definition.feedUrl)}" rel="self" type="application/rss+xml" />
<itunes:author>Pavol Hejný</itunes:author><itunes:explicit>false</itunes:explicit><itunes:type>episodic</itunes:type><itunes:category text="Technology" /><itunes:image href="${xml(definition.imageUrl)}" />
${unique.map(item => `<item><title>${xml(item.title)}</title><link>${xml(item.href)}</link><guid isPermaLink="false">${xml(item.id)}</guid><pubDate>${xml(new Date(item.publishedAt).toUTCString())}</pubDate><description>${xml(`${item.description}${item.language !== language ? ` (${item.language === 'cs' ? 'Audio in Czech' : 'Audio in English'})` : ''}`)}</description><dc:language>${item.language}</dc:language><itunes:author>${xml(item.author)}</itunes:author>${
        publicUrl(item.audioUrl) ? `<enclosure url="${xml(item.audioUrl!)}" length="${item.byteLength ?? 0}" type="audio/mpeg" />` : ''}${
        item.duration && item.duration > 0 ? `<itunes:duration>${Math.round(item.duration)}</itunes:duration>` : ''}</item>`).join('\n')}
</channel></rss>\n`;
}
