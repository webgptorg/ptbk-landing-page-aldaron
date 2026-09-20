'use client';

import { createContext, useContext } from 'react';

/** Room extensions refresh with the authenticated room without losing their own form state. */
export const WORKSHOP_ROOM_REFRESH_CONTEXT = createContext<string | null>(null);

export function useWorkshopRoomRefreshTime(): string | null {
    return useContext(WORKSHOP_ROOM_REFRESH_CONTEXT);
}
