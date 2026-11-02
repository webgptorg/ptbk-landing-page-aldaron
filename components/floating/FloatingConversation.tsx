'use client';

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useFixedControlClearance } from '@/hooks/useFixedControlClearance';
import './floatingConversation.css';

/** Shared visual shell. Conversation, consent and persistence remain the caller's responsibility. */
export function FloatingConversation({ id, open, onOpenChange, title, icon, launcherLabel, closeLabel, compact = false,
    side = 'right', children, panelClassName = '' }: {
    readonly id: string; readonly open: boolean; readonly onOpenChange: (open: boolean) => void;
    readonly title: string; readonly icon: ReactNode; readonly launcherLabel: string; readonly closeLabel: string;
    readonly compact?: boolean; readonly side?: 'left' | 'right'; readonly children: ReactNode; readonly panelClassName?: string;
}) {
    const root = useRef<HTMLDivElement>(null);
    const launcher = useRef<HTMLButtonElement>(null);
    const panelId = useId();
    const { clearance } = useFixedControlClearance(root, '[data-article-player], [data-fixed-bottom-control]');
    useEffect(() => {
        const closeOther = (event: Event) => {
            if ((event as CustomEvent<string>).detail !== id) onOpenChange(false);
        };
        window.addEventListener('floating-conversation-open', closeOther);
        return () => window.removeEventListener('floating-conversation-open', closeOther);
    }, [id, onOpenChange]);
    function change(next: boolean) {
        if (next) window.dispatchEvent(new CustomEvent('floating-conversation-open', { detail: id }));
        onOpenChange(next);
        if (!next) launcher.current?.focus();
    }
    return <div ref={root} className={`floating-conversation floating-conversation-${side}`}
        style={{ '--floating-clearance': `${clearance}px` } as CSSProperties}>
        {open && <section id={panelId} role="dialog" aria-label={title} data-floating-open={id}
            className={`floating-conversation-panel ${panelClassName}`} onKeyDown={event => {
                if (event.key === 'Escape') { event.stopPropagation(); change(false); }
            }}>
            <header className="floating-conversation-header"><span className="floating-conversation-avatar">{icon}</span><h2>{title}</h2>
                <button type="button" onClick={() => change(false)} aria-label={closeLabel}><X size={19} aria-hidden="true" /></button>
            </header>
            {children}
        </section>}
        <button ref={launcher} type="button" className={`floating-conversation-launcher ${compact ? 'floating-conversation-compact' : ''}`}
            aria-label={open ? closeLabel : launcherLabel} title={launcherLabel} aria-expanded={open} aria-controls={open ? panelId : undefined}
            onClick={() => change(!open)}>
            <span className="floating-conversation-avatar">{icon}</span>
            {!compact && <span>{title}</span>}
            {!compact && open && <X size={17} aria-hidden="true" />}
        </button>
    </div>;
}
