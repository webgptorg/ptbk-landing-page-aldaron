'use client';

import { useFixedHorizontalTableScroll } from '@/hooks/useFixedHorizontalTableScroll';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import type { HTMLAttributes, UIEvent } from 'react';

type TableScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
    readonly horizontalScrollLabel?: string;
};

/**
 * Horizontal table viewport with a synchronized scrollbar that remains at the viewport bottom while the table is
 * visible. The native scrollbar remains available as a no-JavaScript fallback at the natural table bottom.
 */
export function TableScrollArea({
    children,
    className,
    horizontalScrollLabel = 'Scroll table horizontally',
    onScroll,
    ...props
}: TableScrollAreaProps) {
    const {
        tableScrollContainerRef,
        fixedScrollbarRef,
        fixedHorizontalScrollbarState,
        handleTableScroll,
        handleFixedScrollbarScroll,
    } = useFixedHorizontalTableScroll();

    const handleScroll = (scrollEvent: UIEvent<HTMLDivElement>) => {
        handleTableScroll(scrollEvent);
        onScroll?.(scrollEvent);
    };

    const isFixedScrollbarVisible = fixedHorizontalScrollbarState.isVisible;

    return (
        <>
            <div
                ref={tableScrollContainerRef}
                className={cn('table-scroll-area relative min-w-0 w-full overflow-x-auto', className)}
                onScroll={handleScroll}
                {...props}
            >
                {children}
            </div>

            {isFixedScrollbarVisible &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={fixedScrollbarRef}
                        className="admin-fixed-horizontal-scrollbar fixed bottom-0 z-40 h-5 overflow-x-scroll overflow-y-hidden border-t border-slate-300 bg-white/95 shadow-[0_-2px_8px_rgba(15,23,42,0.14)] backdrop-blur-sm"
                        style={{
                            left: `${fixedHorizontalScrollbarState.leftPixels}px`,
                            width: `${fixedHorizontalScrollbarState.widthPixels}px`,
                        }}
                        onScroll={handleFixedScrollbarScroll}
                        role="region"
                        aria-label={horizontalScrollLabel}
                        tabIndex={0}
                        data-admin-fixed-horizontal-scrollbar
                    >
                        <div
                            aria-hidden="true"
                            className="h-px"
                            style={{ width: `${fixedHorizontalScrollbarState.contentWidthPixels}px` }}
                        />
                    </div>,
                    document.body,
                )}
        </>
    );
}
