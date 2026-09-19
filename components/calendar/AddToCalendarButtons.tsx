'use client';

import { Button } from '@/components/ui/button';
import { createCalendarLinks, type CalendarEvent } from '@/lib/calendar/create-calendar-links';
import { classNames } from '@/lib/classNames';
import { CalendarPlus, Download } from 'lucide-react';

/**
 * Calendars one event can be sent to
 */
export type CalendarKind = 'google-calendar' | 'icalendar';

/**
 * Backgrounds the buttons are placed on
 */
export type AddToCalendarTone = 'light' | 'dark';

type AddToCalendarStyle = {
    readonly googleCalendarClassName: string;
    readonly icalendarClassName: string;
    readonly iconClassName: string;
};

const ADD_TO_CALENDAR_STYLE_BY_TONE: Readonly<Record<AddToCalendarTone, AddToCalendarStyle>> = {
    light: {
        googleCalendarClassName:
            'h-12 rounded-full bg-promptbook-blue-dark px-6 text-base font-semibold text-white hover:bg-promptbook-blue-dark/90',
        icalendarClassName: 'h-12 rounded-full px-6 text-base',
        iconClassName: 'mr-2 h-5 w-5',
    },
    dark: {
        googleCalendarClassName:
            'h-11 rounded-full bg-room-action px-5 text-sm font-bold text-room-action-foreground hover:bg-room-action-hover',
        icalendarClassName:
            'h-11 rounded-full border-room-border/15 bg-room-overlay/5 px-5 text-sm font-semibold text-room-heading hover:bg-room-overlay/10 hover:text-room-heading',
        iconClassName: 'mr-2 h-4 w-4',
    },
};

type AddToCalendarButtonsProps = {
    /**
     * Event the visitor is invited to put into their calendar
     */
    readonly event: CalendarEvent;

    /**
     * Name of the downloaded iCalendar file
     */
    readonly downloadFileName: string;

    /**
     * Background the buttons are placed on
     */
    readonly tone?: AddToCalendarTone;

    /**
     * Classes of the element which lays the buttons out
     */
    readonly className?: string;

    /**
     * Called when the visitor opens one of the calendars
     */
    readonly onAddToCalendar?: (calendarKind: CalendarKind) => void;
};

/**
 * Pair of buttons which puts one event into the calendar of a visitor
 *
 * Note: Google Calendar opens the event prefilled in a new tab, every other calendar reads the downloaded iCalendar
 *       file.
 */
export function AddToCalendarButtons({
    event,
    downloadFileName,
    tone = 'light',
    className,
    onAddToCalendar,
}: AddToCalendarButtonsProps) {
    const { googleCalendarUrl, icalendarDataUrl } = createCalendarLinks(event);
    const { googleCalendarClassName, icalendarClassName, iconClassName } = ADD_TO_CALENDAR_STYLE_BY_TONE[tone];

    return (
        <div className={classNames('flex flex-col gap-3 sm:flex-row', className)}>
            <Button asChild className={googleCalendarClassName}>
                <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onAddToCalendar?.('google-calendar')}
                >
                    <CalendarPlus className={iconClassName} />
                    Přidat do Google Kalendáře
                </a>
            </Button>
            <Button asChild variant="outline" className={icalendarClassName}>
                <a href={icalendarDataUrl} download={downloadFileName} onClick={() => onAddToCalendar?.('icalendar')}>
                    <Download className={iconClassName} />
                    Stáhnout .ics
                </a>
            </Button>
        </div>
    );
}
