'use client';

import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { RefreshCw } from 'lucide-react';

type WorkshopServerConnectionStatusProps = {
    /**
     * The room has a usable snapshot, but its latest request could not reach the server.
     */
    readonly isUsingCachedState: boolean;

    /**
     * Whether a fresh room snapshot is currently being requested.
     */
    readonly isRefreshing: boolean;

    /**
     * More complete explanation kept available without taking over the room.
     */
    readonly unavailableMessage: string | null;

    /**
     * Lets a participant retry immediately instead of waiting for the automatic backoff.
     */
    readonly onRefresh: () => void;
};

const CONNECTED_STATUS_CLASS_NAME =
    'border-room-success/15 bg-room-success/[0.06] px-3 py-1.5 text-room-success';
const UNAVAILABLE_STATUS_CLASS_NAME =
    'border-room-warning/20 bg-room-warning/[0.08] px-3 py-1.5 text-room-warning transition hover:bg-room-warning/[0.14] disabled:cursor-wait';

/**
 * A deliberately quiet server-status indicator for every room built on the shared participant page.
 *
 * A current snapshot is marked green. If the room has fallen back to a browser-stored snapshot, the same small
 * control turns amber and retains the detailed explanation in its accessible label and native tooltip. This keeps
 * the stream, chat and materials unobstructed while preserving an immediate retry for people who want one.
 */
export function WorkshopServerConnectionStatus({
    isUsingCachedState,
    isRefreshing,
    unavailableMessage,
    onRefresh,
}: WorkshopServerConnectionStatusProps) {
    if (!isUsingCachedState) {
        return (
            <div
                className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${CONNECTED_STATUS_CLASS_NAME}`}
                role="status"
                aria-label="Připojeno k serveru"
                title="Připojeno k serveru"
            >
                <span className="h-2 w-2 shrink-0 rounded-full bg-room-success" aria-hidden="true" />
                <span>Připojeno</span>
            </div>
        );
    }

    const statusLabel = isRefreshing ? 'Obnovuji spojení' : 'Spojení nedostupné';
    const statusDescription =
        unavailableMessage ??
        'Zobrazuje se naposledy uložená verze místnosti; nové informace se načtou po obnovení spojení.';
    const retryDescription = isRefreshing ? 'Právě ověřuji spojení.' : 'Kliknutím zkusíte spojení obnovit hned.';

    return (
        <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${UNAVAILABLE_STATUS_CLASS_NAME}`}
            aria-label={`${statusLabel}. ${statusDescription} ${retryDescription}`}
            title={`${statusDescription} ${retryDescription}`}
        >
            <span className="h-2 w-2 shrink-0 rounded-full bg-room-warning" aria-hidden="true" />
            <span>{statusLabel}</span>
            {isRefreshing && <RefreshCw className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" />}
        </button>
    );
}
