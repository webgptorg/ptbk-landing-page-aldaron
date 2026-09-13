'use client';

import { getLanguageFromPathname } from '@/lib/language/pageLanguage';
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import { ALL_COOKIES_ALLOWED, isCookieChoiceMade, saveCookiePreferences } from '@/lib/legal/cookieConsentStorage';
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CookieSettingsModal } from './cookie-settings-modal';
import { Button } from './ui/button';

export function CookiesBar() {
    const pathname = usePathname();
    const language = getLanguageFromPathname(pathname);
    const content = getCookieConsentContent(language);
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Note: A visitor who follows the cookie settings link gets the bar back, even though they answered it before -
        //       withdrawing a consent has to be as easy as giving it.
        const showBarWhenSettingsRequested = () => {
            if (window.location.hash === COOKIE_SETTINGS_HASH) {
                setIsVisible(true);
            }
        };

        if (!isCookieChoiceMade()) {
            setIsVisible(true);
        }

        showBarWhenSettingsRequested();

        window.addEventListener('hashchange', showBarWhenSettingsRequested);
        return () => window.removeEventListener('hashchange', showBarWhenSettingsRequested);
    }, []);

    const handleAcceptAll = () => {
        saveCookiePreferences(ALL_COOKIES_ALLOWED);
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md p-4 bg-promptbook-dark-gray text-white rounded-lg shadow-lg z-50">
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="font-bold text-lg">{content.barTitle}</h3>
                        <p className="text-sm text-gray-300">{content.barDescription}</p>
                        <p className="mt-2 text-sm text-gray-400">
                            {content.privacyNotePrefix}
                            <Link
                                href={getLegalPagePath('privacyPolicy', language)}
                                className="underline underline-offset-4 hover:text-white"
                            >
                                {content.privacyPolicyLinkText}
                            </Link>
                            .
                        </p>
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button onClick={() => setIsModalOpen(true)}>{content.customizeButton}</Button>
                        <Button onClick={handleAcceptAll}>{content.acceptAllButton}</Button>
                    </div>
                </div>
            </div>
            <CookieSettingsModal
                language={language}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={() => setIsVisible(false)}
            />
        </>
    );
}
