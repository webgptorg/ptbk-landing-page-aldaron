'use client';

import { requestJson, sendJson } from '@/lib/api/requestJson';
import { LEGAL_PAGE_PATHS } from '@/lib/legal/legalPagePaths';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { formatPromptbookBillingAmount } from './promptbookBillingPresentation';
import styles from './promptbookBilling.module.css';
import site from './site.module.css';

const MEMBERS_API = '/api/promptbook-billing/membership';
const ACCESS_API = '/api/promptbook-billing/access';
const dateFormat = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'long', timeZone: 'Europe/Prague' });

const MEMBERSHIP_STATUS_LABELS = {
    pending: 'Čeká na potvrzení',
    active: 'Aktivní',
    past_due: 'Čeká na úhradu',
    canceled: 'Ukončené',
    unpaid: 'Neuhrazené',
    incomplete: 'Nedokončené',
    incomplete_expired: 'Platba vypršela',
    paused: 'Pozastavené',
    trialing: 'Zkušební období',
};

type Membership = {
    readonly id: string;
    readonly plan: 'start' | 'business';
    readonly status: keyof typeof MEMBERSHIP_STATUS_LABELS;
    readonly paidThrough: string | null;
    readonly cancelAtPeriodEnd: boolean;
    readonly invoiceUrl: string | null;
    readonly amountPaid: number | null;
    readonly supportedVersion: string | null;
    readonly supportEmail: string | null;
    readonly engineLicenceUrl: string | null;
    readonly termsVersion: string;
    readonly firstPaidAt: string | null;
};

type MembersResponse = {
    readonly memberships: readonly Membership[];
    readonly supportEmail: string;
    readonly supportedVersion: string | null;
    readonly portalLoginUrl: string | null;
    readonly emailVerificationEnabled: boolean;
};

function isPaymentPending(data: MembersResponse) {
    return (
        data.memberships.length === 0 ||
        data.memberships.some(({ status }) => status === 'pending' || status === 'incomplete')
    );
}

export function PromptbookMembers({ confirming }: { readonly confirming: boolean }) {
    const [result, setResult] = useState<MembersResponse | null>(null);
    const [waiting, setWaiting] = useState(confirming);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const abort = new AbortController();
        let timeout: ReturnType<typeof setTimeout>;

        async function load(remainingAttempts: number) {
            try {
                const data = await requestJson<MembersResponse>(MEMBERS_API, { signal: abort.signal });
                if (abort.signal.aborted) return;

                setResult(data);
                setError('');
                if (confirming && isPaymentPending(data) && remainingAttempts > 0) {
                    setWaiting(true);
                    timeout = setTimeout(() => void load(remainingAttempts - 1), 2500);
                } else {
                    setWaiting(false);
                }
            } catch {
                if (abort.signal.aborted) return;

                setWaiting(false);
                setError('Předplatné se nepodařilo načíst. Zkuste to prosím znovu.');
            }
        }

        void load(12);
        return () => {
            abort.abort();
            clearTimeout(timeout);
        };
    }, [confirming, refresh]);

    function refreshMemberships() {
        setRefresh((previous) => previous + 1);
    }

    return (
        <div className={styles.page}>
            <Link className={site.textLink} href="/cs/pricing">
                <ArrowLeft size={16} aria-hidden="true" /> Ceník
            </Link>
            <header className={styles.heading}>
                <h1>Moje předplatné</h1>
            </header>
            {error && (
                <p className={site.error} role="alert">
                    {error}
                </p>
            )}
            {waiting && <p role="status">Ověřujeme platbu…</p>}
            {!waiting && !error && result === null && <p role="status">Načítáme předplatné…</p>}
            {!waiting && (error || (confirming && result && isPaymentPending(result))) && (
                <div className={styles.empty}>
                    {!error && <p>Potvrzení platby zatím nemáme. Stav můžete zkontrolovat znovu.</p>}
                    <button className={site.secondaryButton} type="button" onClick={refreshMemberships}>
                        Obnovit stav
                    </button>
                </div>
            )}
            {result && result.memberships.length > 0 && (
                <div className={styles.members}>
                    {result.memberships.map((membership) => (
                        <MembershipCard
                            key={membership.id}
                            membership={membership}
                            supportEmail={membership.supportEmail || result.supportEmail}
                            supportedVersion={membership.supportedVersion || result.supportedVersion}
                        />
                    ))}
                </div>
            )}
            {result && !waiting && result.memberships.length === 0 && (
                <div className={styles.empty}>
                    {result.emailVerificationEnabled ? (
                        <MembershipAccess onVerified={refreshMemberships} />
                    ) : (
                        <p>Předplatné se zobrazí v prohlížeči, ve kterém jste dokončili nákup.</p>
                    )}
                    {result.portalLoginUrl && (
                        <a className={site.textLink} href={result.portalLoginUrl} rel="noreferrer">
                            Přihlásit se do fakturačního portálu <ExternalLink size={15} aria-hidden="true" />
                        </a>
                    )}
                </div>
            )}
            {result && result.memberships.length > 0 && result.emailVerificationEnabled && (
                <details className={styles.onboardingDisclosure}>
                    <summary>Dohledat další předplatné podle e-mailu</summary>
                    <MembershipAccess onVerified={refreshMemberships} />
                </details>
            )}
        </div>
    );
}

