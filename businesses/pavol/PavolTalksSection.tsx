import Image from 'next/image';
import Link from 'next/link';
import { loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';
import { rankContent } from '@/lib/content/contentRanking';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getPavolTalks } from './pavolTalks';
import { PAVOL_CONTAINER_CLASS_NAME } from './layout';
import { PavolSectionHeading } from './PavolSectionHeading';
import { PAVOL_EVENT_PHOTOS } from './pavolEventPhotos';
import { EventDescription } from '@/components/events/EventDescription';

export async function PavolTalksSection({ language, isArchive = false }: { readonly language: SupportedHomepageLanguage; readonly isArchive?: boolean }) {
    const cs = language === 'cs';
    const all = getPavolTalks(await loadPublishedWorkshopSummaries(), language);
    const talks = isArchive ? rankContent(all) : rankContent(all.filter(talk => talk.prominence !== 0)).slice(0, 4);
    return <section id="talks" tabIndex={-1} className="pavol-section outline-none">
        <div className={PAVOL_CONTAINER_CLASS_NAME}>
            <PavolSectionHeading as={isArchive ? 'h1' : 'h2'} eyebrow={cs ? 'Setkáme se' : 'Meet in person'} title={cs ? 'Akce, přednášky a workshopy' : 'Events, talks and workshops'}
                description={cs ? 'Od webových technologií po AI agenty. Záznamy přednášek a termíny workshopů, které vedu.' : 'From web technologies to AI agents. Talk recordings and dates of workshops I teach. Event details may be in Czech.'} />
            <div className="mt-8 grid gap-5 md:grid-cols-2">{talks.map(talk => <article key={talk.id} className="overflow-hidden rounded-2xl border border-[var(--pavol-border)] bg-white p-6">
                <p className="text-xs text-[var(--pavol-muted)]">{talk.source}{talk.publishedAt && <> · <time dateTime={talk.publishedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { dateStyle: 'medium', timeZone: 'Europe/Prague' }).format(new Date(talk.publishedAt))}</time></>}</p>
                <h3 className="mt-3 text-2xl font-medium" lang={talk.textLanguage}><a href={talk.href}>{talk.title}</a></h3>
                <div lang={talk.textLanguage}><EventDescription className="my-4 text-sm leading-relaxed text-[var(--pavol-muted)]" description={talk.description} /></div>
                <a href={talk.href} className="pavol-source-link">{cs ? 'Podrobnosti a záznam' : 'Details and recording'} ↗</a>
            </article>)}</div>
            {!isArchive && <Link href="/talks" className="pavol-source-link mt-6">{cs ? 'Všechny akce' : 'All events'} →</Link>}
            <div className="mt-12">
                <h3 className="text-2xl font-medium">{cs ? 'Z akcí' : 'At events'}</h3>
                <div className="mt-5 grid gap-5 sm:grid-cols-3">{PAVOL_EVENT_PHOTOS.map(photo => <figure key={photo.src} className="overflow-hidden rounded-xl border border-[var(--pavol-border)] bg-white">
                    <a href={photo.href} target="_blank" rel="noopener noreferrer" className="group block">
                        <Image src={photo.src} alt={`${photo.title}: ${cs ? photo.captionCs : photo.captionEn}`} width={800} height={533} sizes="(min-width: 640px) 30vw, 90vw" className="aspect-[3/2] h-auto w-full object-cover transition-transform group-hover:scale-[1.025] motion-reduce:transform-none" />
                        <figcaption className="p-4"><strong className="block text-sm font-medium">{photo.title} ↗</strong>
                            <span className="mt-1 block text-xs text-[var(--pavol-muted)]">{cs ? photo.dateCs : photo.dateEn}</span>
                            <span className="mt-2 block text-sm text-[var(--pavol-muted)]">{cs ? photo.captionCs : photo.captionEn}</span>
                        </figcaption>
                    </a>
                </figure>)}</div>
            </div>
        </div>
    </section>;
}
