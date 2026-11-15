import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { HeroHandwriting } from './HeroHandwriting';
import { handwritingFor } from './heroHandwriting';
import s from './hero-headline.module.css';

export type ActivityMotion = 'assemble' | 'code' | 'ledger' | 'plan' | 'handwriting' | 'transcribe' | 'scan' | 'verify';

export const ACTIVITY_MOTIONS: Record<string, ActivityMotion> = {
    pracuje: 'assemble', works: 'assemble',
    vyvíjí: 'code', codes: 'code',
    účtuje: 'ledger', files: 'ledger',
    plánuje: 'plan', plans: 'plan',
    píše: 'handwriting', writes: 'handwriting',
    přepisuje: 'transcribe', replies: 'transcribe',
    analyzuje: 'scan', analyzes: 'scan',
    testuje: 'verify', tests: 'verify',
};

/** A complete invisible copy measures the same typography as the visible word.
 * Only the visible layer remounts; font loading/resizing also refresh the width. */
export const HeroActivity = memo(function HeroActivity({ word, generation, fading }: { word: string; generation: string | number; fading: boolean }) {
    const motion = ACTIVITY_MOTIONS[word];
    const measure = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState<number>();
    useEffect(() => {
        const element = measure.current;
        if (!element) return;
        let disposed = false;
        const update = () => {
            if (disposed) return;
            const next = element.getBoundingClientRect().width;
            if (next > 0) setWidth(previous => previous === next ? previous : next);
        };
        update();
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
        observer?.observe(element);
        document.fonts?.ready.then(update);
        window.addEventListener('resize', update);
        return () => { disposed = true; observer?.disconnect(); window.removeEventListener('resize', update); };
    }, [word]);

    const handwritten = motion === 'handwriting';
    const drawingWidth = handwritten ? `${handwritingFor(word).width / 100}em` : undefined;
    return <span className={s.activity} data-hero-word-slot data-hero-motion={motion}
        style={{ width: width === undefined ? undefined : `${width}px` }}>
        <span ref={measure} className={`${s.wordMeasure} ${motion === 'code' ? s.codeWord : ''}`}
            style={{ width: drawingWidth }} data-hero-typed>{word}</span>
        <span key={generation} className={s.activityLayer} data-fading={fading}>
            {handwritten ? <HeroHandwriting word={word}/> : <span className={`${s.activityWord} ${motion === 'code' ? s.codeWord : ''}`}
                style={{ '--letter-count': word.length } as CSSProperties}>
                <span className={s.wordBody}>
                    {motion === 'ledger' || motion === 'plan' || motion === 'verify' || motion === 'transcribe'
                        ? Array.from(word).map((letter, index) => <span key={index} className={s.letter}
                            style={{ '--letter-index': index, '--pair-index': Math.floor(index / 2), '--transcribe-delay': `${120 + index * 90 + Math.floor(index / 3) * 80}ms`, '--step-offset': `${(index % 3 - 1) * .12}em` } as CSSProperties}>
                            <span className={s.glyph}>{letter}</span>
                        </span>)
                        : word}
                </span>
                <span className={s.activityDetail} aria-hidden="true">
                    {motion === 'verify' && <svg viewBox="0 0 16 16" focusable="false"><path d="m3 8 3.5 3.5L13 4"/></svg>}
                </span>
            </span>}
        </span>
    </span>;
});
