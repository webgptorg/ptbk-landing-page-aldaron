'use client';
import { useEffect, useState, type RefObject } from 'react';

const DURATIONS = [1400, 2700, 3400] as const;
const TOTAL = DURATIONS.reduce((sum, duration) => sum + duration, 0);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
type StoryClock = { elapsed: number; panels: number[]; reached: number };
const initialClock = (): StoryClock => ({ elapsed: 0, panels: [0, 0, 0], reached: 0 });

/** The desktop plays one readable scene; mobile gives each visible panel its own clock and scroll progress. */
export function useBlueprintPlayback(ref: RefObject<HTMLElement | null>, resetKey: number, { scrollSteps = false } = {}) {
    const [engineStep, setEngineStep] = useState(0);
    const [clock, setClock] = useState(initialClock);
    const [paused, setPaused] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [visible, setVisible] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [viewport, setViewport] = useState({ stage: -1, progress: 0 });

    useEffect(() => {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const width = window.matchMedia('(max-width: 600px)');
        const preference = () => setReduced(motion.matches);
        const resize = () => setMobile(width.matches);
        const visibility = () => setHidden(document.hidden);
        preference(); resize(); visibility();
        motion.addEventListener('change', preference);
        width.addEventListener('change', resize);
        document.addEventListener('visibilitychange', visibility);
        return () => {
            motion.removeEventListener('change', preference);
            width.removeEventListener('change', resize);
            document.removeEventListener('visibilitychange', visibility);
        };
    }, []);

    useEffect(() => { setClock(initialClock()); setEngineStep(reduced ? 3 : 0); }, [resetKey, reduced, mobile]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        if (scrollSteps && mobile) {
            let frame = 0;
            const measure = () => {
                frame = 0;
                const top = 100, bottom = window.innerHeight - 24;
                const rect = element.getBoundingClientRect();
                setVisible(rect.bottom > top && rect.top < bottom);
                let stage = -1, progress = 0;
                element.querySelectorAll('[data-bp-stage]').forEach(panel => {
                    const bounds = panel.getBoundingClientRect();
                    const readable = Math.max(0, Math.min(bounds.bottom, bottom) - Math.max(bounds.top, top));
                    if (bounds.height > 0 && readable >= Math.min(bounds.height * .45, (bottom - top) * .6)) {
                        stage = Number(panel.getAttribute('data-bp-stage'));
                        progress = clamp((top + (bottom - top) * .32 - bounds.top) / bounds.height);
                    }
                });
                setViewport(previous => previous.stage === stage && previous.progress === progress ? previous : { stage, progress });
            };
            const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
            schedule();
            window.addEventListener('scroll', schedule, { passive: true });
            window.addEventListener('resize', schedule);
            const observer = new ResizeObserver(schedule);
            observer.observe(element);
            return () => {
                window.cancelAnimationFrame(frame); observer.disconnect();
                window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
            };
        }
        const threshold = scrollSteps ? .55 : .12;
        const observer = new IntersectionObserver(([entry]) => {
            setVisible(entry.isIntersecting && entry.intersectionRatio >= threshold);
        }, { threshold, rootMargin: scrollSteps ? '-90px 0px -20px 0px' : '0px' });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, resetKey, mobile, scrollSteps]);

    useEffect(() => {
        if (!scrollSteps || reduced || paused || hidden) return;
        if (mobile && viewport.stage >= 0 && visible) {
            setClock(previous => ({
                ...previous,
                reached: Math.max(previous.reached, viewport.stage),
                panels: previous.panels.map((value, index) => index < viewport.stage ? 1 : index === viewport.stage ? Math.max(value, viewport.progress) : value),
            }));
        } else if (!mobile && !visible) {
            // A partially seen desktop scene starts afresh; a finished one stays available to read.
            setClock(previous => previous.elapsed > 0 && previous.elapsed < TOTAL ? initialClock() : previous);
        }
    }, [visible, mobile, viewport, paused, hidden, reduced, scrollSteps]);

    const finished = scrollSteps && (mobile ? clock.panels[2] >= 1 : clock.elapsed >= TOTAL);
    const running = visible && !hidden && !paused && !reduced && !finished && (!scrollSteps || !mobile || viewport.stage >= 0);
    useEffect(() => {
        if (!running) return;
        if (!scrollSteps) {
            const interval = window.setInterval(() => setEngineStep(value => (value + 1) % 4), 4500);
            return () => window.clearInterval(interval);
        }
        let last = performance.now();
        const interval = window.setInterval(() => {
            const now = performance.now(), delta = Math.min(100, now - last);
            last = now;
            setClock(previous => {
                if (!mobile) return { ...previous, elapsed: Math.min(TOTAL, previous.elapsed + delta) };
                const stage = viewport.stage;
                if (stage < 0 || previous.panels[stage] >= 1) return previous;
                return { ...previous, panels: previous.panels.map((value, index) => index === stage ? Math.min(1, value + delta / DURATIONS[stage]) : value) };
            });
        }, 40);
        return () => window.clearInterval(interval);
    }, [running, scrollSteps, mobile, viewport.stage, resetKey]);

    const progress = reduced ? [1, 1, 1] : mobile ? clock.panels : DURATIONS.map((duration, index) => clamp((clock.elapsed - DURATIONS.slice(0, index).reduce((sum, value) => sum + value, 0)) / duration));
    const step = reduced ? 3 : !scrollSteps ? engineStep : finished ? 3 : mobile ? clock.reached : clock.elapsed >= DURATIONS[0] + DURATIONS[1] ? 2 : clock.elapsed >= DURATIONS[0] ? 1 : 0;
    return {
        step, progress, running, reduced,
        visibleStage: scrollSteps && mobile && !reduced ? Math.min(step, 2) : undefined,
        paused: paused || reduced || finished,
        toggle: () => { if (!reduced) setPaused(value => !value); },
    };
}
