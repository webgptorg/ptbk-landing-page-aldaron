'use client';

import type { WorkshopArtificialCommentValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    MAXIMAL_WORKSHOP_COMMENT_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { MessageCirclePlus, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopArtificialCommentProps = {
    /**
     * Whether this room has a live stage which can receive the newly-created comment
     */
    readonly isStageOffered?: boolean;

    /**
     * The normal artificial-comment path, with the optional stage selection kept in the same action so custom stage
     * questions never need a second, competing text form.
     */
    readonly onCreate: (values: WorkshopArtificialCommentValues, isSentToStage: boolean) => Promise<boolean>;
};

/**
 * Keeps artificial comments alongside comment moderation, instead of mixing them into the reactions administration.
 */
export function WorkshopArtificialComment({ onCreate, isStageOffered = false }: WorkshopArtificialCommentProps) {
    const [authorName, setAuthorName] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);

    const createComment = async (isSentToStage: boolean) => {
        if (!authorName.trim() || !commentBody.trim()) {
            return;
        }

        setIsCreatingComment(true);
        const isCreated = await onCreate({ authorName, body: commentBody }, isSentToStage);
        setIsCreatingComment(false);
        if (isCreated) {
            setAuthorName('');
            setCommentBody('');
        }
    };

    const handleCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void createComment(false);
    };

    return (
        <section className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                <MessageCirclePlus className="h-5 w-5 text-violet-600" /> Umělý komentář
            </h2>
            <p className="mt-1 text-sm text-slate-600">
                Komentář zůstane v databázi i administraci výslovně označený jako umělý. Můžete jej rovnou poslat i
                nad živé vysílání.
            </p>
            <AdminEditorButton label="Přidat umělý komentář" title="Přidat umělý komentář" buttonProps={{ className: 'mt-4' }}>
                <form onSubmit={handleCreate} className="mt-5 max-w-2xl rounded-xl border border-violet-200 bg-white p-5">
                    <label className="block text-xs font-medium text-slate-600">
                        Zobrazené jméno autora
                        <Input
                            value={authorName}
                            onChange={(event) => setAuthorName(event.target.value)}
                            className="mt-1 bg-white"
                            maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH}
                            placeholder="Například Petra z týmu"
                            required
                        />
                    </label>
                    <label className="mt-4 block text-xs font-medium text-slate-600">
                        Text komentáře
                        <Textarea
                            value={commentBody}
                            onChange={(event) => setCommentBody(event.target.value)}
                            className="mt-1 min-h-28 bg-white"
                            maxLength={MAXIMAL_WORKSHOP_COMMENT_LENGTH}
                            placeholder="Přidejte otázku nebo komentář do živého chatu…"
                            required
                        />
                    </label>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="submit" size="sm" disabled={isCreatingComment}>
                            <MessageCirclePlus className="mr-2 h-4 w-4" />
                            {isCreatingComment ? 'Přidávám…' : 'Přidat do chatu'}
                        </Button>
                        {isStageOffered && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isCreatingComment}
                                onClick={() => void createComment(true)}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isCreatingComment ? 'Posílám…' : 'Přidat a poslat na stage'}
                            </Button>
                        )}
                    </div>
                </form>
            </AdminEditorButton>
        </section>
    );
}
