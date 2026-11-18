'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

type ChromeSlot = 'headerActions' | 'menu' | 'chatTools';
export type PavolFooterLink = { readonly label: string; readonly href?: string };
type ChromeContext = {
    readonly title: string;
    readonly footerLinks: readonly PavolFooterLink[];
    readonly targets: Partial<Record<ChromeSlot, HTMLElement | null>>;
    readonly outlets: Record<ChromeSlot, (element: HTMLDivElement | null) => void>;
    readonly menuRef: RefObject<HTMLDetailsElement | null>;
    readonly closeMenu: () => void;
};
const Context = createContext<ChromeContext | null>(null);

/** An application supplies its own chrome without changing ordinary personal-site pages. */
export function PavolPageChromeProvider({ title, footerLinks, children }: {
    readonly title: string; readonly footerLinks: readonly PavolFooterLink[]; readonly children: ReactNode;
}) {
    const [targets, setTargets] = useState<ChromeContext['targets']>({});
    const menuRef = useRef<HTMLDetailsElement>(null);
    const closeMenu = useCallback(() => { if (menuRef.current) menuRef.current.open = false; }, []);
    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const menu = menuRef.current;
            if (menu?.open && event.target instanceof Element && !menu.contains(event.target) && !event.target.closest('[role="menu"]')) closeMenu();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !event.defaultPrevented && menuRef.current?.open) {
                closeMenu();
                menuRef.current?.querySelector('summary')?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
    }, [closeMenu]);
    const outlets = useMemo(() => {
        const register = (slot: ChromeSlot) => (element: HTMLDivElement | null) => {
            setTargets(current => current[slot] === element ? current : { ...current, [slot]: element });
        };
        return { headerActions: register('headerActions'), menu: register('menu'), chatTools: register('chatTools') };
    }, []);
    const value = useMemo(() => ({ title, footerLinks, targets, outlets, menuRef, closeMenu }), [title, footerLinks, targets, outlets, closeMenu]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePavolPageChrome() { return useContext(Context); }

/** Portals retain the application's state, handlers and cleanup in their original owner. */
export function PavolChromeSlot({ slot, children }: { readonly slot: ChromeSlot; readonly children: ReactNode }) {
    const chrome = usePavolPageChrome();
    if (!chrome) return <>{children}</>;
    const target = chrome.targets[slot];
    return target ? createPortal(<div onClick={event => {
        const action = (event.target as Element).closest('button, a[href], [role="menuitem"]');
        if (action && !action.hasAttribute('aria-haspopup')) chrome.closeMenu();
    }}>{children}</div>, target) : null;
}
