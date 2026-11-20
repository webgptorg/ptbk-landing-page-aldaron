'use client';

import { useRef, useState, type CSSProperties, type FormEvent, type ReactNode, type RefObject } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import styles from './emailSignInDialog.module.css';

type EmailSignInDialogProps = {
    language: 'cs' | 'en';
    title: string;
    description: string;
    onSend: (email: string) => Promise<unknown>;
    onVerify: (email: string, code: string) => Promise<{ isVerified: boolean }>;
    onVerified: () => void | Promise<void>;
    onDismiss: () => void;
    returnFocus: RefObject<HTMLElement | null>;
    style?: CSSProperties;
    footer?: ReactNode;
};

/** Both sites offer a link and a numeric code. Each caller owns its session and return destination. */
export function EmailSignInDialog({ language, title, description, onSend, onVerify, onVerified, onDismiss, returnFocus, style, footer }: EmailSignInDialogProps) {
    const cs = language === 'cs';
    const [email, setEmail] = useState('');
    const [awaitingCode, setAwaitingCode] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const emailField = useRef<HTMLInputElement>(null);
    const failedMessage = cs ? 'Přihlášení se nepodařilo. Zkus to znovu.' : 'Sign-in failed. Please try again.';

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        const code = new FormData(event.currentTarget).get('code');
        setError('');
        setBusy(true);
        try {
            if (awaitingCode) {
                const result = await onVerify(email.trim(), String(code).trim());
                if (!result.isVerified) throw new Error(failedMessage);
                await onVerified();
            } else {
                await onSend(email.trim());
                setAwaitingCode(true);
            }
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : failedMessage);
        } finally {
            setBusy(false);
        }
    }

    return <Dialog open onOpenChange={open => { if (!open && !(busy && awaitingCode)) onDismiss(); }}>
        <DialogContent className={styles.dialog} style={style} lang={language} closeLabel={cs ? 'Zavřít' : 'Close'}
            onOpenAutoFocus={event => { event.preventDefault(); emailField.current?.focus(); }}
            onCloseAutoFocus={event => {
                event.preventDefault();
                const trigger = returnFocus.current;
                if (trigger?.isConnected && !trigger.matches(':disabled')) trigger.focus();
                else document.querySelector<HTMLElement>('main[tabindex="-1"]')?.focus({ preventScroll: true });
            }}>
            <DialogTitle className={styles.title}>{title}</DialogTitle>
            <DialogDescription className={styles.description}>{description}</DialogDescription>
            <form onSubmit={submit} className={styles.form} aria-busy={busy}>
                <label>{cs ? 'E-mail' : 'Email'}
                    <input ref={emailField} name="email" type="email" autoComplete="email" maxLength={254} required
                        value={email} disabled={busy || awaitingCode} onChange={event => setEmail(event.target.value)} />
                </label>
                {awaitingCode && <>
                    <p role="status">{cs ? 'Otevři odkaz v e-mailu, nebo sem zadej přihlašovací kód.' : 'Open the link in your email, or enter the sign-in code here.'}</p>
                    <label>{cs ? 'Kód z e-mailu' : 'Email code'}
                        <input name="code" autoFocus autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,10}" minLength={6} maxLength={10} required disabled={busy} />
                    </label>
                </>}
                {error && <p role="alert" className={styles.error}>{error}</p>}
                <button className={styles.submit} type="submit" disabled={busy}>
                    {busy ? (cs ? 'Chvilku…' : 'Please wait…') : awaitingCode ? (cs ? 'Ověřit kód' : 'Verify code') : (cs ? 'Poslat přihlašovací odkaz' : 'Send sign-in link')}
                </button>
                {awaitingCode && <button type="button" className={styles.retry} disabled={busy} onClick={() => {
                    setAwaitingCode(false);
                    setError('');
                    requestAnimationFrame(() => emailField.current?.focus());
                }}>{cs ? 'Změnit e-mail nebo poslat znovu' : 'Change email or send again'}</button>}
            </form>
            {footer && <p className={styles.footer}>{footer}</p>}
        </DialogContent>
    </Dialog>;
}
