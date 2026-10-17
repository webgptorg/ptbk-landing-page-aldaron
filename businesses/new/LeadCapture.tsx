'use client';

import { useSiteLocale } from './LocaleProvider';
import { createContext, useContext, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { getPersonalDataConsentNote } from '@/lib/legal/personalDataConsentNotes';
import Link from 'next/link';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { sitePath } from './siteConfig';
import s from './site.module.css';

type LeadRequest = { topic: string; kind?: 'contact' | 'pdf'; note?: string; afterSave?: () => Promise<void> };
const LeadContext = createContext<((request: LeadRequest) => void) | null>(null);
export function useLeadCapture() {
    const open = useContext(LeadContext);
    if (!open) throw new Error('LeadCaptureProvider is required.');
    return open;
}

/** Uses the site's existing server-side Contact collection, not a parallel lead store. */
export function LeadCaptureProvider({ children }: { children: ReactNode }) {
    const { t, locale, path } = useSiteLocale();

    const [request, setRequest] = useState<LeadRequest | null>(null);
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const submitting = useRef(false);
    const trigger = useRef<HTMLElement | null>(null);
    const id = useId();
    const consent = getPersonalDataConsentNote(locale, 'formal');
    function open(next: LeadRequest) {
        trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setRequest(next); setEmail(''); setFullname(''); setNote(''); setSaved(false); setDone(false); setError('');
    }
    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!request || submitting.current) return;
        if (!isEmailAddressValid(email.trim())) { setError('Zadejte platný e-mail.'); return; }
        submitting.current = true; setBusy(true); setError('');
        try {
            if (!saved) {
                await subscribeToWaitlist({ email: email.trim(), fullname: fullname.trim(),
                    placeName: request.kind === 'pdf' ? 'new-calculator-pdf' : 'new-website-contact',
                    note: [request.topic, request.note || '', note.trim(), request.kind === 'pdf'
                        ? 'Zájemce požádal o PDF kalkulaci. Nejde o přihlášení k newsletteru.'
                        : 'Zájemce požádal o kontakt k tomuto tématu.'].filter(Boolean).join('\n'),
                });
                setSaved(true);
            }
            // Keep the captured request (including its calculation snapshot) unchanged across retries.
            if (request.afterSave) await request.afterSave();
            setDone(true);
        } catch { setError('Akci se nepodařilo dokončit. Zkuste to znovu; zadané údaje zůstaly zachované.'); }
        finally { submitting.current = false; setBusy(false); }
    }
    return <LeadContext.Provider value={open}>{t(children)}
        <Dialog open={request !== null} onOpenChange={(value) => { if (!value && !submitting.current) setRequest(null); }}>
            <DialogContent className={s.leadDialog} closeLabel={t("Zavřít")} onCloseAutoFocus={(event) => { event.preventDefault(); trigger.current?.focus(); }}>
                <DialogHeader><DialogTitle>{t(done ? (request?.kind === 'pdf' ? 'Výpočet je připravený.' : 'Děkujeme. Ozveme se vám.') : request?.kind === 'pdf' ? 'Kam se vám můžeme ozvat?' : 'Pojďme to probrat.')}</DialogTitle>
                    <DialogDescription>{t(request?.kind === 'pdf' ? 'Zadejte e-mail a stáhněte PDF. K žádosti uložíme váš kontakt a odkaz s parametry této kalkulace. Nepřihlašujeme vás k newsletteru.' : request?.topic)}</DialogDescription></DialogHeader>
                {done ? <div className={s.formSuccess}><Check size={28} /><p>{t(request?.kind === 'pdf' ? 'PDF se stahuje do vašeho zařízení. E-mail jsme uložili k vaší žádosti, samotné PDF neposíláme e-mailem.' : 'Vaše zpráva je v našem kontaktním systému. Obrátí se na vás příslušný člen týmu.')}</p><button className={s.button} onClick={() => setRequest(null)}>{t("Hotovo")}</button></div> :
                    <form onSubmit={submit} className={s.leadForm} aria-busy={busy}>
                        <label htmlFor={`${id}-email`}>{t("Váš e-mail")}<input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy || saved} onChange={(event) => setEmail(event.target.value)} /></label>
                        {request?.kind !== 'pdf' && <><label htmlFor={`${id}-name`}>{t("Jméno ")}<span>{t("(nepovinné)")}</span><input id={`${id}-name`} autoComplete="name" maxLength={150} value={fullname} disabled={busy || saved} onChange={(event) => setFullname(event.target.value)} /></label><label htmlFor={`${id}-note`}>{t("S čím chcete pomoci? ")}<span>{t("(nepovinné)")}</span><textarea id={`${id}-note`} rows={3} maxLength={2000} value={note} disabled={busy || saved} onChange={(event) => setNote(event.target.value)} /></label></>}
                        <p className={s.small}>{t(consent.prefix)}<Link href={path('soukromi')}>{t(consent.privacyPolicyLinkText)}</Link>{t(". Údaje použijeme k vyřízení této žádosti.")}</p>
                        {error && <p role="alert" className={s.error}>{t(saved ? 'Kontakt je uložený, ale PDF se nepodařilo vytvořit. Zkuste přípravu znovu, kontakt znovu neodešleme.' : error)}</p>}
                        <button type="submit" className={s.button} disabled={busy}>{busy && <Loader2 className={s.spin} size={18} />}{t(busy ? 'Zpracovávám…' : request?.kind === 'pdf' ? (saved ? 'Znovu připravit PDF' : 'Uložit e-mail a stáhnout PDF') : 'Odeslat zprávu')}<ArrowUpRight size={18} /></button>
                    </form>}
            </DialogContent>
        </Dialog>
    </LeadContext.Provider>;
}

export function LeadButton({ children, topic = 'Zájem o nasazení Promptbooku', secondary = false, className = '' }: { children: ReactNode; topic?: string; secondary?: boolean; className?: string }) {
    const { t, locale, path } = useSiteLocale();

    const open = useLeadCapture();
    return <button type="button" className={`${secondary ? s.secondaryButton : s.button} ${className}`} onClick={() => open({ topic })}>{t(children)}<ArrowUpRight size={17} aria-hidden="true" /></button>;
}
