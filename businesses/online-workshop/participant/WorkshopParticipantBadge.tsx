'use client';

import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { Input } from '@/components/ui/input';
import { MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH } from '@/lib/workshops/workshopConstants';
import { isWorkshopParticipantFullnameValid } from '@/lib/workshops/workshopParticipantFullname';
import { Check, LogOut, Pencil, Radio, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';

/**
 * What a participant is doing with their own identity right now, which is one thing at a time
 */
type WorkshopParticipantIdentityAction = 'rename' | 'disconnect';

type WorkshopParticipantBadgeProps = {
    /**
     * Name the participant is connected under, which is also the name shown at their comments
     */
    readonly fullname: string;

    /**
     * Whether this participant may not interact, which also freezes the name their comments were moderated under
     */
    readonly isInteractionBanned: boolean;

    /**
     * Whether this participant moderates the room, which the badge says next to their name
     */
    readonly isModerating: boolean;

    /**
     * Whether the room is loading a newer snapshot right now
     */
    readonly isRefreshing: boolean;

    /**
     * Stores the new name and resolves to whether it was accepted
     */
    readonly onChangeFullname: (fullname: string) => Promise<boolean>;

    /**
     * Ends the session of this participant, or `undefined` in a room which is not left this way, see
     * `workshopKindCapabilities`
     */
    readonly onDisconnect?: () => Promise<boolean>;
};

const BADGE_CLASS_NAME = `${WORKSHOP_ROOM_BADGE_CLASS_NAME} border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200`;
const BADGE_ACTION_CLASS_NAME =
    'shrink-0 rounded-full p-1.5 text-emerald-200/70 transition hover:bg-emerald-300/10 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-40';
const BADGE_LEAVING_ACTION_CLASS_NAME =
    'shrink-0 rounded-full p-1.5 text-emerald-200/70 transition hover:bg-rose-300/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40';
const BADGE_ANSWER_CLASS_NAME =
    'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Renames the participant without leaving the room, in the very place their name is shown
 */
function WorkshopParticipantRenameForm({
    fullname,
    onChangeFullname,
    onClose,
}: {
    readonly fullname: string;
    readonly onChangeFullname: (fullname: string) => Promise<boolean>;
    readonly onClose: () => void;
}) {
    const [editedFullname, setEditedFullname] = useState(fullname);
    const [isSaving, setIsSaving] = useState(false);
    const isEditedFullnameValid = isWorkshopParticipantFullnameValid(editedFullname);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isEditedFullnameValid || isSaving) {
            return;
        }

        setIsSaving(true);
        const isChanged = await onChangeFullname(editedFullname);
        setIsSaving(false);
        if (isChanged) {
            onClose();
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`${BADGE_CLASS_NAME} w-full p-1 pl-3 sm:w-auto`}>
            <Radio className="h-3.5 w-3.5 shrink-0" />
            <Input
                value={editedFullname}
                onChange={(event) => setEditedFullname(event.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="name"
                maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH}
                disabled={isSaving}
                placeholder="Jana Nováková"
                aria-label="Vaše jméno"
                aria-invalid={!isEditedFullnameValid}
                className="h-8 w-full min-w-0 rounded-full border-white/15 bg-white/5 px-3 text-xs text-white placeholder:text-slate-600 sm:w-56"
            />
            <button
                type="submit"
                disabled={isSaving || !isEditedFullnameValid}
                className={BADGE_ACTION_CLASS_NAME}
                aria-label="Uložit jméno"
                title="Uložit jméno"
            >
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className={BADGE_ACTION_CLASS_NAME}
                aria-label="Zrušit změnu jména"
                title="Zrušit změnu jména"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </form>
    );
}

/**
 * Asks before the session is really ended, because a misclick in the header of a running workshop would take somebody
 * out of the room they are watching
 */
function WorkshopParticipantDisconnectConfirmation({
    onDisconnect,
    onClose,
}: {
    readonly onDisconnect: () => Promise<boolean>;
    readonly onClose: () => void;
}) {
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleDisconnect = async () => {
        if (isDisconnecting) {
            return;
        }

        setIsDisconnecting(true);
        const isDisconnected = await onDisconnect();
        if (!isDisconnected) {
            // A refused sign-out leaves the question standing, so it can be answered again instead of silently failing.
            setIsDisconnecting(false);
        }
    };

    return (
        <div className={`${BADGE_CLASS_NAME} w-full gap-1.5 py-1 pl-3 pr-1 sm:w-auto`}>
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words text-center">Opravdu se odhlásit?</span>
            <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={isDisconnecting}
                autoFocus
                className={`${BADGE_ANSWER_CLASS_NAME} bg-rose-300/15 text-rose-200 hover:bg-rose-300/25 hover:text-rose-100`}
            >
                {isDisconnecting ? 'Odhlašuji…' : 'Ano, odhlásit'}
            </button>
            <button
                type="button"
                onClick={onClose}
                disabled={isDisconnecting}
                className={`${BADGE_ANSWER_CLASS_NAME} text-emerald-200/70 hover:bg-emerald-300/10 hover:text-emerald-100`}
            >
                Zrušit
            </button>
        </div>
    );
}

/**
 * Shows who the participant is connected as, and lets them rename themselves or sign out without leaving the room
 *
 * Note: This is the one place a participant reads and changes their own identity, so the community and every workshop
 *       room offer both of those in the very same badge rather than each in a surface of its own.
 */
export function WorkshopParticipantBadge({
    fullname,
    isInteractionBanned,
    isModerating,
    isRefreshing,
    onChangeFullname,
    onDisconnect,
}: WorkshopParticipantBadgeProps) {
    const [openedAction, setOpenedAction] = useState<WorkshopParticipantIdentityAction | null>(null);
    const closeAction = () => setOpenedAction(null);

    if (openedAction === 'rename') {
        return (
            <WorkshopParticipantRenameForm
                fullname={fullname}
                onChangeFullname={onChangeFullname}
                onClose={closeAction}
            />
        );
    }

    if (openedAction === 'disconnect' && onDisconnect !== undefined) {
        return <WorkshopParticipantDisconnectConfirmation onDisconnect={onDisconnect} onClose={closeAction} />;
    }

    // Note: A banned participant keeps the name their messages were moderated under, so renaming is not offered to
    //       them. Signing out changes nothing about those messages and is therefore offered to everybody.
    const isRenameOffered = !isInteractionBanned;
    const isAnyActionOffered = isRenameOffered || onDisconnect !== undefined;

    return (
        <div className={`${BADGE_CLASS_NAME} py-1.5 pl-3 ${isAnyActionOffered ? 'pr-1.5' : 'pr-3'}`}>
            <Radio className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words text-center">Připojen/a jako {fullname}</span>
            {isModerating && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-300/10 px-2 py-0.5 text-[11px] font-semibold text-violet-200">
                    <ShieldCheck className="h-3 w-3" /> Moderátor
                </span>
            )}
            {isRefreshing && <RefreshCw className="h-3 w-3 shrink-0 animate-spin text-slate-500" />}
            {isRenameOffered && (
                <button
                    type="button"
                    onClick={() => setOpenedAction('rename')}
                    className={BADGE_ACTION_CLASS_NAME}
                    aria-label="Změnit jméno"
                    title="Změnit jméno"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
            )}
            {onDisconnect !== undefined && (
                <button
                    type="button"
                    onClick={() => setOpenedAction('disconnect')}
                    className={BADGE_LEAVING_ACTION_CLASS_NAME}
                    aria-label="Odhlásit se"
                    title="Odhlásit se"
                >
                    <LogOut className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
