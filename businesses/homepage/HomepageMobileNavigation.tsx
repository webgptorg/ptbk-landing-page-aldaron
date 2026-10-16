'use client';

import { useRef, type ReactNode } from 'react';

export function HomepageMobileNavigation({
    label,
    children,
}: {
    readonly label: string;
    readonly children: ReactNode;
}) {
    const reference = useRef<HTMLDetailsElement>(null);
    return (
        <details
            ref={reference}
            className="ah-mobile-navigation"
            onClick={(event) => {
                if (event.target instanceof Element && event.target.closest('a'))
                    reference.current?.removeAttribute('open');
            }}
        >
            <summary aria-label={label}>
                <span />
                <span />
            </summary>
            {children}
        </details>
    );
}
