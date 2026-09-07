'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AiTaKrajtaSnakeGame } from '@/businesses/ai-ta-krajta/AiTaKrajtaSnakeGame';
import {
    AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { useCallback, useState, type MouseEvent } from 'react';

/**
 * Finds the exact canvas frame occupied by the SVG before it turns into the game
 */
function getAiTaKrajtaMarkFrame(
    terrariumElement: HTMLElement,
    markElement: HTMLElement,
): AiTaKrajtaMarkFrame | null {
    const terrariumBounds = terrariumElement.getBoundingClientRect();
    const markBounds = markElement.getBoundingClientRect();
    const isMarkFrameVisible = markBounds.width > 0 && markBounds.height > 0;

    if (!isMarkFrameVisible) {
        return null;
    }

    return {
        left: markBounds.left - terrariumBounds.left,
        top: markBounds.top - terrariumBounds.top,
        width: markBounds.width,
        height: markBounds.height,
    };
}

/**
 * The canonical logo, either as the button which starts the game or as its short-lived visual handoff
 */
function AiTaKrajtaSnakeLogo({
    onGameStart,
}: {
    readonly onGameStart?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
    const mark = <AiTaKrajtaMark className={`h-full w-full ${AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME}`} />;
    const className = 'block w-1/2 max-w-[13rem] rounded-full bg-transparent p-0';

    if (onGameStart === undefined) {
        return <span className={`${className} pointer-events-none`}>{mark}</span>;
    }

    return (
        <button
            type="button"
            onClick={onGameStart}
            className={`${className} cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#ff9b8f]`}
            aria-label="Spustit minihru s krajtou"
        >
            {mark}
        </button>
    );
}

/**
 * The logo which turns into a game
 *
 * Note: The snake starts as the mark of the show and uncoils when a visitor clicks it, so nobody who came to find an
 *       episode gets a moving canvas thrown at them.
 */
export function AiTaKrajtaSnakeTerrarium() {
    const [initialMarkFrame, setInitialMarkFrame] = useState<AiTaKrajtaMarkFrame | null>(null);
    const [isLogoOverlayVisible, setIsLogoOverlayVisible] = useState(true);
    const isGameRunning = initialMarkFrame !== null;

    const handleGameStart = (event: MouseEvent<HTMLButtonElement>) => {
        const terrariumElement = event.currentTarget.closest<HTMLElement>('[data-ai-ta-krajta-terrarium]');
        const markFrame =
            terrariumElement === null ? null : getAiTaKrajtaMarkFrame(terrariumElement, event.currentTarget);

        if (markFrame === null) {
            return;
        }

        setInitialMarkFrame(markFrame);
        setIsLogoOverlayVisible(true);
    };

    const handleInitialMarkFrameDrawn = useCallback(() => {
        setIsLogoOverlayVisible(false);
    }, []);

    return (
        <div className="relative">
            <div
                data-ai-ta-krajta-terrarium
                className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#232a25] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[2.5rem]"
            >
                <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] [background-size:22px_22px]" />

                {isGameRunning && initialMarkFrame !== null && (
                    <AiTaKrajtaSnakeGame
                        initialMarkFrame={initialMarkFrame}
                        onInitialMarkFrameDrawn={handleInitialMarkFrameDrawn}
                    />
                )}

                {isLogoOverlayVisible && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {isGameRunning ? (
                            <AiTaKrajtaSnakeLogo />
                        ) : (
                            <AiTaKrajtaSnakeLogo onGameStart={handleGameStart} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
