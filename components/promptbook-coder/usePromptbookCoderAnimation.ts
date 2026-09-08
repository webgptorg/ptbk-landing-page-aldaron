'use client';

import {
    DEFAULT_PROMPTBOOK_CODER_POSE,
    PROMPTBOOK_CODER_COMMAND_FRAMES,
    PROMPTBOOK_CODER_TICK_IN_MILLISECONDS,
    getPromptbookCoderFrame,
    type PromptbookCoderFrame,
} from './promptbookCoderAnimation';
import { useEffect, useState, type RefObject } from 'react';

const REACTION_DURATION_IN_MILLISECONDS = 800;
const POINTER_REACTION_DURATION_IN_MILLISECONDS = 1200;
const STILL_FRAME = { pose: DEFAULT_PROMPTBOOK_CODER_POSE, mood: 'idle', command: null };

type TerminalFrame = PromptbookCoderFrame & { readonly command: string | null };

function getEyeLookingAtPointer(pointerPosition: { readonly x: number; readonly y: number }, bounds: DOMRect): string {
    const horizontalDistance = pointerPosition.x - (bounds.left + bounds.width / 2);
    const verticalDistance = pointerPosition.y - (bounds.top + bounds.height / 2);
    if (Math.abs(verticalDistance) > Math.abs(horizontalDistance)) {
        return verticalDistance < 0 ? '◓' : '◒';
    }
    return horizontalDistance < 0 ? '◐' : '◑';
}

/** Events only record intent; one small clock updates this badge, never the page. */
export function usePromptbookCoderAnimation(
    badgeReference: RefObject<HTMLAnchorElement | null>,
    playmateSelector?: string,
): TerminalFrame {
    const [frame, setFrame] = useState<TerminalFrame>({ ...STILL_FRAME, command: PROMPTBOOK_CODER_COMMAND_FRAMES[0] });

    useEffect(() => {
        const badge = badgeReference.current;
        if (badge === null) return;

        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let interval: ReturnType<typeof setInterval> | undefined;
        let tick = 0;
        let isHovered = false;
        let isFocused = false;
        let isPlayingWithSnake = false;
        let pointerPosition: { readonly x: number; readonly y: number } | null = null;
        let lastPointerTime = -Infinity;
        let lastScrollTime = -Infinity;
        let previousScrollPosition = window.scrollY;
        let isScrollingDown = true;

        const showFrame = (nextFrame: TerminalFrame) => {
            setFrame((previousFrame) =>
                previousFrame.command === nextFrame.command &&
                previousFrame.mood === nextFrame.mood &&
                previousFrame.pose === nextFrame.pose
                    ? previousFrame
                    : nextFrame,
            );
        };

        const advanceFrame = () => {
            const currentTick = tick++;
            if (currentTick < PROMPTBOOK_CODER_COMMAND_FRAMES.length) {
                showFrame({ ...STILL_FRAME, command: PROMPTBOOK_CODER_COMMAND_FRAMES[currentTick] });
                return;
            }

            const animationTick = currentTick - PROMPTBOOK_CODER_COMMAND_FRAMES.length;
            const nextFrame = getPromptbookCoderFrame(animationTick, isPlayingWithSnake);
            const now = performance.now();

            if (isHovered || isFocused) {
                showFrame({
                    command: null,
                    mood: 'wave',
                    pose: {
                        ...DEFAULT_PROMPTBOOK_CODER_POSE,
                        leftTentacle: animationTick % 2 === 0 ? '^' : '~',
                        leftEye: '◉',
                        rightEye: animationTick % 5 === 0 ? '.' : '◉',
                        rightTentacle: animationTick % 2 === 0 ? '~' : '^',
                    },
                });
            } else if (now - lastScrollTime < REACTION_DURATION_IN_MILLISECONDS) {
                showFrame({
                    command: null,
                    mood: isScrollingDown ? 'scroll-down' : 'scroll-up',
                    pose: {
                        ...DEFAULT_PROMPTBOOK_CODER_POSE,
                        leftTentacle: isScrollingDown ? '~' : '^',
                        leftEye: isScrollingDown ? '◒' : '◓',
                        rightEye: isScrollingDown ? '◒' : '◓',
                        rightTentacle: isScrollingDown ? '~' : '^',
                    },
                });
            } else if (
                !isPlayingWithSnake &&
                pointerPosition !== null &&
                now - lastPointerTime < POINTER_REACTION_DURATION_IN_MILLISECONDS
            ) {
                const eye = getEyeLookingAtPointer(pointerPosition, badge.getBoundingClientRect());
                showFrame({ command: null, mood: 'watch', pose: { ...nextFrame.pose, leftEye: eye, rightEye: eye } });
            } else {
                showFrame({ ...nextFrame, command: null });
            }
        };

        const synchronizeClock = () => {
            clearInterval(interval);
            if (reducedMotionQuery.matches) {
                tick = PROMPTBOOK_CODER_COMMAND_FRAMES.length;
                showFrame(STILL_FRAME);
            } else if (!document.hidden) {
                interval = setInterval(advanceFrame, PROMPTBOOK_CODER_TICK_IN_MILLISECONDS);
            }
        };

        const recordPointer = (event: PointerEvent) => {
            if (event.pointerType === 'touch' || reducedMotionQuery.matches || document.hidden) return;
            pointerPosition = { x: event.clientX, y: event.clientY };
            lastPointerTime = performance.now();
            isPlayingWithSnake = Boolean(
                playmateSelector && event.target instanceof Element && event.target.closest(playmateSelector),
            );
        };
        const clearPointer = (event: PointerEvent) => {
            if (event.relatedTarget !== null) return;
            pointerPosition = null;
            isPlayingWithSnake = false;
        };
        const recordScroll = () => {
            isScrollingDown = window.scrollY > previousScrollPosition;
            previousScrollPosition = window.scrollY;
            isPlayingWithSnake = false;
            if (!reducedMotionQuery.matches && !document.hidden) lastScrollTime = performance.now();
        };
        const enterBadge = (event: PointerEvent) => {
            isHovered = event.pointerType !== 'touch';
        };
        const leaveBadge = () => {
            isHovered = false;
        };
        const focusBadge = () => {
            isFocused = true;
        };
        const blurBadge = () => {
            isFocused = false;
        };

        synchronizeClock();
        reducedMotionQuery.addEventListener('change', synchronizeClock);
        document.addEventListener('visibilitychange', synchronizeClock);
        window.addEventListener('pointermove', recordPointer, { passive: true });
        window.addEventListener('pointerout', clearPointer, { passive: true });
        window.addEventListener('scroll', recordScroll, { passive: true });
        badge.addEventListener('pointerenter', enterBadge);
        badge.addEventListener('pointerleave', leaveBadge);
        badge.addEventListener('focus', focusBadge);
        badge.addEventListener('blur', blurBadge);

        return () => {
            clearInterval(interval);
            reducedMotionQuery.removeEventListener('change', synchronizeClock);
            document.removeEventListener('visibilitychange', synchronizeClock);
            window.removeEventListener('pointermove', recordPointer);
            window.removeEventListener('pointerout', clearPointer);
            window.removeEventListener('scroll', recordScroll);
            badge.removeEventListener('pointerenter', enterBadge);
            badge.removeEventListener('pointerleave', leaveBadge);
            badge.removeEventListener('focus', focusBadge);
            badge.removeEventListener('blur', blurBadge);
        };
    }, [badgeReference, playmateSelector]);

    return frame;
}
