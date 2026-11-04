'use client';

import type { AiTaKrajtaArchive } from '../AiTaKrajtaEpisode';
import { AiTaKrajtaHero } from '../AiTaKrajtaHero';
import { AiTaKrajtaHeader } from '../AiTaKrajtaHeader';
import { AiTaKrajtaFooter } from '../AiTaKrajtaFooter';
import { AiTaKrajtaEpisodeList } from '../AiTaKrajtaEpisodeList';
import { AiTaKrajtaPeopleSection } from '../AiTaKrajtaPeopleSection';
import { AiTaKrajtaPageStateProvider, useAiTaKrajtaPageState } from '../AiTaKrajtaPageState';
import { AiTaKrajtaCollaborationForm } from '../AiTaKrajtaCollaborationForm';
import { AiTaKrajtaMark } from '../AiTaKrajtaMark';
import { AiTaKrajtaSnakeTerrarium } from '../AiTaKrajtaSnakeTerrarium';
import { AiTaKrajtaLink as Link } from '../AiTaKrajtaLink';
import { AiTaKrajtaSectionHeading } from '../AiTaKrajtaSectionHeading';
import {
    AI_TA_KRAJTA_PARTNERSHIP_OFFERS, AI_TA_KRAJTA_PARTNERSHIP_PROCESS,
    AI_TA_KRAJTA_EDITORIAL_PRINCIPLES, AI_TA_KRAJTA_MEDIA_KIT_STATISTICS,
    AI_TA_KRAJTA_MEDIA_KIT_STATISTICS_SOURCE, AI_TA_KRAJTA_COLLABORATION_GUIDES,
} from '../aiTaKrajtaMediaKitContent';
import {
    AI_TA_KRAJTA_PATH, AI_TA_KRAJTA_EPISODES_PATH, AI_TA_KRAJTA_MEDIA_KIT_PATH,
    AI_TA_KRAJTA_APP_ICONS, AI_TA_KRAJTA_COVER_IMAGE_PATH, AI_TA_KRAJTA_PLATFORMS,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
} from '../config';
import {
    AiTaKrajtaPrototypeNavigationProvider,
    type PrototypeVariant, type PrototypePage,
} from './AiTaKrajtaPrototypeNavigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Play, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { useFixedControlClearance } from '@/hooks/useFixedControlClearance';

// Throwaway branch only. All three layouts compose the real podcast components and current offer data.
const MAIN_OFFER = AI_TA_KRAJTA_PARTNERSHIP_OFFERS.find(offer => offer.id === 'main-show-partner')!;
const MAIN_CONTACT = `${AI_TA_KRAJTA_MEDIA_KIT_PATH}?collaboration=partnerstvi#kontakt`;
const SECTION = 'mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20';
const PRIMARY = 'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ff6b6b] px-6 text-base font-semibold text-[#1a201c] transition-transform hover:scale-[1.02]';
const SECONDARY = 'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-base font-medium text-white transition-colors hover:border-white/50';
const CARD = 'rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8';
const LABELS = { A: 'Pořad a partnerství', B: 'Díly s partnerským panelem', C: 'Partnerství v úvodu' };

function OfferButton({ contact = false, children }: { readonly contact?: boolean; readonly children?: ReactNode }) {
    return <Link href={contact ? MAIN_CONTACT : AI_TA_KRAJTA_MEDIA_KIT_PATH} className={PRIMARY}>
        {children ?? 'Probrat partnerství'}<ArrowUpRight className="h-4 w-4 shrink-0" />
    </Link>;
}

function OfferPrice() {
    return <><p className="mt-4 text-3xl font-bold tracking-tight text-[#ffb1a6] sm:text-4xl">{MAIN_OFFER.priceLabel}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/60">Nejméně tři měsíce · od 117 000 Kč bez DPH celkem.</p></>;
}

