'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSiteLocale } from './LocaleProvider';
import { PromptbookRobot } from './PromptbookRobot';
import s from './hero-headline.module.css';

const COPY = {
    cs: { prefix: 'Teď', suffix: 'pro', you: 'Vás', activities: ['pracuje', 'účtuje', 'vyvíjí', 'přepisuje', 'plánuje', 'píše'] },
    en: { prefix: 'Now it', suffix: 'for', you: 'you', activities: ['works', 'plans', 'writes', 'codes', 'files', 'replies'] },
} as const;
const FIRST_CHANGE_MS = 5400;
const CHANGE_PERIOD_MS = 4200;
const SWAP_MS = 480;

/** One quiet working character; the clock runs only while the headline is visible. */
export function HeroHeadline({ firstLine }: { firstLine?: string }) {
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
    const stage = !animated ? 'still' : elapsed < 1000 ? 'writing' : elapsed < 1700 ? 'checking' : swapping ? 'swapping' : 'idle';
    const verbOffset = copy.prefix.length + 1;
    const suffixOffset = verbOffset + copy.activities[0].length + 1;
    const initial = `${copy.prefix} ${copy.activities[0]} ${copy.suffix} ${copy.you}`;

    return <span ref={root} className={s.headline} data-hero-heading data-animated={animated} data-running={running} data-stage={stage}>
        <span className={s.robot} aria-hidden="true"><PromptbookRobot/></span>
        {firstLine && <><span className={s.firstLine}>{firstLine}</span>{' '}</>}
        <span className={s.srOnly}>{initial}</span>
        <span className={s.visualLine} aria-hidden="true" data-hero-activity={copy.activities[index]}>
            {copy.activities.map((activity, phraseIndex) => <span key={activity} className={s.phrase} data-active={phraseIndex === index} data-swapping={phraseIndex === index && swapping}>
                {cycle < 0 && phraseIndex === 0 ? <InitialText text={copy.prefix}/> : copy.prefix}{' '}
                <span className={s.activity}>{cycle < 0 && phraseIndex === 0 ? <InitialText text={activity} offset={verbOffset}/> : activity}</span>{' '}
                <span className={s.forYou}>
                    {cycle < 0 && phraseIndex === 0 ? <InitialText text={copy.suffix} offset={suffixOffset}/> : copy.suffix}{' '}
                    <span className={s.you}>{cycle < 0 && phraseIndex === 0 ? <InitialText text={copy.you} offset={suffixOffset + copy.suffix.length + 1}/> : copy.you}
                        <svg className={s.underline} viewBox="0 0 100 12" preserveAspectRatio="none" fill="none"><path d="M3 7Q49 11 95 4" pathLength="1"/></svg>
                    </span>
                    <svg className={s.check} viewBox="0 0 24 24" fill="none"><path d="m4 12 5 5L20 6" pathLength="1"/></svg>
                </span>
            </span>)}
        </span>
    </span>;
}
function InitialText({ text, offset = 0 }: { text: string; offset?: number }) {
    return <span>{Array.from(text).map((letter, index) => <span key={index} className={s.initialLetter} style={{ '--letter': offset + index } as CSSProperties}>{letter}</span>)}</span>;
}
