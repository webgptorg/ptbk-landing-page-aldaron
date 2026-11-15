import { memo, type CSSProperties } from 'react';
import { handwritingFor } from './heroHandwriting';
import s from './hero-headline.module.css';

export const HANDWRITING_MS = 1200;
export const HANDWRITING_DELAY_MS = 120;
// Keep each activity's drawing identical across SSR, hydration and pause/resume.
export const HeroHandwriting = memo(function HeroHandwriting({ word }: { word: string }) {
    const drawing = handwritingFor(word);
    return <svg className={s.handwriting} data-hero-handwriting={word} viewBox={`0 0 ${drawing.width} 120`}
        style={{ width: `${drawing.width / 90}em` }} fill="none" stroke="currentColor" strokeWidth="3.6"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {drawing.strokes.map((path, index) => <path key={index} className={s.penStroke}
            d={path.d} transform={`translate(${path.x} 0)`} pathLength="1"
            style={{ '--pen-delay': `${HANDWRITING_DELAY_MS + path.start * HANDWRITING_MS}ms`, '--pen-duration': `${path.duration * HANDWRITING_MS}ms` } as CSSProperties}/>)}
    </svg>;
});
