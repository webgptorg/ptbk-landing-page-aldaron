'use client';

import { subscribeToPromptbookCoderAnimationClock } from '@/components/promptbook-coder/promptbookCoderAnimationClock';
import {
    resolvePromptbookCoderPointerAttention,
    type PromptbookCoderOctopusSurroundings,
    type PromptbookCoderScrollDirection,
} from '@/components/promptbook-coder/promptbookCoderOctopusPose';
import { PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES } from '@/components/promptbook-coder/promptbookCoderTerminalBoot';
import { useEffect, useState, type RefObject } from 'react';

/**
 * What the badge notices, together with which frame of its animation it stands at
 */
export type PromptbookCoderBadgeSenses = PromptbookCoderOctopusSurroundings & {
    /**
     * How many frames have passed since the badge was first drawn, the typed command included
     */
    readonly frame: number;
};

/**
 * What the octopus makes of a pointer, a pointer it has lost track of included
 */
type PromptbookCoderNoticedPointer = Pick<PromptbookCoderOctopusSurroundings, 'pointerGaze' | 'isPointerNear'>;

/**
 * How long a pointer which stopped moving still holds the attention of the octopus, in milliseconds
 */
const OCTOPUS_POINTER_ATTENTION_IN_MILLISECONDS = 2500;

/**
 * How long after the last scrolled pixel the page still counts as travelling, in milliseconds
 */
const OCTOPUS_SCROLL_ATTENTION_IN_MILLISECONDS = 450;

/**
 * What the octopus makes of a pointer it cannot see anywhere
 */
const OCTOPUS_UNNOTICED_POINTER: PromptbookCoderNoticedPointer = {
    pointerGaze: null,
    isPointerNear: false,
};

/**
 * The frame a badge which may not move about on its own rests at
 *
 * Note: The first frame after the typed command, which is the octopus as the badge is named after it, `-<@@/>- { }`.
 */
const PROMPTBOOK_CODER_RESTING_FRAME = PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES;

/**
 * Whether the visitor asked their system for as little movement as possible
 *
 * Note: Not every browser of a test environment answers this question, and one which does not is treated as one whose
 *       visitor never asked.
 */
function isReducedMotionPreferred(): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Follows the frames of the badge animation
 *
 * Note: A visitor who asked for less movement is handed the resting frame and no other, which leaves them a badge
 *       that still turns towards them and still greets them, but neither types, blinks nor waves on its own.
 *
 * @returns which frame to draw
 */
function usePromptbookCoderAnimationFrame(): number {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        if (isReducedMotionPreferred()) {
            setFrame(PROMPTBOOK_CODER_RESTING_FRAME);
            return;
        }

        return subscribeToPromptbookCoderAnimationClock(setFrame);
    }, []);

    return frame;
}

/**
 * Follows the pointer of the visitor across the whole page
 *
 * Note: A moved pointer is only measured against the badge once per painted frame and the state is only replaced when
 *       the octopus would be drawn differently, so that a pointer swept across the page redraws the badge a handful
 *       of times rather than on every reported pixel.
 *
 * @param badgeElementRef the drawn line, whose middle every distance is measured from
 * @returns which way the pointer lies and whether it came close, both forgotten once it rests for a while
 */
function usePromptbookCoderPointerAttention(
    badgeElementRef: RefObject<HTMLElement | null>,
): PromptbookCoderNoticedPointer {
    const [pointerAttention, setPointerAttention] = useState<PromptbookCoderNoticedPointer>(OCTOPUS_UNNOTICED_POINTER);

    useEffect(() => {
        let measuringFrame = 0;
        let forgettingTimer = 0;

        const measurePointer = (clientX: number, clientY: number) => {
            const badgeElement = badgeElementRef.current;

            if (badgeElement === null) {
                return;
            }

            const badgeBounds = badgeElement.getBoundingClientRect();
            const noticedPointer = resolvePromptbookCoderPointerAttention(
                clientX - (badgeBounds.left + badgeBounds.width / 2),
                clientY - (badgeBounds.top + badgeBounds.height / 2),
            );

            setPointerAttention((previousAttention) =>
                previousAttention.pointerGaze === noticedPointer.pointerGaze &&
                previousAttention.isPointerNear === noticedPointer.isPointerNear
                    ? previousAttention
                    : noticedPointer,
            );
        };

        const handlePointerMove = (event: PointerEvent) => {
            const { clientX, clientY } = event;

            window.clearTimeout(forgettingTimer);
            forgettingTimer = window.setTimeout(
                () => setPointerAttention(OCTOPUS_UNNOTICED_POINTER),
                OCTOPUS_POINTER_ATTENTION_IN_MILLISECONDS,
            );

            if (measuringFrame !== 0) {
                return;
            }

            measuringFrame = window.requestAnimationFrame(() => {
                measuringFrame = 0;
                measurePointer(clientX, clientY);
            });
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.cancelAnimationFrame(measuringFrame);
            window.clearTimeout(forgettingTimer);
        };
    }, [badgeElementRef]);

    return pointerAttention;
}

/**
 * Watches which way the page is being scrolled
 *
 * @returns the direction of travel, `null` once the page has stood still for a moment
 */
function usePromptbookCoderScrollDirection(): PromptbookCoderScrollDirection | null {
    const [scrollDirection, setScrollDirection] = useState<PromptbookCoderScrollDirection | null>(null);

    useEffect(() => {
        let lastScrollPosition = window.scrollY;
        let stillnessTimer = 0;

        const handleScroll = () => {
            const scrolledDistance = window.scrollY - lastScrollPosition;

            lastScrollPosition = window.scrollY;

            if (scrolledDistance === 0) {
                return;
            }

            setScrollDirection(scrolledDistance > 0 ? 'DOWN' : 'UP');

            window.clearTimeout(stillnessTimer);
            stillnessTimer = window.setTimeout(
                () => setScrollDirection(null),
                OCTOPUS_SCROLL_ATTENTION_IN_MILLISECONDS,
            );
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.clearTimeout(stillnessTimer);
        };
    }, []);

    return scrollDirection;
}

/**
 * Everything the badge notices about the visitor and about the page it sits on
 *
 * Note: This is the only part of the badge which listens to the browser. What is then made of what it notices is
 *       decided by `selectPromptbookCoderOctopusPose` and drawn by `drawPromptbookCoderOctopus`, neither of which
 *       knows that a browser exists.
 *
 * @param badgeElementRef the drawn line, which the pointer is measured against
 * @returns which frame to draw and what the octopus notices while it is drawn
 */
export function usePromptbookCoderBadgeSenses(
    badgeElementRef: RefObject<HTMLElement | null>,
): PromptbookCoderBadgeSenses {
    const frame = usePromptbookCoderAnimationFrame();
    const { pointerGaze, isPointerNear } = usePromptbookCoderPointerAttention(badgeElementRef);
    const scrollDirection = usePromptbookCoderScrollDirection();

    return { frame, pointerGaze, isPointerNear, scrollDirection };
}