function Deliverables() {
    return <ul className="mt-6 space-y-4 text-sm leading-relaxed text-white/65">{MAIN_OFFER.deliverables.map(item =>
        <li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9b8f]" /><span>{item}</span></li>)}
    </ul>;
}

function OfferCard({ contact = false }: { readonly contact?: boolean }) {
    return <article className={cn(CARD, 'border-[#ff6b6b]/30')}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9db1ff]">Dlouhodobé partnerství</p>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">{MAIN_OFFER.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/65">{MAIN_OFFER.description}</p>
        <OfferPrice /><Deliverables /><div className="mt-8"><OfferButton contact={contact} /></div>
    </article>;
}

function PartnerStrip() {
    return <section className="border-y border-white/10 bg-[#1a201c]/45">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div><p className="text-sm font-semibold text-[#b5c2ff]">Partnerství pro firmy</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">{MAIN_OFFER.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{MAIN_OFFER.priceLabel}, nejméně tři měsíce. Celkem od 117 000 Kč bez DPH.</p>
            </div><OfferButton />
        </div>
    </section>;
}

function Intro() {
    const { newestPlayableEpisode, playEpisode } = useAiTaKrajtaPageState();
    return <div className="relative pb-12 pt-12 sm:pb-16 sm:pt-16">
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">AI ta Krajta</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">{AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs}</p>
        <div className="mt-8 flex flex-wrap gap-3"><button type="button" className={PRIMARY}
            disabled={!newestPlayableEpisode} onClick={() => newestPlayableEpisode && playEpisode(newestPlayableEpisode)}>
            <Play className="h-5 w-5 fill-current" />Pustit poslední díl
        </button><Link href={AI_TA_KRAJTA_MEDIA_KIT_PATH} className={SECONDARY}>Partnerství pro firmy</Link></div>
        <ul className="mt-8 flex flex-wrap gap-2">{AI_TA_KRAJTA_PLATFORMS.map(platform => <li key={platform.id}>
            <a href={platform.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:border-white/35">
                {platform.label}<ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </a></li>)}</ul>
    </div>;
}

function Home({ variant }: { readonly variant: PrototypeVariant }) {
    if (variant === 'A') return <><AiTaKrajtaHero partnerActionHref={AI_TA_KRAJTA_MEDIA_KIT_PATH} />
        <PartnerStrip /><AiTaKrajtaEpisodeList /><AiTaKrajtaPeopleSection /></>;
    if (variant === 'B') return <>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div className="lg:col-start-1 lg:row-start-1"><Intro /></div>
            <aside className="row-start-2 pb-12 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-16"><OfferCard />
                <div className="mt-8 hidden lg:block"><AiTaKrajtaSnakeTerrarium /></div></aside>
            <div className="row-start-3 pb-16 lg:col-start-1 lg:row-start-2"><AiTaKrajtaEpisodeList isEmbedded /></div>
        </div><AiTaKrajtaPeopleSection />
    </>;
    return <>
        <section className="relative overflow-hidden border-b border-white/10">
            <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-52 h-[34rem] w-[34rem] rounded-full bg-[#ff6b6b]/10 blur-3xl" />
            <div className={cn(SECTION, 'relative grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16')}>
                <div><p className="text-sm font-semibold text-[#b5c2ff]">Partnerství s AI ta Krajta</p>
                    <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">{MAIN_OFFER.title}</h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{MAIN_OFFER.description}</p>
                    <OfferPrice /><div className="mt-8"><OfferButton /></div>
                    <Link href={AI_TA_KRAJTA_EPISODES_PATH} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b5c2ff]">Poslechnout si podcast<ArrowUpRight className="h-4 w-4" /></Link>
                </div><AiTaKrajtaSnakeTerrarium />
            </div>
        </section><AiTaKrajtaEpisodeList /><AiTaKrajtaPeopleSection />
    </>;
}

/** Capture submission before the real shared form's handler: prototypes must never write to contacts. */
function PreviewContact() {
    const [isDemonstrated, setIsDemonstrated] = useState(false);
    const intercept = (event: FormEvent<HTMLDivElement>) => {
        event.preventDefault(); event.stopPropagation(); setIsDemonstrated(true);
    };
    return <div data-prototype-form onSubmitCapture={intercept}>
        <p className="mb-4 text-xs leading-relaxed text-white/45">Ukázka existujícího formuláře. V prototypu se poptávka neodesílá.</p>
        <AiTaKrajtaCollaborationForm />
        {isDemonstrated && <p role="status" className="mt-4 rounded-xl border border-[#6b8cff]/40 bg-[#6b8cff]/[0.08] p-4 text-sm text-[#b5c2ff]">Ukázka dokončena. Žádná zpráva se neodeslala.</p>}
    </div>;
}

function SupportingDetails() {
    return <section className={SECTION}>
        <details className="border-t border-white/10 py-6"><summary className="cursor-pointer text-lg font-semibold text-white">Redakční pravidla</summary>
            <ul className="mt-5 list-disc space-y-3 pl-4 text-sm leading-relaxed text-white/65">{AI_TA_KRAJTA_EDITORIAL_PRINCIPLES.map(item => <li key={item}>{item}</li>)}</ul>
        </details>
        <details className="border-t border-white/10 py-6"><summary className="cursor-pointer text-lg font-semibold text-white">Media kit: čísla pro partnery</summary>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">{AI_TA_KRAJTA_MEDIA_KIT_STATISTICS.map(stat => <div key={stat.id}>
                <dt className="text-sm text-white/60">{stat.label}</dt><dd className="mt-2 text-2xl font-bold text-white">{stat.value}</dd>
                <p className="mt-2 text-xs text-white/45">{stat.description}</p></div>)}</dl>
            <p className="mt-5 text-xs text-white/45">{AI_TA_KRAJTA_MEDIA_KIT_STATISTICS_SOURCE}</p>
        </details>
        <details className="border-t border-white/10 py-6"><summary className="cursor-pointer text-lg font-semibold text-white">Další možnosti spolupráce</summary>
            <div className="mt-6 grid gap-4 md:grid-cols-2">{AI_TA_KRAJTA_PARTNERSHIP_OFFERS.filter(offer => offer.id !== MAIN_OFFER.id).map(offer => <article key={offer.id} className={CARD}>
                <h3 className="text-xl font-semibold text-white">{offer.title}</h3><p className="mt-3 font-semibold text-[#ffb1a6]">{offer.priceLabel}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{offer.description}</p>
                <Link href={MAIN_CONTACT} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b5c2ff]">{offer.callToActionLabel}<ArrowUpRight className="h-4 w-4" /></Link>
            </article>)}</div>
        </details>
        <details className="border-t border-white/10 py-6"><summary className="cursor-pointer text-lg font-semibold text-white">Hosté a tipy na témata</summary>
            <div className="mt-6 grid gap-4 md:grid-cols-2">{AI_TA_KRAJTA_COLLABORATION_GUIDES.filter(guide => ['host','tema'].includes(guide.collaborationKind)).map(guide => <article key={guide.collaborationKind} className={CARD}>
                <h3 className="text-xl font-semibold text-white">{guide.title}</h3><p className="mt-3 text-sm leading-relaxed text-white/65">{guide.description}</p>
                <Link href={`${AI_TA_KRAJTA_MEDIA_KIT_PATH}?collaboration=${guide.collaborationKind}#kontakt`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b5c2ff]">Napsat redakci<ArrowUpRight className="h-4 w-4" /></Link>
            </article>)}</div>
        </details>
        <details id="podklady" className="scroll-mt-24 border-y border-white/10 py-6"><summary className="cursor-pointer text-lg font-semibold text-white">Logo a podklady</summary>
            <div className="mt-6 flex flex-wrap gap-3">{[[AI_TA_KRAJTA_APP_ICONS.SCALABLE.path,'Logo SVG'],[AI_TA_KRAJTA_APP_ICONS.RASTER.path,'Logo PNG'],[AI_TA_KRAJTA_COVER_IMAGE_PATH,'Obal pořadu']].map(([href,label]) =>
                <a key={href} href={href} target="_blank" rel="noreferrer" className={SECONDARY}>{label}<ArrowUpRight className="h-4 w-4" /></a>)}</div>
            <p className="mt-5 text-sm text-white/60">Název píšeme AI ta Krajta. Logo zachovává původní proporce a barvy.</p>
        </details>
    </section>;
}

