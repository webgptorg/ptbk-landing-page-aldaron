'use client';

import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** A real contact anchor before hydration, the same persistent enquiry everywhere after it. */
export function HomepageEnquiryLink({
    children,
    id,
    className = 'ah-button',
}: {
    readonly children: ReactNode;
    readonly id?: string;
    readonly className?: string;
}) {
    return (
        <a
            id={id}
            className={className}
            href="#contact"
            onClick={(event) => {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                // Keep the contact anchor working if the dialog has not hydrated or its client chunk failed.
                const isHandled = !window.dispatchEvent(
                    new CustomEvent('open-qualification-popup', { cancelable: true }),
                );
                if (isHandled) event.preventDefault();
            }}
        >
            {children}
            <ArrowUpRight size={17} aria-hidden="true" />
        </a>
    );
}
