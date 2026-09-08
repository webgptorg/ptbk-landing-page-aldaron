'use client';

import {
    getAiTaKrajtaPersonPortraitPath,
    type AiTaKrajtaPerson,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * How large an avatar is drawn, in pixels
 */
const AVATAR_SIZE_IN_PIXELS = {
    small: 34,
    large: 96,
} as const;

export type AiTaKrajtaAvatarSize = keyof typeof AVATAR_SIZE_IN_PIXELS;

/**
 * The consistent frame shape of each avatar size
 */
const AVATAR_SHAPE_CLASS_NAME: Readonly<Record<AiTaKrajtaAvatarSize, string>> = {
    small: 'rounded-full',
    large: 'rounded-[1.75rem]',
};

/**
 * Restrained background shades which keep every card cohesive while making neighboring portraits distinguishable
 */
const PORTRAIT_BACKGROUNDS = [
    { from: '#6d766f', to: '#38423c', highlight: 'rgba(235, 241, 233, 0.28)' },
    { from: '#74716a', to: '#413f3a', highlight: 'rgba(247, 242, 231, 0.25)' },
    { from: '#667078', to: '#364149', highlight: 'rgba(232, 240, 245, 0.25)' },
    { from: '#746f78', to: '#433e49', highlight: 'rgba(242, 236, 248, 0.22)' },
] as const;

/**
 * Turns a stable person identifier into a gentle portrait-background variation
 */
function getAiTaKrajtaPortraitBackground(personId: string) {
    const characterCodeTotal = Array.from(personId).reduce(
        (total, character) => total + character.charCodeAt(0),
        0,
    );

    return PORTRAIT_BACKGROUNDS[characterCodeTotal % PORTRAIT_BACKGROUNDS.length];
}

/**
 * Normalized portrait of one person, shown next to an episode and on their card
 *
 * Every source image is a transparent, normalized PNG. The frame supplies the background so photographed locations
 * never compete with the page or with one another.
 */
export function AiTaKrajtaPersonAvatar({
    person,
    size = 'small',
    className,
}: {
    readonly person: AiTaKrajtaPerson;
    readonly size?: AiTaKrajtaAvatarSize;
    readonly className?: string;
}) {
    const sizeInPixels = AVATAR_SIZE_IN_PIXELS[size];
    const portraitPath = getAiTaKrajtaPersonPortraitPath(person);
    const portraitBackground = getAiTaKrajtaPortraitBackground(person.id);

    return (
        <span
            className={cn(
                'group/portrait relative inline-flex shrink-0 items-end justify-center overflow-hidden border border-white/10',
                AVATAR_SHAPE_CLASS_NAME[size],
                'transition-[transform,box-shadow,border-color] duration-300 ease-out motion-reduce:transition-none',
                'hover:-translate-y-0.5 hover:border-white/35 hover:shadow-[0_10px_26px_rgba(10,16,12,0.34)]',
                'motion-reduce:hover:translate-y-0',
                className,
            )}
            style={{
                width: sizeInPixels,
                height: sizeInPixels,
                background: `radial-gradient(circle at 72% 16%, ${portraitBackground.highlight}, transparent 45%), linear-gradient(140deg, ${portraitBackground.from}, ${portraitBackground.to})`,
            }}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-white/[0.04] opacity-0 transition-opacity duration-300 group-hover/portrait:opacity-100 motion-reduce:transition-none"
            />
            <Image
                src={portraitPath}
                alt={person.name}
                width={sizeInPixels}
                height={sizeInPixels}
                sizes={`${sizeInPixels}px`}
                className="relative z-10 h-full w-full object-contain object-bottom transition-transform duration-300 ease-out group-hover/portrait:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover/portrait:scale-100"
            />
        </span>
    );
}
