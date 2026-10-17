'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Scroll writes compositor properties; React only updates at the four story beats. */
export function useShowcaseMotion(
    trackRef: RefObject<HTMLElement | null>,
    shellRef: RefObject<HTMLDivElement | null>,
    panelRef: RefObject<HTMLDivElement | null>,
    paused: boolean,
) {
    const [reduced, setReduced] = useState(true);
    const [visible, setVisible] = useState(false);
    const [immersive, setImmersive] = useState(false);
    const [scrollStage, setScrollStage] = useState(0);

    useEffect(() => {
        const track = trackRef.current;
        const shell = shellRef.current;
        const panel = panelRef.current;
        if (!track || !shell || !panel) return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        let inView = false;
        let frame = 0;
        let canPin = false;
        function updateDepth() {
            frame = 0;
            if (!track || !shell || !panel || media.matches || paused || !inView || document.hidden) return;
            const bounds = track.getBoundingClientRect();
            const travel = bounds.height - shell.offsetHeight;
            const progress = canPin && travel > 0
                ? Math.max(0, Math.min(1, (84 - bounds.top) / travel))
                : Math.max(0, Math.min(1, (window.innerHeight - panel.getBoundingClientRect().top) / (window.innerHeight + panel.offsetHeight)));
            panel.style.setProperty('--progress', progress.toFixed(4));
            const compact = window.innerWidth <= 760;
            const orbit = compact ? 3 : 10;
            const lift = compact ? 8 : 32;
            panel.style.setProperty('--orbit', `${(orbit - progress * orbit * 2).toFixed(2)}deg`);
            panel.style.setProperty('--lift', `${(lift - progress * lift * 2).toFixed(2)}px`);
            panel.style.setProperty('--light', `${(25 + progress * 50).toFixed(2)}%`);
            if (canPin) setScrollStage(Math.min(3, Math.floor(progress * 4)));
        }
        function requestUpdate() {
            if (!frame && inView && !document.hidden && !media.matches && !paused) frame = requestAnimationFrame(updateDepth);
        }
        function measure() {
            // The cue always reserves its desktop height, preventing a pin/unpin
            // feedback loop when the viewport sits at the height threshold.
            canPin = !media.matches && window.innerWidth >= 900 && shell!.offsetHeight + 108 <= window.innerHeight;
            setImmersive(canPin);
            requestUpdate();
        }
        function updatePreference() {
            setReduced(media.matches);
            if (media.matches) {
                ['--progress', '--orbit', '--lift', '--light'].forEach(property => panel?.style.removeProperty(property));
            }
            measure();
        }
        function updateVisibility() { setVisible(inView && !document.hidden); requestUpdate(); }
        const observer = new IntersectionObserver(entries => {
            inView = entries[0].isIntersecting;
            updateVisibility();
        }, { threshold: 0 });
        const resize = new ResizeObserver(measure);
        observer.observe(track);
        resize.observe(shell);
        updatePreference();
        media.addEventListener('change', updatePreference);
        document.addEventListener('visibilitychange', updateVisibility);
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', measure);
        return () => {
            observer.disconnect();
            resize.disconnect();
            cancelAnimationFrame(frame);
            media.removeEventListener('change', updatePreference);
            document.removeEventListener('visibilitychange', updateVisibility);
            window.removeEventListener('scroll', requestUpdate);
            window.removeEventListener('resize', measure);
        };
    }, [trackRef, shellRef, panelRef, paused]);

    // Pinning changes the available travel after React applies the track's data attribute.
    useEffect(() => { window.dispatchEvent(new Event('scroll')); }, [immersive]);
    return { reduced, visible, immersive, scrollStage };
}
