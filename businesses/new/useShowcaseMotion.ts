'use client';

import { useEffect, useState, type RefObject } from 'react';

/** No render per scroll frame, no idle animation loop, and no work outside the viewport. */
export function useShowcaseMotion(ref: RefObject<HTMLDivElement | null>, paused: boolean) {
    const [reduced, setReduced] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        let inView = false;
        let frame = 0;
        function updateDepth() {
            frame = 0;
            if (!element || media.matches || paused || !inView || document.hidden) return;
            const bounds = element.getBoundingClientRect();
            const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - bounds.top - bounds.height / 2) / window.innerHeight));
            element.style.setProperty('--tilt', `${(-progress * 9).toFixed(2)}deg`);
            element.style.setProperty('--drift', `${(progress * 18).toFixed(2)}px`);
        }
        function requestUpdate() {
            if (!frame && inView && !document.hidden && !media.matches && !paused) frame = requestAnimationFrame(updateDepth);
        }
        function updatePreference() {
            setReduced(media.matches);
            if (media.matches) {
                element?.style.removeProperty('--tilt');
                element?.style.removeProperty('--drift');
            }
            requestUpdate();
        }
        function updateVisibility() { setVisible(inView && !document.hidden); requestUpdate(); }
        const observer = new IntersectionObserver(entries => {
            inView = entries[0].isIntersecting;
            updateVisibility();
        }, { threshold: 0.15 });
        observer.observe(element);
        updatePreference();
        media.addEventListener('change', updatePreference);
        document.addEventListener('visibilitychange', updateVisibility);
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            media.removeEventListener('change', updatePreference);
            document.removeEventListener('visibilitychange', updateVisibility);
            window.removeEventListener('scroll', requestUpdate);
            window.removeEventListener('resize', requestUpdate);
        };
    }, [ref, paused]);

    return { reduced, visible };
}