function ContactHeading() {
    return <AiTaKrajtaSectionHeading eyebrow="Probrat partnerství" title="Napište nám" description="Napište, čeho chcete spoluprací dosáhnout. Pomůže také téma a termín. Rozsah a další krok si společně potvrdíme." />;
}

function Partners({ variant }: { readonly variant: PrototypeVariant }) {
    return <>
        {variant === 'A' && <>
            <section className="border-b border-white/10"><div className={cn(SECTION,'grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-center')}>
                <div><p className="text-sm font-semibold text-[#b5c2ff]">Spolupráce s AI ta Krajta</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{MAIN_OFFER.title}</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">{MAIN_OFFER.description}</p><OfferPrice /><Deliverables />
                    <div className="mt-8"><OfferButton contact /></div></div><div className="mx-auto w-40 sm:w-56"><AiTaKrajtaMark className="h-full w-full" /></div>
            </div></section>
            <section id="kontakt" className={cn(SECTION,'scroll-mt-24 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]')}><ContactHeading /><PreviewContact /></section>
        </>}
        {variant === 'B' && <>
            <section className={cn(SECTION,'grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start')}>
                <div><p className="text-sm font-semibold text-[#b5c2ff]">Partnerství s AI ta Krajta</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Pravidelně u našeho podcastu.</h1>
                    <p className="mt-6 text-lg leading-relaxed text-white/65">{MAIN_OFFER.description}</p>
                    <h2 className="mt-10 text-2xl font-bold text-white">Jak spolupráce probíhá</h2><ol className="mt-6 space-y-6">{AI_TA_KRAJTA_PARTNERSHIP_PROCESS.map(step => <li key={step.number} className="flex gap-4">
                        <span className="text-sm font-semibold text-[#9db1ff]">{step.number}</span><div><h3 className="text-lg font-semibold text-white">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p></div>
                    </li>)}</ol>
                </div><OfferCard contact />
            </section><section id="kontakt" className="scroll-mt-24 border-y border-white/10 bg-[#1a201c]/45"><div className={cn(SECTION,'grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]')}><ContactHeading /><PreviewContact /></div></section>
        </>}
        {variant === 'C' && <section className={SECTION}><p className="text-sm font-semibold text-[#b5c2ff]">Spolupráce s AI ta Krajta</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{MAIN_OFFER.title}</h1>
            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="lg:sticky lg:top-24"><p className="text-lg leading-relaxed text-white/65">{MAIN_OFFER.description}</p><OfferPrice /><Deliverables />
                    <p className="mt-8 text-sm leading-relaxed text-white/60">{AI_TA_KRAJTA_EDITORIAL_PRINCIPLES[0]} Placená spolupráce je vždy jasně označená.</p>
                </div><div id="kontakt" className="scroll-mt-24"><PreviewContact /></div>
            </div>
        </section>}
        <SupportingDetails />
    </>;
}

