'use client';

import { PROMPTBOOK_CODER_URL } from '@/businesses/ai-ta-krajta/config';
import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { useEffect, useRef, useState } from 'react';

const PROMPTBOOK_CODER_COMMAND = '$ ptbk';
const COMMAND_TYPING_INTERVAL_IN_MILLISECONDS = 110;
const COMMAND_COMPLETION_DELAY_IN_MILLISECONDS = 360;
const BADGE_ANIMATION_INTERVAL_IN_MILLISECONDS = 1_100;
const POINTER_LOOK_DURATION_IN_MILLISECONDS = 700;
const SCROLL_REACTION_DURATION_IN_MILLISECONDS = 260;
const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

const IDLE_BADGE_FRAMES = ['-<@@/>-', '~<@@/>—', '=<@@/>^', '-<--/>-'] as const;
const HOVER_BADGE_FRAMES = ['=<@@/>- {}', '~<@@/>— 🐍', '^<@@/>~ 🎨'] as const;
const POINTER_BADGE_FRAMES = {
    left: '←<@@/>—',
    right: '—<@@/>→',
    up: '^<@@/>^',
    down: 'v<@@/>v',
} as const;
const SCROLLING_BADGE_FRAME = '~<@@/>≈';

type PointerDirection = keyof typeof POINTER_BADGE_FRAMES;

type MousePosition = {
    readonly clientX: number;
    readonly clientY: number;
};

/**
 * Finds the direction in which the octopus should turn its eyes towards a mouse pointer
 */
function getPointerDirection(mousePosition: MousePosition, badgeBounds: DOMRect): PointerDirection {
    const horizontalDistance = mousePosition.clientX - (badgeBounds.left + badgeBounds.width / 2);
    const verticalDistance = mousePosition.clientY - (badgeBounds.top + badgeBounds.height / 2);
    const isHorizontalDistanceLarger = Math.abs(horizontalDistance) >= Math.abs(verticalDistance);

    if (isHorizontalDistanceLarger) {
        return horizontalDistance < 0 ? 'left' : 'right';
    }

    return verticalDistance < 0 ? 'up' : 'down';
}

/**
 * Chooses a frame without making every source of interaction know about the others
 */
function getBadgeFrame({
    isHovered,
    isPageScrolling,
    pointerDirection,
    animationFrameIndex,
}: {
    readonly isHovered: boolean;
    readonly isPageScrolling: boolean;
    readonly pointerDirection: PointerDirection | null;
    readonly animationFrameIndex: number;
}): string {
    if (isPageScrolling) {
        return SCROLLING_BADGE_FRAME;
    }

    if (isHovered) {
        return HOVER_BADGE_FRAMES[animationFrameIndex % HOVER_BADGE_FRAMES.length];
    }

    if (pointerDirection !== null) {
        return POINTER_BADGE_FRAMES[pointerDirection];
    }

    return IDLE_BADGE_FRAMES[animationFrameIndex % IDLE_BADGE_FRAMES.length];
}

/**
 * Whether the browser asks the site to avoid non-essential motion
 */
function isReducedMotionPreferred(): boolean {
    return window.matchMedia?.(REDUCED_MOTION_MEDIA_QUERY).matches ?? false;
}

/**
 * A tiny, terminal-flavoured credit for Promptbook coder
 *
 * Note: Its mouse and scroll reactions intentionally only replace text at a throttled cadence. It never owns a
 *       continuously rendered animation loop, so it remains a small bit of personality beside the podcast rather
 *       than a competing widget.
 */
