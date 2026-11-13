'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
/** A lightweight editorial proposal, intentionally separate from Developers project publishing. */
export function ArticleProposal({ fullname = '', email = '' }: { fullname?: string; email?: string }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const submitting = useRef(false);
    useEffect(() => {
        if (!open) return;
        const abort = new AbortController();
        void fetch('/api/workshops/komunita-promptbook/state', { signal: abort.signal })
            .then(async (response) => {
                if (!response.ok) return;
                const data: unknown = await response.json();
                if (data && typeof data === 'object' && 'participant' in data) {
                    const p = data.participant;
                    if (
                        p &&
                        typeof p === 'object' &&
                        'email' in p &&
                        'fullname' in p &&
                        typeof p.email === 'string' &&
                        typeof p.fullname === 'string'
                    )
                        setIdentity({ email: p.email, fullname: p.fullname });
                }
            })
            .catch(() => undefined);
        return () => abort.abort();
    }, [open]);
    const [identity, setIdentity] = useState({ fullname, email });
    useEffect(() => setIdentity({ fullname, email }), [fullname, email]);
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError('');
        const fields = new FormData(event.currentTarget);
        try {
            await subscribeToWaitlist({
                placeName: 'promptbook-article-proposal',
                language: 'cs',
                fullname: identity.fullname,
                email: identity.email,
                note: [
                    'Nabídka článku pro komunitu Promptbook',
                    `Téma: ${String(fields.get('title'))}`,
                    String(fields.get('description')),
                    `Odkaz na návrh: ${String(fields.get('draftUrl') ?? '')}`,
                ].join('\n'),
            });
            setDone(true);
        } catch {
            setError('Nabídku se nepodařilo uložit. Údaje zůstaly ve formuláři; zkuste to znovu.');
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }
    return (
        <div className="my-6 rounded-xl border border-room-line p-5">
            <button
                type="button"
                onClick={() => {
                    setOpen(true);
                    setDone(false);
                }}
            >
                Napsat článek
            </button>
            <p>Máte zkušenost nebo nápad? Nabídněte téma, text může vzniknout později.</p>
            <Dialog
                open={open}
                onOpenChange={(value) => {
                    if (!submitting.current) setOpen(value);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nabídnout článek komunitě</DialogTitle>
                        <DialogDescription>
                            Stačí nápad. Publikaci domluvíme a článek zveřejníme pod vaším jménem.
                        </DialogDescription>
                    </DialogHeader>
                    {done ? (
                        <p role="status">Děkujeme, ozveme se vám.</p>
                    ) : (
                        <form onSubmit={submit} className="grid gap-4" aria-busy={busy}>
                            <label>
                                Jméno
                                <input
                                    required
                                    value={identity.fullname}
                                    onChange={(e) => setIdentity({ ...identity, fullname: e.target.value })}
                                    autoComplete="name"
                                    maxLength={150}
                                    disabled={busy}
                                />
                            </label>
                            <label>
                                E-mail
                                <input
                                    required
                                    type="email"
                                    value={identity.email}
                                    onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                                    maxLength={254}
                                    disabled={busy}
                                />
                            </label>
                            <label>
                                Téma nebo název
                                <input name="title" required maxLength={200} disabled={busy} />
                            </label>
                            <label>
                                Stručný popis
                                <textarea name="description" required maxLength={3000} rows={4} disabled={busy} />
                            </label>
                            <label>
                                Odkaz na návrh či hotový text (nepovinné)
                                <input name="draftUrl" type="url" maxLength={1500} disabled={busy} />
                            </label>
                            <PersonalDataConsentNote language="cs" />
                            {error && <p role="alert">{error}</p>}
                            <button disabled={busy}>{busy ? 'Odesílám…' : 'Nabídnout článek'}</button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
