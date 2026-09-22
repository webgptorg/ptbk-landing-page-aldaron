'use client';

import { useFixedControlClearance } from '@/hooks/useFixedControlClearance';
import { getLanguageFromPathname } from '@/lib/language/pageLanguage';
import { getCookieConsentTheme, PODCAST_COOKIE_CONSENT_STYLE } from '@/lib/legal/cookieConsentAppearance';
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import { ALL_COOKIES_ALLOWED, isCookieChoiceMade, saveCookiePreferences } from '@/lib/legal/cookieConsentStorage';
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './cookie-consent.module.css';
import { CookieSettingsModal } from './cookie-settings-modal';
import { Button } from './ui/button';

export function CookiesBar() {
    const [isVisible, setIsVisible] = useState(false);

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

    if (!isVisible) {
        return null;
    }

    return <CookieConsentPanel onDismiss={() => setIsVisible(false)} />;
}

/** Mount the measurements with the visible panel, so a saved choice leaves no observers or reserved space. */
function CookieConsentPanel({ onDismiss }: { readonly onDismiss: () => void }) {
    const pathname = usePathname();
    const language = getLanguageFromPathname(pathname);
    const content = getCookieConsentContent(language);
    const theme = getCookieConsentTheme(pathname);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const panelReference = useRef<HTMLElement>(null);
    const { height, clearance } = useFixedControlClearance(panelReference, '[data-fixed-bottom-control]');
    const appearanceStyle = theme === 'podcast' ? PODCAST_COOKIE_CONSENT_STYLE : undefined;
    const layoutStyle = {
        ...appearanceStyle,
        '--cookie-panel-height': `${height}px`,
        '--cookie-clearance': `${clearance}px`,
    } as CSSProperties;

    const handleAcceptAll = () => {
        saveCookiePreferences(ALL_COOKIES_ALLOWED);
        onDismiss();
    };

    return (
        <div className={`${styles.appearance} ${styles.layout}`} data-theme={theme} style={layoutStyle}>
            <div className={styles.spacer} aria-hidden="true" />
            <section
                ref={panelReference}
                className={`cookie-consent__panel ${styles.panel}`}
                data-cookie-consent-panel
                aria-labelledby="cookie-consent-title"
                aria-describedby="cookie-consent-description"
            >
                <div>
                    <div className={styles.heading}>
                        <Cookie className={styles.icon} aria-hidden="true" />
                        <h2 id="cookie-consent-title" className={styles.title}>
                            {content.barTitle}
                        </h2>
                    </div>
                    <p id="cookie-consent-description" className={styles.description}>
                        {content.barDescription}
                    </p>
                    <p className={styles.privacy}>
                        {content.privacyNotePrefix}
                        <Link href={getLegalPagePath('privacyPolicy', language)}>{content.privacyPolicyLinkText}</Link>.
                    </p>
                </div>
                <div className={styles.actions}>
                    <Button type="button" className={styles.action} onClick={() => setIsModalOpen(true)}>
                        {content.customizeButton}
                    </Button>
                    <Button type="button" className={`${styles.action} ${styles.primary}`} onClick={handleAcceptAll}>
                        {content.acceptAllButton}
                    </Button>
                </div>
            </section>
            <CookieSettingsModal
                language={language}
                theme={theme}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={onDismiss}
            />
        </div>
    );
}
