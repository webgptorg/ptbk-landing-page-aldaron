import Image from 'next/image';
import portrait from '@/public/people/pavol-hejny-studio-neat.webp';
import hat from '@/public/people/pavol-hejny-hat.webp';
import s from './pavol-portrait.module.css';

/** The approved portrait and removable hat share one intrinsic coordinate system. */
export function PavolPortrait({
    sizes,
    hatSizes = '140px',
    priority = false,
    showHat = true,
}: {
    readonly sizes: string;
    readonly hatSizes?: string;
    readonly priority?: boolean;
    readonly showHat?: boolean;
}) {
    return (
        <div className={s.portrait}>
            {showHat && (
                <div className={`${s.accessoryFrame} ${s.hatRearFrame}`} aria-hidden="true">
                    <span className={s.hatInterior} />
                </div>
            )}
            <div className={s.portraitCrop}>
                <Image className={s.photo} src={portrait} alt="Pavol Hejný" sizes={sizes} priority={priority} />
            </div>
            {showHat && (
                <div className={s.accessoryFrame} aria-hidden="true">
                    <span
                        className={s.hatShadow}
                        style={{ maskImage: `url(${portrait.src})`, WebkitMaskImage: `url(${portrait.src})` }}
                    />
                    <Image className={s.hat} src={hat} alt="" sizes={hatSizes} priority={priority} draggable={false} />
                </div>
            )}
        </div>
    );
}
