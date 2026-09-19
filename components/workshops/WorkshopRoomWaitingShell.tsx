import { WorkshopRoomThemeControl } from '@/components/workshops/WorkshopRoomThemeControl';
import type { ReactNode } from 'react';

/** Keeps appearance controls available while connecting, loading, or retrying a room. */
export function WorkshopRoomWaitingShell({ children }: { readonly children: ReactNode }) {
    return (
        <div className="workshop-room min-h-screen bg-room-background">
            <div className="mx-auto flex h-[4.5rem] max-w-[1500px] items-center justify-end px-4 sm:px-8">
                <WorkshopRoomThemeControl />
            </div>
            {children}
        </div>
    );
}