const REVIEWS: Record<PrototypeVariant, readonly [string,string,string][]> = {
    A: [
        ['Bílý — fakta','Ceny a plnění čte přímo z aktuální nabídky. Archiv čte stejná data jako běžná stránka.','Odstraněné ruční kopie cen, epizod a stylů.'],
        ['Červený — dojem','Nejbližší dnešnímu pořadu. Návštěvník ihned poznává původní vizuál.','Ponechané původní hero, logo, minihra a písmo.'],
        ['Černý — rizika','Pod dlouhým úvodem by se mohla ztratit firemní nabídka.','Přímý odkaz na partnerství v hero a nabídka před epizodami.'],
        ['Žlutý — přínosy','Jednoduché pokračování existujícího webu s nízkou změnou pro posluchače.','Zachované původní karty, filtry, přehrávání i tým.'],
        ['Zelený — možnosti','Sloučit vedlejší podklady do jedné obchodní stránky.','Statistiky, další nabídky a logo za nativními rozbaleními.'],
        ['Modrý — ověření','Cíl je uzavřené placené partnerství, nikoli samotné kliknutí.','Po výběru měřit cestu nabídka → kvalifikovaná poptávka → platící partner.'],
    ],
    B: [
        ['Bílý — fakta','Používá reálný archiv, nabídku a komponenty; nevzniká další zdroj obchodních údajů.','Partnerství je stále od 39 000 Kč měsíčně na nejméně tři měsíce.'],
        ['Červený — dojem','Stejná tmavá Krajta, původní korálová tlačítka, stejné karty a portréty.','Rozdíl tvoří umístění nabídky, ne nové barvy nebo typografie.'],
        ['Černý — rizika','Vedlejší sloupec by mohl na telefonu zůstat až pod dlouhým seznamem.','Mobilní nabídka má vlastní pozici a nepoužívá úzký boční panel.'],
        ['Žlutý — přínosy','Firemní nabídka je dostupná během prohlížení dílů.','Stejný partnerský panel je i v archivu.'],
        ['Zelený — možnosti','Ukázat průběh spolupráce místo dalších stejně výrazných balíčků.','Obchodní stránka využívá původní redakční proces.'],
        ['Modrý — ověření','Hypotéza: více relevantních zájemců z archivu při zachování poslechu.','Vedle uzavřených partnerství sledovat také spuštění dílu.'],
    ],
    C: [
        ['Bílý — fakta','Hlavní nabídka i datum statistik zůstávají ze současného webu.','Cena za celé minimální období je vidět u nabídky i kontaktu.'],
        ['Červený — dojem','Vizuálně stále současná Krajta, ale s obchodem jako prvním tématem.','Použité původní logo, minihra, pozadí i akcenty.'],
        ['Černý — rizika','Běžný posluchač by mohl nabídku chápat jako jediný účel webu.','Přímý poslech z hlavičky, odkaz na díly a pět epizod pod úvodem.'],
        ['Žlutý — přínosy','Firma vidí hlavní nabídku před prvním dalším kliknutím.','Obchodní stránka staví plnění a současný formulář vedle sebe.'],
        ['Zelený — možnosti','Zkrátit obchodní cestu bez vytváření nového formulářového systému.','Přímo použitý současný formulář s blokovaným odesláním v prototypu.'],
        ['Modrý — ověření','Silnější obchodní priorita je hypotéza, nikoli naměřená konverze.','Sledovat kvalifikované poptávky, uzavřená partnerství a zachování poslechu.'],
    ],
};

