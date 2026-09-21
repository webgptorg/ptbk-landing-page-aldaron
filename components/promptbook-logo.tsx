import { PROMPTBOOK_LOGO_ASSETS, type PromptbookLogoTone } from '@/lib/branding/promptbookLogoAssets';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PromptbookLogoProps {
    /** The white material keeps its shading on dark backgrounds. */
    tone?: PromptbookLogoTone;
    size?: number;
    className?: string;
    /** Use an empty label when adjacent text already names Promptbook. */
    alt?: string;
    isPriority?: boolean;
}

/** The shared 3D mark is an ordinary image: crisp at any size, with no canvas, motion, or hydration dependency. */
export function PromptbookLogo({
    tone = 'blue',
    size = 32,
    className,
    alt = 'Promptbook',
    isPriority = false,
}: PromptbookLogoProps) {
    return (
        <Image
            src={PROMPTBOOK_LOGO_ASSETS[tone].svg}
            alt={alt}
            width={size}
            height={size}
            className={cn('shrink-0 object-contain', className)}
            priority={isPriority}
        />
    );
}
