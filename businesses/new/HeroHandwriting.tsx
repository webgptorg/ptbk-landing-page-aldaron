import { memo, useId, type CSSProperties } from 'react';
import { handwritingFor } from './heroHandwriting';
import s from './hero-headline.module.css';

export const HANDWRITING_MS = 1200;
export const HANDWRITING_DELAY_MS = 120;
// Keep each activity's drawing identical across SSR, hydration and pause/resume.
export const HeroHandwriting = memo(function HeroHandwriting({ word }: { word: string }) {
    const drawing = handwritingFor(word);
    const id = useId();
    return <svg className={s.handwriting} data-hero-handwriting={word} data-handwriting-source="calligrapher-style-9"
        viewBox={`0 -20 ${drawing.width} 190`} style={{ width: `${drawing.width / 100}em` }}
        aria-hidden="true" focusable="false">
        {drawing.strokes.map((path, index) => <g key={index}>
            <defs><mask id={`${id}-${index}`} className={s.inkMask} maskUnits="userSpaceOnUse" x="-4" y="-25" width={drawing.width + 8} height="210">
                <path className={s.penStroke} d={path.spine} pathLength="1" fill="none" stroke="white"
                    strokeWidth={path.maskWidth + path.edgeWidth} strokeLinecap="round" strokeLinejoin="round"
                    style={{ '--pen-delay': `${HANDWRITING_DELAY_MS + path.start * HANDWRITING_MS}ms`, '--pen-duration': `${path.duration * HANDWRITING_MS}ms` } as CSSProperties}/>
            </mask></defs>
            <path className={s.inkStroke} d={path.outline} mask={`url(#${id}-${index})`}
                stroke={path.edgeWidth ? 'currentColor' : undefined} strokeWidth={path.edgeWidth}/>
        </g>)}
    </svg>;
});
