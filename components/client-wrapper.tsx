'use client';

import { WorkshopRoomThemeProvider } from '@/components/workshops/WorkshopRoomThemeProvider';
import { PublicSiteNavigationProvider } from '@/components/public-site-navigation-provider';
import { isThirdPartyTrackingAllowed, removeSensitiveTrackingParameters } from '@/lib/tracking/trackingExclusions';
import LogRocket from 'logrocket';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let hasInitializedLogRocket = false;

export function ClientWrapper({ children, publicHostname }: { children: React.ReactNode; publicHostname: string }) {
    const pathname = usePathname();

    useEffect(() => {
        const scheme = window.matchMedia('(prefers-color-scheme: dark)');
        function updateTabIcon() {
            // Chromium caches a rasterized tab icon by URL across theme changes.
            const icon = document.head.querySelector<HTMLLinkElement>('link[rel~="icon"][href^="/favicon.svg"]');
            const href = `/favicon.svg?scheme=${scheme.matches ? 'dark' : 'light'}`;
            if (icon && icon.getAttribute('href') !== href) {
                icon.href = href;
            }
        }

        updateTabIcon();
        scheme.addEventListener('change', updateTabIcon);
        return () => scheme.removeEventListener('change', updateTabIcon);
    }, [pathname]);

    useEffect(() => {
        if (hasInitializedLogRocket || !isThirdPartyTrackingAllowed(pathname)) {
            return;
        }

        LogRocket.init('xuy44p/promptbook', {
            shouldSendData: () => isThirdPartyTrackingAllowed(window.location.pathname),
            browser: { urlSanitizer: removeSensitiveTrackingParameters },
            dom: { inputSanitizer: true },
            network: {
                requestSanitizer: (request) =>
                    isThirdPartyTrackingAllowed(window.location.pathname)
                        ? { ...request, url: removeSensitiveTrackingParameters(request.url) }
                        : null,
                responseSanitizer: (response) =>
                    isThirdPartyTrackingAllowed(window.location.pathname)
                        ? {
                              ...response,
                              url: response.url ? removeSensitiveTrackingParameters(response.url) : response.url,
                          }
                        : null,
            },
        });
        hasInitializedLogRocket = true;
    }, [pathname]);

    return (
        <PublicSiteNavigationProvider hostname={publicHostname}>
            <WorkshopRoomThemeProvider>{children}</WorkshopRoomThemeProvider>
        </PublicSiteNavigationProvider>
    );
}
