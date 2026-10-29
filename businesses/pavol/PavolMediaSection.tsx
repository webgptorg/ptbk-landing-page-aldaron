import {
    pavolMediaAppearances as PAVOL_MEDIA_APPEARANCES,
    pavolMediaMoreHref as PAVOL_MEDIA_MORE_URL,
    type PavolMediaAppearance,
} from '@/businesses/pavol/config-media';
import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleAudioButton } from '@/businesses/articles/ArticleAudioButton';
import { getArticles } from '@/lib/articles/load';
import { getArticleIndexUrl, getArticleUrl } from '@/lib/articles/urls';
import { fetchPavolPodcasts } from './fetchPavolPodcasts';
import { PavolPodcastCard } from './PavolPodcastCard';
import { createPublicUrl } from '@/lib/domains/publicDomainRouting';
import { AI_TA_KRAJTA_SECTION_IDS } from '@/businesses/ai-ta-krajta/config';

function MediaAppearanceCard({ appearance }: { readonly appearance: PavolMediaAppearance }) {
    const IS_HIGHLIGHT = appearance.importance === 'highlight';
    return (
        <article className="h-full">
            <a
                href={appearance.href}
                className={cn(
                    'group flex h-full overflow-hidden rounded-2xl border border-[var(--pavol-border)] bg-white transition-colors hover:border-[var(--pavol-accent)]',
                    IS_HIGHLIGHT ? 'flex-col' : 'flex-col gap-5 p-5 sm:flex-row',
                )}
            >
                <div
                    aria-hidden="true"
                    style={
                        appearance.thumbnailBackgroundColor
                            ? { backgroundColor: appearance.thumbnailBackgroundColor }
                            : undefined
                    }
                    className={cn(
                        'relative flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-3xl font-bold',
                        IS_HIGHLIGHT ? 'h-56 w-full sm:h-64' : 'h-32 w-full rounded-lg sm:h-28 sm:w-40',
                        appearance.thumbnailClassName,
                    )}
                >
                    {appearance.imageSrc ? (
                        <Image
                            src={appearance.imageSrc}
                            alt=""
                            fill
                            sizes={
                                IS_HIGHLIGHT
                                    ? '(min-width: 1280px) 520px, (min-width: 768px) 42vw, 90vw'
                                    : '(min-width: 640px) 160px, 90vw'
                            }
                            className="object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
                        />
                    ) : (
                        (appearance.thumbnailLabel ?? appearance.source)
                    )}
                </div>
                <div className={cn('flex min-w-0 flex-1 flex-col', IS_HIGHLIGHT && 'p-6 sm:p-8')}>
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--pavol-accent)]">
                        <span>
                            {appearance.kind}{' '}
                            <span aria-hidden="true" className="px-1 text-slate-400">
                                /
                            </span>{' '}
                            {appearance.source}
                        </span>
                        <span className={IS_HIGHLIGHT ? 'pavol-link-arrow' : undefined}>
                            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                        </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-medium leading-snug tracking-tight text-[var(--pavol-ink)]">
                        {appearance.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--pavol-muted)]">{appearance.description}</p>
                </div>
            </a>
        </article>
    );
}

