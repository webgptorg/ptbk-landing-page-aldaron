'use client';

import { useEffect, type RefObject } from 'react';

const COOKIE_CONSENT_INSET_PROPERTY = '--cookie-consent-height';

/** Reserve the bar's actual height for page content and fixed controls, including wrapping and browser zoom. */
export function useCookieConsentInset(panelReference: RefObject<HTMLElement | null>, isVisible: boolean): void {
    useEffect(() => {
        const panel = panelReference.current;
        if (!isVisible || panel === null) return;

        const rootStyle = document.documentElement.style;
        const measurePanel = () => {
            rootStyle.setProperty(COOKIE_CONSENT_INSET_PROPERTY, `${Math.ceil(panel.getBoundingClientRect().height)}px`);
        };
        const resizeObserver = new ResizeObserver(measurePanel);

        measurePanel();
        resizeObserver.observe(panel);

        return () => {
            resizeObserver.disconnect();
            rootStyle.removeProperty(COOKIE_CONSENT_INSET_PROPERTY);
        };
    }, [isVisible, panelReference]);
}
