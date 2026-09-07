'use client';

import {
    AI_TA_KRAJTA_SNAKE_GAME_STARTED_EVENT_NAME,
    PROMPTBOOK_CODER_INITIAL_OCTOPUS,
    PROMPTBOOK_CODER_TERMINAL_COMMAND,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPromptbookCoder';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Delay between entered terminal characters, in milliseconds
 */
const TERMINAL_CHARACTER_DELAY_IN_MILLISECONDS = 95;

/**
 * Time the completed command stays visible before the coder appears, in milliseconds
 */
const TERMINAL_COMMAND_HOLD_DURATION_IN_MILLISECONDS = 520;

/**
 * Pace of the coder's quiet background actions, in milliseconds
 */
const IDLE_ACTIVITY_INTERVAL_IN_MILLISECONDS = 3_200;

/**
 * Duration of its occasional closed-eye frame, in milliseconds
 */
const EYE_BLINK_DURATION_IN_MILLISECONDS = 130;

/**
 * How long a deliberate interaction remains readable, in milliseconds
 */
const INTERACTION_DURATION_IN_MILLISECONDS = 1_100;

/**
 * Avoids repeatedly measuring the badge during a continuous pointer movement
 */
const POINTER_REACTION_INTERVAL_IN_MILLISECONDS = 140;

/**
 * The pointer only gets a reaction when it reaches the badge's small personal space
 */
const POINTER_REACTION_DISTANCE_IN_PIXELS = 280;

type PromptbookCoderBadgeActivity =
    | 'resting'
    | 'programming'
    | 'paintingEmojis'
    | 'playingWithSnake'
    | 'waving'
    | 'lookingLeft'
    | 'lookingRight'
    | 'lookingUp'
    | 'lookingDown'
    | 'scrollingUp'
    | 'scrollingDown';

/**
 * Every action remains one line wide: the tentacles change shape while the two @ signs remain the coder's eyes.
 */
const ASCII_BY_ACTIVITY: Readonly<Record<PromptbookCoderBadgeActivity, string>> = {
    resting: PROMPTBOOK_CODER_INITIAL_OCTOPUS,
    programming: '=<@@/>= { }',
    paintingEmojis: '^<@@/>~ 🎨 :)',
    playingWithSnake: '~<@@/>~ 🐍',
    waving: '^<@@/>~',
    lookingLeft: '←-<@@/>~',
    lookingRight: '~<@@/>-→',
    lookingUp: '↑^<@@/>^',
    lookingDown: '—<@@/>—↓',
    scrollingUp: '↑~<@@/>~',
    scrollingDown: '~<@@/>~↓',
};

/**
 * The actions quietly rotated through when the visitor is not talking to the badge
 */
const IDLE_ACTIVITIES: readonly PromptbookCoderBadgeActivity[] = [
    'programming',
    'paintingEmojis',
    'playingWithSnake',
    'resting',
];

/**
 * Reads the visitor's motion relative to the badge into the smallest useful one-line reaction
 */
function getPointerActivity(
    clientX: number,
    clientY: number,
    badgeBounds: DOMRect,
): PromptbookCoderBadgeActivity {
    const horizontalDistance = clientX - (badgeBounds.left + badgeBounds.width / 2);
    const verticalDistance = clientY - (badgeBounds.top + badgeBounds.height / 2);
    const isPointerCloserAlongHorizontalAxis = Math.abs(horizontalDistance) >= Math.abs(verticalDistance);

    if (isPointerCloserAlongHorizontalAxis) {
        return horizontalDistance < 0 ? 'lookingLeft' : 'lookingRight';
    }

    return verticalDistance < 0 ? 'lookingUp' : 'lookingDown';
}

/**
 * Checks whether the pointer has moved close enough for the octopus to notice it
 */
function isPointerNearBadge(clientX: number, clientY: number, badgeBounds: DOMRect): boolean {
    const horizontalDistance = clientX - (badgeBounds.left + badgeBounds.width / 2);
    const verticalDistance = clientY - (badgeBounds.top + badgeBounds.height / 2);

    return Math.hypot(horizontalDistance, verticalDistance) <= POINTER_REACTION_DISTANCE_IN_PIXELS;
}

/**
 * Replaces the eyes only for a very short blink, preserving the familiar octopus shape between blinks
 */
function getActivityAscii(activity: PromptbookCoderBadgeActivity, isBlinking: boolean): string {
    const ascii = ASCII_BY_ACTIVITY[activity];

    return isBlinking ? ascii.replace('@@', '--') : ascii;
}

/**
 * Respects a visitor who asks the browser not to animate the interface
 */
function usePrefersReducedMotion(): boolean {
    const [isReducedMotion, setIsReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') {
            return;
        }

        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateReducedMotionPreference = () => setIsReducedMotion(reducedMotionQuery.matches);

        updateReducedMotionPreference();
        reducedMotionQuery.addEventListener('change', updateReducedMotionPreference);

        return () => reducedMotionQuery.removeEventListener('change', updateReducedMotionPreference);
    }, []);

    return isReducedMotion;
}

