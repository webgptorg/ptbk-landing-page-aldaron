import type { ReactNode } from 'react';

type AiTaKrajtaSectionHeadingProps = {
    readonly eyebrow: string;
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly isCentered?: boolean;
};

/**
 * One heading treatment shared by every major section of the pages standing beside the podcast
 */
export function AiTaKrajtaSectionHeading({
    eyebrow,
    title,
    description,
    isCentered = false,
}: AiTaKrajtaSectionHeadingProps) {
    return (
        <div className={isCentered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9db1ff]">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 leading-relaxed text-white/60">{description}</p>
        </div>
    );
}
