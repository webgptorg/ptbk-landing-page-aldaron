import {
    EventTermOptionCard,
    type EventTermAppearance,
    type EventTermDensity,
} from '@/components/events/EventTermOptionCard';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * How many terms stand next to each other at each density
 *
 * Note: A compact card needs less width than a comfortable one, so a surface which offers its terms quietly fits one
 *       more of them into a row instead of merely making each of them shorter.
 */
const EVENT_TERM_OPTION_LIST_DENSITIES: Readonly<Record<EventTermDensity, string>> = {
    comfortable: 'gap-3 sm:grid-cols-2',
    compact: 'gap-2 sm:grid-cols-2 lg:grid-cols-3',
};

type EventTermOptionListProps = {
    readonly terms: readonly EventOccurrence[];

    /**
     * The one term of this event which is chosen right now, which may well be listed somewhere else than here
     */
    readonly selectedTermSlug: string;
    readonly onSelectTerm: (term: EventOccurrence) => void;

    /**
     * Icon and text of the one line this surface adds about each of its terms, see `EventTermOptionCard`
     */
    readonly noteIcon: LucideIcon;
    readonly createNoteText: (term: EventOccurrence) => string;
    readonly isTopicShown?: boolean;
    readonly appearance?: EventTermAppearance;

    /**
     * How much room each of these terms is given, see `EVENT_TERM_OPTION_LIST_DENSITIES`
     */
    readonly density?: EventTermDensity;
    readonly className?: string;

    /**
     * Identifier of the list itself, for a surface which discloses it with a button of its own
     */
    readonly id?: string;
};

/**
 * The terms of one event offered next to each other, in the order they were given in
 *
 * Note: Every surface which lets somebody choose a term lays them out with this one list, so the terms of an event are
 *       offered in the same grid whether they are being registered for or entered. What names the whole group — a
 *       legend of a form or a heading of a section — belongs to the surface around it, because only that surface knows
 *       whether it offers one group of terms or several.
 */
export function EventTermOptionList({
    terms,
    selectedTermSlug,
    onSelectTerm,
    noteIcon,
    createNoteText,
    isTopicShown = false,
    appearance = 'light',
    density = 'comfortable',
    className,
    id,
}: EventTermOptionListProps) {
    return (
        <div id={id} className={cn('grid', EVENT_TERM_OPTION_LIST_DENSITIES[density], className)}>
            {terms.map((term) => (
                <EventTermOptionCard
                    key={term.id}
                    occurrence={term}
                    isSelected={term.slug === selectedTermSlug}
                    onSelect={() => onSelectTerm(term)}
                    isTopicShown={isTopicShown}
                    appearance={appearance}
                    density={density}
                    noteIcon={noteIcon}
                    noteText={createNoteText(term)}
                />
            ))}
        </div>
    );
}
