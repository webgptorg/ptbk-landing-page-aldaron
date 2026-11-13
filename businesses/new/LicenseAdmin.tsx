'use client';
import { useState, type FormEvent } from 'react';
import { requestJson, sendJson } from '@/lib/api/requestJson';
const API = '/api/admin/promptbook-licensing';
/** Explicit grants and attribution corrections retain a reason; they do not charge or send messages. */
export function LicenseAdmin() {
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<unknown>(null);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function lookup() {
        setBusy(true);
        try {
            setResult(await requestJson(API + '?email=' + encodeURIComponent(email)));
        } catch {
            setMessage('Evidence se nepodařila načíst.');
        } finally {
            setBusy(false);
        }
    }
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (busy) return;
        const data = new FormData(e.currentTarget);
        setBusy(true);
        setMessage('');
        try {
            await sendJson(API, 'POST', {
                action: 'grant',
                email,
                kind: 'partner',
                communitySeats: Number(data.get('seats')),
                capabilities: {
                    engineProjects: 0,
                    specialists: 0,
                    controllingUsers: 0,
                    harnessInstances: 0,
                    browserProfiles: 0,
                    remoteControl: false,
                },
                validUntil: data.get('until') ? new Date(String(data.get('until'))).toISOString() : null,
                reason: String(data.get('reason')),
            });
            setMessage('Komunitní oprávnění bylo uděleno.');
        } catch {
            setMessage('Oprávnění se nepodařilo uložit.');
        } finally {
            setBusy(false);
        }
    }
    return (
        <div className="mx-auto max-w-3xl space-y-6 p-8">
            <h1>Licence a komunitní oprávnění Promptbook</h1>
            <label>
                E-mail účtu
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} />
            </label>
            <button onClick={() => void lookup()} disabled={busy}>
                Načíst evidenci
            </button>
            <form onSubmit={submit} className="grid gap-4">
                <h2>Partnerský komunitní přístup bez licence</h2>
                <label>
                    Počet míst
                    <input name="seats" type="number" min="1" max="1000" defaultValue="1" required />
                </label>
                <label>
                    Do (nepovinné)
                    <input name="until" type="date" />
                </label>
                <label>
                    Důvod
                    <textarea name="reason" minLength={5} maxLength={1000} required />
                </label>
                <button disabled={busy || !email}>Udělit přístup</button>
            </form>
            <details>
                <summary>Opravit doporučení</summary>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        if (busy) return;
                        setBusy(true);
                        void sendJson(API, 'POST', {
                            action: 'referral',
                            accountId: String(data.get('account')),
                            code: String(data.get('code')),
                            reason: String(data.get('reason')),
                        })
                            .then(() => setMessage('Doporučení bylo opraveno s historií.'))
                            .catch(() => setMessage('Opravu nelze uložit.'))
                            .finally(() => setBusy(false));
                    }}
                >
                    <label>
                        ID účtu
                        <input name="account" required />
                    </label>
                    <label>
                        Kód
                        <input name="code" pattern="[A-Za-z0-9_-]*" maxLength={80} />
                    </label>
                    <label>
                        Důvod
                        <textarea name="reason" minLength={5} maxLength={1000} required />
                    </label>
                    <button disabled={busy}>Uložit opravu</button>
                </form>
            </details>
            {message && <p role="status">{message}</p>}
            <pre className="overflow-auto">{result ? JSON.stringify(result, null, 2) : ''}</pre>
        </div>
    );
}
