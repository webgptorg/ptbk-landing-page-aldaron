import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Headphones } from 'lucide-react';
import type { Article, ArticleLanguage, ArticlePublication } from '@/lib/articles/types';
import { getArticleIndexUrl, getArticlePodcastUrl, getArticleUrl } from '@/lib/articles/urls';
import { ArticleHeader, ArticleFooter } from './ArticleShell';
import { ArticleRssLink } from './ArticleRssLink';
import { ArticleAudioButton } from './ArticleAudioButton';
import { renderArticleDocument } from './articleDocument';
import './articles.css';

export function ArticleIndex({ articles, language, publication }: { readonly articles: readonly Article[]; readonly language: ArticleLanguage; readonly publication: ArticlePublication }) {
    const cs = language === 'cs';
    const otherLanguage = cs ? 'en' : 'cs';
    return (
        <div className="article-site" data-publication={publication} lang={language}>
            <ArticleHeader language={language} publication={publication} translations={[{ language: otherLanguage, url: getArticleIndexUrl(otherLanguage, publication), title: cs ? 'English articles' : 'České články' }]} />
            <main id="article-main" tabIndex={-1} className="article-container article-index">
                <header className="article-index-heading"><span className="article-eyebrow">{publication === 'personal' ? 'Pavol Hejný' : 'Promptbook Journal'}</span><h1>{cs ? 'Myšlenky o tom,\nco přichází dál.' : 'Thinking about\nwhat comes next.'}</h1><p>{cs ? 'O umělé inteligenci, vývoji softwaru a rozhodnutích, která za nás technologie neudělá.' : 'On artificial intelligence, software development, and the decisions technology cannot make for us.'}</p></header>
                {articles.length ? <div className="article-index-list">{articles.map((article, index) => {
                    const minutes = Math.max(1, Math.ceil(renderArticleDocument(article.markdown, article.title, article.perex).wordCount / 200));
                    return <article className="article-index-card" key={article.id}>
                        <Link href={new URL(getArticleUrl(article, publication)).pathname} className="article-index-visual" aria-label={article.title}>
                            {article.coverImage ? <Image src={article.coverImage} width={1200} height={630} alt="" /> : <div className="article-card-diagram" aria-hidden="true"><span>{cs ? 'Záměr' : 'Intent'}</span><span className="article-diagram-line" /><span>{cs ? 'Specifikace' : 'Specification'}</span><span className="article-diagram-line" /><span>{cs ? 'Implementace' : 'Implementation'}</span></div>}
                            <span className="article-index-number">{(index + 1).toString().padStart(2, '0')}</span>
                        </Link>
                        <div className="article-index-card-content"><div className="article-card-meta"><time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(article.publishedAt))}</time><span>{minutes} {cs ? 'min čtení' : 'min read'}</span>{article.audio && <Headphones size={15} aria-label={cs ? 'S audio verzí' : 'Audio available'} />}</div><h2><Link href={new URL(getArticleUrl(article, publication)).pathname}>{article.title}</Link></h2><p>{article.perex}</p>{article.audio && <div className="article-index-audio"><ArticleAudioButton article={{ id: article.id, title: article.title, language: article.language, coverImage: article.coverImage, audio: article.audio, author: { name: article.author.name, photoUrl: article.author.photoUrl } }} href={new URL(getArticleUrl(article, publication)).pathname} publication={publication} /></div>}<div className="article-card-bottom"><span><Image src={article.author.photoUrl} width={28} height={28} alt="" />{article.author.name}</span><Link href={new URL(getArticleUrl(article, publication)).pathname} className="article-round-link" aria-label={`${cs ? 'Číst' : 'Read'}: ${article.title}`}><ArrowUpRight size={22} aria-hidden="true" /></Link></div></div>
                    </article>;
                })}</div> : <section className="article-empty"><BookOpen size={32} strokeWidth={1.25} aria-hidden="true" /><h2>{cs ? 'První texty teprve přijdou.' : 'The first English articles are still ahead.'}</h2><p>{cs ? 'Nové články se objeví zde.' : 'Articles are published in their original language. You can already read the Czech edition.'}</p>{!cs && <a className="article-button" href={getArticleIndexUrl('cs', publication)}>České články<ArrowUpRight size={16} aria-hidden="true" /></a>}</section>}
                <section className="article-index-subscribe"><div><span className="article-eyebrow">{cs ? 'Audio články' : 'Audio articles'}</span><h2>{cs ? 'Na cestu. Na procházku.\nDo sluchátek.' : 'For the road. For a walk.\nFor your headphones.'}</h2></div><ArticleRssLink language={language} url={getArticlePodcastUrl(language, publication)} /></section>
            </main>
            <ArticleFooter language={language} publication={publication} />
        </div>
    );
}
