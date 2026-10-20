import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Download, List } from 'lucide-react';
import type { Article, ArticlePublication } from '@/lib/articles/types';
import { getArticleAssetUrl, getArticleIndexUrl, getArticlePodcastUrl, getArticleUrl } from '@/lib/articles/urls';
import { ArticleHeader, ArticleFooter } from './ArticleShell';
import { ArticleAudioButton } from './ArticleAudioButton';
import { ArticleRssLink } from './ArticleRssLink';
import { ArticleTracking } from './ArticleTracking';
import { AnchoringExplorer } from './AnchoringExplorer';
import { renderArticleDocument } from './articleDocument';
import './articles.css';

export function ArticlePage({ article, publication }: { readonly article: Article; readonly publication: ArticlePublication }) {
    const cs = article.language === 'cs';
    const document = renderArticleDocument(article.markdown, article.title, article.perex, getArticleAssetUrl(article.id, ''));
    const readingMinutes = Math.max(1, Math.ceil(document.wordCount / 200));
    const indexPath = new URL(getArticleIndexUrl(article.language, publication)).pathname;
    const articlePath = new URL(getArticleUrl(article, publication)).pathname;
    const playableArticle = {
        id: article.id,
        title: article.title,
        language: article.language,
        coverImage: article.coverImage,
        audio: article.audio,
        author: { name: article.author.name, photoUrl: article.author.photoUrl },
    };
    const isAnchoringArticle = article.translationGroupId === 'spec-driven-anchoring';
    let explorerInserted = false;
    return (
        <div className="article-site" data-publication={publication} lang={article.language}>
            <ArticleHeader language={article.language} publication={publication} translations={article.translations} />
            <main id="article-main" tabIndex={-1}>
                <header className="article-hero article-container">
                    <Link href={indexPath} className="article-back-link"><ArrowLeft size={15} aria-hidden="true" />{cs ? 'Články a myšlenky' : 'Articles and ideas'}</Link>
                    <div className="article-hero-meta"><span className="article-eyebrow">{article.tags[0] ?? (cs ? 'Technologie' : 'Technology')}</span><span className="article-meta-dot" /><time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(article.publishedAt))}</time></div>
                    <h1>{article.title}</h1>
                    <p className="article-perex">{article.perex}</p>
                    <div className="article-byline"><Image src={article.author.photoUrl} width={46} height={46} alt="" /><div><a href={article.author.domains[article.language] ?? article.canonicalUrl}>{article.author.name}</a><span>{readingMinutes} {cs ? 'min čtení' : 'min read'}</span></div></div>
                    <div className="article-hero-actions"><ArticleAudioButton article={playableArticle} href={articlePath} publication={publication} /><a href={article.pdfUrl} download className="article-button"><Download size={17} aria-hidden="true" />{cs ? 'Stáhnout PDF' : 'Download PDF'}</a><a className="article-text-link" href="#article-contents"><List size={17} aria-hidden="true" />{cs ? 'Obsah článku' : 'Contents'}</a></div>
                    {!article.audio && <p className="article-audio-note">{cs ? 'Audio verze se připravuje.' : 'The audio edition is being prepared.'}</p>}
                </header>
                <div className="article-reading-layout article-container">
                    <aside className="article-contents" id="article-contents">
                        <details open><summary>{cs ? 'V tomto článku' : 'In this article'}</summary><nav aria-label={cs ? 'Kapitoly článku' : 'Article chapters'}>{document.chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`}><span>{(index + 1).toString().padStart(2, '0')}</span>{chapter.title}</a>)}</nav></details>
                    </aside>
                    <div className="article-reading-column">
                        <ArticleTracking articleId={article.id} wordsUrl={article.audio?.wordsUrl}>
                            <article className="article-prose" aria-label={article.title}>
                                {document.sections.map((section, index) => {
                                    const showExplorer = isAnchoringArticle && !explorerInserted && Boolean(section.id?.startsWith('anchoring'));
                                    if (showExplorer) explorerInserted = true;
                                    if (section.id?.startsWith('o-autorovi') || section.id?.startsWith('about-the-author')) {
                                        return <section key={section.id} className="article-authored-bio" aria-labelledby={section.id}><Image src={article.author.photoUrl} width={84} height={84} alt={article.author.name} /><div><div dangerouslySetInnerHTML={{ __html: section.html }} /><a className="article-text-link" href={article.author.domains[article.language] ?? article.canonicalUrl}>{cs ? 'Více o autorovi' : 'About the author'}<ArrowUpRight size={15} aria-hidden="true" /></a></div></section>;
                                    }
                                    return <div key={section.id ?? `introduction-${index}`}><div dangerouslySetInnerHTML={{ __html: section.html }} />{showExplorer && <AnchoringExplorer language={article.language} />}</div>;
                                })}
                            </article>
                        </ArticleTracking>
                        <section className="article-subscribe" aria-labelledby="article-subscribe-title"><p className="article-eyebrow">{cs ? 'Čtení do sluchátek' : 'Ideas to listen to'}</p><h2 id="article-subscribe-title">{cs ? 'Další článek si vezměte s sebou.' : 'Take the next article with you.'}</h2><p>{cs ? 'Přidejte si RSS do své podcastové aplikace. Nové audio články se objeví automaticky.' : 'Add this RSS feed to your podcast app. New audio articles will appear automatically.'}</p><ArticleRssLink language={article.language} url={getArticlePodcastUrl(article.language, publication)} /></section>
                    </div>
                </div>
            </main>
            <ArticleFooter language={article.language} publication={publication} />
        </div>
    );
}
