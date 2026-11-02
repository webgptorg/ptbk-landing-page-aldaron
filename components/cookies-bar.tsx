'use client';

import { getLanguageFromPathname } from '@/lib/language/pageLanguage';
import { getCookieConsentTheme, PODCAST_COOKIE_CONSENT_STYLE } from '@/lib/legal/cookieConsentAppearance';
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import { ALL_COOKIES_ALLOWED, ONLY_NECESSARY_COOKIES_ALLOWED, isCookieChoiceMade, saveCookiePreferences } from '@/lib/legal/cookieConsentStorage';
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { usePublicNavigationUrl } from '@/components/public-site-navigation-provider';
import { FloatingConversation } from '@/components/floating/FloatingConversation';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './cookie-consent.module.css';
import { CookieSettingsModal } from './cookie-settings-modal';

/** A quiet launcher first; only a still-unanswered choice opens one predefined message. */
export function CookiesBar({ brandedLanguage, isPodcastDomain = false }: {
    readonly brandedLanguage?: SupportedHomepageLanguage; readonly isPodcastDomain?: boolean;
} = {}) {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState(false);
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let cancelled = false;
        function requestSettings() {
            if (window.location.hash === COOKIE_SETTINGS_HASH) { setVisible(true); setOpen(true); }
        }
        function prompt() {
            if (cancelled || isCookieChoiceMade()) return;
            // Do not interrupt a conversation the visitor deliberately opened.
            if (document.querySelector('[data-floating-open]')) { timer = setTimeout(prompt, 3000); return; }
            setOpen(true);
        }
        if (!isCookieChoiceMade()) { setVisible(true); timer = setTimeout(prompt, 6000); }
        requestSettings();
        window.addEventListener('hashchange', requestSettings);
        return () => { cancelled = true; clearTimeout(timer); window.removeEventListener('hashchange', requestSettings); };
    }, []);
    const language = brandedLanguage ?? getLanguageFromPathname(pathname);
    const content = getCookieConsentContent(language);
    const privacyUrl = usePublicNavigationUrl(getLegalPagePath('privacyPolicy', language));
    const theme = isPodcastDomain ? 'podcast' : getCookieConsentTheme(pathname);
    function dismiss() { setVisible(false); setOpen(false); }
    function choose(all: boolean) {
        saveCookiePreferences(all ? ALL_COOKIES_ALLOWED : ONLY_NECESSARY_COOKIES_ALLOWED);
        dismiss();
    }
    if (!visible || /^(?:\/cs\/pavol)?\/messages(?:\/|$)/.test(pathname)) return null;
    return <div className={styles.appearance} data-theme={theme} style={theme === 'podcast' ? PODCAST_COOKIE_CONSENT_STYLE : undefined}>
        {!settings && <FloatingConversation id="cookie-choice" open={open} onOpenChange={setOpen} title={content.barTitle}
            side="left" compact icon={<Cookie size={25} strokeWidth={1.6} aria-hidden="true" />}
            launcherLabel={language === 'cs' ? 'Nastavení cookies' : 'Cookie preferences'} closeLabel={language === 'cs' ? 'Sbalit cookies' : 'Minimize cookies'}>
            <div className="cookie-conversation-body">
                <p className="cookie-conversation-message">{content.barDescription}</p>
                <div className="cookie-conversation-actions">
                    <button type="button" onClick={() => choose(false)}>{content.necessaryOnlyButton}</button>
                    <button type="button" onClick={() => choose(true)}>{content.acceptAllButton}</button>
                    <button type="button" className="cookie-conversation-settings" onClick={() => { setOpen(false); setSettings(true); }}>{content.customizeButton}</button>
                </div>
                <Link href={privacyUrl} className="cookie-conversation-privacy">{language === 'cs' ? 'Ochrana osobních údajů' : 'Privacy policy'}</Link>
            </div>
        </FloatingConversation>}
        <CookieSettingsModal language={language} theme={theme} isOpen={settings} onOpenChange={setSettings} onSave={dismiss} />
    </div>;
}
