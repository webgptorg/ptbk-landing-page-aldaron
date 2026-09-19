'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { MAXIMAL_WORKSHOP_COMMENT_LENGTH } from '@/lib/workshops/workshopConstants';
import { Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

/**
 * What the button of the form says while it waits to be pressed and while it is working
 */
export type WorkshopChatComposerLabels = {
    readonly idle: string;
    readonly pending: string;
};

type WorkshopChatComposerProps = {
    readonly className?: string;
    readonly label: string;
    readonly placeholder: string;

    /**
     * The text this form starts with, which is how a moderator corrects a message which is already in the chat
     */
    readonly initialBody?: string;

    /**
     * Whether this is the smaller form of a reply instead of the main form of the chat
     */
    readonly isCompact?: boolean;
    readonly isAutoFocused?: boolean;
    readonly submitLabels?: WorkshopChatComposerLabels;
    readonly onCancel?: () => void;
    readonly onSubmit: (body: string) => Promise<boolean>;
};

const MARKDOWN_FORMATTING_HINT = 'Tučně **text**, kurzíva *text*, podtržení __text__.';
const WORKSHOP_CHAT_SUBMIT_LABELS: WorkshopChatComposerLabels = { idle: 'Odeslat', pending: 'Odesílám…' };

/**
 * The one form which writes into the chat, both as a new message and as a reply
 *
 * Note: A message which was not accepted stays in the form, so that nothing a participant wrote is ever lost.
 */
export function WorkshopChatComposer({
    className,
    label,
    placeholder,
    initialBody = '',
    isCompact = false,
    isAutoFocused = false,
    submitLabels = WORKSHOP_CHAT_SUBMIT_LABELS,
    onCancel,
    onSubmit,
}: WorkshopChatComposerProps) {
    const [commentBody, setCommentBody] = useState(initialBody);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!commentBody.trim()) {
            return;
        }
        setIsSubmitting(true);
        const isSubmitted = await onSubmit(commentBody);
        if (isSubmitted) {
            setCommentBody('');
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <Textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                aria-label={label}
                placeholder={placeholder}
                autoFocus={isAutoFocused}
                maxLength={MAXIMAL_WORKSHOP_COMMENT_LENGTH}
                className={cn(
                    'resize-none border-room-border/10 bg-room-overlay/[0.04] text-sm text-room-heading placeholder:text-room-subtle focus-visible:ring-room-accent/50',
                    isCompact ? 'min-h-16' : 'min-h-24',
                )}
            />
            <div
                className={cn(
                    'mt-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center',
                    isCompact ? 'sm:justify-end' : 'sm:justify-between',
                )}
            >
                {!isCompact && <p className="text-[11px] text-room-subtle">{MARKDOWN_FORMATTING_HINT}</p>}
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    {onCancel && (
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={onCancel}
                            className="rounded-full text-room-muted hover:bg-room-overlay/5 hover:text-room-text"
                        >
                            Zrušit
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmitting || !commentBody.trim()}
                        className="w-full rounded-full bg-room-action text-room-action-foreground hover:bg-room-action-hover sm:w-auto"
                    >
                        <Send className="mr-1.5 h-3.5 w-3.5" />{' '}
                        {isSubmitting ? submitLabels.pending : submitLabels.idle}
                    </Button>
                </div>
            </div>
        </form>
    );
}
