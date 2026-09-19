'use client';

import { WorkshopRoomThemeProvider } from '@/components/workshops/WorkshopRoomThemeProvider';
import { isThirdPartyTrackingAllowed, removeSensitiveTrackingParameters } from '@/lib/tracking/trackingExclusions';
import LogRocket from 'logrocket';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let hasInitializedLogRocket = false;

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

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

    return <WorkshopRoomThemeProvider>{children}</WorkshopRoomThemeProvider>;
}