/** Server-rendered sources stay outside the contact form's client boundary. */
export async function PavolMediaSection({ language, revalidateSeconds }: {
    readonly language: SupportedHomepageLanguage; readonly revalidateSeconds: number;
}) {
    const cs = language === 'cs';
    const content = PAVOL_PAGE_CONTENT[language].media;
    const articles = getArticles(language, 'personal');
    const { appearances, aiTaKrajta } = await fetchPavolPodcasts(language, revalidateSeconds);
    const showUrl = createPublicUrl(`/ai-ta-krajta?person=pavol-hejny&archive=1#${AI_TA_KRAJTA_SECTION_IDS.EPISODES}`);
    return <>
        <section id="media" tabIndex={-1} className="pavol-section bg-[var(--pavol-warm)] outline-none">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
                <h3 className="mt-10 text-xl font-medium">{cs ? 'Moje články' : 'My articles'}</h3>
                {articles.length ? <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {articles.map((article) => {
                        const href = new URL(getArticleUrl(article, 'personal')).pathname;
                        return <article key={article.id} className="pavol-article-card">
                            <time dateTime={article.publishedAt} className="pavol-recording-meta">{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' }).format(new Date(article.publishedAt))}</time>
                            <h4><Link href={href}>{article.title}</Link></h4>
                            <p>{article.perex}</p>
                            <div className="pavol-recording-actions">
                                <ArticleAudioButton article={{ id: article.id, title: article.title, language: article.language, coverImage: article.coverImage, audio: article.audio, author: { name: article.author.name, photoUrl: article.author.photoUrl } }} href={href} publication="personal" />
                                <Link href={href} className="pavol-source-link">{cs ? 'Číst článek' : 'Read article'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                            </div>
                        </article>;
                    })}
                </div> : <p className="mt-5 text-[var(--pavol-muted)]">{cs ? 'Nové články se objeví zde.' : 'English articles are still ahead. You can already read and listen to the Czech edition.'}{!cs && <> <a href={getArticleIndexUrl('cs', 'personal')} className="underline underline-offset-4">České články ↗</a></>}</p>}
                <Link href="/articles" className="pavol-source-link mt-6">{cs ? 'Všechny články' : 'All articles'}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                <details className="group/media mt-8 border-y border-[var(--pavol-border)] py-6">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-base font-medium [&::-webkit-details-marker]:hidden">
                        <span>{content.restLabel} <span className="ml-2 font-mono text-sm font-normal text-[var(--pavol-muted)]">({PAVOL_MEDIA_APPEARANCES[language].length})</span></span>
                        <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-open/media:rotate-180" />
                    </summary>
                    <div className="mt-6 space-y-4">{PAVOL_MEDIA_APPEARANCES[language].map((appearance) => <MediaAppearanceCard key={appearance.href} appearance={appearance} />)}</div>
                </details>
                <a href={PAVOL_MEDIA_MORE_URL} className="pavol-source-link mt-5">{content.moreLabel}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
            </div>
        </section>
        <section id="podcasts" tabIndex={-1} className="pavol-section outline-none">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading eyebrow={cs ? 'Do sluchátek' : 'For your headphones'} title={cs ? 'Podcasty, kde mě uslyšíte' : 'Podcasts you can hear me on'} description={cs ? 'Rozhovory o AI, vývoji a vzdělávání. Poslouchejte přímo tady, nebo otevřete původní díl.' : 'Conversations about AI, software, and education. Listen here or open the original episode. Czech recordings are marked with a flag.'} />
                <h3 className="mt-10 text-xl font-medium">{cs ? 'Jako host' : 'Guest appearances'}</h3>
                <div className="pavol-podcast-grid mt-6">{appearances.slice(0, 3).map((podcast) => <PavolPodcastCard key={podcast.id} podcast={podcast} language={language} />)}</div>
                {appearances.length > 3 && <details className="pavol-podcast-archive mt-6">
                    <summary>{cs ? 'Starší rozhovory' : 'Earlier interviews'} <span>({appearances.length - 3})</span><ChevronDown size={18} aria-hidden="true" /></summary>
                    <div className="pavol-podcast-archive-list mt-5">{appearances.slice(3).map((podcast) => <PavolPodcastCard key={podcast.id} podcast={podcast} language={language} compact />)}</div>
                </details>}
                <div className="pavol-podcast-show">
                    <div className="pavol-podcast-show-heading">
                        <h3 className="text-2xl font-medium">AI ta Krajta</h3>
                        <a href={showUrl} className="pavol-source-link">{cs ? 'Všechny moje díly' : 'All my episodes'}<ArrowUpRight size={16} aria-hidden="true" /></a>
                    </div>
                    <p className="mt-3 max-w-3xl text-[var(--pavol-muted)]">{cs ? 'Nejnovější epizody se mnou. Další díly se sem přidávají automaticky.' : 'The latest episodes featuring me, in their original Czech. New appearances are added automatically.'}</p>
                    <div className="pavol-podcast-grid mt-6">{aiTaKrajta.slice(0, 3).map((podcast) => <PavolPodcastCard key={podcast.id} podcast={podcast} language={language} />)}</div>
                    {aiTaKrajta.length > 3 && <details className="pavol-podcast-archive mt-6">
                        <summary>{cs ? 'Další díly se mnou' : 'More episodes featuring me'} <span>({aiTaKrajta.length - 3})</span><ChevronDown size={18} aria-hidden="true" /></summary>
                        <div className="pavol-podcast-archive-list mt-5">{aiTaKrajta.slice(3).map((podcast) => <PavolPodcastCard key={podcast.id} podcast={podcast} language={language} compact />)}</div>
                    </details>}
                </div>
            </div>
        </section>
    </>;
}
