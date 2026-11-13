'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { requestJson, sendJson } from '@/lib/api/requestJson';
import { MembershipAccess } from './MembershipAccess';
import { referralFromBrowser } from '@/lib/promptbook-licensing/referral';
import type { LicenseGrant } from '@/lib/promptbook-licensing/contract';
import s from './site.module.css';
import styles from './promptbookBilling.module.css';
const API = '/api/promptbook-billing/licenses';
type State = {
    verified: boolean;
    email?: string;
    grants?: (LicenseGrant & { kind: string; campaign?: string })[];
    seats?: { email: string }[];
    communitySeatLimit?: number;
    referral?: string | null;
};
export function LicenseMemberPanel() {
    const [state, setState] = useState<State | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [referral, setReferral] = useState('');
    const gate = useRef(false);
    async function load(signal?: AbortSignal) {
        try {
            const data = await requestJson<State>(API, { signal });
            setState(data);
            setError('');
            setReferral(data.referral ?? referralFromBrowser());
        } catch {
            if (!signal?.aborted) setError('Členskou sekci teď nelze načíst. Zkuste to znovu.');
        }
    }
    useEffect(() => {
        const abort = new AbortController();
        void load(abort.signal);
        return () => abort.abort();
    }, []);
    async function mutate(body: object) {
        if (gate.current) return;
        gate.current = true;
        setBusy(true);
        setError('');
        try {
            await sendJson(API, 'POST', body);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Změnu se nepodařilo uložit.');
        } finally {
            gate.current = false;
            setBusy(false);
        }
    }
    async function signOut() {
        if (gate.current) return;
        gate.current = true;
        setBusy(true);
        try {
            await requestJson('/api/promptbook-billing/access', { method: 'DELETE' });
            window.location.reload();
        } catch {
            setError('Odhlášení se nepodařilo. Zkuste to znovu.');
            gate.current = false;
            setBusy(false);
        }
    }
    async function activate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (gate.current) return;
        const data = new FormData(event.currentTarget);
        gate.current = true;
        setBusy(true);
        setError('');
        try {
            await sendJson(API, 'POST', { action: 'referral', code: referral, provenance: 'customer' });
            await sendJson(API, 'POST', {
                action: 'activate',
                ready: true,
                acceptedTrialTerms: true,
                country: String(data.get('country')),
            });
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Zkoušku se nepodařilo spustit.');
        } finally {
            gate.current = false;
            setBusy(false);
        }
    }
    const trial = state?.grants?.find((g) => g.campaign === 'business-launch-2026');
    return (
        <section className={styles.empty} aria-busy={busy}>
            <h2>Licence a členství</h2>
            {error && (
                <p role="alert" className={s.error}>
                    {error} <button onClick={() => void load()}>Zkusit znovu</button>
                </p>
            )}
            {state?.verified === false && (
                <>
                    <p>
                        14 dní Business bez karty. Čas začne běžet až po přípravě enginu a vašem potvrzení. Nejdříve
                        ověřte svůj e-mail.
                    </p>
                    <MembershipAccess onVerified={() => void load()} />
                </>
            )}
            {state?.verified && (
                <>
                    <p>Přihlášeni jako {state.email}</p>
                    <button disabled={busy} onClick={() => void signOut()}>Odhlásit tento prohlížeč</button>
                    <a className={s.button} href="/cs/open-source">
                        Nainstalovat engine
                    </a>
                    <p>
                        Vzdálenou ovládací appku připravujeme. Dnes pracujte v lokální Console. Po zpřístupnění vzdálené
                        appky nabídneme prvním uživatelům další zkoušku.
                    </p>
                    {!trial ? (
                        <form onSubmit={activate} className={styles.onboarding}>
                            <h3>Spustit Business zdarma</h3>
                            <label>
                                Země
                                <select name="country" required disabled={busy}>
                                    <option value="CZ">Česko</option>
                                    <option value="SK">Slovensko</option>
                                </select>
                            </label>
                            <label>
                                Doporučil vás někdo? (nepovinné)
                                <input
                                    value={referral}
                                    onChange={(e) => setReferral(e.target.value)}
                                    pattern="[A-Za-z0-9_-]*"
                                    maxLength={80}
                                    disabled={busy}
                                />
                            </label>
                            <label>
                                <input type="checkbox" required disabled={busy} /> Engine mám připravený a chci spustit
                                14 dní Business.
                            </label>
                            <label>
                                <input type="checkbox" required disabled={busy} /> Souhlasím s{' '}
                                <Link href="/cs/legal/podminky-produktu/2026-11-13-online-v3" target="_blank">
                                    podmínkami zkoušky a předplatného
                                </Link>
                                .
                            </label>
                            <p>
                                Bez karty a bez automatické platby. AI a případný server hradíte sami. Business zahrnuje
                                10 míst v komunitě. Údaje používáme pro zkoušku a související komunikaci, bez přihlášení
                                k newsletteru.
                            </p>
                            <button className={s.button} disabled={busy}>
                                Spustit 14denní zkoušku
                            </button>
                        </form>
                    ) : (
                        <p>
                            Zkouška: {new Date(trial.validFrom).toLocaleDateString('cs-CZ')}–
                            {new Date(trial.validUntil!).toLocaleDateString('cs-CZ')}.{' '}
                            {Date.parse(trial.validUntil!) > Date.now()
                                ? 'Probíhá.'
                                : 'Skončila; pro placené pokračování objednejte licenci.'}{' '}
                            Po skončení se engine nezablokuje a nic automaticky nestrhneme.
                        </p>
                    )}
                    <div className={s.actions}>
                        <a className={s.textLink} href="/cs/pricing/objednat/business">
                            Koupit Business rovnou →
                        </a>
                        <a className={s.textLink} href="/cs/pricing/objednat/start">
                            Koupit Start →
                        </a>
                    </div>
                    <h3>Komunitní místa</h3>
                    <p>
                        {state.seats?.length ?? 0} přiřazeno / {state.communitySeatLimit ?? 0} míst. Ovládající
                        uživatelé appky se počítají zvlášť. Přidělený člověk si přístup otevře po ověření svého e-mailu.
                    </p>
                    <ul>
                        {state.seats?.map((seat) => (
                            <li key={seat.email}>
                                {seat.email}{' '}
                                <button
                                    disabled={busy}
                                    onClick={() => void mutate({ action: 'seat', email: seat.email, remove: true })}
                                >
                                    Uvolnit místo
                                </button>
                            </li>
                        ))}
                    </ul>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const fields = new FormData(form);
                            void mutate({ action: 'seat', email: String(fields.get('seatEmail')), remove: false });
                        }}
                    >
                        <label>
                            E-mail člena
                            <input type="email" name="seatEmail" required maxLength={254} disabled={busy} />
                        </label>
                        <button disabled={busy || !state.communitySeatLimit}>Přidělit místo</button>
                    </form>
                    <form action="/api/promptbook-billing/community" method="post">
                        <button className={s.button} disabled={busy}>
                            Vstoupit do komunity
                        </button>
                    </form>
                    <details>
                        <summary>Doporučení</summary>
                        <label>
                            Doporučovací kód
                            <input
                                value={referral}
                                onChange={(e) => setReferral(e.target.value)}
                                maxLength={80}
                                disabled={busy}
                            />
                        </label>
                        <button
                            disabled={busy}
                            onClick={() => void mutate({ action: 'referral', code: referral, provenance: 'customer' })}
                        >
                            Uložit doporučení
                        </button>
                    </details>
                </>
            )}
            {!state && !error && <p role="status">Načítáme…</p>}
        </section>
    );
}
