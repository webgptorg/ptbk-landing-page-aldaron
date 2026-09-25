'use client';

import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopContentEditor } from '@/businesses/workshop-admin/WorkshopContentEditor';
import { WorkshopQuickLinkMaterialEditor } from '@/businesses/workshop-admin/WorkshopQuickLinkMaterialEditor';
import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { Button } from '@/components/ui/button';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import { getWorkshopMaterialAppendSortOrders } from '@/lib/workshops/workshopQuickLinkMaterials';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { useRef, useState } from 'react';

type WorkshopContentAdminProps = {
    readonly workshopId: string;
    /**
     * When a newly written material unlocks unless an admin picks another moment
     */
    readonly defaultUnlockAt: string;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly onCreate: (values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onCreateQuickLink: (values: WorkshopContentWriteValues) => Promise<WorkshopContentBlock>;
    readonly onUpdate: (contentId: string, values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onDelete: (contentId: string) => Promise<void>;
};

export function WorkshopContentAdmin({
    workshopId,
    defaultUnlockAt,
    contentBlocks,
    onCreate,
    onCreateQuickLink,
    onUpdate,
    onDelete,
}: WorkshopContentAdminProps) {
    const [isQuickLinkDialogOpen, setIsQuickLinkDialogOpen] = useState(false);
    const isQuickLinkSavingReference = useRef(false);
    const defaultSortOrder = getWorkshopMaterialAppendSortOrders(contentBlocks, 1)?.[0] ?? 100_000;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Časovaný Markdown obsah</h2>
            <p className="mt-1 text-sm text-slate-500">
                Změny, smazání i publikace se připojeným účastníkům projeví živě. Jeden materiál lze označit jako
                navazující – před koncem je zvýrazněný v seznamu a po konci vede wrap-up obrazovku.
            </p>
            <div className="mt-6 space-y-4">
                {contentBlocks.map((contentBlock) => (
                    <article key={contentBlock.id} className="rounded-xl border border-slate-200 p-4">
                        <h3 className="font-semibold text-slate-950">{contentBlock.title || 'Materiál bez nadpisu'}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            {contentBlock.isPublished ? 'Publikovaný' : 'Nezveřejněný'} · Odemknout {formatWorkshopAdminDateTime(contentBlock.unlockAt)}
                            {contentBlock.isPaidMembersOnly ? ' · Jen pro placené členy' : ''}
                            {contentBlock.isFollowUp ? ' · Navazující materiál' : ''}
                        </p>
                        <p className="my-3 line-clamp-3 whitespace-pre-wrap break-words text-sm text-slate-600">{contentBlock.bodyMarkdown}</p>
                        <AdminEditorButton label="Upravit materiál" title={contentBlock.title || 'Upravit materiál'} buttonProps={{ size: 'sm' }}>
                            <WorkshopContentEditor
                                key={contentBlock.id}
                                contentBlock={contentBlock}
                                defaultUnlockAt={defaultUnlockAt}
                                defaultSortOrder={contentBlock.sortOrder}
                                onSave={(values) => onUpdate(contentBlock.id, values)}
                                onDelete={() => onDelete(contentBlock.id)}
                            />
                        </AdminEditorButton>
                    </article>
                ))}
                <div className="flex flex-wrap gap-2">
                    <AdminEditorButton label="Přidat materiál" title="Nový materiál">
                        {(closeEditor) => (
                            <WorkshopContentEditor
                                contentBlock={null}
                                defaultUnlockAt={defaultUnlockAt}
                                defaultSortOrder={defaultSortOrder}
                                onSave={async (values) => {
                                    const isCreated = await onCreate(values);
                                    if (isCreated) closeEditor();
                                    return isCreated;
                                }}
                            />
                        )}
                    </AdminEditorButton>
                    <Button type="button" variant="outline" onClick={() => void runAfterAdminSaves(() => setIsQuickLinkDialogOpen(true))}>
                        Přidat odkaz
                    </Button>
                </div>
                <AdminEditorDialog
                    isOpen={isQuickLinkDialogOpen}
                    canClose={() => !isQuickLinkSavingReference.current}
                    onClose={() => { if (!isQuickLinkSavingReference.current) setIsQuickLinkDialogOpen(false); }}
                    title="Přidat odkazy jako materiály"
                    description="Z každého odkazu vznikne samostatný běžný materiál. Vytvoření potvrdíte tlačítkem dole."
                >
                    {isQuickLinkDialogOpen && <WorkshopQuickLinkMaterialEditor
                        workshopId={workshopId}
                        defaultUnlockAt={defaultUnlockAt}
                        contentBlocks={contentBlocks}
                        onCreate={onCreateQuickLink}
                        onSavingChange={(isSaving) => { isQuickLinkSavingReference.current = isSaving; }}
                        onClose={() => setIsQuickLinkDialogOpen(false)}
                    />}
                </AdminEditorDialog>
            </div>
        </section>
    );
}
