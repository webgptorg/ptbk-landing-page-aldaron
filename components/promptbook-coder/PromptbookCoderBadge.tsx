'use client';

import {
    PROMPTBOOK_CODER_BADGE_LABEL,
    PROMPTBOOK_CODER_URL,
} from '@/components/promptbook-coder/promptbookCoderConfig';
import { PromptbookCoderTerminalLine } from '@/components/promptbook-coder/PromptbookCoderTerminalLine';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Says that the page was written with Promptbook coder and leads to it, as a terminal of one line
 *
 * Note: The classes it defaults to are the ones of a dark page, which is where it is worn today. A page of another
 *       colour passes its own through `className`, `terminalClassName` and `labelClassName` rather than getting a
 *       second badge.
 *
 * @param className look of the whole badge
 * @param terminalClassName look of the terminal line inside it
 * @param labelClassName look of the words, which a badge with no room for them can fold away
 */
export function PromptbookCoderBadge({
    className,
    terminalClassName,
    labelClassName,
}: {
    readonly className?: string;
    readonly terminalClassName?: string;
    readonly labelClassName?: string;
}) {
    const [isGreeting, setIsGreeting] = useState(false);

    return (
        <a
            href={PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noreferrer"
            // Note: The octopus greets whoever reaches the badge with the keyboard as well, so that the joke is not
            //       reserved for visitors who arrive with a mouse.
            onPointerEnter={() => setIsGreeting(true)}
            onPointerLeave={() => setIsGreeting(false)}
            onFocus={() => setIsGreeting(true)}
            onBlur={() => setIsGreeting(false)}
            className={cn(
                'group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 py-1.5 pl-2.5 pr-3 text-xs font-medium text-white/55 transition-colors hover:border-white/25 hover:bg-black/50 hover:text-white',
                className,
            )}
        >
            <PromptbookCoderTerminalLine
                isGreeting={isGreeting}
                className={terminalClassName}
                octopusClassName="text-promptbook-blue"
            />
            <span className={cn('whitespace-nowrap', labelClassName)}>{PROMPTBOOK_CODER_BADGE_LABEL}</span>
        </a>
    );
}
