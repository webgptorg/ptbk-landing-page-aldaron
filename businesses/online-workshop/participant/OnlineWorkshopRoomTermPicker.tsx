'use client';

import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
import { EventTermOptionList } from '@/components/events/EventTermOptionList';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
import { ChevronDown, Clock, History } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

/**
 * What the waiting room says while a participant is choosing which workshop to enter
 */
const ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY = {
    legend: 'Vyberte si workshop',
    description: 'Do místnosti kteréhokoli workshopu se dostanete stejným jménem a e-mailem.',
    noCurrentTermsMessage: 'Právě teď žádný workshop neběží a další termín zatím není vypsaný.',
    pastTermsLabel: 'Proběhlé workshopy',

    /**
     * Note: A room which is over is worth entering for what stayed in it, and that is all this promises. What a
     *       recording or a paid material asks for is decided by the room itself once a participant is inside.
     */
    pastTermNoteText: 'Místnost zůstává otevřená',
} as const;

type OnlineWorkshopRoomTermPickerProps = {
    readonly terms: readonly EventOccurrence[];
    readonly selectedTermSlug: string;
    readonly onSelectTerm: (term: EventOccurrence) => void;

    /**
     * Moment which decides what is running, what is ahead, and what is already over
     *
     * Note: That moment comes from the server which listed these terms, so the browser groups them exactly as the
     *       page it received was built, rather than regrouping them the instant it hydrates.
     */
    readonly currentTime: string;
};

/**
 * Every published term of the online workshop, offered to a participant who has not connected to one yet
 *
 * Note: A workshop which runs right now or is still ahead is what a participant is nearly always looking for, so those
 *       terms lead. The ones which are over stay reachable behind one click, because their rooms keep the chat and the
 *       materials of the workshop which was held in them.
 */
export function OnlineWorkshopRoomTermPicker({
    terms,
    selectedTermSlug,
    onSelectTerm,
    currentTime,
}: OnlineWorkshopRoomTermPickerProps) {
    const pastTermsListId = useId();
    const termsByPhase = useMemo(
        () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
        [currentTime, terms],
    );
    const currentTerms = [...termsByPhase.ongoing, ...termsByPhase.upcoming];
    const { past: pastTerms } = termsByPhase;
    const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);

    // Note: A participant who came for a workshop which is already over meets the history open, so the term they came
    //       for is where they can see it. That is asked about the workshop the room was entered with rather than kept
    //       in step with the choice, because from then on it is the participant who opens and closes the history.
    const [isPastTermsShown, setIsPastTermsShown] = useState(isSelectedTermPast);

    return (
        <fieldset className="min-w-0">
            <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-200">
                {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.legend}
            </legend>
            <p className="mt-2 text-sm leading-6 text-slate-400">
                {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.description}
            </p>

            {currentTerms.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-4 text-sm text-slate-400">
                    {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.noCurrentTermsMessage}
                </p>
            ) : (
                <EventTermOptionList
                    terms={currentTerms}
                    selectedTermSlug={selectedTermSlug}
                    onSelectTerm={onSelectTerm}
                    isTopicShown={true}
                    appearance="dark"
                    noteIcon={Clock}
                    createNoteText={createOnlineWorkshopTermNoteText}
                    className="mt-4"
                />
            )}

            {pastTerms.length > 0 && (
                <>
                    <button
                        type="button"
                        aria-controls={pastTermsListId}
                        aria-expanded={isPastTermsShown}
                        onClick={() => setIsPastTermsShown((isShown) => !isShown)}
                        className="mt-4 flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-left text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200"
                    >
                        {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.pastTermsLabel} ({pastTerms.length})
                        <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${isPastTermsShown ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </button>
                    {isPastTermsShown && (
                        <EventTermOptionList
                            id={pastTermsListId}
                            terms={pastTerms}
                            selectedTermSlug={selectedTermSlug}
                            onSelectTerm={onSelectTerm}
                            isTopicShown={true}
                            appearance="dark"
                            noteIcon={History}
                            createNoteText={() => ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.pastTermNoteText}
                            className="mt-1"
                        />
                    )}
                </>
            )}
        </fieldset>
    );
}
