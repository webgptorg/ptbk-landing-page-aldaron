import { Marked } from 'marked';

export type ArticleDocumentWord = { readonly id: string; readonly text: string };
export type ArticleChapter = { readonly id: string; readonly title: string };

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function decodeText(value: string): string {
    return value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[entity] ?? '');
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

/**
 * The renderer is also the editorial alignment contract: w0, w1… identify visible body words in order.
 * A recording maps its actual spoken tokens to these IDs explicitly, including many-to-one pronunciations.
 * Raw HTML is omitted, and authored links are limited to safe web/mail/fragment destinations.
 */
export function renderArticleDocument(markdown: string, title: string, perex: string, assetBaseUrl?: string) {
    const words: ArticleDocumentWord[] = [];
    const chapters: ArticleChapter[] = [];
    const usedIds = new Map<string, number>();
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
                const language = lang?.split(/\s/)[0].replace(/[^a-z\d-]/gi, '');
                return `<pre><code${language ? ` class="language-${language}"` : ''}>${annotate(text)}</code></pre>\n`;
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
            link({ href, title: linkTitle, tokens }) {
                const content = this.parser.parseInline(tokens);
                if (!/^(?:https?:\/\/|mailto:|\/|#)/i.test(href) || href.startsWith('//')) return content;
                return `<a href="${escapeHtml(href)}"${linkTitle ? ` title="${escapeHtml(linkTitle)}"` : ''}>${content}</a>`;
            },
            image({ href, text }) {
                let source: string | undefined;
                try {
                    const decoded = decodeURIComponent(href);
                    if (decoded.includes('\\') || decoded.split(/[/?#]/).some((segment) => segment === '..' || segment === '.')) return escapeHtml(text);
                    if (/^images\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|svg|avif)$/i.test(href) && assetBaseUrl) {
                        const base = new URL(assetBaseUrl);
                        if (/^https?:$/.test(base.protocol) && !base.username && !base.password) source = new URL(href, base).href;
                    } else if (/^https?:\/\//i.test(href)) {
                        const image = new URL(href);
                        if (!image.username && !image.password) source = image.href;
                    } else if (href.startsWith('/') && !href.startsWith('//')) source = href;
                } catch { /* Invalid paths leave the authored alternative text readable. */ }
                if (!source) return escapeHtml(text);
                return `<img src="${escapeHtml(source)}" alt="${escapeHtml(text)}" loading="lazy" />`;
            },
        },
    });
    const body = getArticleBody(markdown, title, perex);
    const html = renderer.parse(body, { async: false });
    return {
        html,
        chapters,
        words,
        wordCount: words.length,
        sections: html.split(/(?=<h2 id=")/).filter(Boolean).map((section) => ({
            id: section.match(/^<h2 id="([^"]+)"/)?.[1],
            html: section,
        })),
    };
}
