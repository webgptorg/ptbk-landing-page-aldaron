'use client';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Code2, Headphones, Pause, Play, Users } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import { BlueprintScene } from './BlueprintScene';
import { useBlueprintPlayback } from './useBlueprintPlayback';
import s from './blueprint-scene.module.css';
const choices = [{ id: 'podcast', Icon: Headphones }, { id: 'relationships', Icon: Users }, { id: 'development', Icon: Code2 }] as const;
/** The work itself is the explanation; only story selection and pause surround it. */
export function BrandStories({ partnership = false }: { partnership?: boolean }) {
    const { locale } = useSiteLocale(); const en = locale === 'en'; const id = useId();
    const root = useRef<HTMLElement>(null); const scene = useRef<HTMLDivElement>(null); const [active, setActive] = useState(0);
    const playback = useBlueprintPlayback(scene, active, { scrollSteps: true });
    const labels = en ? ['Podcast management', 'Contact follow-up', 'Website maintenance'] : ['Správa podcastu', 'Péče o kontakty', 'Údržba webu'];
    function select(index: number, focus = false) {
        setActive(index);
        if (focus) root.current?.querySelector<HTMLButtonElement>('[data-story-choice="'+index+'"]')?.focus();
    }
    function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
        if (next !== null) { event.preventDefault(); select(next, true); }
    }
    return <section ref={root} className={s.stories} aria-label={en ? 'Work examples' : 'Ukázky práce'} data-testid="brand-carousel" data-partnership={partnership} data-running={playback.running}>
        <div className={s.toolbar}>
            <div className={s.tabs} role="tablist" aria-label={en ? 'Choose an example' : 'Vyberte ukázku'}>
                {choices.map(({ id: storyId, Icon }, index) => <button key={storyId} type="button" role="tab" id={id+'-'+index} aria-selected={active === index} aria-controls={id+'-panel'} tabIndex={active === index ? 0 : -1} data-story-choice={index} onClick={() => select(index)} onKeyDown={event => navigate(event, index)}><Icon size={17} strokeWidth={1.5} aria-hidden="true"/>{labels[index]}</button>)}
            </div>
            <button className={s.iconButton} type="button" onClick={playback.toggle} disabled={playback.reduced} aria-label={playback.paused ? (en ? 'Play animation' : 'Přehrát animaci') : (en ? 'Pause animation' : 'Pozastavit animaci')} aria-pressed={playback.paused}>{playback.paused ? <Play size={16}/> : <Pause size={16}/>}</button>
        </div>
        <article ref={scene} id={id+'-panel'} role="tabpanel" aria-labelledby={id+'-'+active} data-story={choices[active].id} data-step={playback.step}>
            <BlueprintScene kind={choices[active].id} step={playback.step} visibleStage={playback.visibleStage}/>
        </article>
    </section>;
}
