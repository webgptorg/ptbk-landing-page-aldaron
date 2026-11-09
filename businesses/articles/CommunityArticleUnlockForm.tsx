'use client';

import { connectToWorkshop } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import type { ArticleLanguage } from '@/lib/articles/types';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { isWorkshopParticipantFullnameValid } from '@/lib/workshops/workshopParticipantFullname';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition, type FormEvent } from 'react';

export function CommunityArticleUnlockForm({ language, roomSlug }: {
    readonly language: ArticleLanguage;
    readonly roomSlug: string;
}) {
    const router = useRouter();
    const requestInProgress = useRef(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [isRefreshing, startRefresh] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const cs = language === 'cs';
    const busy = isSubmitting || isRefreshing;

    async function unlock(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (requestInProgress.current || isRefreshing) return;
        const values = new FormData(event.currentTarget);
        const fullname = String(values.get('fullname') ?? '').trim();
        const email = String(values.get('email') ?? '').trim();
        if (!isWorkshopParticipantFullnameValid(fullname)) {
            setError(cs ? 'Vyplňte prosím své jméno.' : 'Enter your name.');
            return;
        }

        requestInProgress.current = true;
        setSubmitting(true);
        setError(null);
        try {
            await connectToWorkshop(roomSlug, { fullname, email });
            startRefresh(() => router.refresh());
        } catch {
            setError(cs ? 'Článek se nepodařilo odemknout. Zkuste to znovu.' : 'Could not unlock the article. Please try again.');
        } finally {
            requestInProgress.current = false;
            setSubmitting(false);
        }
    }

    return (
        <form className="article-unlock-form" onSubmit={unlock} aria-labelledby="article-unlock-title" aria-busy={busy}>
            <h2 id="article-unlock-title">{cs ? 'Dočtěte článek zdarma' : 'Read the rest for free'}</h2>
            <p>{cs ? 'Zadejte jméno a e-mail a připojíte se ke komunitě Promptbook.' : 'Enter your name and email to join the Promptbook community.'}</p>
            <div className="article-unlock-fields">
                <label>
                    {cs ? 'Jméno a příjmení' : 'Full name'}
                    <input name="fullname" autoComplete="name" maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH} required />
                </label>
                <label>
                    {cs ? 'E-mail' : 'Email'}
                    <input name="email" type="email" autoComplete="email" maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH} required />
                </label>
            </div>
            {error && <p role="alert">{error}</p>}
            <button type="submit" className="article-button article-button-primary" disabled={busy}>
                {busy ? (cs ? 'Odemykám…' : 'Unlocking…') : (cs ? 'Odemknout článek' : 'Unlock article')}
            </button>
            <PersonalDataConsentNote language={language} className="article-unlock-privacy" />
        </form>
    );
}