function PrototypeControls({ variant, page }: { readonly variant: PrototypeVariant; readonly page: PrototypePage }) {
    const params = useSearchParams();
    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const { clearance } = useFixedControlClearance(controlsRef, '[data-fixed-bottom-control], .cookie-consent__panel');
    const choose = (next: PrototypeVariant) => {
        const query = new URLSearchParams(params.toString()); query.set('variant', next);
        router.replace(`${AI_TA_KRAJTA_PATH}?${query}`, { scroll: false });
    };
    const cycle = (direction: number) => choose((['A','B','C'] as const)[(['A','B','C'].indexOf(variant)+direction+3)%3]);
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('input,textarea,select,[contenteditable="true"]') || dialogRef.current?.open) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycle(event.key === 'ArrowLeft' ? -1 : 1); }
        };
        window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
    }, [variant, params, router]);
    return <>
        <div ref={controlsRef} style={{ bottom: clearance + 16 }} aria-label="Přepínání prototypů" className="fixed left-1/2 z-[60] flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-[#1a201c] p-2 text-xs text-white shadow-2xl">
            <button onClick={() => cycle(-1)} aria-label="Předchozí varianta" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></button>
            <span className="hidden px-2 sm:block"><strong>{variant} · {LABELS[variant]}</strong><span className="block text-[10px] text-white/45">Prototyp · {page === 'home' ? 'Úvod' : page === 'episodes' ? 'Díly' : 'Pro firmy'}</span></span>
            {(['A','B','C'] as const).map(key => <button key={key} onClick={() => choose(key)} aria-label={`Varianta ${key}`} aria-pressed={key === variant}
                className={cn('h-8 w-8 rounded-full font-semibold',key === variant ? 'bg-[#ff6b6b] text-[#1a201c]' : 'text-white/65 hover:bg-white/10')}>{key}</button>)}
            <button onClick={() => cycle(1)} aria-label="Další varianta" className="rounded-full p-2 hover:bg-white/10"><ArrowRight className="h-4 w-4" /></button>
            <button onClick={() => dialogRef.current?.showModal()} className="whitespace-nowrap rounded-full border border-white/15 px-3 py-2 text-[10px]">6 klobouků</button>
        </div>
        <dialog ref={dialogRef} aria-labelledby="prototype-review-title" className="max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl rounded-2xl border border-white/15 bg-[#232a25] p-6 text-white backdrop:bg-black/70 sm:p-8">
            <div className="flex justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.16em] text-[#9db1ff]">Revize návrhu</p><h2 id="prototype-review-title" className="mt-3 text-2xl font-bold">{variant} · {LABELS[variant]}</h2></div>
                <button onClick={() => dialogRef.current?.close()} aria-label="Zavřít hodnocení" className="self-start rounded-full p-2 hover:bg-white/10"><X className="h-5 w-5" /></button></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">{REVIEWS[variant].map(([hat,review,change]) => <section key={hat} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-sm font-semibold text-white">{hat}</h3><p className="mt-3 text-sm leading-relaxed text-white/65">{review}</p><p className="mt-3 text-xs leading-relaxed text-[#b5c2ff]">Zapracováno: {change}</p>
            </section>)}</div>
            <p className="mt-6 text-xs leading-relaxed text-white/45">Jde o návrhové hypotézy. Konverze nebyly měřené. Všechny varianty používají přímo komponenty a vizuální pravidla současného webu.</p>
        </dialog>
    </>;
}

