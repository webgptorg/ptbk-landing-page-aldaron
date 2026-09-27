'use client';

import {
    AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_CONTACT_NOTE,
    AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_PLACE_NAME,
    AI_TA_KRAJTA_SECTION_IDS,
} from '@/businesses/ai-ta-krajta/config';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { CheckCircle2, Mail } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';

const EMAIL_FIELD_ID = 'ai-ta-krajta-email-subscription-email';
const EMAIL_ERROR_ID = 'ai-ta-krajta-email-subscription-error';
const EMAIL_FIELD_CLASS_NAME =
    'h-11 w-full rounded-xl border border-white/15 bg-[#1a201c]/70 px-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-white/55 disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Collect a listener's request for email updates through the shared contacts inbox
 */
export function AiTaKrajtaEmailSubscriptionForm() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isSubmissionInFlightRef = useRef(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmissionInFlightRef.current || isSubmitted) {
            return;
        }

        const normalizedEmail = email.trim();

        if (!isEmailAddressValid(normalizedEmail)) {
            setErrorMessage(
                normalizedEmail === ''
                    ? 'Napiš svůj e-mail.'
                    : 'Ten e-mail nevypadá platně, mrkni na něj.',
            );
            return;
        }

        isSubmissionInFlightRef.current = true;
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await subscribeToWaitlist({
                email: normalizedEmail,
                placeName: AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_PLACE_NAME,
                note: AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_CONTACT_NOTE,
            });
            setEmail('');
            setIsSubmitted(true);
        } catch (submissionError) {
            setErrorMessage(
                submissionError instanceof Error
                    ? submissionError.message
                    : 'Žádost se nepodařilo uložit. Zkus to prosím ještě jednou.',
            );
        } finally {
            isSubmissionInFlightRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <section
            id={AI_TA_KRAJTA_SECTION_IDS.EMAIL_SUBSCRIPTION}
            className="scroll-mt-28 border-y border-white/10 py-6 md:scroll-mt-20 sm:py-7"
            aria-labelledby="ai-ta-krajta-email-subscription-heading"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="rounded-2xl border border-[#6b8cff]/25 bg-gradient-to-br from-[#6b8cff]/10 via-white/[0.03] to-[#ff6b6b]/[0.06] p-5 sm:p-6">
                    {isSubmitted ? (
                        <div className="flex items-start gap-3" role="status" aria-live="polite">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9db1ff]" />
                            <div>
                                <h2
                                    id="ai-ta-krajta-email-subscription-heading"
                                    className="text-lg font-semibold text-white"
                                >
                                    AI ta Krajta do e-mailu
                                </h2>
                                <p className="mt-1 text-sm text-white/65">
                                    Díky, žádost o e-mailové novinky jsme uložili.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form
                            noValidate
                            onSubmit={handleSubmit}
                            aria-labelledby="ai-ta-krajta-email-subscription-heading"
                            aria-busy={isSubmitting}
                        >
                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                <div>
                                    <h2
                                        id="ai-ta-krajta-email-subscription-heading"
                                        className="text-lg font-semibold text-white"
                                    >
                                        AI ta Krajta do e-mailu
                                    </h2>
                                    <label
                                        htmlFor={EMAIL_FIELD_ID}
                                        className="mt-3 block text-sm font-medium text-white/70"
                                    >
                                        E-mail
                                    </label>
                                    <input
                                        id={EMAIL_FIELD_ID}
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            setErrorMessage(null);
                                        }}
                                        autoComplete="email"
                                        required
                                        disabled={isSubmitting}
                                        aria-invalid={errorMessage !== null}
                                        aria-describedby={errorMessage === null ? undefined : EMAIL_ERROR_ID}
                                        className={`${EMAIL_FIELD_CLASS_NAME} mt-2`}
                                        placeholder="tvoje@email.cz"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#ff6b6b] px-5 text-sm font-semibold text-[#1a201c] transition-colors hover:bg-[#ff8580] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb1a6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {isSubmitting ? 'Odesíláme…' : 'Odebírat e-mailem'}
                                    {!isSubmitting && <Mail className="h-4 w-4" aria-hidden="true" />}
                                </button>
                            </div>

                            {errorMessage !== null && (
                                <p
                                    id={EMAIL_ERROR_ID}
                                    role="alert"
                                    className="mt-3 rounded-xl bg-[#ff6b6b]/15 px-4 py-3 text-sm text-[#ffb1a6]"
                                >
                                    {errorMessage}
                                </p>
                            )}

                            <PersonalDataConsentNote
                                language="cs"
                                addressForm="informal"
                                className="mt-3 text-white/40"
                                linkClassName="text-white/70"
                            >
                                Odesláním zároveň žádáš o e-mailové novinky AI ta Krajta.
                            </PersonalDataConsentNote>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
