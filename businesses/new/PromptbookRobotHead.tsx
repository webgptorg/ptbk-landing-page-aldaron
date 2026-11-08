import { useEffect, useRef, useState } from 'react';
import s from './hero-headline.module.css';

const REST = { yaw: 0, pitch: 0 };
const clamp = (value: number) => Math.max(-1, Math.min(1, value));

export function PromptbookRobotHead() {
    const head = useRef<SVGGElement>(null);
    const [look, setLook] = useState(REST);

    useEffect(() => {
        const svg = head.current?.ownerSVGElement;
        const hero = svg?.closest<HTMLElement>('[data-landing-hero]');
        if (!svg || !hero) return;

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let target = REST;
        let current = REST;
        let activePointer: number | undefined;
        let frame: number | undefined;
        let previousTime = 0;

        function animate(now: number) {
            const elapsed = Math.max(0, Math.min(now - previousTime, 50));
            const smoothing = 1 - Math.exp(-elapsed / 80);
            previousTime = now;
            const yaw = target.yaw - current.yaw;
            const pitch = target.pitch - current.pitch;
            if (Math.abs(yaw) < .001 && Math.abs(pitch) < .001) {
                current = target;
                frame = undefined;
            } else {
                current = { yaw: current.yaw + yaw * smoothing, pitch: current.pitch + pitch * smoothing };
                frame = window.requestAnimationFrame(animate);
            }
            setLook(current);
        }

        function lookAt(next: typeof REST) {
            target = next;
            if (frame === undefined) {
                previousTime = performance.now();
                frame = window.requestAnimationFrame(animate);
            }
        }

        const track = (event: PointerEvent) => {
            if (motion.matches || !event.isPrimary) return;
            if (event.pointerType !== 'mouse' && event.type !== 'pointerdown' && activePointer !== event.pointerId) return;
            activePointer = event.pointerId;

            const bounds = svg.getBoundingClientRect();
            // The center of the head in the neutral 112 × 112 view box.
            const x = event.clientX - (bounds.left + bounds.width / 2);
            const y = event.clientY - (bounds.top + bounds.height * 45.12 / 112);
            lookAt({ yaw: .45 * clamp(x / 180), pitch: -.20 * clamp(y / 180) });
        };

        function release(event: PointerEvent) {
            if (event.pointerId !== activePointer) return;
            activePointer = undefined;
            lookAt(REST);
        }

        function lift(event: PointerEvent) {
            if (event.pointerType !== 'mouse') release(event);
        }

        function reset() {
            if (frame !== undefined) window.cancelAnimationFrame(frame);
            frame = undefined;
            activePointer = undefined;
            current = target = REST;
            setLook(REST);
        }

        hero.addEventListener('pointerdown', track, { passive: true });
        hero.addEventListener('pointermove', track, { passive: true });
        hero.addEventListener('pointerleave', release);
        window.addEventListener('pointerup', lift);
        window.addEventListener('pointercancel', release);
        window.addEventListener('blur', reset);
        document.addEventListener('visibilitychange', reset);
        motion.addEventListener('change', reset);
        return () => {
            if (frame !== undefined) window.cancelAnimationFrame(frame);
            hero.removeEventListener('pointerdown', track);
            hero.removeEventListener('pointermove', track);
            hero.removeEventListener('pointerleave', release);
            window.removeEventListener('pointerup', lift);
            window.removeEventListener('pointercancel', release);
            window.removeEventListener('blur', reset);
            document.removeEventListener('visibilitychange', reset);
            motion.removeEventListener('change', reset);
        };
    }, []);

    const cosYaw = Math.cos(look.yaw);
    const sinYaw = Math.sin(look.yaw);
    const cosPitch = Math.cos(look.pitch);
    const sinPitch = Math.sin(look.pitch);
    // Rotate the cube around its neck and project into the mascot's isometric view.
    function project(x: number, y: number, z: number) {
        const side = (x * (cosYaw + sinYaw) + z * (sinYaw - cosYaw)) / Math.SQRT2;
        const depth = (x * (cosYaw - sinYaw) + z * (sinYaw + cosYaw)) / Math.SQRT2;
        const tiltedDepth = depth * cosPitch - y * sinPitch;
        const height = y * cosPitch + depth * sinPitch;
        return [56 + 33.01 * Math.SQRT2 * side, 64.18 + 19.06 * Math.SQRT2 * tiltedDepth - 38.12 * height];
    }

    const frontTopLeft = project(-.5, 1, .5);
    const frontTopRight = project(.5, 1, .5);
    const frontBottomLeft = project(-.5, 0, .5);
    const frontBottomRight = project(.5, 0, .5);
    const backTopRight = project(.5, 1, -.5);
    const backBottomRight = project(.5, 0, -.5);
    const backTopLeft = project(-.5, 1, -.5);
    const topCenter = project(0, 1, 0);

    const [left, top] = frontTopLeft;
    const [right, rightY] = frontTopRight;
    const [bottomX, bottom] = frontBottomLeft;
    const faceTransform = `matrix(${right - left} ${rightY - top} ${bottomX - left} ${bottom - top} ${left} ${top})`;

    return <g ref={head} className={s.robotHead} data-promptbook-robot-head>
        <polygon points={[frontBottomRight, backBottomRight, backTopRight, frontTopRight].join(' ')} fill="#17386C"/>
        <polygon points={[frontBottomLeft, frontBottomRight, frontTopRight, frontTopLeft].join(' ')} fill="#FFFFFF"/>
        <g transform={faceTransform} fill="#FFFFFF" stroke="none">
            <rect x=".16" y=".23" width=".68" height=".54" rx=".095" fill="#111318"/>
            <rect x=".353" y=".385" width=".0422" height=".0842"/>
            <rect x=".605" y=".385" width=".0422" height=".0842"/>
            <rect x=".353" y=".553" width=".0422" height=".0422"/>
            <rect x=".395" y=".595" width=".0422" height=".0422"/>
            <rect x=".437" y=".637" width=".1262" height=".0422"/>
            <rect x=".563" y=".595" width=".0422" height=".0422"/>
            <rect x=".605" y=".553" width=".0422" height=".0422"/>
        </g>
        <polygon points={[frontTopLeft, frontTopRight, backTopRight, backTopLeft].join(' ')} fill="#EEF3FF"/>
        <polygon points={[backTopLeft, frontTopLeft, topCenter].join(' ')} fill="#17386C" stroke="none"/>
    </g>;
}
