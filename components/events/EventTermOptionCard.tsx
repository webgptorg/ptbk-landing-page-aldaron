import { formatEventFormat } from '@/lib/events/eventLocation';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { cn } from '@/lib/utils';
import { formatCzechWorkshopDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
import type { LucideIcon } from 'lucide-react';

/**
 * The two surfaces a term of an event is offered on: the bright landing page of that event and the dark room a
 * participant connects to
 */
export const EVENT_TERM_APPEARANCES = ['light', 'dark'] as const;

export type EventTermAppearance = (typeof EVENT_TERM_APPEARANCES)[number];

/**
 * How one card is drawn on each of those surfaces
 *
 * Note: Both appearances say the very same things in the very same places and differ only in colour, so a term never
 *       becomes easier or harder to read by being offered somewhere else.
 */
const EVENT_TERM_OPTION_CARD_APPEARANCES: Readonly<
    Record<
        EventTermAppearance,
        {
            readonly card: string;
            readonly selectedCard: string;
            readonly heading: string;
            readonly title: string;
            readonly description: string;
            readonly formatBadge: string;
            readonly price: string;
            readonly note: string;
            readonly noteIcon: string;
        }
    >
> = {
    light: {
        card: 'border-slate-200 bg-white hover:border-cyan-200',
        selectedCard: 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100',
        heading: 'text-slate-950',
        title: 'text-slate-950',
        description: 'text-slate-600',
        formatBadge: 'bg-slate-100 text-slate-700',
        price: 'text-slate-700',
        note: 'text-slate-600',
        noteIcon: 'text-cyan-600',
    },
    dark: {
        card: 'border-white/10 bg-white/[0.04] hover:border-cyan-300/40',
        selectedCard: 'border-cyan-300/70 bg-cyan-300/10 ring-2 ring-cyan-300/20',
        heading: 'text-white',
        title: 'text-white',
        description: 'text-slate-300',
        formatBadge: 'bg-white/10 text-slate-200',
        price: 'text-slate-200',
        note: 'text-slate-300',
        noteIcon: 'text-cyan-300',
    },
};

type EventTermOptionCardProps = {
    readonly occurrence: EventOccurrence;
    readonly isSelected: boolean;
    readonly onSelect: () => void;

    /**
     * Whether the card says what this very term is about
     *
     * Note: An event whose terms each have a subject of their own is chosen by that subject, so those cards name it.
     *       An event which is the very same workshop held in another form or on another day is chosen by when and
     *       where it is, and naming it again on every card would only repeat what the card already carries.
     */
    readonly isTopicShown?: boolean;

    /**
     * Which of the two surfaces this card is offered on, see `EVENT_TERM_OPTION_CARD_APPEARANCES`
     */
    readonly appearance?: EventTermAppearance;

    /**
     * Icon and text of the one line each landing page adds about its terms, such as how long they take or how many
     * seats are left in them
     */
    readonly noteIcon: LucideIcon;
    readonly noteText: string;
};

/**
 * One term of an event as a visitor picks it, which says when it is held, what it is about, in what form, and at what
 * price
 *
 * Note: Every landing page which lets a visitor choose between the terms of its event picks them with this one card,
 *       so the terms of two events are never offered in two different ways. What only one of those pages knows about
 *       its terms is said in the note beneath.
 */
export function EventTermOptionCard({
    occurrence,
    isSelected,
    onSelect,
    isTopicShown = false,
    appearance = 'light',
    noteIcon: NoteIcon,
    noteText,
}: EventTermOptionCardProps) {
    const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];

    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={onSelect}
            className={cn(
                'rounded-xl border p-4 text-left transition-all',
                isSelected ? appearanceClassNames.selectedCard : appearanceClassNames.card,
            )}
        >
            <span className={cn('block text-lg font-bold', appearanceClassNames.heading)}>
                {formatCzechWorkshopDay(occurrence.startsAt)} ·{' '}
                {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
            </span>
            {isTopicShown && (
                <>
                    <span className={cn('mt-2 block font-semibold', appearanceClassNames.title)}>
                        {occurrence.title}
                    </span>
                    {occurrence.description.trim() !== '' && (
                        <span className={cn('mt-1 block text-sm leading-relaxed', appearanceClassNames.description)}>
                            {occurrence.description}
                        </span>
                    )}
                </>
            )}
            <span className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', appearanceClassNames.formatBadge)}>
                    {formatEventFormat(occurrence.event)}
                </span>
                <span className={cn('font-medium', appearanceClassNames.price)}>
                    {formatEventPrice(occurrence.event.priceCzk)}
                </span>
            </span>
            <span className={cn('mt-2 flex items-center gap-2 text-sm', appearanceClassNames.note)}>
                <NoteIcon className={cn('h-4 w-4 shrink-0', appearanceClassNames.noteIcon)} aria-hidden="true" />
                {noteText}
            </span>
        </button>
    );
}
