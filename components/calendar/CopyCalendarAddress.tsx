'use client';

import {
    SUBSCRIBE_TO_CALENDAR_CONTROL_CLASS_NAME,
    SUBSCRIBE_TO_CALENDAR_SECONDARY_CONTROL_CLASS_NAME,
} from '@/components/calendar/subscribeToCalendarAppearance';
import { useCopyTextToClipboard, type CopyStatus } from '@/hooks/useCopyTextToClipboard';
import { classNames } from '@/lib/classNames';
import { AlertTriangle, Check, Copy } from 'lucide-react';

const COPY_CALENDAR_ADDRESS_COPY = {
    idleLabel: 'Zkopírovat adresu kalendáře',
    copiedLabel: 'Adresa zkopírována',
    failedLabel: 'Zkopírujte adresu ručně',
} as const;

/**
 * How each outcome of the copying is named and marked
 *
 * Note: The colour sits on the icon rather than on the button, so that it is inherited over the resting colour of the
 *       pill instead of competing with it in the stylesheet.
 */
const COPY_CALENDAR_ADDRESS_STATES = {
    idle: { label: COPY_CALENDAR_ADDRESS_COPY.idleLabel, icon: Copy, iconClassName: undefined },
    copied: { label: COPY_CALENDAR_ADDRESS_COPY.copiedLabel, icon: Check, iconClassName: 'text-room-success' },
    failed: { label: COPY_CALENDAR_ADDRESS_COPY.failedLabel, icon: AlertTriangle, iconClassName: 'text-room-danger' },
} as const satisfies Record<CopyStatus, unknown>;

type CopyCalendarAddressProps = {
    /**
     * Absolute `https:` address of the published calendar
     */
    readonly calendarAddress: string;
    readonly className?: string;
};

/**
 * Hands the address of the published calendar over, for a calendar application which is subscribed to by hand
 *
 * Note: The `https:` address is offered rather than the `webcal:` one, because that is what the `subscribe from a web
 *       address` field of a calendar application is given, while `webcal:` is a protocol a click hands to the device.
 *
 * Note: The address itself is shown beside the button rather than hidden behind it, so that a browser which refuses
 *       the clipboard - an insecure origin, a denied permission - still leaves the member able to take it by hand.
 */
export function CopyCalendarAddress({ calendarAddress, className }: CopyCalendarAddressProps) {
    const { copyStatus, copyText } = useCopyTextToClipboard();
    const { label, icon: CopyStatusIcon, iconClassName } = COPY_CALENDAR_ADDRESS_STATES[copyStatus];

    return (
        <div className={classNames('flex flex-wrap items-center gap-2', className)}>
            <button
                type="button"
                onClick={() => void copyText(calendarAddress)}
                className={classNames(
                    SUBSCRIBE_TO_CALENDAR_CONTROL_CLASS_NAME,
                    SUBSCRIBE_TO_CALENDAR_SECONDARY_CONTROL_CLASS_NAME,
                )}
            >
                <CopyStatusIcon className={classNames('h-3.5 w-3.5', iconClassName)} aria-hidden="true" />
                <span aria-live="polite">{label}</span>
            </button>
            <code className="select-all break-all rounded-lg border border-room-border/10 bg-room-overlay/5 px-2 py-1 font-mono text-[11px] leading-5 text-room-muted">
                {calendarAddress}
            </code>
        </div>
    );
}
