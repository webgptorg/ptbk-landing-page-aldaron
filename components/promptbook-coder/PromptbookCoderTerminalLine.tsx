'use client';

import { PROMPTBOOK_CODER_PROMPT_SIGIL } from '@/components/promptbook-coder/promptbookCoderConfig';
import {
    drawPromptbookCoderOctopus,
    PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS,
} from '@/components/promptbook-coder/promptbookCoderOctopusArt';
import { selectPromptbookCoderOctopusPose } from '@/components/promptbook-coder/promptbookCoderOctopusPose';
import {
    drawPromptbookCoderTypedCommand,
    isPromptbookCoderCommandRunning,
    PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES,
} from '@/components/promptbook-coder/promptbookCoderTerminalBoot';
import { usePromptbookCoderBadgeSenses } from '@/components/promptbook-coder/usePromptbookCoderBadgeSenses';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

/**
 * The one line of a terminal the badge is: `$ ptbk` is typed into it and the octopus of Promptbook coder is what
 * running that prints
 *
 * Note: The line is held at the width of the widest thing it ever shows, so that neither the typing nor a waving
 *       tentacle moves anything around it.
 *
 * Note: A screen reader is told nothing about it. What the octopus is doing is a joke for the eyes, and the badge it
 *       sits in already says in words what the tool is and where it leads.
 *
 * @param isGreeting whether the visitor is pointing at the badge, which is when the octopus waves back
 * @param className size and colour the whole line is written at, which is what the typed command is written in
 * @param octopusClassName colour of the octopus itself, so that what the command printed stands out from what was
 *                         typed into it
 */
export function PromptbookCoderTerminalLine({
    isGreeting = false,
    className,
    octopusClassName,
}: {
    readonly isGreeting?: boolean;
    readonly className?: string;
    readonly octopusClassName?: string;
}) {
    const lineElementRef = useRef<HTMLSpanElement>(null);
    const { frame, ...surroundings } = usePromptbookCoderBadgeSenses(lineElementRef);
    const isCommandRunning = isPromptbookCoderCommandRunning(frame);

    const drawnLine = isCommandRunning
        ? drawPromptbookCoderOctopus(
              selectPromptbookCoderOctopusPose({
                  ...surroundings,
                  octopusFrame: frame - PROMPTBOOK_CODER_BOOT_LENGTH_IN_FRAMES,
                  isGreeting,
              }),
          )
        : drawPromptbookCoderTypedCommand(frame);

    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex shrink-0 items-center whitespace-pre font-mono text-[0.8125rem] leading-none',
                className,
            )}
        >
            {/* Note: The gap after the sigil is written rather than laid out, so that the line reads as the one line
                      of characters a terminal would have printed even where it is read as text. */}
            <span className="opacity-50">{PROMPTBOOK_CODER_PROMPT_SIGIL} </span>
            <span
                ref={lineElementRef}
                style={{ width: `${PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS}ch` }}
                className={cn('inline-block overflow-hidden', isCommandRunning && octopusClassName)}
            >
                {drawnLine}
            </span>
        </span>
    );
}
