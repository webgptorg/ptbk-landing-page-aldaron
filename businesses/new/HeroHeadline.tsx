'use client';

import { useEffect, useRef, useState } from 'react';
import { useSiteLocale } from './LocaleProvider';
import { PromptbookRobot } from './PromptbookRobot';
import { HeroUnderline } from './HeroUnderline';
import { HeroHandwriting, HANDWRITING_DELAY_MS, HANDWRITING_MS } from './HeroHandwriting';
import { handwritingFor } from './heroHandwriting';
import s from './hero-headline.module.css';

const COPY = {
    cs: { prefix: 'Teď', suffix: 'pro', you: 'Vás', activities: ['pracuje', 'vyvíjí', 'účtuje', 'plánuje', 'píše', 'přepisuje', 'analyzuje', 'testuje'] },
    en: { prefix: 'Now it', suffix: 'for', you: 'you', activities: ['works', 'codes', 'plans', 'writes', 'files', 'replies', 'analyzes', 'tests'] },
} as const;
const HOLD_MS = 3500;
const FADE_MS = 180;
const WRITTEN_MS = HANDWRITING_DELAY_MS + HANDWRITING_MS;
const CHANGE_PERIOD_MS = WRITTEN_MS + HOLD_MS + FADE_MS;

/** One quiet working character; the clock runs only while the headline is visible. */
export function HeroHeadline({ firstLine, underlineReplay = 0 }: { firstLine?: string; underlineReplay?: number }) {
    const { locale } = useSiteLocale();
    const copy = COPY[locale];
    const root = useRef<HTMLSpanElement>(null);
    const [elapsed, setElapsed] = useState(0);
    const [animated, setAnimated] = useState(false);
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

    const cycle = Math.floor(elapsed / CHANGE_PERIOD_MS);
    const phase = elapsed % CHANGE_PERIOD_MS;
    const activity = copy.activities[cycle % copy.activities.length];
    const fading = animated && phase >= WRITTEN_MS + HOLD_MS;
    const stage = !animated ? 'still' : phase < WRITTEN_MS ? 'writing' : 'idle';
    const initial = `${copy.prefix} ${copy.activities[0]} ${copy.suffix} ${copy.you}`;

    return <span ref={root} className={s.headline} data-hero-heading data-animated={animated} data-running={running} data-stage={stage}>
        <span className={s.robot} aria-hidden="true"><PromptbookRobot/></span>
        {firstLine && <><span className={s.firstLine}>{firstLine}</span>{' '}</>}
        <span className={s.srOnly}>{initial}</span>
        <span className={s.visualLine} aria-hidden="true" data-hero-activity={activity}>
            <span className={s.phrase}>
                <span>{copy.prefix}</span>{' '}
                <span className={s.activity} data-hero-word-slot style={{ width: `${handwritingFor(activity).width / 100}em` }}>
                    <span className={s.srOnly} data-hero-typed>{activity}</span>
                    <span key={`${locale}-${cycle}`} className={s.handwritingLayer} data-fading={fading}>
                        <HeroHandwriting word={activity}/>
                    </span>
                </span>{' '}
                <span className={s.forYou}>
                    {copy.suffix}{' '}
                    <span className={s.you}>{copy.you}
                        <HeroUnderline generation={0} locale={locale} replay={underlineReplay} initialDelay={WRITTEN_MS + 100}/>
                    </span>
                </span>
            </span>
        </span>
    </span>;
}
