'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState, type MouseEvent } from 'react';
import portrait from '@/public/people/pavol-hejny-studio-neat.webp';
import hat from '@/public/people/pavol-hejny-hat.webp';
import s from './pavol-portrait.module.css';

type PavolPortraitProps = {
    readonly sizes: string;
    readonly hatSizes?: string;
    readonly priority?: boolean;
    /** Allows the Easter egg; false disables both URL and gesture activation. */
    readonly showHat?: boolean;
};

/** One Easter egg for every brand, with a hat-free static rendering fallback. */
export function PavolPortrait(props: PavolPortraitProps) {
    return (
        <Suspense fallback={<Portrait {...props} queryHat={false} />}>
            <PortraitWithQuery {...props} />
        </Suspense>
    );
}

function PortraitWithQuery(props: PavolPortraitProps) {
    const search = useSearchParams();
    return <Portrait {...props} queryHat={search?.get('hat') === '1' || search?.get('head') === '1'} />;
}

/** The approved portrait and removable hat share one intrinsic coordinate system. */
function Portrait({
    sizes,
    hatSizes = '140px',
    priority = false,
    showHat = true,
    queryHat,
}: PavolPortraitProps & { readonly queryHat: boolean }) {
    const [revealed, setRevealed] = useState(false);
    const taps = useRef({ count: 0, startedAt: 0 });
    const visible = showHat && (queryHat || revealed);
    const arrival = revealed && !queryHat ? s.hatArriving : '';

    function revealHat(event: MouseEvent<HTMLButtonElement>) {
        if (visible) return;
        // Keyboard and assistive activation use the native button's single action.
        if (event.detail === 0) {
            setRevealed(true);
            return;
        }
        const now = performance.now();
        if (taps.current.count === 0 || now - taps.current.startedAt > 1000) {
            taps.current = { count: 1, startedAt: now };
        } else if (++taps.current.count === 3) {
            taps.current.count = 0;
            setRevealed(true);
        }
    }

    return (
        <div className={s.portrait}>
            {visible && (
                <div className={`${s.accessoryFrame} ${s.hatRearFrame} ${arrival}`} aria-hidden="true">
                    <span className={s.hatInterior} />
                </div>
            )}
            <div className={s.portraitCrop}>
                <Image className={s.photo} src={portrait} alt="Pavol Hejný" sizes={sizes} priority={priority} draggable={false} />
            </div>
            {visible && (
                <div className={`${s.accessoryFrame} ${arrival}`} aria-hidden="true">
                    <span
                        className={s.hatShadow}
                        style={{ maskImage: `url(${portrait.src})`, WebkitMaskImage: `url(${portrait.src})` }}
                    />
                    <Image className={s.hat} src={hat} alt="" sizes={hatSizes} priority={priority} draggable={false} />
                </div>
            )}
            {showHat && (
                <button type="button" className={s.revealHat} aria-label="Pavol Hejný — 🎩" onClick={revealHat} />
            )}
        </div>
    );
}
