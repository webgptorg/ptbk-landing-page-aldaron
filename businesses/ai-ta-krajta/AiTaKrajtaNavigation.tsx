import { AiTaKrajtaLink as Link } from './AiTaKrajtaLink';
import { AiTaKrajtaMark } from './AiTaKrajtaMark';
import { AI_TA_KRAJTA_NAME, AI_TA_KRAJTA_NAVIGATION_ITEMS, AI_TA_KRAJTA_PATH } from './config';
import type { ReactNode } from 'react';

/** The same compact, internal navigation on every podcast page. */
export function AiTaKrajtaNavigation({
    activePath = AI_TA_KRAJTA_PATH,
    children,
}: {
    readonly activePath?: string;
    readonly children?: ReactNode;
}) {
    return (
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
            <Link href={AI_TA_KRAJTA_PATH} aria-label={AI_TA_KRAJTA_NAME} className="flex shrink-0 items-center gap-2.5 text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#303832] p-1">
                    <AiTaKrajtaMark className="h-full w-full" />
                </span>
                <span className="hidden text-base font-semibold tracking-tight sm:inline">{AI_TA_KRAJTA_NAME}</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4 sm:gap-6" aria-label="Hlavní navigace">
                {AI_TA_KRAJTA_NAVIGATION_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={item.href === activePath ? 'page' : undefined}
                        className="whitespace-nowrap text-sm text-white/65 transition-colors hover:text-white aria-[current=page]:text-white"
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            {children}
        </div>
    );
}
