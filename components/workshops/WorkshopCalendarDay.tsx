import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
import { getCalendarDayNumber, type CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { classNames } from '@/lib/classNames';
import type { EventListing } from '@/lib/events/eventListing';
import { getMostProminentWorkshopPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';

/**
 * How many terms of a day are named in it before the rest of them are only counted
 */
const NAMED_DAY_LISTING_COUNT = 2;

type WorkshopCalendarDayProps = {
    readonly dayKey: CalendarDayKey;

    /**
     * The terms held on this day, most pressing first
     */
    readonly listings: readonly EventListing[];

    /**
     * Whether this day belongs to the month being shown, rather than filling up its first or last week
     */
    readonly isInShownMonth: boolean;
    readonly isToday: boolean;
    readonly isSelected: boolean;

    /**
     * The whole name of this day, which is what a member who cannot see the grid is told
     */
    readonly title: string;
    readonly onSelect: (dayKey: CalendarDayKey) => void;
};

/**
 * The colour of one term inside a day, which is the colour its phase is drawn with everywhere else
 */
function WorkshopCalendarDayMark({ phase }: { readonly phase: WorkshopPhase }) {
    return (
        <span
            className={classNames('h-1.5 w-1.5 shrink-0 rounded-full', getWorkshopPhaseAppearance(phase).markClassName)}
            aria-hidden="true"
        />
    );
}

/**
 * One day of the month, which says by its own colour whether what is held on it is over, running, or still ahead
 *
 * Note: A day nothing is held on cannot be selected, so moving through the calendar with a keyboard reaches the days
 *       which have something to show and skips the rest.
 */
export function WorkshopCalendarDay({
    dayKey,
    listings,
    isInShownMonth,
    isToday,
    isSelected,
    title,
    onSelect,
}: WorkshopCalendarDayProps) {
    const isDayFull = listings.length > 0;
    const dayPhaseClassName = isDayFull
        ? getWorkshopPhaseAppearance(getMostProminentWorkshopPhase(listings.map((listing) => listing.phase)))
              .calendarDayClassName
        : 'border-room-border/5 text-room-subtle';
    const namedListings = listings.slice(0, NAMED_DAY_LISTING_COUNT);
    const unnamedListingCount = listings.length - namedListings.length;

    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={isSelected}
            disabled={!isDayFull}
            onClick={() => onSelect(dayKey)}
            className={classNames(
                'flex min-h-[3.25rem] flex-col rounded-lg border p-1 text-left transition sm:min-h-[4.75rem] sm:p-1.5',
                dayPhaseClassName,
                // Note: A day of the neighbouring month stands back, but a term held on it is still readable, because
                //       the last days before a month and the first days after it are exactly where a member looks.
                !isInShownMonth && (isDayFull ? 'opacity-75' : 'opacity-40'),
                isDayFull && 'hover:border-room-accent/60 hover:bg-room-accent/15',
                isSelected && 'ring-2 ring-room-accent',
                isToday && !isSelected && 'ring-1 ring-room-accent/60',
            )}
        >
            <span
                className={classNames(
                    'text-[11px] font-semibold leading-none sm:text-xs',
                    isToday ? 'text-room-accent' : 'text-inherit',
                )}
            >
                {getCalendarDayNumber(dayKey)}
            </span>

            <span className="mt-1 hidden min-w-0 flex-col gap-0.5 sm:flex">
                {namedListings.map((listing) => (
                    <span key={listing.workshop.id} className="flex min-w-0 items-center gap-1">
                        <WorkshopCalendarDayMark phase={listing.phase} />
                        <span className="min-w-0 truncate text-[10px] leading-tight">{listing.workshop.title}</span>
                    </span>
                ))}
                {unnamedListingCount > 0 && (
                    <span className="text-[10px] leading-tight opacity-80">+{unnamedListingCount}</span>
                )}
            </span>

            <span className="mt-auto flex items-center gap-1 sm:hidden">
                {listings.map((listing) => (
                    <WorkshopCalendarDayMark key={listing.workshop.id} phase={listing.phase} />
                ))}
            </span>
        </button>
    );
}
