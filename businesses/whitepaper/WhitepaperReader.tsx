import { Marked } from 'marked';
import { ChevronDown } from 'lucide-react';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { WHITEPAPER_AUTHOR, WHITEPAPER_PATHS, WHITEPAPER_VERSION } from './whitepaperConfig';
import type { WhitepaperContent } from './whitepaperContent';
import { readWhitepaperDocument, splitWhitepaperChapters } from './whitepaperDocument';
import { WhitepaperReaderControls } from './WhitepaperReaderControls';

/** Only the two repository-authored documents reach this server renderer. Raw HTML is deliberately omitted. */
const WHITEPAPER_MARKDOWN = new Marked({
    renderer: {
        html() {
            return '';
        },
        heading({ tokens, depth }) {
            const headingLevel = Math.min(depth + 1, 6);
            return `<h${headingLevel}>${this.parser.parseInline(tokens)}</h${headingLevel}>`;
        },
    },
});

export async function WhitepaperReader({
    language,
    content,
}: {
    readonly language: SupportedHomepageLanguage;
    readonly content: WhitepaperContent['reader'];
}) {
    const document = await readWhitepaperDocument(language);
    const chapters = splitWhitepaperChapters(document);
    const introduction = document
        .split(/^## (?:Abstract|Abstrakt)\s*$/m)[0]
        .replace(/^#{1,2} .+$/gm, '')
        .trim();

    return (
        <section className="wp-reader wp-container" id="read" aria-labelledby="reader-title">
            <div className="wp-section-heading">
                <p className="wp-eyebrow">{content.eyebrow}</p>
                <h2 id="reader-title">{content.title}</h2>
                <p>{content.description}</p>
            </div>
            <div className="wp-reader-meta">
                <span>
                    {content.by} <strong>{WHITEPAPER_AUTHOR}</strong>
                </span>
                <span>v{WHITEPAPER_VERSION}</span>
                <span>{content.translation}</span>
            </div>
            <WhitepaperReaderControls content={content} downloadPath={`${WHITEPAPER_PATHS[language]}/download`} />
            <div className="wp-reader-layout">
                <nav className="wp-chapter-navigation" aria-label={content.contents}>
                    <p className="wp-eyebrow">{content.contents}</p>
                    {chapters.map((chapter) => (
                        <a key={chapter.id} href={`#${chapter.id}`}>
                            <span>{chapter.number}</span>
                            {chapter.title}
                        </a>
                    ))}
                </nav>
                <div className="wp-chapters">
                    <div
                        className="wp-prose wp-reader-introduction"
                        dangerouslySetInnerHTML={{ __html: WHITEPAPER_MARKDOWN.parse(introduction, { async: false }) }}
                    />
                    {chapters.map((chapter) => (
                        <details
                            className="wp-chapter"
                            id={chapter.id}
                            key={chapter.id}
                            open={chapter.id === 'chapter-abstract'}
                        >
                            <summary>
                                <span className="wp-chapter-number">{chapter.number}</span>
                                <h3>{chapter.title}</h3>
                                <ChevronDown size={19} />
                            </summary>
                            <div
                                className="wp-prose"
                                dangerouslySetInnerHTML={{
                                    __html: WHITEPAPER_MARKDOWN.parse(chapter.markdown, { async: false }),
                                }}
                            />
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