function MembershipCard({
    membership,
    supportEmail,
    supportedVersion,
}: {
    readonly membership: Membership;
    readonly supportEmail: string;
    readonly supportedVersion: string | null;
}) {
    const [portalPending, setPortalPending] = useState(false);
    const [portalError, setPortalError] = useState('');
    const hasAccess =
        membership.status === 'active' || membership.status === 'trialing' || membership.status === 'past_due';
    const canManage =
        hasAccess ||
        membership.status === 'unpaid' ||
        membership.status === 'paused' ||
        membership.status === 'canceled';
    const periodEnd = membership.paidThrough && new Date(membership.paidThrough);

    async function openPortal() {
        setPortalPending(true);
        setPortalError('');
        try {
            const { url } = await sendJson<{ url: string }>('/api/promptbook-billing/portal', 'POST', {
                id: membership.id,
            });
            window.location.assign(url);
        } catch {
            setPortalError('Fakturační portál se nepodařilo otevřít. Zkuste to prosím znovu.');
            setPortalPending(false);
        }
    }

    return (
        <article className={styles.memberCard}>
            <div className={styles.memberTitle}>
                <h2>Promptbook {membership.plan === 'start' ? 'Start' : 'Business'}</h2>
                <span className={styles.memberStatus}>
                    {MEMBERSHIP_STATUS_LABELS[membership.status] ?? 'Stav se ověřuje'}
                </span>
            </div>
            {membership.firstPaidAt && membership.amountPaid !== null && (
                <p>Poslední úhrada {formatPromptbookBillingAmount(membership.amountPaid)}.</p>
            )}
            {periodEnd && Number.isFinite(periodEnd.getTime()) && (
                <p>Zaplacené období do {dateFormat.format(periodEnd)}.</p>
            )}
            {membership.cancelAtPeriodEnd && <p>Předplatné se po tomto období neobnoví.</p>}
            {hasAccess && supportedVersion && <p>Podporovaná verze enginu {supportedVersion}.</p>}
            {hasAccess && (
                <div className={styles.memberActions}>
                    <Link className={site.textLink} href="/cs/open-source">
                        Nainstalovat engine <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                    <a className={site.textLink} href={`mailto:${supportEmail || COMMERCIAL_TERMS.contact}`}>
                        Produktová podpora
                    </a>
                    {membership.engineLicenceUrl && (
                        <a className={site.textLink} href={membership.engineLicenceUrl} rel="noreferrer">
                            Licence enginu
                        </a>
                    )}
                </div>
            )}
            <div className={styles.memberActions}>
                {membership.invoiceUrl && (
                    <a className={site.textLink} href={membership.invoiceUrl} rel="noreferrer">
                        Poslední faktura <ExternalLink size={15} aria-hidden="true" />
                    </a>
                )}
                {canManage && (
                    <button
                        className={site.secondaryButton}
                        disabled={portalPending}
                        type="button"
                        onClick={openPortal}
                    >
                        {portalPending ? 'Otevíráme fakturaci…' : 'Spravovat platby a obnovu'}
                    </button>
                )}
            </div>
            {membership.termsVersion && (
                <p className={styles.small}>
                    <Link href={`${LEGAL_PAGE_PATHS.productTerms.cs}/${encodeURIComponent(membership.termsVersion)}`}>
                        Podmínky přijaté při nákupu
                    </Link>
                </p>
            )}
            {portalError && (
                <p className={site.error} role="alert">
                    {portalError}
                </p>
            )}
            {hasAccess && (
                <details className={styles.onboardingDisclosure}>
                    <summary>Chcete nám říct víc o Vašem projektu?</summary>
                    <MembershipOnboarding membershipId={membership.id} />
                </details>
            )}
        </article>
    );
}

function MembershipOnboarding({ membershipId }: { readonly membershipId: string }) {
    const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const phone = String(fields.get('phone')).trim();
        const note = String(fields.get('note')).trim();
        if ((!phone && !note) || status === 'saving') return;

        setStatus('saving');
        try {
            await sendJson('/api/promptbook-billing/onboarding', 'POST', {
                id: membershipId,
                phone: phone || undefined,
                note: note || undefined,
            });
            setStatus('done');
        } catch {
            setStatus('error');
        }
    }

    return status === 'done' ? (
        <p role="status">Děkujeme, údaje jsme uložili.</p>
    ) : (
        <form className={styles.onboarding} onSubmit={submit} aria-busy={status === 'saving'}>
            <p className={styles.small}>Tyto údaje jsou nepovinné.</p>
            <label>
                Telefon
                <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
            </label>
            <label>
                Co chcete s Promptbookem řešit?
                <textarea name="note" rows={3} maxLength={2000} />
            </label>
            {status === 'error' && (
                <p className={site.error} role="alert">
                    Údaje se nepodařilo uložit. Zkuste to prosím znovu.
                </p>
            )}
            <button className={site.secondaryButton} disabled={status === 'saving'} type="submit">
                {status === 'saving' ? 'Ukládáme…' : 'Uložit údaje'}
            </button>
        </form>
    );
}

function MembershipAccess({ onVerified }: { readonly onVerified: () => void }) {
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
            {awaitingCode && <p role="status">Pokud k e-mailu evidujeme nákup, poslali jsme Vám přihlašovací kód.</p>}
            <label>
                E-mail z objednávky
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
