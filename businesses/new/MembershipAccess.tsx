'use client';
import { useState, type FormEvent } from 'react';
import { sendJson } from '@/lib/api/requestJson';
import styles from './promptbookBilling.module.css';
import site from './site.module.css';
const ACCESS_API = '/api/promptbook-billing/access';
export function MembershipAccess({ onVerified }: { readonly onVerified: () => void }) {
    const [email, setEmail] = useState('');
    const [awaitingCode, setAwaitingCode] = useState(false);
    const [pending, setPending] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending) return;
        const fields = new FormData(event.currentTarget);
        setError('');
        setPending(true);
        try {
            if (awaitingCode) {
                await sendJson(ACCESS_API, 'POST', {
                    action: 'verify',
                    email,
                    code: String(fields.get('code')).trim(),
                });
                setVerified(true);
                onVerified();
            } else {
                await sendJson(ACCESS_API, 'POST', { action: 'send', email });
                setAwaitingCode(true);
            }
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Přihlášení se nepodařilo. Zkuste to prosím znovu.');
        } finally {
            setPending(false);
        }
    }

    return verified ? (
        <p role="status">E-mail jsme ověřili.</p>
    ) : (
        <form className={styles.onboarding} onSubmit={submit} aria-busy={pending}>
            {awaitingCode && <p role="status">Přihlašovací kód vám přijde e-mailem.</p>}
            <label>
                Váš e-mail
                <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    maxLength={254}
                    disabled={pending || awaitingCode}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </label>
            {awaitingCode && (
                <label>
                    Přihlašovací kód
                    <input
                        name="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6,10}"
                        maxLength={10}
                        required
                        disabled={pending}
                    />
                </label>
            )}
            {error && (
                <p className={site.error} role="alert">
                    {error}
                </p>
            )}
            <div className={styles.memberActions}>
                <button className={site.button} type="submit" disabled={pending}>
                    {pending ? 'Ověřujeme…' : awaitingCode ? 'Přihlásit se' : 'Poslat přihlašovací kód'}
                </button>
                {awaitingCode && (
                    <button
                        className={site.secondaryButton}
                        type="button"
                        disabled={pending}
                        onClick={() => {
                            setAwaitingCode(false);
                            setError('');
                        }}
                    >
                        Použít jiný e-mail
                    </button>
                )}
            </div>
        </form>
    );
}
