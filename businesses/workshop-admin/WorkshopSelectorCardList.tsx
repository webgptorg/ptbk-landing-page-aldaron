'use client';

import { WorkshopSelectorCard } from '@/businesses/workshop-admin/WorkshopSelectorCard';
import { Input } from '@/components/ui/input';
import { getWorkshopPhase, groupWorkshopsByPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { ChevronDown, RefreshCw, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

type WorkshopSelectorCardListProps = {
    readonly label: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly isLoading: boolean;
    readonly emptyMessage: string;
    readonly onSelect: (workshopId: string) => void;
};

const CZECH_LOCALE = 'cs-CZ';
const WORKSHOP_CARD_GRID_CLASS_NAME = 'grid grid-cols-1 gap-1.5 xl:grid-cols-2';
const WORKSHOP_LIST_CLASS_NAME =
    'mt-3 space-y-3 lg:max-h-[min(34rem,calc(100dvh-31rem))] lg:overflow-y-auto lg:pr-1';

function normalizeWorkshopSearchQuery(searchQuery: string): string {
    return searchQuery
        .trim()
        .toLocaleLowerCase(CZECH_LOCALE)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isWorkshopMatchingSearchQuery(workshop: WorkshopAdminSummary, normalizedSearchQuery: string): boolean {
    if (normalizedSearchQuery.length === 0) {
        return true;
    }

    return normalizeWorkshopSearchQuery(`${workshop.title} ${workshop.slug}`).includes(normalizedSearchQuery);
}

type WorkshopSelectorCardGridProps = {
    readonly accessibleLabel: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * Renders each selectable workshop in one place, so the current terms and the progressively disclosed archive stay
 * equally informative and behave identically.
 */
function WorkshopSelectorCardGrid({
    accessibleLabel,
    workshops,
    selectedWorkshopId,
    onSelect,
}: WorkshopSelectorCardGridProps) {
    return (
        <ul aria-label={accessibleLabel} className={WORKSHOP_CARD_GRID_CLASS_NAME}>
            {workshops.map((workshop) => (
                <li key={workshop.id} className="min-w-0">
                    <WorkshopSelectorCard
                        workshop={workshop}
                        isSelected={workshop.id === selectedWorkshopId}
                        onSelect={onSelect}
                    />
                </li>
            ))}
        </ul>
    );
}

/**
 * Offers every occurrence as a card, ordered so that a running room leads the list, the prepared terms follow it, and
 * the history closes it.
 */
export function WorkshopSelectorCardList({
    label,
    workshops,
    selectedWorkshopId,
    isLoading,
    emptyMessage,
    onSelect,
}: WorkshopSelectorCardListProps) {
    const searchInputId = useId();
    const pastWorkshopsListId = useId();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPastWorkshopsExpanded, setIsPastWorkshopsExpanded] = useState(false);
    const normalizedSearchQuery = useMemo(() => normalizeWorkshopSearchQuery(searchQuery), [searchQuery]);
    const matchingWorkshops = useMemo(() => {
        return workshops.filter((workshop) => isWorkshopMatchingSearchQuery(workshop, normalizedSearchQuery));
    }, [normalizedSearchQuery, workshops]);
    const matchingWorkshopsByPhase = useMemo(() => groupWorkshopsByPhase(matchingWorkshops), [matchingWorkshops]);
    const currentAndUpcomingWorkshops = [
        ...matchingWorkshopsByPhase.ongoing,
        ...matchingWorkshopsByPhase.upcoming,
    ];

    // Note: An administrator works on a term which has only just been held exactly as they work on any other finished
    //       one, so the history holds both of them. It merely leads that history, because the workshop of last night
    //       is the one still being wrapped up.
    const pastWorkshops = [...matchingWorkshopsByPhase['freshly-past'], ...matchingWorkshopsByPhase.past];
    const selectedWorkshop = workshops.find((workshop) => workshop.id === selectedWorkshopId);
    const isSelectedWorkshopPast =
        selectedWorkshop !== undefined && isWorkshopPhasePast(getWorkshopPhase(selectedWorkshop));
    const isSearchQueryPresent = normalizedSearchQuery.length > 0;
    const isPastWorkshopsVisible = isPastWorkshopsExpanded || isSelectedWorkshopPast || isSearchQueryPresent;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h2>
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" aria-label="Načítání" />
                </div>
            ) : workshops.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    {emptyMessage}
                </p>
            ) : (
                <>
                    <label htmlFor={searchInputId} className="sr-only">
                        Hledat workshop
                    </label>
                    <div className="relative mt-3">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <Input
                            id={searchInputId}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Hledat workshop"
                            className="h-9 pl-9"
                        />
                    </div>
                    {matchingWorkshops.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                            Žádný workshop neodpovídá hledání.
                        </p>
                    ) : (
                        <div className={WORKSHOP_LIST_CLASS_NAME}>
                            {currentAndUpcomingWorkshops.length > 0 && (
                                <section aria-labelledby={`${pastWorkshopsListId}-current`}>
                                    <h3
                                        id={`${pastWorkshopsListId}-current`}
                                        className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        Aktuální a nadcházející ({currentAndUpcomingWorkshops.length})
                                    </h3>
                                    <div className="mt-1.5">
                                        <WorkshopSelectorCardGrid
                                            accessibleLabel="Seznam workshopů"
                                            workshops={currentAndUpcomingWorkshops}
                                            selectedWorkshopId={selectedWorkshopId}
                                            onSelect={onSelect}
                                        />
                                    </div>
                                </section>
                            )}

                            {pastWorkshops.length > 0 && (
                                <section>
                                    <button
                                        type="button"
                                        aria-controls={pastWorkshopsListId}
                                        aria-expanded={isPastWorkshopsVisible}
                                        onClick={() => setIsPastWorkshopsExpanded((isExpanded) => !isExpanded)}
                                        className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-800"
                                    >
                                        Historie ({pastWorkshops.length})
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 transition-transform ${isPastWorkshopsVisible ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {isPastWorkshopsVisible && (
                                        <div className="mt-1.5" id={pastWorkshopsListId}>
                                            <WorkshopSelectorCardGrid
                                                accessibleLabel="Historie workshopů"
                                                workshops={pastWorkshops}
                                                selectedWorkshopId={selectedWorkshopId}
                                                onSelect={onSelect}
                                            />
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
