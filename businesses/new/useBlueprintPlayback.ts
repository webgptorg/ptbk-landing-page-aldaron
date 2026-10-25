'use client';
import { useEffect, useState, type RefObject } from 'react';
/** Motion stops offscreen, in hidden tabs and for reduced motion; native scrolling stays untouched. */
export function useBlueprintPlayback(ref: RefObject<HTMLElement | null>, resetKey: number) {
    const [step, setStep] = useState(3), [paused, setPaused] = useState(false), [reduced, setReduced] = useState(false), [visible, setVisible] = useState(false), [hidden, setHidden] = useState(false);
    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const preference = () => { setReduced(media.matches); if (media.matches) setStep(3); };
        const visibility = () => setHidden(document.hidden);
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .12 });
        if (ref.current) observer.observe(ref.current);
        preference(); visibility();
        media.addEventListener('change', preference); document.addEventListener('visibilitychange', visibility);
        return () => { observer.disconnect(); media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility); };
    }, [ref]);
    useEffect(() => { setStep(reduced ? 3 : 0); }, [resetKey, reduced]);
    const running = visible && !hidden && !paused && !reduced;
    useEffect(() => {
        if (!running) return;
        const interval = window.setInterval(() => setStep(value => (value + 1) % 4), 4500);
        return () => window.clearInterval(interval);
    }, [running, resetKey]);
    return { step, running, reduced, paused: paused || reduced, toggle: () => { if (!reduced) setPaused(value => !value); } };
}
