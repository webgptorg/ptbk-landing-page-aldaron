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
import { useRef, useState, type FormEvent } from 'react';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { formatPromptbookBillingAmount } from './promptbookBillingPresentation';
import styles from './promptbookBilling.module.css';
import site from './site.module.css';

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
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
    readonly canceled: boolean;
};

export function PromptbookCheckout({
    plan,
    availability,
    promotion,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
    canceled,
}: PromptbookCheckoutProps) {
    const [country, setCountry] = useState<'CZ' | 'SK'>('CZ');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [quoteExpired, setQuoteExpired] = useState(false);
    const [validatedQuote, setValidatedQuote] = useState<{ code: string; discounts: ActiveDiscountByPlaceId } | null>(
        null,
    );
    const lastAttempt = useRef<{ key: string; requestId: string } | null>(null);
    const submitting = useRef(false);
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

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current || !discountReady || quoteExpired) return;

        const fields = new FormData(event.currentTarget);
        const order = {
            plan,
            country,
            companyId: String(fields.get('companyId')).trim(),
            vatId: country === 'SK' ? String(fields.get('vatId')).trim() : undefined,
            email: String(fields.get('email')).trim(),
            promoCode: activeDiscount ? normalizeDiscountCode(discount.discountCode) : undefined,
            expectedDiscount: activeDiscount ? { percent: activeDiscount.percent, months: duration } : null,
            acceptedTerms: fields.get('terms') === 'on',
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
                <h1>Promptbook {planName}</h1>
                <p>Měsíční předplatné za jeden projekt enginu</p>
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
                    {promotion && (
                        <div className={styles.promotion}>
                            <p>
                                <strong>Nabídka pro první zákazníky</strong> {promotion.percent} %{' '}
                                {promotion.subscriptionDiscountDurationMonths === null
                                    ? 'po dobu předplatného'
                                    : `na první ${formatSubscriptionDiscountDurationMonthCount(promotion.subscriptionDiscountDurationMonths)}`}
                            </p>
                            <button
                                className={styles.promotionAction}
                                type="button"
                                disabled={busy || activeDiscount?.code === promotion.code}
                                onClick={() => discount.setDiscountCode(promotion.code)}
                            >
                                {activeDiscount?.code === promotion.code ? 'Sleva uplatněna' : 'Uplatnit slevu'}
                            </button>
                        </div>
                    )}
                    <form id={REGISTRATION_SECTION_ID} className={styles.checkout} onSubmit={submit} aria-busy={busy}>
                        <section className={styles.billing} aria-labelledby="billing-title">
                            <h2 id="billing-title">Fakturační údaje</h2>
                            {canceled && <p role="status">Platba nebyla dokončena. Můžete ji zkusit znovu.</p>}
                            <label>
                                Země podnikání
                                <select
                                    name="country"
                                    value={country}
                                    onChange={(event) => setCountry(event.target.value === 'SK' ? 'SK' : 'CZ')}
                                    disabled={busy}
                                >
                                    <option value="CZ">Česko</option>
                                    {availability.slovakiaEnabled && <option value="SK">Slovensko</option>}
                                </select>
                            </label>
                            <div className={styles.fieldRow}>
                                <label>
                                    IČO
                                    <input
                                        name="companyId"
                                        required
                                        inputMode="numeric"
                                        pattern="[0-9]{8}"
                                        maxLength={8}
                                        placeholder="8 číslic"
                                        disabled={busy}
                                    />
                                </label>
                                {country === 'SK' && (
                                    <label>
                                        IČ DPH
                                        <input
                                            name="vatId"
                                            required
                                            pattern="[Ss][Kk][0-9]{10}"
                                            maxLength={12}
                                            placeholder="SK…"
                                            disabled={busy}
                                        />
                                    </label>
                                )}
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
                            <p className={styles.small}>Fakturační název a adresu dohledáme podle IČO.</p>
                            <label className={styles.agreement}>
                                <input name="terms" type="checkbox" required disabled={busy} />
                                <span>
                                    Objednávám v rámci podnikání a souhlasím s{' '}
                                    <Link href={PROMPTBOOK_ONLINE_TERMS_PATH} target="_blank" rel="noreferrer">
                                        podmínkami předplatného
                                    </Link>
                                    .
                                </span>
                            </label>
                            <p className={styles.small}>
                                {PROMPTBOOK_BILLING_CONTACT_NOTICE}{' '}
                                <Link href={LEGAL_PAGE_PATHS.privacyPolicy.cs} target="_blank" rel="noreferrer">
                                    Ochrana osobních údajů
                                </Link>
                            </p>
                        </section>
                        <section className={styles.summary} aria-labelledby="order-title">
                            <h2 id="order-title">Přehled objednávky</h2>
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
                            <p>
                                Vlastní instalace enginu {availability.supportedVersion} a produktová podpora.{' '}
                                {plan === 'business'
                                    ? 'První věcná reakce do 16 pracovních hodin.'
                                    : 'Bez garantované doby reakce.'}
                            </p>
                            <p className={styles.small}>
                                <a href={availability.engineLicenceUrl} target="_blank" rel="noreferrer">
                                    Licence enginu
                                </a>{' '}
                                · <a href={`mailto:${availability.supportEmail}`}>Kontakt na podporu</a>
                            </p>
                            <p className={styles.small}>
                                Předplatné se obnovuje automaticky. Obnovu můžete zrušit před dalším obdobím.
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
