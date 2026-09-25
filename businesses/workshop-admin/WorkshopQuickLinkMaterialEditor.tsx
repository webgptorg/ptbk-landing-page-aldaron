'use client';

import {
    fetchAdminWorkshopQuickLinkPreview,
    type WorkshopContentWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JsonRequestError } from '@/lib/api/requestJson';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { createWorkshopContentDefaults } from '@/lib/workshops/workshopContentDefaults';
import {
    createWorkshopQuickLinkMarkdown,
    getWorkshopMaterialAppendSortOrders,
    getWorkshopQuickLinkFallbackTitle,
    MAXIMAL_WORKSHOP_QUICK_LINK_COUNT,
    parseWorkshopQuickLinkInput,
} from '@/lib/workshops/workshopQuickLinkMaterials';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

const WORKSHOP_QUICK_LINK_PREVIEW_CONCURRENCY = 3;

type QuickLinkEntry = {
    readonly id: string;
    readonly destination: string;
    readonly titleCorrection: string | null;
    readonly previewTitle: string;
    readonly previewState: 'idle' | 'loading' | 'ready' | 'fallback' | 'blocked' | 'error';
    readonly previewMessage: string | null;
    readonly isExisting: boolean;
    readonly sortOrder: number | null;
    readonly saveState: 'idle' | 'saving' | 'created' | 'failed';
    readonly saveErrorMessage: string | null;
};

type WorkshopQuickLinkMaterialEditorProps = {
    readonly workshopId: string;
    readonly defaultUnlockAt: string;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly onCreate: (values: WorkshopContentWriteValues) => Promise<WorkshopContentBlock>;
    readonly onSavingChange: (isSaving: boolean) => void;
    readonly onClose: () => void;
};

function createQuickLinkEntry(destination: string): QuickLinkEntry {
    return {
        id: crypto.randomUUID(),
        destination,
        titleCorrection: null,
        previewTitle: getWorkshopQuickLinkFallbackTitle(destination),
        previewState: 'idle',
        previewMessage: null,
        isExisting: false,
        sortOrder: null,
        saveState: 'idle',
        saveErrorMessage: null,
    };
}

function formatMaterialCount(count: number): string {
    if (count === 1) return '1 materiál';
    if (count >= 2 && count <= 4) return `${count} materiály`;
    return `${count} materiálů`;
}

