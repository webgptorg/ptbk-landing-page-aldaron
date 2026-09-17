'use client';

import { Button } from '@/components/ui/button';
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
import { PODCAST_COOKIE_CONSENT_STYLE, type CookieConsentTheme } from '@/lib/legal/cookieConsentAppearance';
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import { ONLY_NECESSARY_COOKIES_ALLOWED, saveCookiePreferences } from '@/lib/legal/cookieConsentStorage';
import { useState, type ReactNode } from 'react';
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
    theme,
    isOpen,
    onOpenChange,
    onSave,
}: {
    language: SupportedHomepageLanguage;
    theme: CookieConsentTheme;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave?: () => void;
}) {
    const content = getCookieConsentContent(language);
    const [preferences, setPreferences] = useState(ONLY_NECESSARY_COOKIES_ALLOWED);

    const handleSave = () => {
        saveCookiePreferences(preferences);
        onOpenChange(false);
        onSave?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className={`${styles.appearance} ${styles.dialog}`}
                data-theme={theme}
                style={theme === 'podcast' ? PODCAST_COOKIE_CONSENT_STYLE : undefined}
            >
                <DialogHeader className={styles.dialogHeader}>
                    <DialogTitle>{content.settingsTitle}</DialogTitle>
                    <DialogDescription className={styles.description}>{content.settingsDescription}</DialogDescription>
                </DialogHeader>
                <div className={styles.categories}>
                    <CookieCategoryRow
                        id="necessary-cookies"
                        title={content.necessaryCategory.title}
                        description={content.necessaryCategory.description}
                    >
                        <Switch id="necessary-cookies" className={styles.switch} checked disabled />
                    </CookieCategoryRow>

                    <CookieCategoryRow
                        id="analytics-cookies"
                        title={content.analyticsCategory.title}
                        description={content.analyticsCategory.description}
                    >
                        <Switch
                            id="analytics-cookies"
                            className={styles.switch}
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
                            className={styles.switch}
                            checked={preferences.isMarketingAllowed}
                            onCheckedChange={(isAllowed) =>
                                setPreferences((previous) => ({ ...previous, isMarketingAllowed: isAllowed }))
                            }
                        />
                    </CookieCategoryRow>
                </div>
                <DialogFooter>
                    <Button type="button" className={`${styles.action} ${styles.primary}`} onClick={handleSave}>
                        {content.saveButton}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
