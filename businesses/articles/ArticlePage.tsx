import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Download, List } from 'lucide-react';
import type { CommunityId } from '@/businesses/community/config';
import { TerminalTourArticleLink } from '@/businesses/terminal-tour/TerminalTourArticleLink';
import { TERMINAL_TOUR_ARTICLE_SECTION_ID } from '@/businesses/terminal-tour/terminalTour';
import type { Article, ArticlePublication } from '@/lib/articles/types';
import { getArticleAssetUrl, getArticleIndexUrl, getArticlePodcastUrl, getArticleUrl } from '@/lib/articles/urls';
import { ArticleHeader, ArticleFooter } from './ArticleShell';
import { ArticleAudioButton } from './ArticleAudioButton';
import { ArticleBookExamples } from './ArticleBookExamples';
import { ArticleMedia } from './ArticleMedia';
import { ArticleRssLink } from './ArticleRssLink';
import { ArticleTracking } from './ArticleTracking';
import { AnchoringExplorer } from './AnchoringExplorer';
import { renderArticleCover, renderArticleDocument } from './articleDocument';
import './articles.css';

export function ArticlePage({ article, publication, community }: {
    readonly article: Article;
    readonly publication: ArticlePublication;
    readonly community?: { readonly id: CommunityId; readonly indexPath: string; readonly articlePath: string };
}) {
    const cs = article.language === 'cs';
    const document = renderArticleDocument(
        article.markdown, article.title, article.perex,
        article.managed ? undefined : getArticleAssetUrl(article.id, ''), { bookExamples: true, mediaLanguage: article.language },
    );
    const cover = renderArticleCover(article.title, article.perex);
    const readingMinutes = Math.max(1, Math.ceil(document.wordCount / 200));
    const indexPath = community?.indexPath ?? new URL(getArticleIndexUrl(article.language, publication)).pathname;
    const articlePath = community?.articlePath ?? new URL(getArticleUrl(article, publication)).pathname;
    const playableArticle = {
        id: article.id,
        title: article.title,
        language: article.language,
        coverImage: article.coverImage,
        audio: article.audio,
        author: { name: article.author.name, photoUrl: article.author.photoUrl },
    };
    const isAnchoringArticle = article.translationGroupId === 'spec-driven-anchoring';
    const isCzechPromptbookArticle = community?.id === 'promptbook' && cs && article.managed;
    let explorerInserted = false;
    const sections = document.sections.map((section, index) => {
        const showExplorer = isAnchoringArticle && !explorerInserted && Boolean(section.id?.startsWith('anchoring'));
        if (showExplorer) explorerInserted = true;
        if (section.id?.startsWith('o-autorovi') || section.id?.startsWith('about-the-author')) {
            return <section key={section.id} className="article-authored-bio" aria-labelledby={section.id}><Image src={article.author.photoUrl} width={84} height={84} alt={article.author.name} /><div><div dangerouslySetInnerHTML={{ __html: section.html }} /><a className="article-text-link" href={article.author.domains[article.language] ?? article.canonicalUrl}>{cs ? 'Více o autorovi' : 'About the author'}<ArrowUpRight size={15} aria-hidden="true" /></a></div></section>;
        }
        return (
            <div key={section.id ?? `introduction-${index}`}>
                <div dangerouslySetInnerHTML={{ __html: section.html }} />
                {showExplorer && <AnchoringExplorer language={article.language} />}
                {isCzechPromptbookArticle && section.id === TERMINAL_TOUR_ARTICLE_SECTION_ID && (
                    <TerminalTourArticleLink articleSlug={article.slug} />
                )}
            </div>
        );
    });
    return (
        <div className="article-site" data-publication={publication} lang={article.language}>
            <ArticleHeader language={article.language} publication={publication} translations={article.translations} indexPath={community?.indexPath} />
            <main id="article-main" tabIndex={-1}>
                <ArticleTracking articleId={article.id} wordsUrl={article.audio?.wordsUrl}>
                    <header className="article-hero article-container">
                        <Link href={indexPath} className="article-back-link"><ArrowLeft size={15} aria-hidden="true" />{community ? (cs ? 'Zpět do komunity' : 'Back to the community') : (cs ? 'Články a myšlenky' : 'Articles and ideas')}</Link>
                        <div className="article-hero-meta"><span className="article-eyebrow">{article.tags[0] ?? (cs ? 'Technologie' : 'Technology')}</span><span className="article-meta-dot" /><time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(article.publishedAt))}</time></div>
                        <h1 dangerouslySetInnerHTML={{ __html: cover.titleHtml }} />
                        <p className="article-perex" dangerouslySetInnerHTML={{ __html: cover.perexHtml }} />
                        <div className="article-byline"><Image src={article.author.photoUrl} width={46} height={46} alt="" /><div><a href={article.author.domains[article.language] ?? article.canonicalUrl}>{article.author.name}</a><span>{readingMinutes} {cs ? 'min čtení' : 'min read'}</span></div></div>
                        <div className="article-hero-actions"><ArticleAudioButton article={playableArticle} href={articlePath} publication={publication} />{article.pdfUrl && <a href={article.pdfUrl} download className="article-button"><Download size={17} aria-hidden="true" />{cs ? 'Stáhnout PDF' : 'Download PDF'}</a>}<a className="article-text-link" href="#article-contents"><List size={17} aria-hidden="true" />{cs ? 'Obsah článku' : 'Contents'}</a></div>
                        {!article.audio && !article.managed && <p className="article-audio-note">{cs ? 'Audio verze se připravuje.' : 'The audio edition is being prepared.'}</p>}
                    </header>
                    <div className="article-reading-layout article-container">
                        <aside className="article-contents" id="article-contents">
                            <details open><summary>{cs ? 'V tomto článku' : 'In this article'}</summary><nav aria-label={cs ? 'Kapitoly článku' : 'Article chapters'}>{document.chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`}><span>{(index + 1).toString().padStart(2, '0')}</span>{chapter.title}</a>)}</nav></details>
                        </aside>
                        <div className="article-reading-column">
                            <ArticleMedia key={article.id} language={article.language}>
                                {document.hasBookExamples
                                    ? <ArticleBookExamples title={article.title}>{sections}</ArticleBookExamples>
                                    : <article className="article-prose" aria-label={article.title}>{sections}</article>}
                            </ArticleMedia>
                            {!community && <section className="article-subscribe" aria-labelledby="article-subscribe-title"><p className="article-eyebrow">{cs ? 'Čtení do sluchátek' : 'Ideas to listen to'}</p><h2 id="article-subscribe-title">{cs ? 'Další článek si vezměte s sebou.' : 'Take the next article with you.'}</h2><p>{cs ? 'Přidejte si RSS do své podcastové aplikace. Nové audio články se objeví automaticky.' : 'Add this RSS feed to your podcast app. New audio articles will appear automatically.'}</p><ArticleRssLink language={article.language} url={getArticlePodcastUrl(article.language, publication)} /></section>}
                        </div>
                    </div>
                </ArticleTracking>
            </main>
            <ArticleFooter language={article.language} publication={publication} indexPath={community?.indexPath} />
        </div>
    );
}
