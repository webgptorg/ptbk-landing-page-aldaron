'use client';

import { Input } from '@/components/ui/input';
import {
    joinDurationParts,
    MINUTES_PER_HOUR,
    SECONDS_PER_HOUR,
    SECONDS_PER_MINUTE,
    splitDurationIntoParts,
    type DurationParts,
} from '@/lib/durationParts';
import { cn } from '@/lib/utils';
import { Fragment } from 'react';

/**
 * What one part of the picker is called and how far it counts before the next part takes over
 *
 * Note: The hours are the only part with no part above them, so how far they count is decided by the longest duration
 *       the picker is allowed to write rather than by a clock.
 */
type DurationPickerPart = {
    readonly name: keyof DurationParts;
    readonly label: string;
    readonly maximalValue: number | null;
};

const DURATION_PICKER_PARTS: readonly DurationPickerPart[] = [
    { name: 'hours', label: 'Hodiny', maximalValue: null },
    { name: 'minutes', label: 'Minuty', maximalValue: MINUTES_PER_HOUR - 1 },
    { name: 'seconds', label: 'Sekundy', maximalValue: SECONDS_PER_MINUTE - 1 },
];

type DurationPickerProps = {
    /**
     * The length of time which is being written, in the seconds it is stored as
     */
    readonly durationInSeconds: number;

    /**
     * Says the whole length of time again, in seconds, whenever any of its parts changes
     */
    readonly onChange: (durationInSeconds: number) => void;

    /**
     * The longest length of time which may be written, in seconds
     */
    readonly maximalDurationInSeconds: number;

    /**
     * Identifies the parts of this picker, so that each of them can be labelled on its own
     */
    readonly id: string;

    /**
     * Identifies what the whole picker is called, which is written next to it by whoever asks for the length of time
     */
    readonly labelledById?: string;

    readonly className?: string;
};

/**
 * Reads what somebody typed into one part of the picker as a whole number that part can hold
 */
function readPartValue(writtenValue: string, maximalPartValue: number): number {
    const partValue = Number(writtenValue);

    if (!Number.isFinite(partValue)) {
        return 0;
    }

    return Math.min(maximalPartValue, Math.max(0, Math.trunc(partValue)));
}

/**
 * Writes a length of time as hours, minutes and seconds instead of as a number of seconds
 *
 * Note: Nothing but the picker changes — the length of time is given and said back in the very same seconds it is
 *       stored as, so no reader of that value has to know it was written on a clock.
 */
export function DurationPicker({
    durationInSeconds,
    onChange,
    maximalDurationInSeconds,
    id,
    labelledById,
    className,
}: DurationPickerProps) {
    const durationParts = splitDurationIntoParts(durationInSeconds);
    const maximalHours = Math.floor(maximalDurationInSeconds / SECONDS_PER_HOUR);

    const changePart = (part: DurationPickerPart, writtenValue: string) => {
        const partValue = readPartValue(writtenValue, part.maximalValue ?? maximalHours);

        onChange(Math.min(maximalDurationInSeconds, joinDurationParts({ ...durationParts, [part.name]: partValue })));
    };

    return (
        <div role="group" aria-labelledby={labelledById} className={cn('flex items-start gap-2', className)}>
            {DURATION_PICKER_PARTS.map((part, partIndex) => (
                <Fragment key={part.name}>
                    {partIndex > 0 && (
                        <span aria-hidden="true" className="pt-2 text-base text-slate-400">
                            :
                        </span>
                    )}
                    <div>
                        <Input
                            id={`${id}-${part.name}`}
                            type="number"
                            min={0}
                            max={part.maximalValue ?? maximalHours}
                            step={1}
                            value={durationParts[part.name]}
                            onChange={(changeEvent) => changePart(part, changeEvent.target.value)}
                            className="w-20 text-center font-mono"
                        />
                        <label
                            htmlFor={`${id}-${part.name}`}
                            className="mt-1 block text-center text-xs font-normal text-slate-400"
                        >
                            {part.label}
                        </label>
                    </div>
                </Fragment>
            ))}
        </div>
    );
}
