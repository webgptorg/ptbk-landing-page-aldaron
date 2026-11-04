'use client';

import { AI_TA_KRAJTA_PATH } from '../config';
import { createContext, useContext, type ReactNode } from 'react';

export type PrototypeVariant = 'A' | 'B' | 'C';
export type PrototypePage = 'home' | 'episodes' | 'partners';

type PrototypeNavigation = {
    readonly variant: PrototypeVariant;
    readonly page: PrototypePage;
    readonly createHref: (href: string) => string | null;
};

const Context = createContext<PrototypeNavigation | null>(null);

/** Keep real podcast components on the isolated preview route without changing their production destinations. */
export function AiTaKrajtaPrototypeNavigationProvider({ variant, page, children }: {
    readonly variant: PrototypeVariant;
    readonly page: PrototypePage;
    readonly children: ReactNode;
}) {
    const createHref = (href: string): string | null => {
        if (!href.startsWith(AI_TA_KRAJTA_PATH)) return null;
        const destination = new URL(href, 'https://ai-ta-krajta.cz');
        const suffix = destination.pathname.slice(AI_TA_KRAJTA_PATH.length);
        const nextPage: PrototypePage = suffix.startsWith('/episodes') ? 'episodes'
            : suffix.startsWith('/media-kit') || suffix.startsWith('/branding') ? 'partners' : 'home';
        if (suffix && !['/episodes', '/media-kit', '/branding'].includes(suffix)) return null;
        destination.searchParams.set('variant', variant);
        destination.searchParams.set('prototypePage', nextPage);
        if (nextPage === 'partners' && !destination.searchParams.has('collaboration')) {
            destination.searchParams.set('collaboration', 'partnerstvi');
        }
        if (suffix === '/branding') destination.hash = 'podklady';
        return `${AI_TA_KRAJTA_PATH}?${destination.searchParams}${destination.hash}`;
    };
    return <Context.Provider value={{ variant, page, createHref }}>{children}</Context.Provider>;
}

export function useAiTaKrajtaPrototypeNavigation() {
    return useContext(Context);
}
