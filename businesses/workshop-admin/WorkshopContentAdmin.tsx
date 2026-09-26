'use client';

import type {
    WorkshopContentOrderResult,
    WorkshopContentUpdateValues,
    WorkshopContentWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopContentEditor } from '@/businesses/workshop-admin/WorkshopContentEditor';
import { WorkshopQuickLinkMaterialEditor } from '@/businesses/workshop-admin/WorkshopQuickLinkMaterialEditor';
import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { AdminEditorDialog } from '@/components/admin/AdminEditorDialog';
import { Button } from '@/components/ui/button';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';
import { getWorkshopMaterialAppendSortOrders } from '@/lib/workshops/workshopQuickLinkMaterials';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

type WorkshopContentAdminProps = {
    readonly workshopId: string;
    /** When a newly written material unlocks unless an admin picks another moment. */
    readonly defaultUnlockAt: string;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly onCreate: (values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onCreateQuickLink: (values: WorkshopContentWriteValues) => Promise<WorkshopContentBlock>;
    readonly onUpdate: (contentId: string, values: WorkshopContentUpdateValues) => Promise<boolean>;
    readonly onDelete: (contentId: string) => Promise<void>;
    readonly onReorder: (contentIds: readonly string[]) => Promise<WorkshopContentOrderResult>;
};

function sortContentBlocks(contentBlocks: readonly WorkshopContentBlock[]): readonly WorkshopContentBlock[] {
    return [...contentBlocks].sort((first, second) =>
        first.sortOrder - second.sortOrder ||
        first.unlockAt.localeCompare(second.unlockAt) ||
        first.id.localeCompare(second.id),
    );
}

function mergeOrderWithCurrentMaterials(
    previousOrder: readonly string[],
    currentOrder: readonly string[],
): readonly string[] {
    const currentIds = new Set(currentOrder);
    const retainedIds = previousOrder.filter((contentId) => currentIds.has(contentId));
    const retainedIdSet = new Set(retainedIds);
    return [...retainedIds, ...currentOrder.filter((contentId) => !retainedIdSet.has(contentId))];
}

function haveSameOrder(first: readonly string[], second: readonly string[]): boolean {
    return first.length === second.length && first.every((contentId, index) => contentId === second[index]);
}

type SortableWorkshopContentCardProps = {
    readonly contentBlock: WorkshopContentBlock;
    readonly position: number;
    readonly contentCount: number;
    readonly isDropTarget: boolean;
    readonly isBeingDragged: boolean;
    readonly defaultUnlockAt: string;
    readonly onUpdate: WorkshopContentAdminProps['onUpdate'];
    readonly onDelete: WorkshopContentAdminProps['onDelete'];
    readonly onHandleReferenceChange: (contentId: string, button: HTMLButtonElement | null) => void;
    readonly onMove: (contentId: string, direction: -1 | 1) => void;
};

function SortableWorkshopContentCard({
    contentBlock,
    position,
    contentCount,
    isDropTarget,
    isBeingDragged,
    defaultUnlockAt,
    onUpdate,
    onDelete,
    onHandleReferenceChange,
    onMove,
}: SortableWorkshopContentCardProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: contentBlock.id,
    });
    const title = contentBlock.title || 'Materiál bez nadpisu';

    return (
        <article
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`rounded-xl border p-4 ${
                isDropTarget
                    ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-300'
                    : 'border-slate-200 bg-white'
            } ${isBeingDragged || isDragging ? 'z-10 opacity-60 shadow-lg' : ''}`}
            aria-label={`${title}, pozice ${position + 1} z ${contentCount}`}
        >
            <div className="flex items-start gap-3">
                <div className="flex shrink-0 flex-col items-center gap-1">
                    <button
                        ref={(button) => {
                            setActivatorNodeRef(button);
                            onHandleReferenceChange(contentBlock.id, button);
                        }}
                        type="button"
                        {...attributes}
                        {...listeners}
                        aria-label={`Přesunout materiál ${title}, pozice ${position + 1} z ${contentCount}`}
                        aria-pressed={isBeingDragged || isDragging}
                        className="flex h-10 w-10 touch-none select-none items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 active:cursor-grabbing cursor-grab"
                    >
                        <GripVertical aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Přesunout materiál ${title} nahoru`}
                        disabled={position === 0}
                        onClick={() => onMove(contentBlock.id, -1)}
                    >
                        <ArrowUp aria-hidden="true" className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Přesunout materiál ${title} dolů`}
                        disabled={position === contentCount - 1}
                        onClick={() => onMove(contentBlock.id, 1)}
                    >
                        <ArrowDown aria-hidden="true" className="h-4 w-4" />
                    </Button>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-slate-950">{title}</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {contentBlock.isPublished ? 'Publikovaný' : 'Nezveřejněný'} · Odemknout {formatWorkshopAdminDateTime(contentBlock.unlockAt)}
                                {contentBlock.isPaidMembersOnly ? ' · Jen pro placené členy' : ''}
                                {contentBlock.isFollowUp ? ' · Navazující materiál' : ''}
                            </p>
                        </div>
                        <AdminEditorButton label="Upravit materiál" title={title} buttonProps={{ size: 'sm' }}>
                            <WorkshopContentEditor
                                key={contentBlock.id}
                                contentBlock={contentBlock}
                                defaultUnlockAt={defaultUnlockAt}
                                defaultSortOrder={contentBlock.sortOrder}
                                onSave={(values) => onUpdate(contentBlock.id, values)}
                                onDelete={() => onDelete(contentBlock.id)}
                            />
                        </AdminEditorButton>
                    </div>
                    <p className="my-3 line-clamp-3 whitespace-pre-wrap break-words text-sm text-slate-600">
                        {contentBlock.bodyMarkdown}
                    </p>
                    {isDropTarget && (
                        <p className="text-xs font-semibold text-cyan-800" aria-hidden="true">
                            Cíl přesunutí · pozice {position + 1}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

export function WorkshopContentAdmin({
    workshopId,
    defaultUnlockAt,
    contentBlocks,
    onCreate,
    onCreateQuickLink,
    onUpdate,
    onDelete,
    onReorder,
}: WorkshopContentAdminProps) {
    const serverSortedContentBlocks = useMemo(() => sortContentBlocks(contentBlocks), [contentBlocks]);
    const serverOrderIds = useMemo(() => serverSortedContentBlocks.map(({ id }) => id), [serverSortedContentBlocks]);
    const serverOrderSignature = serverOrderIds.join('|');
    const observedServerOrderSignatureReference = useRef(serverOrderSignature);
    const [orderedIds, setOrderedIds] = useState<readonly string[]>(serverOrderIds);
    const orderedIdsReference = useRef(orderedIds);
    orderedIdsReference.current = orderedIds;
    const handleReferenceById = useRef(new Map<string, HTMLButtonElement>());
    const isDragActiveReference = useRef(false);
    const [activeContentId, setActiveContentId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [announcement, setAnnouncement] = useState('');
    const [isQuickLinkDialogOpen, setIsQuickLinkDialogOpen] = useState(false);
    const isQuickLinkSavingReference = useRef(false);
    const defaultSortOrder = getWorkshopMaterialAppendSortOrders(contentBlocks, 1)?.[0] ?? 100_000;

    const applyOrder = useCallback((nextOrder: readonly string[]) => {
        orderedIdsReference.current = nextOrder;
        setOrderedIds(nextOrder);
    }, []);
    const updateHandleReference = useCallback((contentId: string, button: HTMLButtonElement | null) => {
        if (button === null) handleReferenceById.current.delete(contentId);
        else handleReferenceById.current.set(contentId, button);
    }, []);

    const saveOrder = useCallback(async () => {
        const submittedOrder = [...orderedIdsReference.current];
        const result = await onReorder(submittedOrder);
        const latestOrder = orderedIdsReference.current;
        const reconciledOrder = mergeOrderWithCurrentMaterials(latestOrder, result.contentIds);
        if (!haveSameOrder(latestOrder, reconciledOrder)) applyOrder(reconciledOrder);
        setAnnouncement(result.wasReconciled
            ? 'Pořadí bylo sladěno s aktuálním seznamem materiálů.'
            : 'Nové pořadí materiálů je uloženo.');
        return true;
    }, [applyOrder, onReorder]);
    const autosave = useAdminAutosave({ value: orderedIds, onSave: saveOrder });

    useLayoutEffect(() => {
        if (isDragActiveReference.current) return;
        if (observedServerOrderSignatureReference.current === serverOrderSignature) return;
        observedServerOrderSignatureReference.current = serverOrderSignature;
        if (autosave.isDirty || autosave.isSaving) {
            applyOrder(mergeOrderWithCurrentMaterials(orderedIdsReference.current, serverOrderIds));
            return;
        }
        if (!haveSameOrder(orderedIdsReference.current, serverOrderIds)) applyOrder(serverOrderIds);
        // The ID signature changes only when the server adds or removes a material. Order-only snapshots are adopted
        // once there is no local write; while a write is pending, the local sequence remains authoritative.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverOrderSignature, autosave.isDirty, autosave.isSaving, activeContentId, applyOrder]);

    const orderedContentBlocks = useMemo(() => {
        const contentBlockById = new Map(serverSortedContentBlocks.map((contentBlock) => [contentBlock.id, contentBlock]));
        const listedIds = new Set(orderedIds);
        return [
            ...orderedIds.flatMap((contentId) => {
                const contentBlock = contentBlockById.get(contentId);
                return contentBlock === undefined ? [] : [contentBlock];
            }),
            ...serverSortedContentBlocks.filter((contentBlock) => !listedIds.has(contentBlock.id)),
        ];
    }, [orderedIds, serverSortedContentBlocks]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        isDragActiveReference.current = false;
        const activeId = String(event.active.id);
        const overId = event.over === null ? null : String(event.over.id);
        setActiveContentId(null);
        setDropTargetId(null);
        if (overId === null) {
            setAnnouncement('Přesunutí zrušeno. Pořadí zůstalo beze změny.');
            return;
        }

        const previousOrder = orderedIdsReference.current;
        const fromIndex = previousOrder.indexOf(activeId);
        const toIndex = previousOrder.indexOf(overId);
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
            setAnnouncement('Pořadí zůstalo beze změny.');
            return;
        }

        const nextOrder = arrayMove([...previousOrder], fromIndex, toIndex);
        applyOrder(nextOrder);
        const movedContentBlock = orderedContentBlocks.find(({ id }) => id === activeId);
        setAnnouncement(`${movedContentBlock?.title || 'Materiál'} přesunut na pozici ${toIndex + 1} z ${previousOrder.length}.`);
    };

    const handleMoveByOne = (contentId: string, direction: -1 | 1) => {
        const previousOrder = orderedIdsReference.current;
        const fromIndex = previousOrder.indexOf(contentId);
        const toIndex = fromIndex + direction;
        if (fromIndex < 0 || toIndex < 0 || toIndex >= previousOrder.length) return;
        applyOrder(arrayMove([...previousOrder], fromIndex, toIndex));
        const contentBlock = orderedContentBlocks.find(({ id }) => id === contentId);
        setAnnouncement(`${contentBlock?.title || 'Materiál'} přesunut na pozici ${toIndex + 1} z ${previousOrder.length}.`);
        window.requestAnimationFrame(() => handleReferenceById.current.get(contentId)?.focus({ preventScroll: true }));
    };

    const cancelDrag = () => {
        isDragActiveReference.current = false;
        setActiveContentId(null);
        setDropTargetId(null);
        setAnnouncement('Přesunutí zrušeno. Pořadí zůstalo beze změny.');
    };

    const handleCreateQuickLink = async (values: WorkshopContentWriteValues) => onCreateQuickLink(values);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Časovaný Markdown obsah</h2>
            <p className="mt-1 text-sm text-slate-500">
                Změny, smazání i publikace se připojeným účastníkům projeví živě. Jeden materiál lze označit jako
                navazující – před koncem je zvýrazněný v seznamu a po konci vede wrap-up obrazovku.
            </p>
            <p className="mt-2 text-sm text-slate-600">
                Pořadí změníte tažením za úchyt; klávesnicí použijte tlačítka se šipkami. Escape tažení zruší.
                Nové pořadí se ukládá automaticky.
            </p>
            <div className="mt-3"><AdminAutosaveStatus {...autosave} /></div>
            <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={({ active }) => {
                    isDragActiveReference.current = true;
                    setActiveContentId(String(active.id));
                    setDropTargetId(String(active.id));
                    setAnnouncement('Materiál uchopen. Zvolte cílové místo a potvrďte přesunutí.');
                }}
                onDragOver={({ active, over }) => {
                    const targetId = over === null ? null : String(over.id);
                    setDropTargetId(targetId);
                    if (targetId === null || targetId === String(active.id)) return;
                    const targetIndex = orderedIdsReference.current.indexOf(targetId);
                    setAnnouncement(`Cíl přesunutí: pozice ${targetIndex + 1} z ${orderedIdsReference.current.length}.`);
                }}
                onDragCancel={cancelDrag}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={orderedContentBlocks.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
                    <div className="mt-6 space-y-4">
                        {orderedContentBlocks.map((contentBlock, index) => (
                            <SortableWorkshopContentCard
                                key={contentBlock.id}
                                contentBlock={contentBlock}
                                position={index}
                                contentCount={orderedContentBlocks.length}
                                isDropTarget={dropTargetId === contentBlock.id && activeContentId !== null}
                                isBeingDragged={activeContentId === contentBlock.id}
                                defaultUnlockAt={defaultUnlockAt}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                onHandleReferenceChange={updateHandleReference}
                                onMove={handleMoveByOne}
                            />
                        ))}
                        <div className="flex flex-wrap gap-2">
                            <AdminEditorButton label="Přidat materiál" title="Nový materiál">
                                {(closeEditor) => (
                                    <WorkshopContentEditor
                                        contentBlock={null}
                                        defaultUnlockAt={defaultUnlockAt}
                                        defaultSortOrder={defaultSortOrder}
                                        onSave={async (values) => {
                                            const isCreated = await onCreate(values as WorkshopContentWriteValues);
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
                    </div>
                </SortableContext>
            </DndContext>
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
                    onCreate={handleCreateQuickLink}
                    onSavingChange={(isSaving) => { isQuickLinkSavingReference.current = isSaving; }}
                    onClose={() => setIsQuickLinkDialogOpen(false)}
                />}
            </AdminEditorDialog>
        </section>
    );
}
