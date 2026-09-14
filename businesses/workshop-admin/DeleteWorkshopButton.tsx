'use client';

import { Button } from '@/components/ui/button';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

type DeleteWorkshopButtonProps = {
    readonly workshop: Pick<WorkshopDetails, 'id' | 'title'>;
    readonly onDelete: (workshopId: string) => Promise<boolean>;
};

function createWorkshopDeletionConfirmation(workshopTitle: string): string {
    return `Opravdu smazat workshop „${workshopTitle}“? Přestane se zobrazovat návštěvníkům i v tomto seznamu, ale jeho data a připojené ankety zůstanou uložené.`;
}

/**
 * Keeps the consequential, soft-delete confirmation and its pending state beside the workshop actions that can cause
 * it, while the dashboard remains responsible for refreshing the list after the server accepts it.
 */
export function DeleteWorkshopButton({ workshop, onDelete }: DeleteWorkshopButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const isDeletionConfirmed = window.confirm(createWorkshopDeletionConfirmation(workshop.title));
        if (!isDeletionConfirmed) {
            return;
        }

        setIsDeleting(true);
        try {
            await onDelete(workshop.id);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button type="button" variant="destructive" className="w-full" disabled={isDeleting} onClick={() => void handleDelete()}>
            <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? 'Mažu workshop…' : 'Smazat workshop'}
        </Button>
    );
}
