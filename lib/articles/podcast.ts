import type { Article, ArticleLanguage, ArticlePublication } from './types';
import { getArticleIndexUrl, getArticlePodcastUrl, getArticleUrl } from './urls';

/** A podcast is an editorial brand and a language, independently of an article's author. */
export type ArticlePodcastDefinition = {
    readonly title: string;
    readonly description: string;
    readonly author: string;
    readonly imageUrl: string;
    readonly websiteUrl: string;
    readonly feedUrl: string;
};

/** Only existing brand artwork is used; the committed square PNGs are podcast-sized. */
export function getArticlePodcastDefinition(
    language: ArticleLanguage,
    publication: ArticlePublication,
): ArticlePodcastDefinition {
    const isPersonal = publication === 'personal';
    const brand = isPersonal ? 'Pavol Hejný' : 'Promptbook';
    const label = language === 'cs' ? 'CZ' : 'EN';

    return {
        title: `${brand} (${label})`,
        description:
            language === 'cs'
                ? `${brand}: autorské články o umělé inteligenci, programování a technologiích v audio podobě.`
                : `${brand}: audio articles about artificial intelligence, programming and technology.`,
        author: brand,
        imageUrl: `https://ptbk.io/article-podcasts/${isPersonal ? 'pavol-hejny' : 'promptbook'}.png`,
        websiteUrl: getArticleIndexUrl(language, publication),
        feedUrl: getArticlePodcastUrl(language, publication),
    };
}

/** Escape text as XML, including attributes; illegal XML 1.0 control characters cannot be published. */
function xml(value: string | number): string {
    return String(value)
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/** Keep any authored CDATA terminator inside text, rather than allowing it to end the XML node. */
function cdata(value: string): string {
    return `<![CDATA[${value.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

function isPublicHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && Boolean(parsed.hostname);
    } catch {
        return false;
    }
}

/** A pending narration must never become a podcast episode with an imaginary enclosure. */
function hasPublishableAudio(article: Article): boolean {
    const audio = article.audio;
    return Boolean(
        audio &&
            isPublicHttpUrl(audio.url) &&
            Number.isSafeInteger(audio.byteLength) &&
            audio.byteLength > 0 &&
            Number.isFinite(audio.duration) &&
            audio.duration > 0 &&
            audio.mimeType === 'audio/mpeg',
    );
}

function createEpisodeXml(article: Article, publication: ArticlePublication): string {
    const audio = article.audio!;
    const articleUrl = getArticleUrl(article, publication);
    const articleLabel = article.language === 'cs' ? 'Číst článek' : 'Read the article';
    const originalLabel = article.language === 'cs' ? 'Autorský originál' : 'Canonical original';
    const description = `<p>${xml(article.perex)}</p><p><a href="${xml(articleUrl)}">${articleLabel}</a> · <a href="${xml(article.canonicalUrl)}">${originalLabel}</a></p>`;
    const imageUrl = article.coverImage && isPublicHttpUrl(article.coverImage) ? article.coverImage : undefined;

    return `    <item>
      <title>${xml(article.title)}</title>
      <link>${xml(articleUrl)}</link>
      <guid isPermaLink="false">${xml(article.id)}</guid>
      <pubDate>${xml(new Date(article.publishedAt).toUTCString())}</pubDate>
      <description>${cdata(description)}</description>
      <itunes:author>${xml(article.author.name)}</itunes:author>
      <itunes:duration>${Math.round(audio.duration)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
      <enclosure url="${xml(audio.url)}" length="${audio.byteLength}" type="${xml(audio.mimeType)}" />${
          imageUrl ? `\n      <itunes:image href="${xml(imageUrl)}" />` : ''
      }${
          audio.subtitlesUrl && isPublicHttpUrl(audio.subtitlesUrl)
              ? `\n      <podcast:transcript url="${xml(audio.subtitlesUrl)}" type="text/vtt" language="${xml(article.language)}" rel="captions" />`
              : ''
      }
    </item>`;
}

/**
 * Deterministic RSS 2.0 rendered by force-static Next routes at build time.
 * The same article keeps its GUID and exact audio URL across independent feeds.
 * No clock, external service, filesystem mutation, hashing, or TTS call is involved.
 */
export function createArticlePodcastFeed(
    articles: readonly Article[],
    language: ArticleLanguage,
    publication: ArticlePublication,
): string {
    const definition = getArticlePodcastDefinition(language, publication);
    const episodes = articles
        .filter(
            (article) =>
                article.language === language &&
                (publication === 'promptbook' || article.authorId === 'pavol-hejny') &&
                hasPublishableAudio(article),
        )
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
    const newestPublication = episodes[0]?.publishedAt;

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${xml(definition.title)}</title>
    <link>${xml(definition.websiteUrl)}</link>
    <language>${xml(language)}</language>
    <description>${xml(definition.description)}</description>
    <atom:link href="${xml(definition.feedUrl)}" rel="self" type="application/rss+xml" />
    <itunes:author>${xml(definition.author)}</itunes:author>
    <itunes:owner><itunes:name>${xml(definition.author)}</itunes:name></itunes:owner>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <itunes:category text="Technology" />
    <itunes:image href="${xml(definition.imageUrl)}" />
    <image><url>${xml(definition.imageUrl)}</url><title>${xml(definition.title)}</title><link>${xml(definition.websiteUrl)}</link></image>${
        newestPublication ? `\n    <pubDate>${xml(new Date(newestPublication).toUTCString())}</pubDate>` : ''
    }${episodes.length ? `\n${episodes.map((article) => createEpisodeXml(article, publication)).join('\n')}` : ''}
  </channel>
</rss>
`;
}
