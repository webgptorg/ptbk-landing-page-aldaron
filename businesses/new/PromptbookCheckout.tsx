'use client';

import { JsonRequestError, sendJson } from '@/lib/api/requestJson';
import { PROMPTBOOK_BILLING_CONTACT_NOTICE } from '@/lib/contacts/contactSubmissionPolicy';
import {
    formatSubscriptionDiscountDurationMonthCount,
    normalizeDiscountCode,
    type ActiveDiscount,
    type ActiveDiscountByPlaceId,
} from '@/lib/discounts/discountCode';
import { validateDiscountCode } from '@/lib/discounts/discountCodeApi';
import { MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH, REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { getPromptbookDiscountPlaceId } from '@/lib/discounts/discountPlaces';
import { isDiscountCodeReadyForSubmission, useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { LEGAL_PAGE_PATHS } from '@/lib/legal/legalPagePaths';
import {
    PROMPTBOOK_ONLINE_TERMS_PATH,
    PROMPTBOOK_ONLINE_TERMS_VERSION,
} from '@/lib/legal/promptbookOnlineTermsVersion';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { referralFromBrowser } from '@/lib/promptbook-licensing/referral';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { formatPromptbookBillingAmount } from './promptbookBillingPresentation';
import styles from './promptbookBilling.module.css';
import site from './site.module.css';
import { CompanyNameInput } from './CompanyNameInput';
import type { PromptbookBillingIdentity } from '@/lib/promptbook-billing/billingIdentity';

type PromptbookCheckoutProps = {
    readonly plan: 'start' | 'business';
    readonly availability: {
        readonly enabled: boolean;
        readonly slovakiaEnabled: boolean;
        readonly supportedVersion: string | null;
        readonly supportEmail: string;
        readonly engineLicenceUrl: string;
        readonly isTest: boolean;
    };
    readonly promotion: ActiveDiscount | null;
    readonly promotionsByPlan?: Partial<Record<'start' | 'business', ActiveDiscount | null>>;
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
    readonly canceled: boolean;
};

export function PromptbookCheckout({
    plan: initialPlan,
    availability,
    promotion,
    promotionsByPlan,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
    canceled,
}: PromptbookCheckoutProps) {
    const [referral, setReferral] = useState('');
    useEffect(() => { const saved=referralFromBrowser();setReferral(saved);if(!saved)void fetch('/api/promptbook-billing/licenses').then(async response=>{if(!response.ok)return;const data:unknown=await response.json();if(data&&typeof data==='object'&&'referral' in data&&typeof data.referral==='string')setReferral(data.referral);}).catch(()=>undefined); }, []);
    const [plan, setPlan] = useState(initialPlan);
    const [country, setCountry] = useState<'CZ' | 'SK'>('CZ');
    const [isBusiness, setIsBusiness] = useState(true);
    const [companyId, setCompanyId] = useState('');
    const [vatId, setVatId] = useState('');
    const [billingDetails, setBillingDetails] = useState({ name: '', line1: '', city: '', postal_code: '' });
    const editedBillingFields = useRef(new Set<keyof typeof billingDetails>());
    const customerNames = useRef({ business: { value: '', edited: false }, consumer: { value: '', edited: false } });
    const [identityStatus, setIdentityStatus] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [quoteExpired, setQuoteExpired] = useState(false);
    const [validatedQuote, setValidatedQuote] = useState<{ code: string; discounts: ActiveDiscountByPlaceId } | null>(
        null,
    );
    const lastAttempt = useRef<{ key: string; requestId: string } | null>(null);
    const submitting = useRef(false);
    const currentPromotion = promotionsByPlan?.[plan] ?? (plan === initialPlan ? promotion : null);
    const discountPlaceId = getPromptbookDiscountPlaceId(plan);
    const discount = useDiscountCodeValidation({
        initialDiscountCode: validatedQuote?.code ?? initialDiscountCode,
        initialActiveDiscountByPlaceId: validatedQuote?.discounts ?? initialActiveDiscountByPlaceId,
        discountPlaceId,
    });

    const planName = plan === 'start' ? 'Start' : 'Business';
    const basePrice = plan === 'start' ? COMMERCIAL_TERMS.startCzk : COMMERCIAL_TERMS.businessCzk;
    const activeDiscount = discount.activeDiscount;
    const duration = activeDiscount?.subscriptionDiscountDurationMonths ?? null;
    const baseAmount = basePrice * 100;
    const amount = activeDiscount ? baseAmount - Math.round(basePrice * activeDiscount.percent) : baseAmount;
    const discountReady = isDiscountCodeReadyForSubmission(discount);
    const discountMessage =
        discount.validationError ??
        (discount.isValidationPending
            ? 'Ověřujeme kód…'
            : activeDiscount
              ? 'Slevový kód je uplatněný.'
              : discount.discountCode.trim()
                ? 'Tento kód pro vybraný tarif neplatí.'
                : '');

    useEffect(() => {
        if (!isBusiness || !/^\d{8}$/.test(companyId)) {
            setIdentityStatus('');
            return;
        }
        let current = true;
        setIdentityStatus('Dohledáváme údaje…');
        const timeout = window.setTimeout(() => {
            void sendJson<{
                name: string;
                address: { line1: string; city: string; postal_code: string };
            }>('/api/promptbook-billing/identity', 'POST', { country, companyId, vatId: vatId.trim() || undefined })
                .then((identity) => {
                    if (!current) return;
                    const resolved = { name: identity.name, ...identity.address };
                    setBillingDetails((details) => {
                        const updated = { ...details };
                        for (const key of ['name', 'line1', 'city', 'postal_code'] as const) {
                            if (!editedBillingFields.current.has(key) || details[key] === '') updated[key] = resolved[key];
                        }
                        return updated;
                    });
                    setIdentityStatus('Údaje načtené. Můžete je upravit.');
                })
                .catch(() => {
                    if (current) setIdentityStatus('Údaje se nepodařilo dohledat. Vyplňte je ručně.');
                });
        }, 400);
        return () => {
            current = false;
            window.clearTimeout(timeout);
        };
    }, [isBusiness, companyId, country, vatId]);

    function changePlan(nextPlan: 'start' | 'business') {
        if (submitting.current || nextPlan === plan) return;
        setPlan(nextPlan);
        setQuoteExpired(false);
        setError('');
        lastAttempt.current = null;
        const url = new URL(window.location.href);
        url.pathname = `/cs/pricing/objednat/${nextPlan}`;
        url.searchParams.delete('stav');
        window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    function editBillingField(key: keyof typeof billingDetails, value: string) {
        editedBillingFields.current.add(key);
        setBillingDetails((details) => ({ ...details, [key]: value }));
    }

    function selectCompany(company: PromptbookBillingIdentity) {
        editedBillingFields.current.clear();
        setCompanyId(company.companyId);
        setVatId(company.vatId ?? '');
        setBillingDetails({ name: company.name, line1: company.address.line1,
            city: company.address.city, postal_code: company.address.postal_code });
        setIdentityStatus('Údaje načtené. Můžete je upravit.');
    }

    function changeCustomerType(business: boolean) {
        customerNames.current[isBusiness ? 'business' : 'consumer'] = {
            value: billingDetails.name, edited: editedBillingFields.current.has('name'),
        };
        const name = customerNames.current[business ? 'business' : 'consumer'];
        if (name.edited) editedBillingFields.current.add('name');
        else editedBillingFields.current.delete('name');
        setBillingDetails((details) => ({ ...details, name: name.value }));
        setIsBusiness(business);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current || !discountReady || quoteExpired) return;

        const fields = new FormData(event.currentTarget);
        const order = {
            plan,
            country,
            isBusiness,
            companyId: isBusiness ? companyId.trim() : '',
            vatId: isBusiness ? vatId.trim() || undefined : undefined,
            billingName: billingDetails.name.trim(),
            billingAddress: {
                line1: billingDetails.line1.trim(),
                city: billingDetails.city.trim(),
                postal_code: billingDetails.postal_code.trim(),
                country,
            },
            note: String(fields.get('note') ?? '').trim(),
            referralCode: referral.trim(),
            email: String(fields.get('email')).trim(),
            promoCode: activeDiscount ? normalizeDiscountCode(discount.discountCode) : undefined,
            expectedDiscount: activeDiscount ? { percent: activeDiscount.percent, months: duration } : null,
            acceptedTerms: fields.get('terms') === 'on',
            immediateStart: fields.get('immediateStart') === 'on',
            termsVersion: PROMPTBOOK_ONLINE_TERMS_VERSION,
        };
        const key = JSON.stringify(order);
        const requestId = lastAttempt.current?.key === key ? lastAttempt.current.requestId : window.crypto.randomUUID();
        lastAttempt.current = { key, requestId };
        submitting.current = true;
        setBusy(true);
        setError('');

        try {
            const { url } = await sendJson<{ url: string }>('/api/promptbook-billing/checkout', 'POST', {
                ...order,
                requestId,
            });
            window.location.assign(url);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Platbu se nepodařilo otevřít. Zkuste to prosím znovu.');
            setQuoteExpired(error instanceof JsonRequestError && error.status === 409);
            submitting.current = false;
            setBusy(false);
        }
    }

    async function refreshQuote() {
        if (submitting.current) return;
        const code = discount.discountCode.trim();
        submitting.current = true;
        setBusy(true);
        try {
            const updatedDiscount = code ? await validateDiscountCode(code, discountPlaceId) : null;
            setValidatedQuote({ code, discounts: { [discountPlaceId]: updatedDiscount } });
            lastAttempt.current = null;
            setError('');
            setQuoteExpired(false);
        } catch {
            setError('Nabídku se nepodařilo ověřit. Zkuste to prosím znovu.');
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    return (
        <div className={styles.page}>
            <Link className={site.textLink} href="/cs/pricing">
                <ArrowLeft size={16} aria-hidden="true" /> Ceník
            </Link>
            <header className={styles.heading}>
                <h1>Objednávka</h1>
            </header>
            {!availability.enabled ? (
                <div className={styles.empty}>
                    <p>Online nákup teď není dostupný.</p>
                    <Link className={site.textLink} href="/cs/pricing/predplatne">
                        Spravovat předplatné
                    </Link>
                </div>
            ) : (
                <>
                    {availability.isTest && <p role="status">Testovací platba ve Stripe.</p>}
                    <fieldset className={styles.plans} disabled={busy}>
                        <legend>Plán</legend>
                        {(['start', 'business'] as const).map((option) => (
                            <label className={styles.plan} key={option} data-selected={plan === option}>
                                <input
                                    type="radio"
                                    name="plan"
                                    value={option}
                                    checked={plan === option}
                                    onChange={() => changePlan(option)}
                                />
                                <span>
                                    <strong>{option === 'start' ? 'Start' : 'Business'}</strong>
                                    <span>{formatPromptbookBillingAmount((option === 'start' ? COMMERCIAL_TERMS.startCzk : COMMERCIAL_TERMS.businessCzk) * 100)} / měsíc</span>
                                    <small>{option === 'start' ? '3 agenti · 1 uživatel' : '10 agentů · 5 uživatelů'}</small>
                                </span>
                            </label>
                        ))}
                    </fieldset>
                    {plan === 'start' && (
                        <aside className={styles.upgrade} aria-labelledby="upgrade-title">
                            <div>
                                <h2 id="upgrade-title">Více možností s Business</h2>
                                <p>10 agentů, 5 uživatelů a reakce podpory do 16 pracovních hodin.</p>
                            </div>
                            <button type="button" onClick={() => changePlan('business')} disabled={busy}>
                                Vybrat Business <ArrowRight size={17} aria-hidden="true" />
                            </button>
                        </aside>
                    )}
                    {currentPromotion && (
                        <div className={styles.promotion}>
                            <p>
                                <strong>{currentPromotion.percent} %{' '}
                                {currentPromotion.subscriptionDiscountDurationMonths === null
                                    ? 'po dobu předplatného'
                                    : currentPromotion.subscriptionDiscountDurationMonths === 3
                                      ? 'na tři měsíce'
                                      : `na ${formatSubscriptionDiscountDurationMonthCount(currentPromotion.subscriptionDiscountDurationMonths)}`}
                                {' '}pro první zákazníky</strong>
                            </p>
                            <button
                                className={styles.promotionAction}
                                type="button"
                                disabled={busy || activeDiscount?.code === currentPromotion.code}
                                onClick={() => discount.setDiscountCode(currentPromotion.code)}
                            >
                                {activeDiscount?.code === currentPromotion.code ? 'Sleva uplatněna' : 'Uplatnit slevu'}
                            </button>
                        </div>
                    )}
                    <form id={REGISTRATION_SECTION_ID} className={styles.checkout} onSubmit={submit} aria-busy={busy}>
                        <section className={styles.billing} aria-labelledby="billing-title">
                            <h2 id="billing-title">Fakturační údaje</h2>
                            {canceled && <p role="status">Platba nebyla dokončena. Můžete ji zkusit znovu.</p>}
                            <label><span>Doporučil vás někdo? (nepovinné)</span><input maxLength={80} pattern="[A-Za-z0-9_-]*" value={referral} onChange={event => setReferral(event.target.value)} disabled={busy}/><small>Doporučovací kód je nezávislý na slevovém kódu.</small></label>
                            <label className={styles.agreement}>
                                <input type="checkbox" name="isBusiness" checked={isBusiness}
                                    onChange={(event) => changeCustomerType(event.target.checked)} disabled={busy} />
                                <span>Nakupuji na firmu</span>
                            </label>
                            <label>
                                Země
                                <select
                                    name="country"
                                    value={country}
                                    onChange={(event) => {
                                        setCountry(event.target.value === 'SK' ? 'SK' : 'CZ');
                                        setVatId('');
                                    }}
                                    disabled={busy}
                                >
                                    <option value="CZ">Česko</option>
                                    {availability.slovakiaEnabled && <option value="SK">Slovensko</option>}
                                </select>
                            </label>
                            {isBusiness ? (
                                <CompanyNameInput key={country} value={billingDetails.name} disabled={busy}
                                    searchEnabled={country === 'CZ'}
                                    onChange={(value) => editBillingField('name', value)} onSelect={selectCompany} />
                            ) : (
                                <label>
                                    Jméno a příjmení
                                    <input name="billingName" required autoComplete="name" maxLength={200}
                                        value={billingDetails.name} onChange={(event) => editBillingField('name', event.target.value)} disabled={busy} />
                                </label>
                            )}
                            {isBusiness && <div className={styles.fieldRow}>
                                <label>
                                    IČO
                                    <input
                                        name="companyId"
                                        required
                                        inputMode="numeric"
                                        pattern="[0-9]{8}"
                                        maxLength={8}
                                        placeholder="8 číslic"
                                        value={companyId}
                                        onChange={(event) => setCompanyId(event.target.value)}
                                        disabled={busy}
                                    />
                                </label>
                                    <label>
                                        {country === 'SK' ? 'IČ DPH' : 'DIČ'}
                                        <input
                                            name="vatId"
                                            required={country === 'SK'}
                                            pattern={country === 'SK' ? '[Ss][Kk][0-9]{10}' : '[Cc][Zz][0-9]{8,10}'}
                                            maxLength={12}
                                            placeholder={country === 'SK' ? 'SK…' : 'CZ…'}
                                            value={vatId}
                                            onChange={(event) => setVatId(event.target.value)}
                                            disabled={busy}
                                        />
                                    </label>
                            </div>}
                            {isBusiness && identityStatus && <p className={styles.small} role="status">{identityStatus}</p>}
                            <label>
                                Ulice a číslo
                                <input name="line1" required autoComplete="address-line1" maxLength={200}
                                    value={billingDetails.line1} onChange={(event) => editBillingField('line1', event.target.value)} disabled={busy} />
                            </label>
                            <div className={styles.fieldRow}>
                                <label>
                                    Město
                                    <input name="city" required autoComplete="address-level2" maxLength={100}
                                        value={billingDetails.city} onChange={(event) => editBillingField('city', event.target.value)} disabled={busy} />
                                </label>
                                <label>
                                    PSČ
                                    <input name="postalCode" required autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{3} ?[0-9]{2}" maxLength={6}
                                        value={billingDetails.postal_code} onChange={(event) => editBillingField('postal_code', event.target.value)} disabled={busy} />
                                </label>
                            </div>
                            <label>
                                E-mail
                                <input
                                    name="email"
                                    required
                                    type="email"
                                    autoComplete="email"
                                    maxLength={254}
                                    disabled={busy}
                                />
                            </label>
                            <label>
                                <span>Poznámka <span className={styles.optional}>(nepovinné)</span></span>
                                <textarea name="note" rows={2} maxLength={4000} disabled={busy} />
                            </label>
                            <label className={styles.agreement}>
                                <input name="terms" type="checkbox" required disabled={busy} />
                                <span>
                                    Souhlasím s{' '}
                                    <Link href={PROMPTBOOK_ONLINE_TERMS_PATH} target="_blank" rel="noreferrer">
                                        podmínkami předplatného
                                    </Link>
                                    .
                                </span>
                            </label>
                            {!isBusiness && (
                                <label className={styles.agreement}>
                                    <input name="immediateStart" type="checkbox" required disabled={busy} />
                                    <span>Chci zpřístupnit předplatné ihned.</span>
                                </label>
                            )}
                            <p className={styles.small}>
                                {PROMPTBOOK_BILLING_CONTACT_NOTICE}{' '}
                                <Link href={LEGAL_PAGE_PATHS.privacyPolicy.cs} target="_blank" rel="noreferrer">
                                    Ochrana osobních údajů
                                </Link>
                            </p>
                        </section>
                        <section className={styles.summary} aria-labelledby="order-title">
                            <h2 id="order-title">Přehled objednávky</h2>
                            <p><strong>Promptbook {planName}</strong></p>
                            <div className={styles.price} aria-live="polite">
                                <strong>{formatPromptbookBillingAmount(amount)}</strong>
                                <span>
                                    {' '}
                                    {duration === null
                                        ? 'měsíčně'
                                        : `měsíčně první ${formatSubscriptionDiscountDurationMonthCount(duration)}`}
                                </span>
                                {duration !== null && <p>Poté {formatPromptbookBillingAmount(baseAmount)} měsíčně.</p>}
                            </div>
                            <p className={styles.small}>
                                Automatické měsíční obnovení. Zrušíte kdykoliv.
                            </p>
                            <label>
                                <span>
                                    Slevový kód <span className={styles.optional}>(nepovinné)</span>
                                </span>
                                <input
                                    name="promoCode"
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={discount.discountCode}
                                    maxLength={MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH}
                                    onChange={(event) => discount.setDiscountCode(event.target.value)}
                                    aria-describedby="promo-status"
                                    disabled={busy}
                                />
                            </label>
                            <p className={styles.small} id="promo-status" role="status">
                                {discountMessage}
                            </p>
                            {error && (
                                <p className={site.error} role="alert">
                                    {error}
                                </p>
                            )}
                            {quoteExpired ? (
                                <button
                                    type="button"
                                    className={site.secondaryButton}
                                    disabled={busy}
                                    onClick={refreshQuote}
                                >
                                    {busy ? 'Ověřujeme nabídku…' : 'Ověřit nabídku znovu'}
                                </button>
                            ) : (
                                <button type="submit" className={site.button} disabled={busy || !discountReady}>
                                    {busy ? 'Otevíráme platbu…' : 'Pokračovat k platbě'}
                                    <ArrowRight size={17} aria-hidden="true" />
                                </button>
                            )}
                            <p className={styles.stripe}>
                                <LockKeyhole size={14} aria-hidden="true" /> Platbu kartou zpracuje Stripe.
                            </p>
                        </section>
                    </form>
                    <Link className={site.textLink} href="/cs/pricing/predplatne">
                        Spravovat předplatné
                    </Link>
                </>
            )}
        </div>
    );
}
