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
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import { ONLY_NECESSARY_COOKIES_ALLOWED, saveCookiePreferences } from '@/lib/legal/cookieConsentStorage';
import { useState, type ReactNode } from 'react';

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
        <div className="flex items-center justify-between">
            <label htmlFor={id}>
                <strong>{title}</strong>
                <p className="text-sm text-gray-500">{description}</p>
            </label>
            {children}
        </div>
    );
}

export function CookieSettingsModal({
    language,
    open,
    onOpenChange,
    onSave,
}: {
    language: SupportedHomepageLanguage;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{content.settingsTitle}</DialogTitle>
                    <DialogDescription>{content.settingsDescription}</DialogDescription>
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
                    <Button onClick={handleSave}>{content.saveButton}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
