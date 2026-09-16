'use client';

import { useCookieConsentInset } from '@/hooks/useCookieConsentInset';
import { getLanguageFromPathname } from '@/lib/language/pageLanguage';
import { getCookieConsentAppearance } from '@/lib/legal/cookieConsentAppearance';
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import {
    ALL_COOKIES_ALLOWED,
    ONLY_NECESSARY_COOKIES_ALLOWED,
    isCookieChoiceMade,
    saveCookiePreferences,
    type CookiePreferences,
} from '@/lib/legal/cookieConsentStorage';
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { CookieSettingsModal } from './cookie-settings-modal';
import styles from './cookie-consent.module.css';

export function CookiesBar() {
    const pathname = usePathname();
    const language = getLanguageFromPathname(pathname);
    const content = getCookieConsentContent(language);
    const appearance = getCookieConsentAppearance(pathname);
    const titleId = useId();
    const panelReference = useRef<HTMLElement>(null);
    const customizeButtonReference = useRef<HTMLButtonElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useCookieConsentInset(panelReference, isVisible);

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
    }, [pathname]);

    const dismissBar = () => {
        setIsVisible(false);
        if (window.location.hash === COOKIE_SETTINGS_HASH) {
            window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
        }
    };

    const handleSavePreferences = (preferences: CookiePreferences) => {
        saveCookiePreferences(preferences);
        dismissBar();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <>
            <section
                ref={panelReference}
                aria-labelledby={titleId}
                lang={language}
                className={`${styles.surface} ${styles.panel}`}
                data-cookie-consent-panel
                data-theme={appearance.theme}
                style={appearance.style}
            >
                <div className={styles.layout}>
                    <div className={styles.copy}>
                        <h2 id={titleId} className={styles.title}>
                            <Cookie className={styles.icon} aria-hidden="true" />
                            {content.barTitle}
                        </h2>
                        <p className={styles.description}>{content.barDescription}</p>
                        <p className={styles.privacy}>
                            {content.privacyNotePrefix}
                            <Link href={getLegalPagePath('privacyPolicy', language)}>
                                {content.privacyPolicyLinkText}
                            </Link>
                            .
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <button
                            ref={customizeButtonReference}
                            type="button"
                            className={`${styles.button} ${styles.customizeButton}`}
                            aria-haspopup="dialog"
                            onClick={() => setIsModalOpen(true)}
                        >
                            {content.customizeButton}
                        </button>
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => handleSavePreferences(ONLY_NECESSARY_COOKIES_ALLOWED)}
                        >
                            {content.necessaryOnlyButton}
                        </button>
                        <button
                            type="button"
                            className={`${styles.button} ${styles.acceptButton}`}
                            onClick={() => handleSavePreferences(ALL_COOKIES_ALLOWED)}
                        >
                            {content.acceptAllButton}
                        </button>
                    </div>
                </div>
            </section>
            <CookieSettingsModal
                language={language}
                appearance={appearance}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={dismissBar}
                onCloseAutoFocus={() => customizeButtonReference.current?.focus()}
            />
        </>
    );
}
