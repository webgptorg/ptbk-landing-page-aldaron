'use client';
import { useEffect, useState, type RefObject } from 'react';

/** Native scroll reveals work only when it is readable, without advancing unseen mobile panels. */
export function useBlueprintPlayback(ref: RefObject<HTMLElement | null>, resetKey: number, { scrollSteps = false } = {}) {
    const [step, setStep] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [visible, setVisible] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [currentStage, setCurrentStage] = useState(-1);

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

    useEffect(() => { setStep(reduced ? 3 : 0); }, [resetKey, reduced, mobile]);

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
                let stage = -1;
                element.querySelectorAll('[data-bp-stage]').forEach((panel, index) => {
                    const bounds = panel.getBoundingClientRect();
                    const readable = Math.max(0, Math.min(bounds.bottom, bottom) - Math.max(bounds.top, top));
                    if (bounds.height > 0 && readable >= Math.min(bounds.height * .45, (bottom - top) * .6)) stage = index;
                });
                setCurrentStage(stage);
            };
            const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
            // Measure after the SVG has applied its mobile coordinates, including on a tab change.
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
        if (reduced) return;
        if (scrollSteps && !visible) setStep(0);
        else if (scrollSteps && mobile && !paused && !hidden && currentStage >= 0) {
            setStep(value => Math.max(value, currentStage));
        }
    }, [visible, mobile, scrollSteps, currentStage, paused, hidden, reduced]);

    const finished = scrollSteps && step === 3;
    const running = visible && !hidden && !paused && !reduced && !finished;
    useEffect(() => {
        if (!running || (scrollSteps && mobile && (currentStage !== 2 || step !== 2))) return;
        const interval = window.setInterval(() => setStep(value => scrollSteps ? Math.min(value + 1, 3) : (value + 1) % 4), 4500);
        return () => window.clearInterval(interval);
    }, [running, resetKey, scrollSteps, mobile, currentStage, step]);

    return {
        step, running, reduced, visibleStage: scrollSteps && mobile && !reduced ? Math.min(step, 2) : undefined,
        paused: paused || reduced || finished,
        toggle: () => {
            if (reduced) return;
            if (finished) { setStep(mobile ? 2 : 0); setPaused(false); }
            else setPaused(value => !value);
        },
    };
}
