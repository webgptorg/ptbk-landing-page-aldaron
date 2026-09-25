'use client';

import {
    fetchAdminWorkshopParticipantTrustSummary,
    saveAdminWorkshopAutomaticParticipantTrust,
    trustAllAdminWorkshopParticipants,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { WorkshopParticipantTrustSummary } from '@/lib/workshops/workshopParticipantTrustPolicy';
import { useCallback, useEffect, useRef, useState } from 'react';

type WorkshopParticipantTrustControlsProps = {
    readonly workshopId: string;
    readonly roomTitle: string;
    readonly refreshVersion: number;
    readonly onParticipantsChanged: () => Promise<void>;
};

/** Admin-only controls for the complete participant set of one room. */
export function WorkshopParticipantTrustControls({
    workshopId,
    roomTitle,
    refreshVersion,
    onParticipantsChanged,
}: WorkshopParticipantTrustControlsProps) {
    const [summary, setSummary] = useState<WorkshopParticipantTrustSummary | null>(null);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [settingFeedback, setSettingFeedback] = useState<string | null>(null);
    const [isSettingSaving, setIsSettingSaving] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [reviewedSummary, setReviewedSummary] = useState<WorkshopParticipantTrustSummary | null>(null);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
    const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);
    const [bulkError, setBulkError] = useState<string | null>(null);
    const summaryLoadSequenceReference = useRef(0);
    const reviewLoadSequenceReference = useRef(0);
    const isSettingSavingReference = useRef(false);
    const isBulkSubmittingReference = useRef(false);

    const loadSummary = useCallback(async () => {
        const loadSequence = ++summaryLoadSequenceReference.current;
        try {
            const loadedSummary = await fetchAdminWorkshopParticipantTrustSummary(workshopId);
            if (loadSequence === summaryLoadSequenceReference.current && !isSettingSavingReference.current) {
                setSummary(loadedSummary);
                setSummaryError(null);
            }
        } catch (error) {
            if (loadSequence === summaryLoadSequenceReference.current && !isSettingSavingReference.current) {
                setSummary(null);
                setSummaryError((error as Error).message);
            }
        }
    }, [workshopId]);

    useEffect(() => {
        void loadSummary();
        return () => {
            summaryLoadSequenceReference.current += 1;
        };
    }, [loadSummary, refreshVersion]);

    const saveAutomaticTrust = async (isAutomaticTrustEnabled: boolean) => {
        if (summary === null || isSettingSavingReference.current) return;

        isSettingSavingReference.current = true;
        summaryLoadSequenceReference.current += 1;
        setIsSettingSaving(true);
        setSummaryError(null);
        setSettingFeedback(null);
        try {
            const savedSummary = await saveAdminWorkshopAutomaticParticipantTrust(workshopId, isAutomaticTrustEnabled);
            summaryLoadSequenceReference.current += 1;
            setSummary(savedSummary);
            setSettingFeedback(
                savedSummary.isAutomaticTrustEnabled
                    ? 'Uloženo. Noví účastníci této místnosti získají důvěru při vstupu.'
                    : 'Uloženo. Noví účastníci této místnosti již důvěru automaticky nezískají.',
            );
        } catch (error) {
            setSummaryError(`Nastavení se nepodařilo uložit: ${(error as Error).message}`);
        } finally {
            isSettingSavingReference.current = false;
            setIsSettingSaving(false);
        }
    };

    const loadReview = async () => {
        const loadSequence = ++reviewLoadSequenceReference.current;
        setReviewedSummary(null);
        setIsReviewLoading(true);
        setBulkError(null);
        try {
            const loadedSummary = await fetchAdminWorkshopParticipantTrustSummary(workshopId);
            if (loadSequence !== reviewLoadSequenceReference.current) return;
            summaryLoadSequenceReference.current += 1;
            setSummary(loadedSummary);
            setReviewedSummary(loadedSummary);
        } catch (error) {
            if (loadSequence === reviewLoadSequenceReference.current) setBulkError((error as Error).message);
        } finally {
            if (loadSequence === reviewLoadSequenceReference.current) setIsReviewLoading(false);
        }
    };

    const openBulkDialog = () => {
        setBulkFeedback(null);
        setIsBulkDialogOpen(true);
        void loadReview();
    };

    const changeBulkDialogOpen = (isOpen: boolean) => {
        if (isBulkSubmittingReference.current) return;
        setIsBulkDialogOpen(isOpen);
        if (!isOpen) {
            reviewLoadSequenceReference.current += 1;
            setReviewedSummary(null);
            setBulkError(null);
        }
    };

    const confirmBulkTrust = async () => {
        if (reviewedSummary === null || reviewedSummary.eligibleCount === 0 || isBulkSubmittingReference.current)
            return;

        isBulkSubmittingReference.current = true;
        setIsBulkSubmitting(true);
        setBulkError(null);
        try {
            const result = await trustAllAdminWorkshopParticipants(workshopId, reviewedSummary.eligibilityToken);
            summaryLoadSequenceReference.current += 1;
            if (result.kind === 'stale') {
                setSummary(result.summary);
                setReviewedSummary(result.summary);
                setBulkError('Okruh účastníků se změnil. Zkontrolujte nový počet a potvrďte akci znovu.');
                await onParticipantsChanged();
                return;
            }

            setSummary(result.summary);
            setBulkFeedback(
                `Důvěra byla udělena v místnosti „${roomTitle}“. Počet dotčených účastníků: ${result.changedCount}.`,
            );
            setIsBulkDialogOpen(false);
            setReviewedSummary(null);
            await onParticipantsChanged();
            if (result.summary === null) void loadSummary();
        } catch (error) {
            setBulkError((error as Error).message);
        } finally {
            isBulkSubmittingReference.current = false;
            setIsBulkSubmitting(false);
        }
    };

    return (
        <>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Důvěra v místnosti „{roomTitle}“</p>
                        <p className="mt-1 text-xs text-slate-600">
                            Počty a akce zahrnují všechny účastníky této místnosti, včetně lidí mimo aktuální filtr a
                            stránku.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium" aria-live="polite">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">
                            Důvěryhodní: {summary?.trustedCount ?? '…'}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-800">
                            Nedůvěryhodní: {summary?.untrustedCount ?? '…'}
                        </span>
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-800">
                            Moderátoři: {summary?.moderatorCount ?? '…'}
                        </span>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={summary === null || summary.eligibleCount === 0}
                        onClick={openBulkDialog}
                    >
                        Důvěřovat všem ({summary?.eligibleCount ?? '…'})
                    </Button>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                        <Switch
                            checked={summary?.isAutomaticTrustEnabled ?? false}
                            disabled={summary === null || isSettingSaving}
                            onCheckedChange={(isChecked) => void saveAutomaticTrust(isChecked)}
                            aria-label="Automaticky důvěřovat novým účastníkům této místnosti"
                        />
                        Automaticky důvěřovat novým účastníkům
                    </label>
                    <span className="text-xs text-slate-600" aria-live="polite">
                        {isSettingSaving
                            ? 'Ukládání…'
                            : summary === null
                              ? summaryError === null
                                  ? 'Načítání…'
                                  : 'Nedostupné'
                              : summary.isAutomaticTrustEnabled
                                ? 'Zapnuto'
                                : 'Vypnuto'}
                    </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                    Přepínač platí jen pro nové identity. Stávající účastníky změní pouze samostatná akce výše; vypnutí
                    dříve udělenou důvěru neodebere.
                </p>
                {summary?.isAutomaticTrustEnabled && (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        Automatická důvěra je aktivní. Nové identity v této místnosti mohou publikovat bez čekání na
                        moderaci; zákaz interakcí má stále přednost.
                    </p>
                )}
                {settingFeedback && (
                    <p className="mt-2 text-xs text-emerald-700" role="status">
                        {settingFeedback}
                    </p>
                )}
                {bulkFeedback && (
                    <p className="mt-2 text-xs text-emerald-700" role="status">
                        {bulkFeedback}
                    </p>
                )}
                {summaryError && (
                    <p className="mt-2 text-xs text-rose-700" role="alert">
                        {summaryError}
                    </p>
                )}
            </div>

            <AlertDialog open={isBulkDialogOpen} onOpenChange={changeBulkDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Důvěřovat všem v místnosti „{roomTitle}“?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Důvěra se udělí dosud nedůvěryhodným účastníkům této místnosti, kteří nejsou moderátory,
                            včetně těch mimo aktuální filtr a stránku. Udělení důvěry zároveň zpracuje jejich čekající
                            komentáře, odpovědi v anketách a komunitní projekty podle stávajících pravidel schvalování.
                            Zamítnuté příspěvky zůstanou zamítnuté a zákaz interakcí zůstane platný.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <p className="text-sm font-semibold text-slate-900" aria-live="polite">
                        {isReviewLoading
                            ? 'Zjišťuji přesný počet…'
                            : `Počet účastníků, kteří získají důvěru: ${reviewedSummary?.eligibleCount ?? '—'}.`}
                    </p>
                    {bulkError && (
                        <p className="text-sm text-rose-700" role="alert">
                            {bulkError}
                        </p>
                    )}
                    {reviewedSummary === null && !isReviewLoading && (
                        <Button type="button" variant="outline" onClick={() => void loadReview()}>
                            Načíst počet znovu
                        </Button>
                    )}
                    <AlertDialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isBulkSubmitting}
                            onClick={() => changeBulkDialogOpen(false)}
                        >
                            Zrušit
                        </Button>
                        <Button
                            type="button"
                            disabled={
                                reviewedSummary === null || reviewedSummary.eligibleCount === 0 || isBulkSubmitting
                            }
                            onClick={() => void confirmBulkTrust()}
                        >
                            {isBulkSubmitting ? 'Uděluji důvěru…' : 'Potvrdit udělení důvěry'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
