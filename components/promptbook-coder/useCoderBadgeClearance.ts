'use client';

import { useEffect, type RefObject } from 'react';

/** Measures only fixed controls sharing this corner, including ones mounted after the badge. */
export function useCoderBadgeClearance(
    badgeReference: RefObject<HTMLAnchorElement | null>,
    obstacleSelector: string,
) {
    useEffect(() => {
        const badge = badgeReference.current;
        if (badge === null) return;

        let animationFrame: number | null = null;
        const measureClearance = () => {
            animationFrame = null;
            const badgeBounds = badge.getBoundingClientRect();
            let clearance = 0;

            document.querySelectorAll(obstacleSelector).forEach((obstacle) => {
                const bounds = obstacle.getBoundingClientRect();
                const isInCorner =
                    bounds.width > 0 &&
                    bounds.height > 0 &&
                    bounds.left < badgeBounds.right &&
                    bounds.right > badgeBounds.left;
                if (isInCorner) clearance = Math.max(clearance, window.innerHeight - bounds.top);
            });

            badge.style.setProperty('--coder-obstacle-inset', `${clearance}px`);
        };
        const scheduleMeasurement = () => {
            if (animationFrame === null) animationFrame = window.requestAnimationFrame(measureClearance);
        };
        const resizeObserver = new ResizeObserver(scheduleMeasurement);
        const observeObstacles = () => {
            resizeObserver.disconnect();
            document.querySelectorAll(obstacleSelector).forEach((obstacle) => resizeObserver.observe(obstacle));
            scheduleMeasurement();
        };
        const mutationObserver = new MutationObserver((records) => {
            const isObstacleChanged = records.some((record) =>
                [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)].some(
                    (node) =>
                        node instanceof Element &&
                        (node.matches(obstacleSelector) || node.querySelector(obstacleSelector) !== null),
                ),
            );
            if (isObstacleChanged) observeObstacles();
        });

        observeObstacles();
        mutationObserver.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('resize', scheduleMeasurement, { passive: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('resize', scheduleMeasurement);
            if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        };
    }, [badgeReference, obstacleSelector]);
}
