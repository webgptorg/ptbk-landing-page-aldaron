import { ArticleAudioButton } from '@/businesses/articles/ArticleAudioButton';
import { getPersonalArticleListings } from '@/lib/articles/publishedArticles';
import { getArticleListingHref } from '@/lib/articles/urls';
import { rankContent } from '@/lib/content/contentRanking';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { pavolMediaAppearances } from './config-media';
import { fetchPavolPodcasts } from './fetchPavolPodcasts';
import { PAVOL_CONTAINER_CLASS_NAME } from './layout';
import { PavolPodcastAudioButton } from './PavolPodcastAudioButton';
import { createPavolPodcastTrack } from './pavolPodcasts';
import { getPavolTalks } from './pavolTalks';

/** A homepage excerpt keeps authored wording; complete descriptions remain in the archives. */
function excerpt(text: string): string {
    const plain = convertMarkdownToPlainText(text).replace(/\s+/g, ' ').trim();
    return plain.length <= 150 ? plain : `${plain.slice(0, 150).replace(/\s+\S*$/, '').trimEnd()}…`;
}

function dateLabel(date: string, language: SupportedHomepageLanguage): string {
    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Prague',
    }).format(new Date(date));
}

/** Server-rendered sources stay outside the contact form's client boundary. */
export async function PavolMediaSection({ language, revalidateSeconds }: {
    readonly language: SupportedHomepageLanguage;
    readonly revalidateSeconds: number;
}) {
    const cs = language === 'cs';
    const [allArticles, allPodcasts, workshops] = await Promise.all([
        getPersonalArticleListings(language),
        fetchPavolPodcasts(language, revalidateSeconds),
        loadPublishedWorkshopSummaries(),
    ]);
    const article = allArticles.filter(item => item.language === language && item.prominence !== 0)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
    // English readers get an English recording on the homepage; the full archive keeps every language.
    const podcast = allPodcasts.filter(item => item.language === language && item.prominence !== 0)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
    const track = podcast ? createPavolPodcastTrack(podcast, language) : null;
    const now = Date.now();
    const allTalks = getPavolTalks(workshops, language).filter(talk => talk.prominence !== 0
        && (!talk.textLanguage || talk.textLanguage === language));
    const currentEventIds = new Set(workshops.filter(workshop => !isWorkshopPhasePast(getWorkshopPhase(workshop, now)))
        .map(workshop => workshop.slug));
    const currentTalks = allTalks.filter(talk => currentEventIds.has(talk.id))
        .sort((a, b) => (Date.parse(a.publishedAt ?? '') || 0) - (Date.parse(b.publishedAt ?? '') || 0));
    const talk = currentTalks[0] ?? rankContent(allTalks)[0];
    const press = rankContent(pavolMediaAppearances[language].filter(appearance => appearance.kind !== 'Přednáška' && appearance.kind !== 'Talk'));
    const articleHref = article ? getArticleListingHref(article, 'personal') : null;

    return <section id="writing" tabIndex={-1} className="pavol-section outline-none">
        <div className={PAVOL_CONTAINER_CLASS_NAME}>
            {/* Existing shared links still land at the now unified selection. */}
            {['articles', 'podcasts', 'talks', 'media'].map(id => <span key={id} id={id} className="block scroll-mt-24" />)}
            <h2 className="pavol-section-title text-4xl font-medium tracking-tight sm:text-5xl">{cs ? 'Píšu a mluvím' : 'Writing & speaking'}</h2>
            <div className="mt-8 divide-y divide-[var(--pavol-border)] border-y border-[var(--pavol-border)]">
                {article && articleHref && <article className="py-6 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
                    <div className="pavol-recording-meta content-start"><span>{cs ? 'Článek' : 'Article'}</span><time dateTime={article.publishedAt}>{dateLabel(article.publishedAt, language)}</time></div>
                    <div>
                        <h3 className="mt-2 text-xl font-medium tracking-tight sm:mt-0 sm:text-2xl"><Link href={articleHref}>{article.title}</Link></h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--pavol-muted)]">{excerpt(article.perex)}</p>
                        <div className="pavol-recording-actions mt-3">
                            <ArticleAudioButton article={{ id: article.id, title: article.title, language: article.language, coverImage: article.coverImage, audio: article.audio, author: { name: article.author.name, photoUrl: article.author.photoUrl } }} href={articleHref} publication="personal" />
                            <Link href={articleHref} className="pavol-source-link">{cs ? 'Číst článek' : 'Read article'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                        </div>
                    </div>
                </article>}
                {podcast && <article className="py-6 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
                    <div className="pavol-recording-meta content-start"><span>{podcast.source} {podcast.episodeLabel}</span><time dateTime={podcast.publishedAt}>{dateLabel(podcast.publishedAt, language)}</time></div>
                    <div>
                        <h3 lang={podcast.textLanguage ?? podcast.language} className="mt-2 text-xl font-medium tracking-tight sm:mt-0 sm:text-2xl"><a href={podcast.href}>{podcast.title}</a></h3>
                        <p lang={podcast.textLanguage ?? language} className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--pavol-muted)]">{excerpt(podcast.description)}</p>
                        <div className="pavol-recording-actions mt-3">
                            {track && <PavolPodcastAudioButton track={track} />}
                            <a href={podcast.href} className="pavol-source-link">{cs ? 'Původní díl' : 'Original episode'}<ArrowUpRight size={15} aria-hidden="true" /></a>
                        </div>
                    </div>
                </article>}
                {talk && <article className="py-6 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
                    <div className="pavol-recording-meta content-start"><span>{currentEventIds.has(talk.id) ? (cs ? 'Setkáme se' : 'Upcoming event') : talk.source}</span>{talk.publishedAt && <time dateTime={talk.publishedAt}>{dateLabel(talk.publishedAt, language)}</time>}</div>
                    <div lang={talk.textLanguage}>
                        <h3 className="mt-2 text-xl font-medium tracking-tight sm:mt-0 sm:text-2xl"><a href={talk.href}>{talk.title}</a></h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--pavol-muted)]">{excerpt(talk.description)}</p>
                        <a href={talk.href} className="pavol-source-link mt-3">{cs ? 'Podrobnosti' : 'Details'}<ArrowUpRight size={15} aria-hidden="true" /></a>
                    </div>
                </article>}
            </div>
            <nav aria-label={cs ? 'Další články a vystoupení' : 'More writing and appearances'} className="mt-5 flex flex-wrap gap-x-7 gap-y-1">
                <Link href="/articles" className="pavol-source-link">{cs ? 'Všechny články' : 'All articles'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                <Link href="/podcasts" className="pavol-source-link">{cs ? 'Všechny podcasty' : 'All podcasts'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                <Link href="/talks" className="pavol-source-link">{cs ? 'Všechny akce' : 'All events'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
            </nav>
            {press.length > 0 && <details className="mt-4 border-t border-[var(--pavol-border)] pt-3">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">{cs ? 'V médiích' : 'In the media'}</summary>
                <ul className="space-y-5 pb-3 pt-2">{press.map(appearance => <li key={appearance.href}>
                    <a href={appearance.href} className="pavol-source-link">{appearance.source} · {appearance.title}<ArrowUpRight size={15} aria-hidden="true" /></a>
                    <p className="max-w-2xl text-sm leading-relaxed text-[var(--pavol-muted)]">{appearance.description}</p>
                </li>)}</ul>
            </details>}
        </div>
    </section>;
}
