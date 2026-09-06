/**
 * How long one drawn frame of the badge stays on screen, in milliseconds
 *
 * Note: Slow enough to read as a terminal printing one line after another rather than as an animation, which is also
 *       what keeps the badge cheap: everything it does happens between three and four times a second.
 */
export const PROMPTBOOK_CODER_FRAME_IN_MILLISECONDS = 280;

type PromptbookCoderAnimationListener = (frame: number) => void;

const animationListeners = new Set<PromptbookCoderAnimationListener>();

let currentFrame = 0;
let frameTimer = 0;

/**
 * Follows the frames of the badge animation
 *
 * Note: Every badge of one page reads the same clock, so a page wearing the badge twice still counts its frames once
 *       and both badges are always drawn in the same frame. The clock only runs while somebody is listening and
 *       starts over when the last of them leaves, which is what makes the terminal type its command again on the
 *       next page it is worn on.
 *
 * Note: A browser slows a timer of a tab nobody is looking at down to about one frame a second on its own, so a badge
 *       in a forgotten tab costs next to nothing without having to watch for that itself.
 *
 * @param listener told which frame to draw, immediately and then on every frame
 * @returns how to stop listening
 */
export function subscribeToPromptbookCoderAnimationClock(listener: PromptbookCoderAnimationListener): () => void {
    animationListeners.add(listener);
    listener(currentFrame);

    if (frameTimer === 0) {
        frameTimer = window.setInterval(() => {
            currentFrame += 1;

            // Note: The frame is handed to the badges which were listening when it began, so that a badge which
            //       leaves the page in the middle of one is not told about it after it is gone.
            for (const animationListener of Array.from(animationListeners)) {
                animationListener(currentFrame);
            }
        }, PROMPTBOOK_CODER_FRAME_IN_MILLISECONDS);
    }

    return () => {
        animationListeners.delete(listener);

        if (animationListeners.size === 0) {
            window.clearInterval(frameTimer);
            frameTimer = 0;
            currentFrame = 0;
        }
    };
}
