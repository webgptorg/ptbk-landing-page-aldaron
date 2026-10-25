'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Moon, Pause, Play, ShieldCheck, Sun } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import { BlueprintScene } from './BlueprintScene';
import { useBlueprintPlayback } from './useBlueprintPlayback';
import s from './blueprint-scene.module.css';

/** Two independently chosen physical endpoints, without surrounding explanatory panels. */
export function OwnershipScene() {
    const { locale, path } = useSiteLocale(); const en = locale === 'en';
    const root = useRef<HTMLElement>(null);
    const [appPlace, setAppPlace] = useState(0), [enginePlace, setEnginePlace] = useState(0);
    const [manualSleep, setManualSleep] = useState<boolean | null>(null);
    const playback = useBlueprintPlayback(root, 0);
    const asleep = manualSleep ?? playback.step >= 2;
    return <section ref={root} id="your-ai" className={s.ownership} aria-label={en ? 'Your app and your engine' : 'Vaše aplikace a váš engine'} data-running={playback.running}>
        <div className={s.deviceChoice}>
            <label><span className={s.srOnly}>{en ? 'Where you use the app' : 'Odkud ovládáte aplikaci'}</span><select value={appPlace} onChange={event => setAppPlace(Number(event.target.value))}>{(en ? ['Laptop at your desk', 'Phone outside', 'Phone on a train'] : ['Notebook v kanceláři', 'Telefon venku', 'Telefon ve vlaku']).map((label,i) => <option value={i} key={i}>{label}</option>)}</select></label>
            <button className={s.iconButton} type="button" onClick={() => setManualSleep(!asleep)} aria-pressed={asleep} aria-label={asleep ? (en ? 'Open the app' : 'Otevřít aplikaci') : (en ? 'Close the app' : 'Zavřít aplikaci')}>{asleep ? <Sun size={17}/> : <Moon size={17}/>}</button>
            <label><span className={s.srOnly}>{en ? 'Where you run the engine' : 'Kde provozujete engine'}</span><select value={enginePlace} onChange={event => setEnginePlace(Number(event.target.value))}>{(en ? ['Laptop in the office cabinet', 'Laptop on a shelf', 'Your VPS'] : ['Notebook ve skříňce', 'Notebook na poličce', 'Vlastní VPS']).map((label,i) => <option value={i} key={i}>{label}</option>)}</select></label>
            <button className={s.iconButton} type="button" disabled={playback.reduced} onClick={playback.toggle} aria-label={playback.paused ? (en ? 'Play engine animation' : 'Přehrát animaci enginu') : (en ? 'Pause engine animation' : 'Pozastavit animaci enginu')} aria-pressed={playback.paused}>{playback.paused ? <Play size={15}/> : <Pause size={15}/>}</button>
        </div>
        <div data-testid="ownership-scene"><BlueprintScene kind="engine" step={playback.step} appPlace={appPlace} enginePlace={enginePlace} asleep={asleep}/></div>
        <span className={s.srOnly} role="status">{en ? 'The engine keeps working' : 'Engine pracuje dál'}</span>
        <Link href={path('bezpecnost')} className={s.securityLink} aria-label={en ? 'How you stay in control of your data' : 'Jak funguje kontrola nad daty'}><ShieldCheck size={18}/></Link>
    </section>;
}
