import { useEffect, useRef, useState } from 'react';
import s from './hero-headline.module.css';

const CENTER = { x: 0, y: 0 };
const REST = { head: CENTER, eyes: CENTER };
const clamp = (value: number) => Math.max(-1, Math.min(1, value));

function easeToward(current: typeof CENTER, target: typeof CENTER, elapsed: number, timeConstant: number) {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    if (Math.abs(dx) < .002 && Math.abs(dy) < .002) return target;

    const smoothing = 1 - Math.exp(-elapsed / timeConstant);
    return { x: current.x + dx * smoothing, y: current.y + dy * smoothing };
}

export function PromptbookRobotHead() {
    const head = useRef<SVGGElement>(null);
    const [look, setLook] = useState(REST);

    useEffect(() => {
        const svg = head.current?.ownerSVGElement;
        const hero = svg?.closest<HTMLElement>('[data-landing-hero]');
        if (!svg || !hero) return;

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let target = CENTER;
        let current = REST;
        let activePointer: number | undefined;
        let activeTouch: number | undefined;
        let frame: number | undefined;
        let previousTime = 0;

        function animate(now: number) {
            const elapsed = Math.max(0, Math.min(now - previousTime, 50));
            previousTime = now;
            current = {
                head: easeToward(current.head, target, elapsed, 105),
                eyes: easeToward(current.eyes, target, elapsed, 36),
            };
            frame = current.head === target && current.eyes === target ? undefined : window.requestAnimationFrame(animate);
            setLook(current);
        }

        function lookAt(next: typeof CENTER) {
            target = next;
            if (frame === undefined) {
                previousTime = performance.now();
                frame = window.requestAnimationFrame(animate);
            }
        }

        const trackPosition = (clientX: number, clientY: number) => {
            const bounds = svg.getBoundingClientRect();
            // The center of the head in the neutral 112 × 112 view box.
            const x = clientX - (bounds.left + bounds.width / 2);
            const headY = bounds.top + bounds.height * 45.12 / 112;
            const y = clientY - headY;
            // Reach the upward pose in the short gap toward the menu, even near the viewport edge.
            // Keep the existing downward response over one full mascot height.
            const verticalRange = y < 0 ? Math.min(bounds.height * .6, headY) : bounds.height;
            lookAt({ x: clamp(x / 180), y: clamp(y / Math.max(verticalRange, 1)) });
        };

        function trackPointer(event: PointerEvent) {
            if (motion.matches || !event.isPrimary || event.pointerType === 'touch' || activeTouch !== undefined) return;
            if (event.pointerType !== 'mouse' && event.type !== 'pointerdown' && activePointer !== event.pointerId) return;
            // Include the header above the hero, where an upward-looking pointer lands.
            const bounds = hero!.getBoundingClientRect();
            if (bounds.bottom <= 0 || bounds.top >= window.innerHeight || event.clientY > bounds.bottom) {
                release(event);
                return;
            }
            activePointer = event.pointerId;
            trackPosition(event.clientX, event.clientY);
        }

        function release(event: PointerEvent) {
            if (event.pointerId !== activePointer) return;
            activePointer = undefined;
            lookAt(CENTER);
        }

        function lift(event: PointerEvent) {
            if (event.pointerType !== 'mouse') release(event);
        }

        // Native scrolling cancels touch pointer events, but passive touch events keep following the finger.
        function startTouch(event: TouchEvent) {
            if (motion.matches || activeTouch !== undefined || event.touches.length !== 1) return;
            const touch = event.changedTouches[0];
            activePointer = undefined;
            activeTouch = touch.identifier;
            trackPosition(touch.clientX, touch.clientY);
        }

        function moveTouch(event: TouchEvent) {
            if (activeTouch === undefined) return;
            const touch = Array.from(event.changedTouches).find(({ identifier }) => identifier === activeTouch);
            if (touch) trackPosition(touch.clientX, touch.clientY);
        }

        function endTouch(event: TouchEvent) {
            if (activeTouch === undefined || Array.from(event.touches).some(({ identifier }) => identifier === activeTouch)) return;
            activeTouch = undefined;
            lookAt(CENTER);
        }

        function reset() {
            if (frame !== undefined) window.cancelAnimationFrame(frame);
            frame = undefined;
            activePointer = undefined;
            activeTouch = undefined;
            target = CENTER;
            current = REST;
            setLook(REST);
        }

        document.addEventListener('pointerdown', trackPointer, { passive: true });
        document.addEventListener('pointermove', trackPointer, { passive: true });
        document.documentElement.addEventListener('pointerleave', release);
        hero.addEventListener('touchstart', startTouch, { passive: true });
        window.addEventListener('touchmove', moveTouch, { passive: true });
        window.addEventListener('touchend', endTouch, { passive: true });
        window.addEventListener('touchcancel', endTouch, { passive: true });
        window.addEventListener('pointerup', lift);
        window.addEventListener('pointercancel', release);
        window.addEventListener('blur', reset);
        document.addEventListener('visibilitychange', reset);
        motion.addEventListener('change', reset);
        return () => {
            if (frame !== undefined) window.cancelAnimationFrame(frame);
            document.removeEventListener('pointerdown', trackPointer);
            document.removeEventListener('pointermove', trackPointer);
            document.documentElement.removeEventListener('pointerleave', release);
            hero.removeEventListener('touchstart', startTouch);
            window.removeEventListener('touchmove', moveTouch);
            window.removeEventListener('touchend', endTouch);
            window.removeEventListener('touchcancel', endTouch);
            window.removeEventListener('pointerup', lift);
            window.removeEventListener('pointercancel', release);
            window.removeEventListener('blur', reset);
            document.removeEventListener('visibilitychange', reset);
            motion.removeEventListener('change', reset);
        };
    }, []);

    const yaw = .55 * look.head.x;
    // A stronger upward tilt counters the downward-looking isometric view.
    // Stay just below its .615-radian elevation so the top face remains visible.
    const pitch = -(look.head.y < 0 ? .6 : .4) * look.head.y;
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
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
            <g data-promptbook-robot-eyes transform={`translate(${.085 * look.eyes.x} ${.05 * look.eyes.y})`}>
                <rect x=".353" y=".385" width=".0422" height=".0842"/>
                <rect x=".605" y=".385" width=".0422" height=".0842"/>
            </g>
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
