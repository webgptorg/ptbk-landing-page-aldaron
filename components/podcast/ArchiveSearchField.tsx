'use client';

import { Search } from 'lucide-react';

/** The same search control serves both podcast archives; each publication supplies its visual tokens. */
export function ArchiveSearchField({ value, onChange, label, placeholder, className, maxLength = 200, wrapperClassName = 'w-full md:max-w-sm', iconClassName = 'opacity-50' }: {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly label: string;
    readonly placeholder: string;
    readonly className: string;
    readonly maxLength?: number;
    readonly wrapperClassName?: string;
    readonly iconClassName?: string;
}) {
    return <label className={`relative block ${wrapperClassName}`}>
        <span className="sr-only">{label}</span>
        <Search aria-hidden="true" className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${iconClassName}`} />
        <input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder}
            maxLength={maxLength} className={`h-11 w-full rounded-full border bg-transparent pl-11 pr-4 text-sm ${className}`} />
    </label>;
}
