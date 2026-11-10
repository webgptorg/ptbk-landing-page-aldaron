import { Marked, type Tokens } from 'marked';
import { createYoutubeEmbedUrl, extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';
import type { ArticleLanguage } from '@/lib/articles/types';

export type ArticleDocumentWord = { readonly id: string; readonly text: string };
export type ArticleChapter = { readonly id: string; readonly title: string };

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function decodeText(value: string): string {
    return value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[entity] ?? '');
}

const IMAGE_EXTENSION = /\.(?:png|jpe?g|webp|svg|avif|gif|bmp|ico|apng)$/i;
const VIDEO_EXTENSION = /\.(?:mp4|webm|ogv)$/i;

function getMediaUrl(href: string, assetBaseUrl?: string): string | undefined {
    try {
        const decoded = decodeURIComponent(href);
        if (/[\\\t\r\n]/.test(decoded) || decoded.split(/[/?#]/).some((segment) => segment === '..' || segment === '.')) return;
        if (href.startsWith('/') && !href.startsWith('//')) return href;
        const url = /^https?:\/\//i.test(href)
            ? new URL(href)
            : assetBaseUrl && /^images\/[a-z\d_./-]+$/i.test(href) && IMAGE_EXTENSION.test(href)
                ? new URL(href, assetBaseUrl)
                : undefined;
        if (url && /^https?:$/.test(url.protocol) && !url.username && !url.password) return url.href;
    } catch { /* Invalid paths leave the authored text readable. */ }
}

function getYoutubeStart(url: URL): number | undefined {
    const time = url.searchParams.get('start') ?? url.searchParams.get('t') ?? url.hash.slice(1).replace(/^t=/, '');
    if (/^\d+$/.test(time)) return Number(time);
    const duration = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(time);
    if (duration) return Number(duration[1] ?? 0) * 3600 + Number(duration[2] ?? 0) * 60 + Number(duration[3] ?? 0);
}

/** Cover words have their own stable IDs, so adding cover tracking never renumbers body words. */
export function renderArticleCover(title: string, perex: string) {
    const words: ArticleDocumentWord[] = [];
    const annotate = (text: string, prefix: string) => {
        let index = 0;
        return text.replace(/\S+/g, (word) => {
            const id = `${prefix}${index++}`;
            words.push({ id, text: word });
            return `<span data-article-word="${id}">${escapeHtml(word)}</span>`;
        });
    };
    const titleHtml = annotate(title, 't');
    const perexHtml = annotate(perex, 'p');
    return { titleHtml, perexHtml, words };
}

/** Strip duplicated cover copy only when it is the article's actual authored title/perex. */
export function getArticleBody(markdown: string, title: string, perex: string): string {
    let body = markdown.trim();
    const firstHeading = body.match(/^# (.+)\r?\n/);
    if (firstHeading?.[1].trim() === title.trim()) body = body.slice(firstHeading[0].length).trimStart();
    const firstParagraph = body.split(/\r?\n\s*\r?\n/)[0];
    if (firstParagraph?.replace(/\s+/g, ' ').trim() === perex.replace(/\s+/g, ' ').trim()) {
        body = body.slice(firstParagraph.length).trimStart();
    }
    return body;
}

/** Only the first top-level paragraph is public in the preview of a free member article. */
export function getArticleOpeningParagraph(markdown: string, title: string, perex: string): string {
    const [firstBlock] = new Marked().lexer(getArticleBody(markdown, title, perex)).filter(({ type }) => type !== 'space');
    return firstBlock?.type === 'paragraph' ? firstBlock.raw : '';
}

/**
 * The renderer is also the editorial alignment contract: w0, w1… identify visible body words in order.
 * A recording maps its actual spoken tokens to these IDs explicitly, including many-to-one pronunciations.
 * Raw HTML is omitted, and authored links are limited to safe web/mail/fragment destinations.
 */
export function renderArticleDocument(
    markdown: string,
    title: string,
    perex: string,
    assetBaseUrl?: string,
    { bookExamples = false, mediaLanguage }: { readonly bookExamples?: boolean; readonly mediaLanguage?: ArticleLanguage } = {},
) {
    const words: ArticleDocumentWord[] = [];
    const chapters: ArticleChapter[] = [];
    const usedIds = new Map<string, number>();
    let bookExampleCount = 0;
    let insideLink = false;
    const imageLabel = mediaLanguage === 'cs' ? 'Zvětšit obrázek' : 'Enlarge image';
    const playLabel = mediaLanguage === 'cs' ? 'Přehrát video' : 'Play video';

    function renderImage({ href, text }: Tokens.Image, source = getMediaUrl(href, assetBaseUrl), preview = source): string {
        if (!source) return escapeHtml(text);
        const image = `<img src="${escapeHtml(source)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />`;
        if (!mediaLanguage || insideLink || !preview) return image;
        const label = text ? `${imageLabel} · ${text}` : imageLabel;
        return `<a class="article-image-preview" href="${escapeHtml(preview)}" data-article-image aria-haspopup="dialog" aria-label="${escapeHtml(label)}">${image}</a>`;
    }
    function annotate(value: string, alreadyEscaped = false): string {
        return value.replace(/\S+/g, (word) => {
            const id = `w${words.length}`;
            words.push({ id, text: alreadyEscaped ? decodeText(word) : word });
            return `<span data-article-word="${id}">${alreadyEscaped ? word : escapeHtml(word)}</span>`;
        });
    }
    const renderer = new Marked({
        renderer: {
            html() { return ''; },
            text(token) {
                return 'tokens' in token && token.tokens ? this.parser.parseInline(token.tokens) : annotate(token.text, true);
            },
            codespan({ text }) { return `<code>${annotate(decodeText(text))}</code>`; },
            code({ text, lang }) {
                const syntax = lang?.split(/\s/)[0];
                const language = syntax?.replace(/[^a-z\d-]/gi, '');
                const source = `<pre><code${language ? ` class="language-${language}"` : ''}>${annotate(text)}</code></pre>`;
                if (!bookExamples || syntax?.toLowerCase() !== 'book') return `${source}\n`;
                return `<div class="article-book-example">${source}<div data-article-book="${bookExampleCount++}"></div></div>\n`;
            },
            heading({ tokens, depth, text }) {
                const level = Math.max(2, Math.min(depth, 6));
                const baseId = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\d]+/g, '-').replace(/^-|-$/g, '') || 'kapitola';
                const count = usedIds.get(baseId) ?? 0;
                usedIds.set(baseId, count + 1);
                const id = count ? `${baseId}-${count + 1}` : baseId;
                if (level === 2) chapters.push({ id, title: decodeText(text.replace(/[*_`]/g, '')) });
                return `<h${level} id="${id}">${this.parser.parseInline(tokens)}</h${level}>\n`;
            },
            paragraph({ tokens }) {
                const [link] = tokens;
                const source = mediaLanguage && tokens.length === 1 && link?.type === 'link' && getMediaUrl((link as Tokens.Link).href);
                if (!source) return false;
                const url = new URL(source, 'https://ptbk.io');
                const youtubeId = source.startsWith('/') ? null : extractYoutubeVideoId(source);
                if (!youtubeId && !VIDEO_EXTENSION.test(url.pathname)) return false;
                const caption = `<p class="article-video-source">${this.parser.parseInline(tokens)}</p>`;
                if (!youtubeId) {
                    return `<div class="article-video"><video controls playsinline preload="none" src="${escapeHtml(source)}" aria-label="${playLabel}"></video>${caption}</div>\n`;
                }
                const embed = createYoutubeEmbedUrl(youtubeId, { isAutoplayed: true, isInlinePlayback: true, startAtSeconds: getYoutubeStart(url) });
                return `<div class="article-video"><div class="article-youtube-frame"><a href="${escapeHtml(source)}" data-article-youtube="${escapeHtml(embed)}">${playLabel}</a></div>${caption}</div>\n`;
            },
            link({ href, title: linkTitle, tokens }) {
                const validLink = /^(?:https?:\/\/|mailto:|\/|#)/i.test(href) && !href.startsWith('//');
                const titleAttribute = linkTitle ? ` title="${escapeHtml(linkTitle)}"` : '';
                const mediaUrl = mediaLanguage && getMediaUrl(href, assetBaseUrl);
                const isImageLink = Boolean(mediaUrl && IMAGE_EXTENSION.test(new URL(mediaUrl, 'https://ptbk.io').pathname));
                const [firstToken] = tokens;
                if (mediaLanguage && tokens.length === 1 && firstToken?.type === 'image') {
                    const image = firstToken as Tokens.Image;
                    const source = getMediaUrl(image.href, assetBaseUrl);
                    if (source) {
                        if (mediaUrl && (isImageLink || mediaUrl === source)) return renderImage(image, source, mediaUrl);
                        const preview = renderImage(image, source);
                        if (!validLink) return preview;
                        const destination = linkTitle || (mediaLanguage === 'cs' ? 'Otevřít odkaz' : 'Open link');
                        return `<span class="article-linked-image">${preview}<a class="article-image-destination" href="${escapeHtml(href)}">${escapeHtml(destination)}</a></span>`;
                    }
                }
                insideLink = true;
                const content = this.parser.parseInline(tokens);
                insideLink = false;
                if (mediaUrl && isImageLink) return `<a href="${escapeHtml(mediaUrl)}"${titleAttribute} data-article-image aria-haspopup="dialog">${content}</a>`;
                if (!validLink) return content;
                return `<a href="${escapeHtml(href)}"${titleAttribute}>${content}</a>`;
            },
            image: renderImage,
        },
    });
    const body = getArticleBody(markdown, title, perex);
    const html = renderer.parse(body, { async: false });
    return {
        html,
        chapters,
        words,
        wordCount: words.length,
        hasBookExamples: bookExampleCount > 0,
        sections: html.split(/(?=<h2 id=")/).filter(Boolean).map((section) => ({
            id: section.match(/^<h2 id="([^"]+)"/)?.[1],
            html: section,
        })),
    };
}
