'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type WorkshopMaterialPreviewContextValue = {
    readonly workshopSlug: string;
    readonly activeQrCardId: string | null;
    readonly setActiveQrCardId: (cardId: string | null) => void;
    readonly updateMaterialQrCardIds: (materialId: string, cardIds: readonly string[]) => void;
    readonly unregisterMaterialQrCards: (materialId: string) => void;
};

const WorkshopMaterialPreviewContext = createContext<WorkshopMaterialPreviewContextValue | null>(null);

export function WorkshopMaterialPreviewProvider({
    workshopSlug,
    children,
}: {
    readonly workshopSlug: string;
    readonly children: ReactNode;
}) {
    const [activeQrCardId, setActiveQrCardId] = useState<string | null>(null);
    const cardIdsByMaterialId = useRef(new Map<string, readonly string[]>());
    const activeQrCardIdReference = useRef<string | null>(null);
    activeQrCardIdReference.current = activeQrCardId;

    const updateMaterialQrCardIds = useCallback((materialId: string, cardIds: readonly string[]) => {
        cardIdsByMaterialId.current.set(materialId, cardIds);
        const activeQrCardId = activeQrCardIdReference.current;
        const isActiveQrCardStillAvailable = Array.from(cardIdsByMaterialId.current.values()).some((ids) =>
            ids.includes(activeQrCardId ?? ''),
        );
        if (activeQrCardId !== null && !isActiveQrCardStillAvailable) setActiveQrCardId(null);
    }, []);

    const unregisterMaterialQrCards = useCallback((materialId: string) => {
        cardIdsByMaterialId.current.delete(materialId);
        const activeQrCardId = activeQrCardIdReference.current;
        const isActiveQrCardStillAvailable = Array.from(cardIdsByMaterialId.current.values()).some((ids) =>
            ids.includes(activeQrCardId ?? ''),
        );
        if (activeQrCardId !== null && !isActiveQrCardStillAvailable) setActiveQrCardId(null);
    }, []);

    return (
        <WorkshopMaterialPreviewContext.Provider
            value={{
                workshopSlug,
                activeQrCardId,
                setActiveQrCardId,
                updateMaterialQrCardIds,
                unregisterMaterialQrCards,
            }}
        >
            {children}
        </WorkshopMaterialPreviewContext.Provider>
    );
}

export function useWorkshopMaterialPreviewContext(): WorkshopMaterialPreviewContextValue | null {
    return useContext(WorkshopMaterialPreviewContext);
}

export function createWorkshopMaterialQrCardId(materialId: string, href: string, duplicateIndex: number): string {
    return JSON.stringify([materialId, href, duplicateIndex]);
}
