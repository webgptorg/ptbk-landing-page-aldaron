'use client';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Code2, Mic, Users } from 'lucide-react';
import Link from 'next/link';
import { COMMUNITIES } from '@/businesses/community/config';
import { useSiteLocale } from './LocaleProvider';
import { BlueprintScene } from './BlueprintScene';
import { useBlueprintPlayback } from './useBlueprintPlayback';
import s from './blueprint-scene.module.css';
const choices = [
    { id: 'relationships', Icon: Users, articleSlug: 'pece-o-kontakty' },
    { id: 'podcast', Icon: Mic, articleSlug: 'sprava-podcastu' },
    { id: 'development', Icon: Code2, articleSlug: 'udrzba-webu' },
] as const;
/** One shared technology, shown through three concrete responsibilities. */
export function BrandStories({ partnership = false }: { partnership?: boolean }) {
    const { locale } = useSiteLocale(); const en = locale === 'en'; const id = useId();
    const root = useRef<HTMLElement>(null); const scene = useRef<HTMLDivElement>(null); const [active, setActive] = useState(0);
    const playback = useBlueprintPlayback(scene, active, { scrollSteps: true });
    const labels = en ? ['Contact follow-up', 'Podcast management', 'Website maintenance'] : ['Péče o kontakty', 'Správa podcastů', 'Údržba webu'];
    const activeChoice = choices[active];
    const communityPath = COMMUNITIES.promptbook.path;
    function select(index: number, focus = false) {
        setActive(index);
        if (focus) root.current?.querySelector<HTMLButtonElement>('[data-story-choice="'+index+'"]')?.focus();
    }
    function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
        if (next !== null) { event.preventDefault(); select(next, true); }
    }
    return <section ref={root} className={s.stories} aria-labelledby={id+'-heading'} data-testid="brand-carousel" data-partnership={partnership} data-running={playback.running}>
        <header className={s.storyHeading}><h2 id={id+'-heading'}>{en ? 'Use cases' : 'Příklady použití'}</h2></header>
        <div className={s.toolbar}>
            <div className={s.tabs} role="tablist" aria-label={en ? 'Choose an example' : 'Vyberte ukázku'}>
                {choices.map(({ id: storyId, Icon }, index) => <button key={storyId} type="button" role="tab" id={id+'-'+index} aria-selected={active === index} aria-controls={id+'-panel'} tabIndex={active === index ? 0 : -1} data-story-choice={index} onClick={() => select(index)} onKeyDown={event => navigate(event, index)}><Icon size={17} strokeWidth={1.5} aria-hidden="true"/>{labels[index]}</button>)}
            </div>
        </div>
        <article ref={scene} id={id+'-panel'} role="tabpanel" aria-labelledby={id+'-'+active} data-story={activeChoice.id} data-step={playback.step}>
            {!partnership && <div className={s.storyLinks}>
                <Link
                    href={`${communityPath}/clanky/cs/${activeChoice.articleSlug}`}
                    hrefLang="cs"
                    prefetch={false}
                    aria-label={en ? `Read the walkthrough in Czech for ${labels[active]}` : `Přečíst postup k příkladu ${labels[active]}`}
                >
                    {en ? 'Read the walkthrough (Czech)' : 'Přečíst postup'}
                </Link>
                <Link href={communityPath} hrefLang="cs" prefetch={false}>
                    {en ? 'Promptbook community (Czech)' : 'Komunita Promptbook'}
                </Link>
            </div>}
            <BlueprintScene key={activeChoice.id} kind={activeChoice.id} step={playback.step} progress={playback.progress} visibleStage={playback.visibleStage}/>
        </article>
    </section>;
}
