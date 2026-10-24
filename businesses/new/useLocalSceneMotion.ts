'use client';

import { useEffect, useState, type RefObject } from 'react';

/** A passive camera follows the section through the viewport, with no pinning or extra scroll space. */
export function useLocalSceneMotion(ref: RefObject<HTMLElement | null>) {
    const [step, setStep] = useState(3);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        let visible = true;
        const update = () => {
            frame = 0;
            if (!visible || document.hidden || preference.matches) return;
            const bounds = element.getBoundingClientRect();
            const center = bounds.top + Math.min(bounds.height, 680) / 2;
            const progress = Math.max(0, Math.min(1, (window.innerHeight * .95 - center) / (window.innerHeight * .7)));
            element.style.setProperty('--scene-orbit', `${(progress * 12 - 6).toFixed(2)}deg`);
            element.style.setProperty('--scene-tilt', `${(5 - progress * 8).toFixed(2)}deg`);
            element.style.setProperty('--scene-lift', `${(12 - progress * 24).toFixed(2)}px`);
            setStep(Math.min(3, Math.floor(progress * 4)));
        };
        const schedule = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(update); };
        const changePreference = () => {
            if (preference.matches) {
                element.style.setProperty('--scene-orbit', '0deg');
                element.style.setProperty('--scene-tilt', '0deg');
                element.style.setProperty('--scene-lift', '0px');
                setStep(3);
            } else schedule();
        };
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) schedule();
        }, { rootMargin: '100px' });
        observer.observe(element);
        preference.addEventListener('change', changePreference);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        document.addEventListener('visibilitychange', schedule);
        changePreference();
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            preference.removeEventListener('change', changePreference);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            document.removeEventListener('visibilitychange', schedule);
        };
    }, [ref]);

    return { step };
}
