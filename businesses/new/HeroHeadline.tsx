'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSiteLocale } from './LocaleProvider';
import { PromptbookRobot } from './PromptbookRobot';
import { HeroUnderline } from './HeroUnderline';
import s from './hero-headline.module.css';

const COPY = {
    cs: { prefix: 'Teď', suffix: 'pro', you: 'Vás', activities: ['pracuje', 'vyvíjí', 'účtuje', 'plánuje', 'píše', 'přepisuje', 'analyzuje', 'testuje'] },
    en: { prefix: 'Now it', suffix: 'for', you: 'you', activities: ['works', 'codes', 'plans', 'writes', 'files', 'replies', 'analyzes', 'tests'] },
} as const;
const FIRST_CHANGE_MS = 5400;
// Variant 06 + fluid width from the approved word-motion laboratory.
const TYPEWRITER_MS = 1560;
const CHANGE_PERIOD_MS = TYPEWRITER_MS + 3200;

/** One quiet working character; the clock runs only while the headline is visible. */
export function HeroHeadline({ firstLine, underlineReplay = 0 }: { firstLine?: string; underlineReplay?: number }) {
    const { locale } = useSiteLocale();
    const copy = COPY[locale];
    const root = useRef<HTMLSpanElement>(null);
    const [elapsed, setElapsed] = useState(0);
    const [animated, setAnimated] = useState(true);
    const [running, setRunning] = useState(true);
    const [wordWidths, setWordWidths] = useState<Record<string, number>>({});

    useEffect(() => {
        const element = root.current;
        if (!element) return;
        let disposed = false;
        function measure() {
            if (disposed || !element) return;
            const widths: Record<string, number> = {};
            element.querySelectorAll<HTMLElement>('[data-hero-measure]').forEach(word => {
                widths[word.dataset.heroMeasure!] = Math.ceil(word.getBoundingClientRect().width);
            });
            setWordWidths(widths);
        }
        measure();
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        observer?.observe(element);
        document.fonts?.ready.then(measure);
        document.fonts?.addEventListener('loadingdone', measure);
        window.addEventListener('resize', measure);
        return () => {
            disposed = true;
            observer?.disconnect();
            document.fonts?.removeEventListener('loadingdone', measure);
            window.removeEventListener('resize', measure);
        };
    }, [locale]);

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
    const progress = cycle < 0 ? 1 : Math.min(1, ((elapsed - FIRST_CHANGE_MS) % CHANGE_PERIOD_MS) / TYPEWRITER_MS);
    const swapping = progress < 1;
    const previous = copy.activities[(index + copy.activities.length - 1) % copy.activities.length];
    const activity = copy.activities[index];
    const typed = !swapping ? activity : progress < .4
        ? previous.slice(0, Math.ceil(previous.length * (1 - progress / .4)))
        : progress < .51 ? '' : activity.slice(0, Math.floor(activity.length * ((progress - .51) / .49)));
    const stage = !animated ? 'still' : elapsed < 1000 ? 'writing' : elapsed < 1700 ? 'checking' : swapping ? 'swapping' : 'idle';
    const verbOffset = copy.prefix.length + 1;
    const suffixOffset = verbOffset + copy.activities[0].length + 1;
    const initial = `${copy.prefix} ${copy.activities[0]} ${copy.suffix} ${copy.you}`;
    const underlineGeneration = cycle < 0 ? 0 : cycle + (swapping ? 0 : 1);

    return <span ref={root} className={s.headline} data-hero-heading data-animated={animated} data-running={running} data-stage={stage}>
        <span className={s.robot} aria-hidden="true"><PromptbookRobot/></span>
        {firstLine && <><span className={s.firstLine}>{firstLine}</span>{' '}</>}
        <span className={s.srOnly}>{initial}</span>
        <span className={s.visualLine} aria-hidden="true" data-hero-activity={activity}>
            {copy.activities.map(word => <span key={word} className={s.phraseSizer}>
                <span>{copy.prefix}</span>
                <span className={s.activitySizer} data-hero-measure={word}>{word}</span>
                <span>{copy.suffix} {copy.you}</span>
            </span>)}
            <span className={s.phrase}>
                <span>{cycle < 0 ? <InitialText text={copy.prefix}/> : copy.prefix}</span>{' '}
                <span className={s.activity} data-hero-word-slot style={{ width: wordWidths[activity] }}>
                    <span className={s.activitySizer}>{activity}</span>
                    <span className={s.typed} data-hero-typed>{cycle < 0 ? <InitialText text={typed} offset={verbOffset}/> : typed}{swapping && <i className={s.caret}/>}</span>
                </span>{' '}
                <span className={s.forYou}>
                    {cycle < 0 ? <InitialText text={copy.suffix} offset={suffixOffset}/> : copy.suffix}{' '}
                    <span className={s.you}>{cycle < 0 ? <InitialText text={copy.you} offset={suffixOffset + copy.suffix.length + 1}/> : copy.you}
                        <HeroUnderline generation={underlineGeneration} locale={locale} replay={underlineReplay}/>
                    </span>
                </span>
            </span>
        </span>
    </span>;
}
function InitialText({ text, offset = 0 }: { text: string; offset?: number }) {
    return <span>{Array.from(text).map((letter, index) => <span key={index} className={s.initialLetter} style={{ '--letter': offset + index } as CSSProperties}>{letter}</span>)}</span>;
}
