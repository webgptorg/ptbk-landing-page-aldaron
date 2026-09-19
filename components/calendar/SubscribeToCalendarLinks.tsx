import { createCalendarSubscriptionLinks } from '@/lib/calendar/create-calendar-links';
import { classNames } from '@/lib/classNames';
import { CalendarPlus, Rss } from 'lucide-react';

const SUBSCRIBE_TO_CALENDAR_COPY = {
    googleCalendarLabel: 'Přidat do Google Kalendáře',
    webcalLabel: 'Jiná kalendářová aplikace',
} as const;

type SubscribeToCalendarLinksProps = {
    /**
     * Absolute url of the published calendar a visitor subscribes to
     */
    readonly calendarFeedUrl: string;
    readonly className?: string;
};

const SUBSCRIBE_TO_CALENDAR_LINK_CLASS_NAME =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition';

/**
 * Puts a whole published calendar into the calendar application of a visitor, so that every term it will ever carry
 * arrives there on its own
 *
 * Note: A subscription is offered rather than a download of what is published right now, which is what keeps a moved
 *       or newly published term correct in the calendar of everybody who took it.
 */
export function SubscribeToCalendarLinks({ calendarFeedUrl, className }: SubscribeToCalendarLinksProps) {
    const { googleCalendarUrl, webcalUrl } = createCalendarSubscriptionLinks(calendarFeedUrl);

    return (
        <div className={classNames('flex flex-wrap items-center gap-2', className)}>
            <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(
                    SUBSCRIBE_TO_CALENDAR_LINK_CLASS_NAME,
                    'border-room-accent/30 bg-room-accent/10 text-room-accent hover:border-room-accent/60 hover:bg-room-accent/20 hover:text-room-heading',
                )}
            >
                <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                {SUBSCRIBE_TO_CALENDAR_COPY.googleCalendarLabel}
            </a>
            <a
                href={webcalUrl}
                className={classNames(
                    SUBSCRIBE_TO_CALENDAR_LINK_CLASS_NAME,
                    'border-room-border/10 bg-room-overlay/5 text-room-text hover:border-room-border/20 hover:bg-room-overlay/10 hover:text-room-heading',
                )}
            >
                <Rss className="h-3.5 w-3.5" aria-hidden="true" />
                {SUBSCRIBE_TO_CALENDAR_COPY.webcalLabel}
            </a>
        </div>
    );
}