export function AiTaKrajtaPrototypePage({ archive, variant }: { readonly archive: AiTaKrajtaArchive; readonly variant: PrototypeVariant }) {
    const params = useSearchParams();
    const pageValue = params.get('prototypePage');
    const page: PrototypePage = pageValue === 'partners' || pageValue === 'episodes' ? pageValue : 'home';
    return <AiTaKrajtaPrototypeNavigationProvider variant={variant} page={page}>
        <AiTaKrajtaPageStateProvider archive={archive}>
            <div data-ai-ta-krajta-prototype={variant} className="min-h-screen bg-[#232a25] pb-28 font-sans antialiased">
                <AiTaKrajtaHeader activePath={page === 'episodes' ? AI_TA_KRAJTA_EPISODES_PATH : page === 'partners' ? AI_TA_KRAJTA_MEDIA_KIT_PATH : AI_TA_KRAJTA_PATH} />
                <main>{page === 'home' ? <Home variant={variant} /> : page === 'partners' ? <Partners variant={variant} /> : variant === 'B'
                    ? <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12"><div className="row-start-2 lg:col-start-1 lg:row-start-1"><AiTaKrajtaEpisodeList isArchive isEmbedded /></div><aside className="row-start-1 lg:sticky lg:top-24 lg:col-start-2"><OfferCard /></aside></div>
                    : <><AiTaKrajtaEpisodeList isArchive /><PartnerStrip /></>}
                </main><AiTaKrajtaFooter /><PrototypeControls variant={variant} page={page} />
            </div>
        </AiTaKrajtaPageStateProvider>
    </AiTaKrajtaPrototypeNavigationProvider>;
}
