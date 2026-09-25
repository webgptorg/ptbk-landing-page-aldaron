'use client';

import { usePublicNavigationUrl } from '@/components/public-site-navigation-provider';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { getPersonalDataConsentNote, type AddressForm } from '@/lib/legal/personalDataConsentNotes';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Tells the visitor what happens with the data they are about to send, and links the policy which says it in full
 *
 * Note: Every form of the site which collects a contact shows this one note, so the promise given to the visitor is
 *       worded the same everywhere.
 *
 * @param language language the visitor is reading
 * @param addressForm tone the surrounding page talks to the visitor in
 * @param children sentence appended after the note, such as what the visitor receives next
 */
export function PersonalDataConsentNote({
    language,
    addressForm = 'formal',
    className,
    linkClassName,
    children,
}: {
    language: SupportedHomepageLanguage;
    addressForm?: AddressForm;
    className?: string;
    linkClassName?: string;
    children?: ReactNode;
}) {
    const { prefix, privacyPolicyLinkText } = getPersonalDataConsentNote(language, addressForm);
    const privacyPolicyUrl = usePublicNavigationUrl(getLegalPagePath('privacyPolicy', language));

    return (
        <p className={cn('text-xs leading-relaxed text-slate-400', className)}>
            {prefix}
            <Link
                href={privacyPolicyUrl}
                className={cn('underline underline-offset-4 hover:no-underline', linkClassName ?? 'text-cyan-700')}
            >
                {privacyPolicyLinkText}
            </Link>
            .{children ? <> {children}</> : null}
        </p>
    );
}
