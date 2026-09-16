'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { CookieConsentAppearance } from '@/lib/legal/cookieConsentAppearance';
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import {
    ONLY_NECESSARY_COOKIES_ALLOWED,
    readCookiePreferences,
    saveCookiePreferences,
} from '@/lib/legal/cookieConsentStorage';
import { useEffect, useState, type ReactNode } from 'react';
import styles from './cookie-consent.module.css';

/**
 * One switchable kind of cookies, with the switch on its right
 */
function CookieCategoryRow({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <div className={styles.category}>
            <label htmlFor={id}>
                <strong>{title}</strong>
                <p className={styles.description}>{description}</p>
            </label>
            {children}
        </div>
    );
}

export function CookieSettingsModal({
    language,
    appearance,
    isOpen,
    onOpenChange,
    onSave,
    onCloseAutoFocus,
}: {
    language: SupportedHomepageLanguage;
    appearance: CookieConsentAppearance;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave?: () => void;
    onCloseAutoFocus: () => void;
}) {
    const content = getCookieConsentContent(language);
    const [preferences, setPreferences] = useState(ONLY_NECESSARY_COOKIES_ALLOWED);

    useEffect(() => {
        if (isOpen) setPreferences(readCookiePreferences());
    }, [isOpen]);

    const handleSave = () => {
        saveCookiePreferences(preferences);
        onOpenChange(false);
        onSave?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className={`${styles.surface} ${styles.settings}`}
                data-theme={appearance.theme}
                style={appearance.style}
                lang={language}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    onCloseAutoFocus();
                }}
            >
                <DialogHeader>
                    <DialogTitle className={styles.settingsTitle}>{content.settingsTitle}</DialogTitle>
                    <DialogDescription className={styles.description}>{content.settingsDescription}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <CookieCategoryRow
                        id="necessary-cookies"
                        title={content.necessaryCategory.title}
                        description={content.necessaryCategory.description}
                    >
                        <Switch id="necessary-cookies" checked disabled />
                    </CookieCategoryRow>

                    <CookieCategoryRow
                        id="analytics-cookies"
                        title={content.analyticsCategory.title}
                        description={content.analyticsCategory.description}
                    >
                        <Switch
                            id="analytics-cookies"
                            checked={preferences.isAnalyticsAllowed}
                            onCheckedChange={(isAllowed) =>
                                setPreferences((previous) => ({ ...previous, isAnalyticsAllowed: isAllowed }))
                            }
                        />
                    </CookieCategoryRow>

                    <CookieCategoryRow
                        id="marketing-cookies"
                        title={content.marketingCategory.title}
                        description={content.marketingCategory.description}
                    >
                        <Switch
                            id="marketing-cookies"
                            checked={preferences.isMarketingAllowed}
                            onCheckedChange={(isAllowed) =>
                                setPreferences((previous) => ({ ...previous, isMarketingAllowed: isAllowed }))
                            }
                        />
                    </CookieCategoryRow>
                </div>
                <DialogFooter>
                    <button type="button" className={`${styles.button} ${styles.acceptButton}`} onClick={handleSave}>
                        {content.saveButton}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