/** The draft is local until the administrator explicitly confirms creation. */
export function WorkshopQuickLinkMaterialEditor({
    workshopId,
    defaultUnlockAt,
    contentBlocks,
    onCreate,
    onSavingChange,
    onClose,
}: WorkshopQuickLinkMaterialEditorProps) {
    const [input, setInput] = useState('');
    const [entries, setEntries] = useState<readonly QuickLinkEntry[]>([]);
    const [previewRevision, setPreviewRevision] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingReference = useRef(false);
    const inputRows = useMemo(() => parseWorkshopQuickLinkInput(input), [input]);
    const isBatchTooLarge = inputRows.filter((row) => row.issue === null).length > MAXIMAL_WORKSHOP_QUICK_LINK_COUNT;
    const isInputInvalid = inputRows.some((row) => row.issue === 'invalid');
    const destinationSignature = entries.map((entry) => `${entry.id}:${entry.destination}`).join('\n');

    const changeInput = (value: string) => {
        setInput(value);
        const destinations = parseWorkshopQuickLinkInput(value)
            .filter((row): row is typeof row & { readonly destination: string } => row.issue === null && row.destination !== null)
            .map((row) => row.destination);
        setEntries((currentEntries) => {
            const previousByDestination = new Map(currentEntries.map((entry) => [entry.destination, entry]));
            return destinations.map((destination) => previousByDestination.get(destination) ?? createQuickLinkEntry(destination));
        });
    };

    useEffect(() => {
        let isCancelled = false;
        const abortController = new AbortController();
        const pendingEntries = entries.slice(0, MAXIMAL_WORKSHOP_QUICK_LINK_COUNT).filter(
            (entry) => entry.saveState !== 'created' &&
                ['idle', 'loading', 'error'].includes(entry.previewState),
        );
        let nextPendingIndex = 0;

        const loadNextPreview = async () => {
            while (!isCancelled && nextPendingIndex < pendingEntries.length) {
                const entry = pendingEntries[nextPendingIndex++];
                setEntries((currentEntries) => currentEntries.map((currentEntry) =>
                    currentEntry.id === entry.id ? { ...currentEntry, previewState: 'loading', previewMessage: null } : currentEntry,
                ));
                try {
                    const preview = await fetchAdminWorkshopQuickLinkPreview(workshopId, entry.destination, abortController.signal);
                    if (isCancelled) return;
                    setEntries((currentEntries) => currentEntries.map((currentEntry) =>
                        currentEntry.id === entry.id && currentEntry.destination === entry.destination
                            ? {
                                ...currentEntry,
                                previewTitle: preview.title,
                                previewState: preview.state,
                                previewMessage: preview.message,
                                isExisting: preview.isExisting,
                            }
                            : currentEntry,
                    ));
                } catch (error) {
                    if (isCancelled) return;
                    const isBlocked = error instanceof JsonRequestError && (error.status === 400 || error.status === 422);
                    setEntries((currentEntries) => currentEntries.map((currentEntry) =>
                        currentEntry.id === entry.id && currentEntry.destination === entry.destination
                            ? {
                                ...currentEntry,
                                previewState: isBlocked ? 'blocked' : 'error',
                                previewMessage: isBlocked ? error.message : 'Náhled se nepodařilo načíst. Zkuste to znovu.',
                            }
                            : currentEntry,
                    ));
                }
            }
        };

        for (let index = 0; index < Math.min(WORKSHOP_QUICK_LINK_PREVIEW_CONCURRENCY, pendingEntries.length); index++) {
            void loadNextPreview();
        }
        return () => {
            isCancelled = true;
            abortController.abort();
        };
        // Entry identity changes only when URLs change; title edits and preview responses must not restart scraping.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinationSignature, previewRevision, workshopId]);

    const updateEntry = (id: string, changes: Partial<QuickLinkEntry>) => setEntries((currentEntries) =>
        currentEntries.map((entry) => entry.id === id ? { ...entry, ...changes } : entry),
    );

    const pendingEntries = entries.filter((entry) => entry.saveState !== 'created');
    const isPreviewPending = pendingEntries.some((entry) => !['ready', 'fallback'].includes(entry.previewState));
    const isCreationDisabled = isSubmitting || isInputInvalid || isBatchTooLarge || isPreviewPending || pendingEntries.length === 0;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmittingReference.current || isCreationDisabled) return;
        const entriesWithoutOrder = pendingEntries.filter((entry) => entry.sortOrder === null);
        const reservedOrders = entries.flatMap((entry) => entry.sortOrder === null ? [] : [{ sortOrder: entry.sortOrder }]);
        const newOrders = getWorkshopMaterialAppendSortOrders([...contentBlocks, ...reservedOrders], entriesWithoutOrder.length);
        if (newOrders === null) {
            for (const entry of entriesWithoutOrder) updateEntry(entry.id, {
                saveState: 'failed', saveErrorMessage: 'Pořadí materiálů je plné. Upravte číselné pořadí a zkuste to znovu.',
            });
            return;
        }

        const orderByEntryId = new Map(entriesWithoutOrder.map((entry, index) => [entry.id, newOrders[index]]));
        const plannedEntries = pendingEntries.map((entry) => ({
            ...entry,
            sortOrder: entry.sortOrder ?? orderByEntryId.get(entry.id) ?? null,
        }));
        setEntries((currentEntries) => currentEntries.map((entry) => ({
            ...entry,
            sortOrder: entry.sortOrder ?? orderByEntryId.get(entry.id) ?? null,
        })));

        isSubmittingReference.current = true;
        setIsSubmitting(true);
        onSavingChange(true);
        let isEveryCreationSuccessful = true;
        try {
            await protectAdminMutation(async () => {
                for (const entry of plannedEntries) {
                    if (entry.sortOrder === null) continue;
                    updateEntry(entry.id, { saveState: 'saving', saveErrorMessage: null });
                    const title = (entry.titleCorrection?.trim() || entry.previewTitle).slice(0, 200);
                    try {
                        const contentBlock = await onCreate({
                            ...createWorkshopContentDefaults(defaultUnlockAt, entry.sortOrder),
                            title,
                            bodyMarkdown: createWorkshopQuickLinkMarkdown(title, entry.destination),
                            idempotencyKey: entry.id,
                        });
                        updateEntry(entry.id, {
                            saveState: 'created',
                            saveErrorMessage: null,
                            titleCorrection: contentBlock.title,
                        });
                    } catch (error) {
                        isEveryCreationSuccessful = false;
                        updateEntry(entry.id, {
                            saveState: 'failed',
                            saveErrorMessage: (error as Error).message,
                        });
                    }
                }
            });
        } finally {
            isSubmittingReference.current = false;
            setIsSubmitting(false);
            onSavingChange(false);
        }
        if (isEveryCreationSuccessful) onClose();
    };

    return (
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
                Odkazy, jeden na řádek
                <Textarea
                    value={input}
                    onChange={(event) => changeInput(event.target.value)}
                    className="mt-1 min-h-28 bg-white font-mono text-sm"
                    placeholder={'https://example.com/pruvodce\nhttps://example.com/video?t=30'}
                    autoFocus
                    disabled={isSubmitting}
                />
            </label>
            <p className="text-sm text-slate-600">
                Přidá se {formatMaterialCount(pendingEntries.length)}. Nejvýše {MAXIMAL_WORKSHOP_QUICK_LINK_COUNT} odkazů najednou.
                Prázdné řádky a opakované odkazy se nepřidají.
            </p>
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                Výchozí nastavení: publikováno · odemknout {formatWorkshopAdminDateTime(defaultUnlockAt)} · pro všechny účastníky · nenavazující.
                Po přidání lze každý materiál běžně upravit.
            </p>
            {isBatchTooLarge && <p role="alert" className="text-sm text-red-700">Zadejte nejvýše {MAXIMAL_WORKSHOP_QUICK_LINK_COUNT} různých platných odkazů.</p>}
            {inputRows.length > 0 && <div className="space-y-3">
                {inputRows.map((row) => {
                    const entry = row.issue === null ? entries.find((candidate) => candidate.destination === row.destination) : null;
                    const isBeyondBatchLimit = entry !== null && entry !== undefined &&
                        entries.findIndex((candidate) => candidate.id === entry.id) >= MAXIMAL_WORKSHOP_QUICK_LINK_COUNT;
                    return <div key={`${row.lineNumber}:${row.value}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                        <p className="break-all font-medium text-slate-800">{row.lineNumber}. {row.value}</p>
                        {row.issue === 'invalid' && <p role="alert" className="mt-1 text-red-700">Neplatná adresa. Použijte veřejný odkaz HTTP nebo HTTPS bez přihlašovacích údajů.</p>}
                        {row.issue === 'duplicate' && <p className="mt-1 text-amber-800">Tento odkaz je už v dávce; další materiál nevznikne.</p>}
                        {entry?.isExisting && <p className="mt-1 text-amber-800">Tento odkaz už je v materiálech workshopu. Přidání vytvoří další samostatný materiál.</p>}
                        {entry && <div className="mt-2 space-y-2">
                            <p className={entry.previewState === 'blocked' || entry.previewState === 'error' ? 'text-red-700' : 'text-slate-500'} aria-live="polite">
                                {isBeyondBatchLimit ? 'Mimo limit dávky; zkraťte seznam pro načtení nadpisu.' :
                                    entry.previewState === 'idle' || entry.previewState === 'loading' ? 'Načítám nadpis…' :
                                    entry.previewState === 'ready' ? 'Nadpis načtený ze stránky.' :
                                        entry.previewState === 'fallback' ? `Náhradní nadpis: ${entry.previewMessage}` :
                                            entry.previewMessage}
                            </p>
                            <label className="block text-xs font-medium text-slate-600">
                                Nadpis odkazu na řádku {row.lineNumber} (volitelná oprava)
                                <Input
                                    value={entry.titleCorrection ?? entry.previewTitle}
                                    onChange={(event) => updateEntry(entry.id, { titleCorrection: event.target.value })}
                                    className="mt-1 bg-white"
                                    maxLength={200}
                                    disabled={isSubmitting || entry.saveState === 'created' || isBeyondBatchLimit}
                                />
                            </label>
                            {entry.previewState === 'error' && <Button type="button" size="sm" variant="outline" onClick={() => setPreviewRevision((revision) => revision + 1)}>Zkusit načíst znovu</Button>}
                            {entry.saveState === 'saving' && <p className="text-slate-600">Přidávám…</p>}
                            {entry.saveState === 'created' && <p className="text-green-700">Materiál byl přidán.</p>}
                            {entry.saveState === 'failed' && <p role="alert" className="text-red-700">Nepodařilo se přidat: {entry.saveErrorMessage}. Opakování zkusí jen nezdařené položky.</p>}
                        </div>}
                    </div>;
                })}
            </div>}
            <div className="flex justify-end">
                <Button type="submit" disabled={isCreationDisabled}>
                    {isSubmitting ? 'Přidávám…' : `Přidat ${formatMaterialCount(pendingEntries.length)}`}
                </Button>
            </div>
        </form>
    );
}
