import { CopyCalendarAddress } from '@/components/calendar/CopyCalendarAddress';
import {
    SUBSCRIBE_TO_CALENDAR_CONTROL_CLASS_NAME,
    SUBSCRIBE_TO_CALENDAR_PRIMARY_CONTROL_CLASS_NAME,
    SUBSCRIBE_TO_CALENDAR_SECONDARY_CONTROL_CLASS_NAME,
} from '@/components/calendar/subscribeToCalendarAppearance';
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

/**
 * Puts a whole published calendar into the calendar application of a visitor, so that every term it will ever carry
 * arrives there on its own
 *
 * Note: A subscription is offered rather than a download of what is published right now, which is what keeps a moved
 *       or newly published term correct in the calendar of everybody who took it.
 *
 * Note: One click subscribes the two kinds of application which can be handed a calendar by a click at all, and the
 *       address below them is for every other one, which is told where its subscription lives rather than sent there.
 */
export function SubscribeToCalendarLinks({ calendarFeedUrl, className }: SubscribeToCalendarLinksProps) {
    const { googleCalendarUrl, webcalUrl } = createCalendarSubscriptionLinks(calendarFeedUrl);

    return (
        <div className={classNames('flex flex-col gap-2', className)}>
            <div className="flex flex-wrap items-center gap-2">
                <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classNames(
                        SUBSCRIBE_TO_CALENDAR_CONTROL_CLASS_NAME,
                        SUBSCRIBE_TO_CALENDAR_PRIMARY_CONTROL_CLASS_NAME,
                    )}
                >
                    <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    {SUBSCRIBE_TO_CALENDAR_COPY.googleCalendarLabel}
                </a>
                <a
                    href={webcalUrl}
                    className={classNames(
                        SUBSCRIBE_TO_CALENDAR_CONTROL_CLASS_NAME,
                        SUBSCRIBE_TO_CALENDAR_SECONDARY_CONTROL_CLASS_NAME,
                    )}
                >
                    <Rss className="h-3.5 w-3.5" aria-hidden="true" />
                    {SUBSCRIBE_TO_CALENDAR_COPY.webcalLabel}
                </a>
            </div>
            <CopyCalendarAddress calendarAddress={calendarFeedUrl} />
        </div>
    );
}
