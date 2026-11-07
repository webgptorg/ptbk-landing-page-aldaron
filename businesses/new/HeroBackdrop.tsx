'use client';

import { useEffect, useRef } from 'react';
import s from './brand.module.css';

export function HeroBackdrop() {
    const backdrop = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const layer = backdrop.current;
        const hero = layer?.parentElement;
        if (!layer || !hero) return;

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const spots = new Map<number, HTMLSpanElement>();

        function clearSpot({ pointerId }: PointerEvent) {
            spots.get(pointerId)?.remove();
            spots.delete(pointerId);
        }

        function clearAll() {
            spots.forEach(spot => spot.remove());
            spots.clear();
        }

        const track = (event: PointerEvent) => {
            if (motion.matches) return;

            let spot = spots.get(event.pointerId);
            if (!spot) {
                if (event.pointerType !== 'mouse' && event.type !== 'pointerdown') return;
                spot = document.createElement('span');
                spot.className = s.grainSpot;
                layer.append(spot);
                spots.set(event.pointerId, spot);
            }

            const { left, top } = layer.getBoundingClientRect();
            spot.style.transform = `translate3d(${event.clientX - left}px, ${event.clientY - top}px, 0)`;
        };

        function release(event: PointerEvent) {
            if (event.pointerType !== 'mouse') clearSpot(event);
        }

        hero.addEventListener('pointermove', track, { passive: true });
        hero.addEventListener('pointerdown', track, { passive: true });
        hero.addEventListener('pointerup', release);
        hero.addEventListener('pointercancel', clearSpot);
        hero.addEventListener('pointerleave', clearSpot);
        window.addEventListener('blur', clearAll);
        motion.addEventListener('change', clearAll);

        return () => {
            hero.removeEventListener('pointermove', track);
            hero.removeEventListener('pointerdown', track);
            hero.removeEventListener('pointerup', release);
            hero.removeEventListener('pointercancel', clearSpot);
            hero.removeEventListener('pointerleave', clearSpot);
            window.removeEventListener('blur', clearAll);
            motion.removeEventListener('change', clearAll);
            clearAll();
        };
    }, []);

    return <div ref={backdrop} className={s.heroBackdrop} aria-hidden="true"/>;
}
