'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Measures a floating control and the space occupied by controls below it in the same horizontal lane. */
export function useFixedControlClearance(
    controlReference: RefObject<HTMLElement | null>,
    obstacleSelector: string,
    isEnabled = true,
) {
    const [measurements, setMeasurements] = useState({ height: 0, clearance: 0 });

    useEffect(() => {
        const control = controlReference.current;
        if (!isEnabled || control === null) return;

        let animationFrame: number | null = null;
        const measureClearance = () => {
            animationFrame = null;
            const controlBounds = control.getBoundingClientRect();
            let clearance = 0;

            document.querySelectorAll(obstacleSelector).forEach((obstacle) => {
                const bounds = obstacle.getBoundingClientRect();
                const isInSameLane =
                    bounds.width > 0 &&
                    bounds.height > 0 &&
                    bounds.left < controlBounds.right &&
                    bounds.right > controlBounds.left &&
                    window.getComputedStyle(obstacle).visibility !== 'hidden';

                if (isInSameLane) clearance = Math.max(clearance, window.innerHeight - bounds.top);
            });

            const height = Math.ceil(controlBounds.height);
            clearance = Math.ceil(clearance);
            setMeasurements((previous) =>
                previous.height === height && previous.clearance === clearance ? previous : { height, clearance },
            );
        };
        const scheduleMeasurement = () => {
            if (animationFrame === null) animationFrame = window.requestAnimationFrame(measureClearance);
        };
        const resizeObserver = new ResizeObserver(scheduleMeasurement);
        const observeControls = () => {
            resizeObserver.disconnect();
            resizeObserver.observe(control);
            document.querySelectorAll(obstacleSelector).forEach((obstacle) => resizeObserver.observe(obstacle));
            scheduleMeasurement();
        };
        const containsObstacle = (node: Node) =>
            node instanceof Element && (node.matches(obstacleSelector) || node.querySelector(obstacleSelector) !== null);
        const mutationObserver = new MutationObserver((records) => {
            const isObstacleChanged = records.some((record) =>
                record.type === 'attributes'
                    ? containsObstacle(record.target)
                    : [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)].some(containsObstacle),
            );
            if (isObstacleChanged) observeControls();
        });

        measureClearance();
        observeControls();
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden'],
        });
        window.addEventListener('resize', scheduleMeasurement, { passive: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('resize', scheduleMeasurement);
            if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        };
    }, [controlReference, obstacleSelector, isEnabled]);

    return measurements;
}
