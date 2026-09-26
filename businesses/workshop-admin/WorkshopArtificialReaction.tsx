'use client';

import type { WorkshopArtificialReactionValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminDraftProtection } from '@/hooks/useAdminDraftProtection';
import { MAXIMAL_WORKSHOP_REACTION_LENGTH } from '@/lib/workshops/workshopConstants';
import { Radio, Trash2 } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';

const INITIAL_ARTIFICIAL_REACTION = '🚀';

type WorkshopArtificialReactionProps = {
    readonly reactionCount: number;
    readonly artificialReactionCount: number;
    readonly onSend: (values: WorkshopArtificialReactionValues) => Promise<boolean>;
    readonly onClear: () => Promise<boolean>;
};

/**
 * Holds the explicitly labelled artificial reaction controls within the dedicated reactions section.
 */
export function WorkshopArtificialReaction({
    reactionCount,
    artificialReactionCount,
    onSend,
    onClear,
}: WorkshopArtificialReactionProps) {
    return (
        <section className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                <Radio className="h-5 w-5 text-violet-600" /> Reakce v místnosti
            </h2>
            <p className="mt-1 text-sm text-slate-600">
                Celkem reakcí: {reactionCount}. Uměle odeslané: {artificialReactionCount}. Umělé reakce zůstávají v
                datech vždy takto označené.
            </p>
            <AdminEditorButton label="Odeslat umělou reakci" title="Odeslat umělou reakci" buttonProps={{ className: 'mt-4' }}>
                <WorkshopArtificialReactionForm
                    reactionCount={reactionCount}
                    onSend={onSend}
                    onClear={onClear}
                />
            </AdminEditorButton>
        </section>
    );
}

function WorkshopArtificialReactionForm({ reactionCount, onSend, onClear }: {
    readonly reactionCount: number;
    readonly onSend: WorkshopArtificialReactionProps['onSend'];
    readonly onClear: WorkshopArtificialReactionProps['onClear'];
}) {
    const [reactionEmoji, setReactionEmoji] = useState(INITIAL_ARTIFICIAL_REACTION);
    const [isSendingReaction, setIsSendingReaction] = useState(false);
    const [isClearingReactions, setIsClearingReactions] = useState(false);
    const isSendingReference = useRef(false);
    const isClearingReference = useRef(false);
    const draftProtection = useAdminDraftProtection(reactionEmoji);

    const handleSend = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSendingReference.current || !reactionEmoji.trim()) {
            return;
        }

        isSendingReference.current = true;
        setIsSendingReaction(true);
        try {
            const isSent = await onSend({ emoji: reactionEmoji });
            if (isSent) {
                setReactionEmoji(INITIAL_ARTIFICIAL_REACTION);
                draftProtection.acceptDraftValue(INITIAL_ARTIFICIAL_REACTION);
            }
        } finally {
            isSendingReference.current = false;
            setIsSendingReaction(false);
        }
    };

    const handleClear = async () => {
        if (isClearingReference.current) return;
        const isDeletionConfirmed = window.confirm(
            `Opravdu smazat všech ${reactionCount} reakcí? Tento krok nelze vrátit zpět.`,
        );
        if (!isDeletionConfirmed) {
            return;
        }

        isClearingReference.current = true;
        setIsClearingReactions(true);
        try {
            await onClear();
        } finally {
            isClearingReference.current = false;
            setIsClearingReactions(false);
        }
    };

    return (
                <form onSubmit={handleSend} className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-violet-200 bg-white p-4">
                    <label className="min-w-44 flex-1 text-xs font-medium text-slate-600">
                        Odeslat umělou reakci
                        <Input
                            value={reactionEmoji}
                            disabled={isSendingReaction || isClearingReactions}
                            onChange={(event) => setReactionEmoji(event.target.value)}
                            className="mt-1 bg-white text-lg"
                            maxLength={MAXIMAL_WORKSHOP_REACTION_LENGTH}
                            placeholder="🚀"
                            required
                        />
                    </label>
                    <Button type="submit" size="sm" disabled={isSendingReaction || isClearingReactions}>
                        <Radio className="mr-2 h-4 w-4" /> {isSendingReaction ? 'Odesílám…' : 'Odeslat'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isClearingReactions || isSendingReaction || reactionCount === 0}
                        onClick={() => void handleClear()}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> {isClearingReactions ? 'Mažu…' : 'Smazat všechny'}
                    </Button>
                </form>
    );
}