/**
 * Gives the fixed coder badge its tiny terminal boot and the lightweight reactions around it
 *
 * Note: It never owns an animation loop. Timers only change a short line of text, while pointer and scroll listeners
 *       are passive and cleaned up with the page.
 */
export function useAiTaKrajtaPromptbookCoderBadge() {
    const badgeReference = useRef<HTMLAnchorElement | null>(null);
    const interactionTimeoutIdReference = useRef<number | null>(null);
    const interactionActivityReference = useRef<PromptbookCoderBadgeActivity | null>(null);
    const isBadgeHoveredReference = useRef(false);
    const lastPointerReactionTimestampReference = useRef(0);
    const lastScrollPositionInPixelsReference = useRef(0);
    const [typedCharacterCount, setTypedCharacterCount] = useState(1);
    const [isInitialCommandComplete, setIsInitialCommandComplete] = useState(false);
    const [idleActivity, setIdleActivity] = useState<PromptbookCoderBadgeActivity>('resting');
    const [interactionActivity, setInteractionActivity] = useState<PromptbookCoderBadgeActivity | null>(null);
    const [isBadgeHovered, setIsBadgeHovered] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const isReducedMotion = usePrefersReducedMotion();

    const clearInteractionTimeout = useCallback(() => {
        if (interactionTimeoutIdReference.current !== null) {
            window.clearTimeout(interactionTimeoutIdReference.current);
            interactionTimeoutIdReference.current = null;
        }
    }, []);

    const showInteraction = useCallback(
        (nextActivity: PromptbookCoderBadgeActivity) => {
            if (isReducedMotion) {
                return;
            }

            if (interactionActivityReference.current !== nextActivity) {
                interactionActivityReference.current = nextActivity;
                setInteractionActivity(nextActivity);
            }

            clearInteractionTimeout();
            interactionTimeoutIdReference.current = window.setTimeout(() => {
                interactionActivityReference.current = null;
                interactionTimeoutIdReference.current = null;
                setInteractionActivity(null);
            }, INTERACTION_DURATION_IN_MILLISECONDS);
        },
        [clearInteractionTimeout, isReducedMotion],
    );

    useEffect(() => {
        return () => clearInteractionTimeout();
    }, [clearInteractionTimeout]);

    useEffect(() => {
        if (isReducedMotion) {
            setTypedCharacterCount(PROMPTBOOK_CODER_TERMINAL_COMMAND.length);
            setIsInitialCommandComplete(true);
            return;
        }

        if (typedCharacterCount < PROMPTBOOK_CODER_TERMINAL_COMMAND.length) {
            const timeoutId = window.setTimeout(() => {
                setTypedCharacterCount((currentCharacterCount) => currentCharacterCount + 1);
            }, TERMINAL_CHARACTER_DELAY_IN_MILLISECONDS);

            return () => window.clearTimeout(timeoutId);
        }

        const timeoutId = window.setTimeout(
            () => setIsInitialCommandComplete(true),
            TERMINAL_COMMAND_HOLD_DURATION_IN_MILLISECONDS,
        );

        return () => window.clearTimeout(timeoutId);
    }, [isReducedMotion, typedCharacterCount]);

    useEffect(() => {
        if (!isInitialCommandComplete || isReducedMotion) {
            return;
        }

        let idleActivityIndex = 0;
        let blinkTimeoutId: number | null = null;

        const showNextIdleActivity = () => {
            setIsBlinking(true);
            blinkTimeoutId = window.setTimeout(() => {
                setIsBlinking(false);
                setIdleActivity(IDLE_ACTIVITIES[idleActivityIndex]);
                idleActivityIndex = (idleActivityIndex + 1) % IDLE_ACTIVITIES.length;
            }, EYE_BLINK_DURATION_IN_MILLISECONDS);
        };

        const intervalId = window.setInterval(showNextIdleActivity, IDLE_ACTIVITY_INTERVAL_IN_MILLISECONDS);

        return () => {
            window.clearInterval(intervalId);

            if (blinkTimeoutId !== null) {
                window.clearTimeout(blinkTimeoutId);
            }
        };
    }, [isInitialCommandComplete, isReducedMotion]);

    useEffect(() => {
        if (!isInitialCommandComplete || isReducedMotion) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            if (isBadgeHoveredReference.current) {
                return;
            }

            const currentTimestamp = window.performance.now();

            if (
                currentTimestamp - lastPointerReactionTimestampReference.current <
                POINTER_REACTION_INTERVAL_IN_MILLISECONDS
            ) {
                return;
            }

            lastPointerReactionTimestampReference.current = currentTimestamp;

            const badgeBounds = badgeReference.current?.getBoundingClientRect();

            if (
                badgeBounds === undefined ||
                !isPointerNearBadge(event.clientX, event.clientY, badgeBounds)
            ) {
                return;
            }

            showInteraction(getPointerActivity(event.clientX, event.clientY, badgeBounds));
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });

        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [isInitialCommandComplete, isReducedMotion, showInteraction]);

    useEffect(() => {
        if (!isInitialCommandComplete || isReducedMotion) {
            return;
        }

        lastScrollPositionInPixelsReference.current = window.scrollY;
        let animationFrameId: number | null = null;

        const handleScroll = () => {
            if (animationFrameId !== null || isBadgeHoveredReference.current) {
                return;
            }

            animationFrameId = window.requestAnimationFrame(() => {
                animationFrameId = null;
                const currentScrollPositionInPixels = window.scrollY;
                const scrollDistanceInPixels =
                    currentScrollPositionInPixels - lastScrollPositionInPixelsReference.current;

                lastScrollPositionInPixelsReference.current = currentScrollPositionInPixels;

                if (Math.abs(scrollDistanceInPixels) < 2) {
                    return;
                }

                const isScrollingDown = scrollDistanceInPixels > 0;
                showInteraction(isScrollingDown ? 'scrollingDown' : 'scrollingUp');
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isInitialCommandComplete, isReducedMotion, showInteraction]);

    useEffect(() => {
        if (isReducedMotion) {
            return;
        }

        const handleSnakeGameStarted = () => {
            // Note: The snake can be clicked while the command is still typing. Keeping the idle pose means that,
            //       once the terminal opens, the octopus still gets to celebrate the game starting.
            setIdleActivity('playingWithSnake');
            showInteraction('playingWithSnake');
        };

        window.addEventListener(AI_TA_KRAJTA_SNAKE_GAME_STARTED_EVENT_NAME, handleSnakeGameStarted);

        return () => window.removeEventListener(AI_TA_KRAJTA_SNAKE_GAME_STARTED_EVENT_NAME, handleSnakeGameStarted);
    }, [isReducedMotion, showInteraction]);

    const handlePointerEnter = () => {
        isBadgeHoveredReference.current = true;
        setIsBadgeHovered(true);
    };

    const handlePointerLeave = () => {
        isBadgeHoveredReference.current = false;
        setIsBadgeHovered(false);
    };

    const activeActivity = isBadgeHovered ? 'waving' : (interactionActivity ?? idleActivity);
    const isEyeBlinking = isBlinking && !isReducedMotion;
    const displayedAscii = isInitialCommandComplete
        ? getActivityAscii(activeActivity, isEyeBlinking)
        : PROMPTBOOK_CODER_TERMINAL_COMMAND.slice(0, typedCharacterCount);

    return {
        badgeReference,
        displayedAscii,
        isInitialCommandComplete,
        handlePointerEnter,
        handlePointerLeave,
    };
}
