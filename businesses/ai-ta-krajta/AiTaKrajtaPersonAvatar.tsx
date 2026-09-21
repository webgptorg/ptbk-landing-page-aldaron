'use client';

import { getAiTaKrajtaPersonPhotoPath, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
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
 * The two letters standing in for a photograph nobody has taken yet
 */
function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((namePart) => namePart.charAt(0).toUpperCase())
        .join('');
}

/**
 * Turns the name into a stable angle of the gradient, so that two people next to each other never look identical
 */
function getGradientAngleInDegrees(name: string): number {
    const nameCode = Array.from(name).reduce((code, letter) => code + letter.charCodeAt(0), 0);

    return nameCode % 360;
}

/**
 * Round portrait of one person, shown next to an episode and on their card
 *
 * Note: The show has a picture of everyone it has introduced by name so far. Somebody it has none of keeps the
 *       initials on a branded gradient, which is a portrait of its own rather than a fallback which looks broken.
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
    const isLarge = size === 'large';
    const photoPath = getAiTaKrajtaPersonPhotoPath(person);

    return (
        <span
            className={cn(
                'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
                isLarge ? 'text-2xl font-semibold' : 'text-[11px] font-bold',
                className,
            )}
            style={{
                width: sizeInPixels,
                height: sizeInPixels,
                background: `linear-gradient(${getGradientAngleInDegrees(person.name)}deg, ${AI_TA_KRAJTA_COLORS.CORAL}, ${AI_TA_KRAJTA_COLORS.INDIGO})`,
            }}
        >
            {photoPath === null ? (
                <span className="text-white drop-shadow-sm">{getInitials(person.name)}</span>
            ) : (
                <Image
                    src={photoPath}
                    alt={person.name}
                    width={sizeInPixels}
                    height={sizeInPixels}
                    className="h-full w-full object-cover object-top"
                />
            )}
        </span>
    );
}
