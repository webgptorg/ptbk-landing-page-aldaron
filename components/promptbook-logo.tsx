import { PROMPTBOOK_LOGO_3D_PREVIEWS } from '@/lib/branding/promptbookLogoAssets';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PromptbookLogoProps {
    size?: number;
    alt?: string;
    className?: string;
    isPriority?: boolean;
}

/**
 * The shared 3D mark. Use an empty alternative when adjacent text already names the brand.
 * Next image optimization is disabled here, so choose a local render at twice the display size.
 */
export function PromptbookLogo({ size = 32, alt = 'Promptbook', className, isPriority = false }: PromptbookLogoProps) {
    const LOGO_SOURCE =
        PROMPTBOOK_LOGO_3D_PREVIEWS.find(({ width }) => width >= size * 2) ??
        PROMPTBOOK_LOGO_3D_PREVIEWS[PROMPTBOOK_LOGO_3D_PREVIEWS.length - 1];

    return (
        <Image
            src={LOGO_SOURCE.src}
            alt={alt}
            width={size}
            height={size}
            priority={isPriority}
            className={cn('shrink-0 object-contain', className)}
        />
    );
}
