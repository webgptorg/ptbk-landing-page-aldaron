import { ArticleAudioButton } from '@/businesses/articles/ArticleAudioButton';
import { getPersonalArticleListings } from '@/lib/articles/publishedArticles';
import { getArticleListingHref } from '@/lib/articles/urls';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { formatPodcastEpisodeDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { convertMarkdownToPlainText } from '@/lib/text/markdownText';
import { ArrowUpRight, FileText, Headphones, Play } from 'lucide-react';
import Link from 'next/link';
import { pavolMediaAppearances } from './config-media';
import { fetchPavolPodcasts } from './fetchPavolPodcasts';
import { PAVOL_CONTAINER_CLASS_NAME } from './layout';
import { PavolPodcastAudioButton } from './PavolPodcastAudioButton';
import { PavolPodcastIdentity } from './PavolPodcastIdentity';
import { createPavolPodcastTrack, type PavolPodcast } from './pavolPodcasts';
import { selectPavolHomepageItems, type PavolHomepageItem } from './pavolHomepageSelection';

function excerpt(text: string): string {
    const plain = convertMarkdownToPlainText(text).replace(/\s+/g, ' ').trim();
    return plain.length <= 115 ? plain : `${plain.slice(0, 115).replace(/\s+\S*$/, '').trimEnd()}…`;
}

function dateLabel(date: string, language: SupportedHomepageLanguage): string {
    return new Intl.DateTimeFormat(language === 'cs' ? 'cs-CZ' : 'en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Prague',
    }).format(new Date(date));
}

function PodcastFeature({ podcast, language }: {
    readonly podcast: PavolPodcast;
    readonly language: SupportedHomepageLanguage;
}) {
    const cs = language === 'cs';
    const track = createPavolPodcastTrack(podcast, language);
    return <article className="pavol-featured-recording" data-homepage-kind="podcast">
        <div className="flex items-center gap-4">
            <PavolPodcastIdentity podcast={podcast} featured />
            <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight">{podcast.source}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[var(--pavol-muted)]">
                    <Headphones size={14} aria-hidden="true" />{cs ? 'Podcast k poslechu' : 'Listen to the podcast'}
                    {podcast.episodeLabel && <span>· {podcast.episodeLabel}</span>}
                    {podcast.language !== language && <span className="pavol-language-badge" aria-label={podcast.language === 'cs' ? 'Audio in Czech' : 'Audio in English'}>· {podcast.language === 'cs' ? 'Audio in Czech' : 'Audio in English'}</span>}
                </p>
            </div>
        </div>
        <h3 lang={podcast.textLanguage ?? podcast.language} className="mt-5 text-xl font-medium leading-snug tracking-tight sm:text-2xl"><a href={podcast.href}>{podcast.title}</a></h3>
        <p lang={podcast.textLanguage ?? language} className="mb-5 mt-3 text-sm leading-relaxed text-[var(--pavol-muted)]">{excerpt(podcast.description)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
            {track ? <PavolPodcastAudioButton track={track} /> : <a href={podcast.href} className="pavol-play-button"><Play size={17} aria-hidden="true" />{cs ? 'Poslechnout u vydavatele' : 'Listen at the publisher'}</a>}
            {podcast.durationInSeconds !== null && <span className="text-xs text-[var(--pavol-muted)]">{formatPodcastEpisodeDuration(podcast.durationInSeconds)}</span>}
            {track && <a href={podcast.href} className="pavol-source-link">{cs ? 'Původní díl' : 'Original episode'}<ArrowUpRight size={14} aria-hidden="true" /></a>}
        </div>
    </article>;
}

function SelectedItem({ selected, language }: {
    readonly selected: PavolHomepageItem;
    readonly language: SupportedHomepageLanguage;
}) {
    if (selected.kind === 'podcast') return <PodcastFeature podcast={selected.item} language={language} />;
    const cs = language === 'cs';
    const article = selected.kind === 'article' ? selected.item : null;
    const media = selected.kind === 'media' ? selected.item : null;
    const href = article ? getArticleListingHref(article, 'personal') : media!.href;
    const title = article?.title ?? media!.title;
    return <article className="pavol-selected-story" data-homepage-kind={selected.kind}>
        <div className="flex items-center gap-3 text-sm font-medium text-[var(--pavol-accent)]">
            <FileText size={19} aria-hidden="true" />
            <span>{article ? (cs ? 'Moje myšlenky' : 'My writing') : media!.source}</span>
            {article && <time dateTime={article.publishedAt} className="text-xs font-normal text-[var(--pavol-muted)]">{dateLabel(article.publishedAt, language)}</time>}
        </div>
        <h3 className="mt-3 text-xl font-medium leading-snug tracking-tight"><Link href={href}>{title}</Link></h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
            {article && <ArticleAudioButton article={{ id: article.id, title: article.title, language: article.language, coverImage: article.coverImage, audio: article.audio, author: { name: article.author.name, photoUrl: article.author.photoUrl } }} href={href} publication="personal" />}
            <Link href={href} className="pavol-source-link">{cs ? 'Číst článek' : 'Read article'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
    </article>;
}

/** Editorial interest leads; recency only breaks ties inside a source or interest level. */
export async function PavolMediaSection({ language, revalidateSeconds }: {
    readonly language: SupportedHomepageLanguage;
    readonly revalidateSeconds: number;
}) {
    const cs = language === 'cs';
    const [articles, podcasts] = await Promise.all([
        getPersonalArticleListings(language), fetchPavolPodcasts(language, revalidateSeconds),
    ]);
    const selected = selectPavolHomepageItems({ language, articles, podcasts, appearances: pavolMediaAppearances[language] });
    const lead = selected.slice(0, 2);
    const rest = selected.slice(2);
    return <section id="writing" tabIndex={-1} className="pavol-section outline-none">
        <div className={PAVOL_CONTAINER_CLASS_NAME}>
            {['articles', 'podcasts', 'talks', 'media'].map(id => <span key={id} id={id} className="block scroll-mt-24" />)}
            <h2 className="pavol-section-title text-4xl font-medium tracking-tight sm:text-5xl">{cs ? 'Píšu a mluvím' : 'Writing & speaking'}</h2>
            {lead.length > 0 && <div className="pavol-recording-features mt-8 grid gap-5 md:grid-cols-2">
                {lead.map(item => <SelectedItem key={item.key} selected={item} language={language} />)}
            </div>}
            {rest.length > 0 && <div className="pavol-editorial-selection mt-6 grid gap-x-9 md:grid-cols-3">
                {rest.map(item => <SelectedItem key={item.key} selected={item} language={language} />)}
            </div>}
            <nav aria-label={cs ? 'Další články a vystoupení' : 'More writing and appearances'} className="mt-5 flex flex-wrap gap-x-7 gap-y-1">
                <Link href="/podcasts" className="pavol-source-link">{cs ? 'Všechny podcasty' : 'All podcasts'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                <Link href="/articles" className="pavol-source-link">{cs ? 'Všechny články' : 'All articles'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                <Link href="/talks" className="pavol-source-link">{cs ? 'Přednášky a akce' : 'Talks and events'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
            </nav>
            {!selected.length && <p className="mt-5 text-[var(--pavol-muted)]">{cs ? 'Další rozhovory a články najdete v přehledech.' : 'Find more conversations and articles in the archives.'}</p>}
        </div>
    </section>;
}
