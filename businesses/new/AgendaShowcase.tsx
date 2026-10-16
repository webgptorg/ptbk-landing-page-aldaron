'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Check, Code2, FileText, Mail, Pause, Play, RotateCcw, Share2, Video } from 'lucide-react';
import Link from 'next/link';
import { SCENARIOS, type ScenarioId } from './economics';
import { sitePath } from './siteConfig';
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

/** A finite demonstration: playback changes the work itself; scrolling changes depth only. */
export function AgendaShowcase({ initialScenario = 'email' }: { initialScenario?: ScenarioId }) {
    const [active, setActive] = useState<ScenarioId>(initialScenario);
    const [stage, setStage] = useState(0);
    const [paused, setPaused] = useState(false);
    const panel = useRef<HTMLDivElement>(null);
    const { reduced, visible } = useShowcaseMotion(panel, paused);
    const id = useId();
    const shownStage = reduced ? 3 : stage;
    const tab = tabs.find(item => item.id === active)!;

    useEffect(() => {
        if (paused || reduced || !visible || stage >= 3) return;
        const timer = window.setTimeout(() => setStage(value => Math.min(3, value + 1)), 2800);
        return () => window.clearTimeout(timer);
    }, [paused, reduced, visible, stage, active]);

    function select(value: ScenarioId) { setActive(value); setStage(0); setPaused(false); }
    function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(tabs[next].id);
        document.getElementById(`${id}-${tabs[next].id}`)?.focus();
    }

    return <section className={s.showcase} aria-label="Ukázky agend" id="agendy">
        <div role="tablist" aria-label="Vyberte ukázku agendy" className={s.tabs}>
            {tabs.map((item, index) => <button type="button" role="tab" key={item.id} id={`${id}-${item.id}`} aria-selected={item.id === active} aria-controls={`${id}-panel`} tabIndex={item.id === active ? 0 : -1} onClick={() => select(item.id)} onKeyDown={event => navigate(event, index)}>
                <item.icon size={20} strokeWidth={1.6} /><span>{item.label}</span>
            </button>)}
        </div>
        <div ref={panel} className={s.panel} role="tabpanel" tabIndex={0} id={`${id}-panel`} aria-labelledby={`${id}-${active}`} data-scenario={active} data-stage={shownStage} data-still={reduced || paused || !visible}>
            <div className={s.heading}><h2>{tab.title}</h2><span>Ukázka</span></div>
            <div className={s.perspective}><AgendaScene key={active} scenario={active} stage={shownStage} /></div>
            <div className={s.playback}>
                <ol className={s.steps} aria-label="Průběh ukázky">{tab.steps.map((step, index) => <li key={step}>
                    <button type="button" aria-current={index === shownStage ? 'step' : undefined} disabled={reduced} onClick={() => { setStage(index); setPaused(true); }} data-complete={index < shownStage}>
                        <span>{index < shownStage ? <Check size={13} /> : `0${index + 1}`}</span>{step}
                    </button>
                </li>)}</ol>
                {!reduced && <button className={s.transport} type="button" aria-label={stage >= 3 ? 'Přehrát ukázku znovu' : paused ? 'Pokračovat v ukázce' : 'Pozastavit ukázku'} onClick={() => { if (stage >= 3) { setStage(0); setPaused(false); } else setPaused(!paused); }}>
                    {stage >= 3 ? <RotateCcw size={17} /> : paused ? <Play size={17} /> : <Pause size={17} />}
                </button>}
            </div>
        </div>
        <div className={s.caption}><p>{SCENARIOS[active].description}</p><Link href={sitePath(`agendy/${active}`)}>Jak funguje tato agenda <ArrowRight size={17} /></Link></div>
    </section>;
}
