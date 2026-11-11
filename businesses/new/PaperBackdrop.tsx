'use client';

import { useEffect, useRef } from 'react';
import { startPaperBackdrop } from './paperBackdrop';
import s from './paper-backdrop.module.css';

/** The approved Paper / grain / 40% combination from the background laboratory. */
export function PaperBackdrop() {
    const layer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (layer.current) return startPaperBackdrop(layer.current);
    }, []);

    return <div ref={layer} className={s.backdrop} aria-hidden="true" data-paper-backdrop data-testid="paper-backdrop" data-palette="papir" data-effect="zrno" data-strength="40">
        <canvas className={s.canvas}/>
    </div>;
}