export function AiTaKrajtaPromptbookCoderBadge() {
    const { playingEpisode } = useAiTaKrajtaPageState();
    const badgeElementReference = useRef<HTMLAnchorElement | null>(null);
    const [displayedCommandLength, setDisplayedCommandLength] = useState(1);
    const [isCommandEntered, setIsCommandEntered] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPageScrolling, setIsPageScrolling] = useState(false);
    const [pointerDirection, setPointerDirection] = useState<PointerDirection | null>(null);
    const [animationFrameIndex, setAnimationFrameIndex] = useState(0);
    const isMiniPlayerVisible = playingEpisode !== null;

    useEffect(() => {
        if (isReducedMotionPreferred()) {
            setDisplayedCommandLength(PROMPTBOOK_CODER_COMMAND.length);
            setIsCommandEntered(true);
            return;
        }

        let nextCommandLength = 1;
        let commandCompletionTimeoutId: number | null = null;
        const commandTypingIntervalId = window.setInterval(() => {
            nextCommandLength += 1;
            setDisplayedCommandLength(nextCommandLength);

            if (nextCommandLength !== PROMPTBOOK_CODER_COMMAND.length) {
                return;
            }

            window.clearInterval(commandTypingIntervalId);
            commandCompletionTimeoutId = window.setTimeout(
                () => setIsCommandEntered(true),
                COMMAND_COMPLETION_DELAY_IN_MILLISECONDS,
            );
        }, COMMAND_TYPING_INTERVAL_IN_MILLISECONDS);

        return () => {
            window.clearInterval(commandTypingIntervalId);

            if (commandCompletionTimeoutId !== null) {
                window.clearTimeout(commandCompletionTimeoutId);
            }
        };
    }, []);

    useEffect(() => {
        if (!isCommandEntered || isReducedMotionPreferred()) {
            return;
        }

        const badgeAnimationIntervalId = window.setInterval(
            () => setAnimationFrameIndex((previousAnimationFrameIndex) => previousAnimationFrameIndex + 1),
            BADGE_ANIMATION_INTERVAL_IN_MILLISECONDS,
        );

        return () => window.clearInterval(badgeAnimationIntervalId);
    }, [isCommandEntered]);

    useEffect(() => {
        if (!isCommandEntered || isReducedMotionPreferred()) {
            return;
        }

        let pointerReactionTimeoutId: number | null = null;
        let scrollReactionTimeoutId: number | null = null;
        let mouseMoveAnimationFrameId: number | null = null;
        let latestMousePosition: MousePosition | null = null;
        let previousPointerDirection: PointerDirection | null = null;
        let isScrollReactionVisible = false;

        const clearPointerReactionTimeout = () => {
            if (pointerReactionTimeoutId !== null) {
                window.clearTimeout(pointerReactionTimeoutId);
                pointerReactionTimeoutId = null;
            }
        };

        const renderPointerReaction = () => {
            mouseMoveAnimationFrameId = null;

            const badgeElement = badgeElementReference.current;

            if (badgeElement === null || latestMousePosition === null) {
                return;
            }

            const nextPointerDirection = getPointerDirection(latestMousePosition, badgeElement.getBoundingClientRect());

            if (nextPointerDirection !== previousPointerDirection) {
                previousPointerDirection = nextPointerDirection;
                setPointerDirection(nextPointerDirection);
            }

            clearPointerReactionTimeout();
            pointerReactionTimeoutId = window.setTimeout(() => {
                previousPointerDirection = null;
                setPointerDirection(null);
                pointerReactionTimeoutId = null;
            }, POINTER_LOOK_DURATION_IN_MILLISECONDS);
        };

        const handleMouseMove = (event: MouseEvent) => {
            latestMousePosition = { clientX: event.clientX, clientY: event.clientY };

            if (mouseMoveAnimationFrameId === null) {
                mouseMoveAnimationFrameId = window.requestAnimationFrame(renderPointerReaction);
            }
        };

        const handleScroll = () => {
            if (!isScrollReactionVisible) {
                isScrollReactionVisible = true;
                setIsPageScrolling(true);
            }

            if (scrollReactionTimeoutId !== null) {
                window.clearTimeout(scrollReactionTimeoutId);
            }

            scrollReactionTimeoutId = window.setTimeout(() => {
                isScrollReactionVisible = false;
                setIsPageScrolling(false);
                scrollReactionTimeoutId = null;
            }, SCROLL_REACTION_DURATION_IN_MILLISECONDS);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            clearPointerReactionTimeout();

            if (scrollReactionTimeoutId !== null) {
                window.clearTimeout(scrollReactionTimeoutId);
            }

            if (mouseMoveAnimationFrameId !== null) {
                window.cancelAnimationFrame(mouseMoveAnimationFrameId);
            }
        };
    }, [isCommandEntered]);

    const badgeFrame = isCommandEntered
        ? getBadgeFrame({
              isHovered,
              isPageScrolling,
              pointerDirection,
              animationFrameIndex,
          })
        : PROMPTBOOK_CODER_COMMAND.slice(0, displayedCommandLength);
    const bottomOffsetClassName = isMiniPlayerVisible ? 'bottom-[5.25rem] sm:bottom-[5.75rem]' : 'bottom-3 sm:bottom-5';

    return (
        <a
            ref={badgeElementReference}
            href={PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Otevřít Promptbook coder v novém okně"
            title="Promptbook coder"
            data-ai-ta-krajta-promptbook-coder-badge
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            className={`fixed right-3 z-40 w-[11rem] rounded-full border border-cyan-300/35 bg-[#101a21]/95 px-3 py-2 font-mono text-[11px] text-cyan-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200/75 hover:bg-[#13242c] hover:shadow-[0_14px_36px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 motion-reduce:transform-none motion-reduce:transition-none sm:right-5 ${bottomOffsetClassName}`}
        >
            <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
                <span aria-hidden="true" className="min-w-0 flex-1 whitespace-nowrap text-center tracking-tight">
                    {badgeFrame}
                    {!isCommandEntered && <span className="text-cyan-300">▋</span>}
                </span>
                <span className="sr-only">Promptbook coder</span>
            </span>
        </a>
    );
}
