'use client';

import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, type RefObject } from 'react';

/** Optional presentation only. Scroll never chooses a story step or changes its meaning. */
export default function HomepageSceneMotion({
    sceneReference,
}: {
    readonly sceneReference: RefObject<HTMLDivElement | null>;
}) {
    const { scrollYProgress } = useScroll({ target: sceneReference, offset: ['start end', 'end start'] });
    const applyDepth = (progress: number) => {
        sceneReference.current?.style.setProperty('--ah-tilt', `${12 - progress * 12}deg`);
        sceneReference.current?.style.setProperty('--ah-lift', `${progress * -24}px`);
    };
    useMotionValueEvent(scrollYProgress, 'change', applyDepth);
    useEffect(() => {
        applyDepth(scrollYProgress.get());
        // The controller is unmounted offscreen, in hidden tabs and for reduced motion.
        // Preserve the last still frame; do not run catch-up animations on return.
    });
    return null;
}
