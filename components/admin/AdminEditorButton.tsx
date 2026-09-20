'use client';

import { AdminEditorDialog, type AdminEditorDialogProps } from '@/components/admin/AdminEditorDialog';
import { Button } from '@/components/ui/button';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import { useState, type ComponentProps, type ReactNode } from 'react';

type AdminEditorButtonProps = Omit<AdminEditorDialogProps, 'isOpen' | 'onClose' | 'children'> & {
    readonly label: string;
    readonly buttonProps?: Omit<ComponentProps<typeof Button>, 'onClick' | 'children'>;
    readonly children: ReactNode | ((closeEditor: () => void) => ReactNode);
};

/** Keeps a form unmounted until its explicit New/Edit action, with a fresh draft on each opening. */
export function AdminEditorButton({ label, buttonProps, children, ...dialogProps }: AdminEditorButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const closeEditor = () => setIsOpen(false);

    return (
        <>
            <Button type="button" variant="outline" {...buttonProps} onClick={() => void runAfterAdminSaves(() => setIsOpen(true))}>{label}</Button>
            <AdminEditorDialog {...dialogProps} isOpen={isOpen} onClose={closeEditor}>
                {isOpen && (typeof children === 'function' ? children(closeEditor) : children)}
            </AdminEditorDialog>
        </>
    );
}
