'use client';

import { memo, useEffect, useId, useState, type CSSProperties } from 'react';
import { createInkDrawing, freshInkSeed } from './heroInk';
import s from './hero-headline.module.css';

/** Geometry stays still between deliberate drawing events, including re-renders. */
export const HeroUnderline = memo(function HeroUnderline({ generation, locale, replay = 0 }: { generation: number; locale: string; replay?: number }) {
    const id = useId();
    // The same source for server HTML and hydration; fresh ink starts in the effect.
    const [drawing, setDrawing] = useState(() => createInkDrawing(0));
    useEffect(() => {
        setDrawing(previous => createInkDrawing(freshInkSeed(previous.seed)));
    }, [generation, locale, replay]);

    return <svg className={s.underline} data-hero-underline="generative" data-ink-seed={drawing.seed}
        viewBox="0 0 160 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {drawing.strokes.map((stroke, index) => {
            const mask = `${id}-${drawing.seed}-${index}`;
            return <g key={`${drawing.seed}-${index}`} opacity={stroke.opacity}>
                <defs><mask id={mask} className={s.inkMask} maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="40">
                    <path className={s.inkReveal} d={stroke.spine} pathLength="1" fill="none" stroke="white"
                        strokeWidth={stroke.maskWidth} strokeLinecap="round"
                        style={{ '--ink-duration': `${stroke.duration}ms`, '--ink-delay': `${stroke.delay + (generation === 0 && replay === 0 ? 950 : 0)}ms` } as CSSProperties}/>
                    {stroke.texture.map((path, i) => <path key={i} d={path} fill="none" stroke="black" strokeWidth=".45" opacity=".48"/>)}
                </mask></defs>
                <path className={s.inkStroke} d={stroke.outline} mask={`url(#${mask})`}/>
            </g>;
        })}
    </svg>;
});
