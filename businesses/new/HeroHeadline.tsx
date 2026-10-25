'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSiteLocale } from './LocaleProvider';
import s from './hero-headline.module.css';

const COPY = {
    cs: { prefix: 'Teď', suffix: 'pro', you: 'Vás', activities: ['pracuje', 'účtuje', 'vyvíjí', 'přepisuje', 'plánuje', 'píše zákazníkům'] },
    en: { prefix: 'Now it', suffix: 'for', you: 'you', activities: ['works', 'does the books', 'develops', 'transcribes', 'plans', 'writes to customers'] },
} as const;
const FIRST_CHANGE_MS = 5400;
const CHANGE_PERIOD_MS = 4200;
const SWAP_MS = 480;

/** One quiet working character; the clock runs only while the headline is visible. */
export function HeroHeadline() {
    const { locale } = useSiteLocale();
    const copy = COPY[locale];
    const root = useRef<HTMLSpanElement>(null);
    const [elapsed, setElapsed] = useState(0);
    const [animated, setAnimated] = useState(true);
    const [running, setRunning] = useState(true);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        let visible = true;
        let timer: number | undefined;
        let previous = 0;
        setElapsed(0);
        function synchronize() {
            window.clearInterval(timer);
            timer = undefined;
            const enabled = !media.matches;
            const active = enabled && visible && document.visibilityState !== 'hidden';
            setAnimated(enabled);
            setRunning(active);
            if (!enabled) setElapsed(0);
            if (active) {
                previous = performance.now();
                timer = window.setInterval(() => {
                    const now = performance.now();
                    const delta = Math.min(100, Math.max(0, now - previous));
                    previous = now;
                    setElapsed(value => value + delta);
                }, 50);
            }
        }
        const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
            const next = entries[0]?.isIntersecting ?? false;
            if (next !== visible) { visible = next; synchronize(); }
        });
        if (root.current) observer?.observe(root.current);
        media.addEventListener('change', synchronize);
        document.addEventListener('visibilitychange', synchronize);
        synchronize();
        return () => {
            window.clearInterval(timer);
            observer?.disconnect();
            media.removeEventListener('change', synchronize);
            document.removeEventListener('visibilitychange', synchronize);
        };
    }, [locale]);

    const cycle = elapsed < FIRST_CHANGE_MS ? -1 : Math.floor((elapsed - FIRST_CHANGE_MS) / CHANGE_PERIOD_MS);
    const index = cycle < 0 ? 0 : (cycle + 1) % copy.activities.length;
    const swapping = cycle >= 0 && (elapsed - FIRST_CHANGE_MS) % CHANGE_PERIOD_MS < SWAP_MS;
    const stage = !animated ? 'still' : elapsed < 1900 ? 'writing' : elapsed < 2700 ? 'checking' : swapping ? 'swapping' : 'idle';
    const verbOffset = copy.prefix.length + 1;
    const suffixOffset = verbOffset + copy.activities[0].length + 1;
    const initial = `${copy.prefix} ${copy.activities[0]} ${copy.suffix} ${copy.you}`;

    return <span ref={root} className={s.headline} data-hero-heading data-animated={animated} data-running={running} data-stage={stage}>
        <span className={s.srOnly}>{initial}</span>
        <span className={s.visualLine} aria-hidden="true">
            <span className={s.workPhrase}>
                <InitialText text={copy.prefix}/>
                <span className={s.activitySlot} data-hero-activity={copy.activities[index]}>
                    {copy.activities.map(activity => <span className={s.wordSizer} key={activity}>{activity}</span>)}
                    {cycle < 0 ? <span className={s.activity}><InitialText text={copy.activities[0]} offset={verbOffset}/></span> : <>
                        {swapping && <span key={`old-${cycle}`} className={s.peelOut}>{copy.activities[cycle % copy.activities.length]}</span>}
                        <span key={cycle} className={`${s.activity} ${s.replaceWord}`}>{copy.activities[index]}</span>
                    </>}
                </span>
            </span>
            <span className={s.forYou}>
                <InitialText text={copy.suffix} offset={suffixOffset}/>{' '}
                <span className={s.you}><InitialText text={copy.you} offset={suffixOffset + copy.suffix.length + 1}/>
                    <svg className={s.underline} viewBox="0 0 100 12" preserveAspectRatio="none" fill="none"><path d="M3 7Q49 11 95 4" pathLength="1"/></svg>
                </span>
                <span className={s.robot}><span className={s.robotNod}><WorkingRobot/></span></span>
                <svg className={s.check} viewBox="0 0 24 24" fill="none"><path d="m4 12 5 5L20 6" pathLength="1"/></svg>
            </span>
        </span>
    </span>;
}

function InitialText({ text, offset = 0 }: { text: string; offset?: number }) {
    return <span>{Array.from(text).map((letter, index) => <span key={index} className={s.initialLetter} style={{ '--letter': offset + index } as CSSProperties}>{letter}</span>)}</span>;
}

/** Vector artwork follows the site's existing navy line-icon language. */
function WorkingRobot() {
    return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M32 13V7" stroke="currentColor" strokeWidth="2"/><circle cx="32" cy="5" r="3" fill="currentColor"/>
        <rect x="12" y="14" width="40" height="31" rx="11" fill="#edf4ff" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 25v10M56 25v10M22 48v6h20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="28" r="3" fill="currentColor"/><circle cx="40" cy="28" r="3" fill="currentColor"/>
        <path d="M26 37q6 4 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="m12 43-7 8 8 3M4 60l8-16 4 2-8 16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>;
}
