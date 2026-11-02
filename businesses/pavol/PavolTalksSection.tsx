import Image from 'next/image';
import Link from 'next/link';
import { loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';
import { rankContent } from '@/lib/content/contentRanking';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getPavolTalks } from './pavolTalks';
import { PAVOL_CONTAINER_CLASS_NAME } from './layout';
import { PavolSectionHeading } from './PavolSectionHeading';

export async function PavolTalksSection({ language, isArchive = false }: { readonly language: SupportedHomepageLanguage; readonly isArchive?: boolean }) {
    const cs = language === 'cs';
    const all = getPavolTalks(await loadPublishedWorkshopSummaries(), language);
    const talks = isArchive ? rankContent(all) : rankContent(all.filter(talk => talk.prominence !== 0)).slice(0, 4);
    return <section id="talks" tabIndex={-1} className="pavol-section outline-none">
        <div className={PAVOL_CONTAINER_CLASS_NAME}>
            <PavolSectionHeading as={isArchive ? 'h1' : 'h2'} eyebrow={cs ? 'Setkáme se' : 'Meet in person'} title={cs ? 'Přednášky a workshopy' : 'Talks and workshops'}
                description={cs ? 'Od webových technologií po AI agenty. Záznamy přednášek a termíny workshopů, které vedu.' : 'From web technologies to AI agents. Talk recordings and dates of workshops I teach. Event details may be in Czech.'} />
            <div className="mt-8 grid gap-5 md:grid-cols-2">{talks.map(talk => <article key={talk.id} className="overflow-hidden rounded-2xl border border-[var(--pavol-border)] bg-white p-6">
                <p className="text-xs text-[var(--pavol-muted)]">{talk.source}{talk.publishedAt && <> · <time dateTime={talk.publishedAt}>{new Intl.DateTimeFormat(cs ? 'cs-CZ' : 'en-GB', { dateStyle: 'medium', timeZone: 'Europe/Prague' }).format(new Date(talk.publishedAt))}</time></>}</p>
                <h3 className="mt-3 text-2xl font-medium" lang={talk.textLanguage}><a href={talk.href}>{talk.title}</a></h3>
                <p className="my-4 text-sm leading-relaxed text-[var(--pavol-muted)]" lang={talk.textLanguage}>{talk.description}</p>
                <a href={talk.href} className="pavol-source-link">{cs ? 'Podrobnosti a záznam' : 'Details and recording'} ↗</a>
            </article>)}</div>
            {!isArchive && <Link href="/talks" className="pavol-source-link mt-6">{cs ? 'Všechny přednášky a workshopy' : 'All talks and workshops'} →</Link>}
            <div className="mt-12">
                <h3 className="text-2xl font-medium">{cs ? 'Z přednášky' : 'At a talk'}</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">{[1, 2, 3].map(number => <a key={number} href={`/pavol/gallery/talk-${number}.jpg`} className="block overflow-hidden rounded-xl">
                    <Image src={`/pavol/gallery/talk-${number}.jpg`} alt={cs ? `Pavol Hejný při přednášce, záběr ${number}` : `Pavol Hejný speaking at a talk, photo ${number}`} width={1283} height={855} sizes="(min-width: 640px) 30vw, 90vw" className="aspect-[3/2] h-auto w-full object-cover" />
                </a>)}</div>
            </div>
        </div>
    </section>;
}
