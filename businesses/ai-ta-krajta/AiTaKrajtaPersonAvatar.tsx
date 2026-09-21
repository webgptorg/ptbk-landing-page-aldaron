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
 * Quiet backgrounds for the transparent portraits, with a stable variation for each person.
 */
const PORTRAIT_BACKGROUND_COLORS = [
    ['#e3e1dc', '#b9c3bc'],
    ['#e0e2e3', '#bdc4ca'],
    ['#e6e0d8', '#c5bfb8'],
] as const;

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
 * Keeps each person's neutral background the same in cards and episode credits, even when the roster is shuffled.
 */
function getPortraitBackground(personId: string): string {
    const nameCode = Array.from(personId).reduce((code, letter) => code + letter.charCodeAt(0), 0);
    const [lightColor, shadeColor] = PORTRAIT_BACKGROUND_COLORS[nameCode % PORTRAIT_BACKGROUND_COLORS.length];
    const angleInDegrees = 120 + (nameCode % 60);

    return `linear-gradient(${angleInDegrees}deg, ${lightColor}, ${shadeColor})`;
}

/**
 * Round portrait of one person, shown next to an episode and on their card
 *
 * Portrait files contain only the person. The same neutral backdrop and interaction treatment are shared by both
 * sizes; a future person without a photograph keeps readable initials on that backdrop.
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
                'ring-1 ring-white/15 transition-shadow duration-300 group-hover/portrait:ring-white/50 group-focus-visible/portrait:ring-white/70 motion-reduce:transition-none',
                isLarge ? 'text-2xl font-semibold' : 'text-[11px] font-bold',
                className,
            )}
            style={{
                width: sizeInPixels,
                height: sizeInPixels,
                background: getPortraitBackground(person.id),
            }}
        >
            {photoPath === null ? (
                <span style={{ color: AI_TA_KRAJTA_COLORS.MOSS_DEEP }}>{getInitials(person.name)}</span>
            ) : (
                <Image
                    src={photoPath}
                    alt={person.name}
                    width={sizeInPixels}
                    height={sizeInPixels}
                    className="h-full w-full object-contain object-bottom motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover/portrait:scale-[1.04] motion-safe:group-focus-visible/portrait:scale-[1.04]"
                />
            )}
        </span>
    );
}
