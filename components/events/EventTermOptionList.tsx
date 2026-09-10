import {
    EventTermOptionCard,
    type EventTermAppearance,
} from '@/components/events/EventTermOptionCard';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

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
    className,
    id,
}: EventTermOptionListProps) {
    return (
        <div id={id} className={cn('grid gap-3 sm:grid-cols-2', className)}>
            {terms.map((term) => (
                <EventTermOptionCard
                    key={term.id}
                    occurrence={term}
                    isSelected={term.slug === selectedTermSlug}
                    onSelect={() => onSelectTerm(term)}
                    isTopicShown={isTopicShown}
                    appearance={appearance}
                    noteIcon={noteIcon}
                    noteText={createNoteText(term)}
                />
            ))}
        </div>
    );
}
