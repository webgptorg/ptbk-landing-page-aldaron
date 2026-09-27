'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AiTaKrajtaSnakeGame } from '@/businesses/ai-ta-krajta/AiTaKrajtaSnakeGame';
import { AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME } from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { useEffect, useRef, useState } from 'react';

/** The very same SVG paths are the idle logo and the moving animal, for the entire game. */
export function AiTaKrajtaSnakeTerrarium() {
    const markRef = useRef<SVGSVGElement | null>(null);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // The server-rendered button must not accept a click before React can start the game.
    useEffect(() => { setIsReady(true); }, []);

    return (
        <div className="relative">
            <div
                data-ai-ta-krajta-terrarium
                className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#232a25] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[2.5rem]"
            >
                <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_0)] [background-size:22px_22px]" />

                <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
                    <div className="block w-1/2 max-w-[13rem]">
                        <AiTaKrajtaMark
                            ref={markRef}
                            className={`h-full w-full overflow-visible ${AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME}`}
                        />
                    </div>
                </div>

                <AiTaKrajtaSnakeGame markRef={markRef} isActive={isGameRunning} />

                {!isGameRunning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            type="button"
                            disabled={!isReady}
                            onClick={() => setIsGameRunning(true)}
                            className="block aspect-square w-1/2 max-w-[13rem] cursor-pointer rounded-full bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#ff9b8f]"
                            aria-label="Spustit minihru s krajtou"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
