'use client';

import type { LucideIcon } from 'lucide-react';

type WorkshopModerationActionProps = {
    readonly label: string;
    readonly ariaLabel: string;
    readonly icon: LucideIcon;
    readonly isDisabled: boolean;
    readonly onClick: () => void;
};

const MODERATION_ACTION_CLASS_NAME =
    'inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * One decision a moderator makes inside the room, written the same way wherever it is offered
 *
 * Note: A message of the chat and an answer of a poll are moderated by the same small, quiet buttons, so a moderator
 *       recognizes their toolbar whatever they are deciding about.
 */
export function WorkshopModerationAction({
    label,
    ariaLabel,
    icon: Icon,
    isDisabled,
    onClick,
}: WorkshopModerationActionProps) {
    return (
        <button
            type="button"
            disabled={isDisabled}
            onClick={onClick}
            aria-label={ariaLabel}
            className={MODERATION_ACTION_CLASS_NAME}
        >
            <Icon className="h-3 w-3" /> {label}
        </button>
    );
}
