'use client';

import { useEffect, useRef } from 'react';
import s from './brand.module.css';

type PointerLight = { element: HTMLSpanElement; x: number; y: number };

/** A decorative light for each pointer, leaving hit testing and gestures to the page. */
export function HeroBackdrop() {
    const backdrop = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const layer = backdrop.current;
        const hero = layer?.parentElement;
        if (!layer || !hero) return;

        const staticBackdrop = window.matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)');
        const lights = new Map<number, PointerLight>();
        let frame = 0;

        const paint = () => {
            frame = 0;
            if (!lights.size) return;

            const { left, top } = layer.getBoundingClientRect();
            lights.forEach(({ element, x, y }) => {
                element.style.transform = `translate3d(${x - left}px, ${y - top}px, 0) translate(-50%, -50%)`;
                if (!element.parentElement) {
                    layer.append(element);
                    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
                }
            });
        };

        const track = ({ pointerId, pointerType, type, clientX, clientY }: PointerEvent) => {
            if (staticBackdrop.matches) return;

            let light = lights.get(pointerId);
            if (!light) {
                if (pointerType !== 'mouse' && type !== 'pointerdown') return;
                const element = document.createElement('span');
                element.className = s.heroLight;
                light = { element, x: clientX, y: clientY };
                lights.set(pointerId, light);
            } else {
                light.x = clientX;
                light.y = clientY;
            }
            if (!frame) frame = window.requestAnimationFrame(paint);
        };

        function fade({ pointerId }: PointerEvent) {
            const light = lights.get(pointerId);
            if (!light) return;
            lights.delete(pointerId);

            const { element } = light;
            if (!element.parentElement) return;
            const { opacity } = window.getComputedStyle(element);
            const animation = element.animate([{ opacity }, { opacity: 0 }], {
                duration: 320,
                easing: 'ease-out',
                fill: 'forwards',
            });
            animation.onfinish = () => element.remove();
        }

        function release(event: PointerEvent) {
            if (event.pointerType !== 'mouse') fade(event);
        }

        const clear = () => {
            window.cancelAnimationFrame(frame);
            frame = 0;
            lights.clear();
            layer.replaceChildren();
        };

        function updateBackdrop() {
            if (staticBackdrop.matches) clear();
        }

        hero.addEventListener('pointerenter', track, { passive: true });
        hero.addEventListener('pointermove', track, { passive: true });
        hero.addEventListener('pointerdown', track, { passive: true });
        hero.addEventListener('pointerleave', fade);
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', fade);
        window.addEventListener('blur', clear);
        document.addEventListener('visibilitychange', clear);
        staticBackdrop.addEventListener('change', updateBackdrop);

        return () => {
            hero.removeEventListener('pointerenter', track);
            hero.removeEventListener('pointermove', track);
            hero.removeEventListener('pointerdown', track);
            hero.removeEventListener('pointerleave', fade);
            window.removeEventListener('pointerup', release);
            window.removeEventListener('pointercancel', fade);
            window.removeEventListener('blur', clear);
            document.removeEventListener('visibilitychange', clear);
            staticBackdrop.removeEventListener('change', updateBackdrop);
            clear();
        };
    }, []);

    return <div ref={backdrop} className={s.heroBackdrop} aria-hidden="true" data-testid="hero-backdrop"/>;
}
