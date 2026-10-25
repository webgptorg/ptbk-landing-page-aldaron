'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { getPersonalDataConsentNote } from '@/lib/legal/personalDataConsentNotes';
import { useSiteLocale } from './LocaleProvider';
import s from './inline-contact.module.css';

/** A permanent contact form using the same contact collection as the existing modal. */
export function InlineContactForm({ partnership = false }: { partnership?: boolean }) {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    const id = useId();
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const submitting = useRef(false);
    const consent = getPersonalDataConsentNote(locale, 'formal');

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current || done) return;
        if (!isEmailAddressValid(email.trim())) {
            setError(en ? 'Enter a valid email address.' : 'Zadejte platný e-mail.');
            return;
        }
        submitting.current = true;
        setBusy(true);
        setError('');
        try {
            await subscribeToWaitlist({
                email: email.trim(),
                fullname: fullname.trim(),
                placeName: 'new-website-contact',
                note: [
                    partnership ? 'Partnerství — kontaktní formulář' : 'Promptbook — kontaktní formulář',
                    message.trim(),
                    'Zájemce požádal o kontakt k tomuto tématu. Nejde o přihlášení k newsletteru.',
                ].filter(Boolean).join('\n'),
            });
            setDone(true);
        } catch {
            setError(en
                ? 'Your message could not be saved. Please try again; your details are still here.'
                : 'Zprávu se nepodařilo uložit. Zkuste to znovu; zadané údaje zůstaly zachované.');
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    return <section className={s.section} aria-labelledby={`${id}-title`}>
        <div className={s.intro}>
            <h2 id={`${id}-title`}>{en ? 'Write to us' : 'Napište nám'}</h2>
            <p>{en ? 'Tell us what you need help with.' : 'S čím Vám můžeme pomoci?'}</p>
        </div>
        <form className={s.form} onSubmit={submit} aria-labelledby={`${id}-title`} aria-busy={busy} data-testid="inline-contact-form">
            {done ? <div className={s.success} role="status">
                <Check size={26} aria-hidden="true"/>
                <h3>{en ? 'Thank you. We’ll be in touch.' : 'Děkujeme. Ozveme se Vám.'}</h3>
                <p>{en ? 'Your message is saved in our contact system.' : 'Vaše zpráva je v našem kontaktním systému.'}</p>
            </div> : <>
                <div className={s.fields}>
                    <label htmlFor={`${id}-name`}>{en ? 'Name (optional)' : 'Jméno (nepovinné)'}
                        <input id={`${id}-name`} name="fullname" autoComplete="name" maxLength={150} value={fullname} disabled={busy} onChange={event => setFullname(event.target.value)}/>
                    </label>
                    <label htmlFor={`${id}-email`}>{en ? 'Your email' : 'Váš e-mail'}
                        <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy} onChange={event => setEmail(event.target.value)}/>
                    </label>
                </div>
                <label htmlFor={`${id}-message`}>{en ? 'Message (optional)' : 'Zpráva (nepovinné)'}
                    <textarea id={`${id}-message`} name="message" rows={4} maxLength={2000} value={message} disabled={busy} onChange={event => setMessage(event.target.value)}/>
                </label>
                <p className={s.consent}>{consent.prefix}<Link href={path('soukromi')}>{consent.privacyPolicyLinkText}</Link>{en ? '. We use your details to respond to this request.' : '. Údaje použijeme k vyřízení této žádosti.'}</p>
                {error && <p className={s.error} role="alert">{error}</p>}
                <button type="submit" disabled={busy}>
                    {busy && <Loader2 size={18} className={s.spinner} aria-hidden="true"/>}
                    {busy ? (en ? 'Sending…' : 'Odesílám…') : (en ? 'Send message' : 'Odeslat zprávu')}
                    <ArrowUpRight size={18} aria-hidden="true"/>
                </button>
            </>}
        </form>
    </section>;
}
