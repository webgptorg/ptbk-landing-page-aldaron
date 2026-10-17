'use client';

import { useSiteLocale } from './LocaleProvider';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowRight, Code2, FileText, Mail, Pause, Play, RotateCcw, Share2, Video } from 'lucide-react';
import Link from 'next/link';
import { type ScenarioId } from './economics';
import { AgendaScene } from './AgendaScenes';
import { useShowcaseMotion } from './useShowcaseMotion';
import s from './agenda-showcase.module.css';

const tabs = [
    { id: 'email', label: 'E-maily', icon: Mail, title: 'Schránka, ve které se věci posouvají.', steps: ['Nový dotaz', 'Firemní kontext', 'Návrh odpovědi', 'Vyřízeno podle pravidel'] },
    { id: 'documents', label: 'Účetní podklady', icon: FileText, title: 'Z dokladů jsou připravené podklady.', steps: ['Příchozí doklad', 'Vytěžení údajů', 'Příprava podkladů', 'Předáno účetní'] },
    { id: 'social', label: 'Sociální sítě', icon: Share2, title: 'Jedno téma. Obsah pro všechny vaše sítě.', steps: ['Obsahový plán', 'Texty a vizuály', 'Schválení', 'Naplánováno'] },
    { id: 'video', label: 'Video → obsah', icon: Video, title: 'Natočte jednou. Publikujte vícekrát.', steps: ['Zdrojové video', 'Přepis', 'Článek a příspěvky', 'Připraveno k publikaci'] },
    { id: 'coding', label: 'Údržba webu', icon: Code2, title: 'Web, o který je postaráno i mezi zakázkami.', steps: ['Údržbový úkol', 'Úprava kódu', 'Automatické testy', 'Změna připravena'] },
] as const;

/** A scroll-led story with finite playback and direct, keyboard-accessible steps. */
export function AgendaShowcase({ initialScenario = 'email' }: { initialScenario?: ScenarioId }) {
    const { t, locale, path } = useSiteLocale();

    const [active, setActive] = useState<ScenarioId>(initialScenario);
    const [stage, setStage] = useState(3);
    const [mode, setMode] = useState<'scroll' | 'auto' | 'paused'>('scroll');
    const track = useRef<HTMLElement>(null);
    const shell = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const { reduced, visible, immersive, scrollStage } = useShowcaseMotion(track, shell, panel, mode === 'paused');
    const scrollDriven = immersive && mode === 'scroll';
    const paused = mode === 'paused';
    const id = useId();
    // Compact screens show a complete, stable composition until playback is requested.
    const shownStage = reduced ? 3 : scrollDriven ? scrollStage : mode === 'scroll' ? 3 : stage;
    const tab = tabs.find(item => item.id === active)!;

    useEffect(() => {
        if (mode !== 'auto' || reduced || !visible || stage >= 3) return;
        const timer = window.setTimeout(() => setStage(value => Math.min(3, value + 1)), 2800);
        return () => window.clearTimeout(timer);
    }, [mode, reduced, visible, stage, active]);

    function select(value: ScenarioId) { setActive(value); setStage(3); setMode('scroll'); }
    function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(tabs[next].id);
        document.getElementById(`${id}-${tabs[next].id}`)?.focus();
    }

    return <section className={s.showcase} aria-label={t("Ukázky agend")} id="agendy">
        <section ref={track} className={s.scrollTrack} data-immersive={immersive && !reduced} aria-label={t("Prostorová ukázka")}>
        <div ref={shell} className={s.stageShell}>
        <div role="tablist" aria-label={t("Vyberte ukázku agendy")} className={s.tabs}>
            {tabs.map((item, index) => <button type="button" role="tab" key={item.id} id={`${id}-${item.id}`} aria-selected={item.id === active} aria-controls={`${id}-panel`} tabIndex={item.id === active ? 0 : -1} onClick={() => select(item.id)} onKeyDown={event => navigate(event, index)}>
                <item.icon size={20} strokeWidth={1.6} /><span>{t(item.label)}</span>
            </button>)}
        </div>
        <div ref={panel} className={s.panel} role="tabpanel" tabIndex={0} id={`${id}-panel`} aria-labelledby={`${id}-${active}`} data-scenario={active} data-stage={shownStage} data-still={reduced || paused || !visible} data-scroll-driven={scrollDriven}>
            <div className={s.heading}><span className={s.sceneLabel}>{t("Ukázka")}</span><h2>{t(tab.title)}</h2></div>
            <div className={s.perspective}><AgendaScene key={active} scenario={active} stage={shownStage} /></div>
            <div className={s.playback}>
                <ol className={s.steps} aria-label={t("Průběh ukázky")}>{tab.steps.map((step, index) => <li key={step}>
                    <button type="button" aria-current={index === shownStage ? 'step' : undefined} disabled={reduced} onClick={() => { setStage(index); setMode('paused'); }} data-complete={index < shownStage}>
                        {t(step)}
                    </button>
                </li>)}</ol>
                {!reduced && <button className={s.transport} type="button" aria-label={t(mode === 'scroll' ? 'Přehrát ukázku' : stage >= 3 ? 'Přehrát ukázku znovu' : paused ? 'Pokračovat v ukázce' : 'Pozastavit ukázku')} onClick={() => {
                    if (mode === 'scroll' || stage >= 3) { setStage(0); setMode('auto'); }
                    else setMode(paused ? 'auto' : 'paused');
                }}>
                    {mode === 'scroll' ? <Play size={17} /> : stage >= 3 ? <RotateCcw size={17} /> : paused ? <Play size={17} /> : <Pause size={17} />}
                </button>}
            </div>
            <div className={s.scrollCue}>{immersive && !reduced && <>
                {scrollDriven ? <span><ArrowDown size={13} />{t('Posouvejte stránku')}</span> : <button type="button" onClick={() => setMode('scroll')}><ArrowDown size={13} />{t('Procházet scrollováním')}</button>}
                <a href={`#${id}-after`}>{t("Přeskočit ukázku ")}<ArrowDown size={12} /></a>
            </>}</div>
        </div>
        </div>
        </section>
        <div id={`${id}-after`} className={s.caption}><Link href={path(`agendy/${active}`)}>{t("Jak funguje tato agenda ")}<ArrowRight size={17} /></Link></div>
    </section>;
}
