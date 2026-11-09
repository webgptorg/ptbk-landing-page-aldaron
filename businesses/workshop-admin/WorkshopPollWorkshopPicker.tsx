'use client';

import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { MAXIMAL_WORKSHOP_POLL_WORKSHOP_COUNT } from '@/lib/workshops/workshopConstants';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

type WorkshopPollWorkshopPickerProps = {
    readonly workshops: readonly WorkshopSummary[];
    readonly selectedWorkshopIds: readonly string[];
    readonly isDisabled: boolean;
    readonly onChange: (selectedWorkshopIds: readonly string[]) => void;
};

/**
 * Chooses which workshop occurrences a community poll is about.
 *
 * Note: An occurrence is only ever offered here, never created here, so the poll editor stays a poll editor and the
 *       occurrences keep being administered in /admin/workshops.
 */
export function WorkshopPollWorkshopPicker({
    workshops,
    selectedWorkshopIds,
    isDisabled,
    onChange,
}: WorkshopPollWorkshopPickerProps) {
    const selectedWorkshopIdSet = new Set(selectedWorkshopIds);
    const isSelectionFull = selectedWorkshopIds.length >= MAXIMAL_WORKSHOP_POLL_WORKSHOP_COUNT;

    const toggleWorkshop = (workshopId: string) =>
        onChange(
            selectedWorkshopIdSet.has(workshopId)
                ? selectedWorkshopIds.filter((selectedWorkshopId) => selectedWorkshopId !== workshopId)
                : [...selectedWorkshopIds, workshopId],
        );

    return (
        <fieldset className="mt-4">
            <legend className="text-sm font-medium text-slate-700">Workshopy, kterých se anketa týká</legend>
            <p className="mt-1 text-xs text-slate-500">
                Nepovinné. Připojená anketa se zobrazí i v administraci daného workshopu a členům komunity nabídne
                odkaz do jeho místnosti.
            </p>
            {workshops.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                    Zatím není vytvořený žádný workshop.
                </p>
            ) : (
                <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-cyan-100 bg-white p-2">
                    {workshops.map((workshop) => {
                        const isSelected = selectedWorkshopIdSet.has(workshop.id);
                        return (
                            <label
                                key={workshop.id}
                                className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-cyan-50/70"
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled || (!isSelected && isSelectionFull)}
                                    onChange={() => toggleWorkshop(workshop.id)}
                                    className="mt-0.5 h-4 w-4 accent-cyan-600"
                                />
                                <span className="min-w-0">
                                    <span className="block break-words font-medium">{workshop.title}</span>
                                    <span className="block text-xs text-slate-500">
                                        {formatWorkshopAdminDateTime(workshop.startsAt)}
                                        {workshop.isPublished ? '' : ' · nezveřejněný'}
                                    </span>
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}
        </fieldset>
    );
}
