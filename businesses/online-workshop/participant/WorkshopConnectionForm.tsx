'use client';

import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';
import { isWorkshopParticipantFullnameValid } from '@/lib/workshops/workshopParticipantFullname';
import { ArrowRight, LockKeyhole, Radio } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

type WorkshopConnectionFormProps = {
    readonly connectionDetails: WorkshopConnectionDetails;
    readonly initialEmail: string;
    readonly initialFullname: string;
    readonly errorMessage: string | null;
    readonly onConnect: (values: { readonly fullname: string; readonly email: string }) => Promise<boolean>;

    /**
     * Optional choice of the term this form connects to, offered below the term it currently describes
     *
     * Note: The form neither knows what can be chosen nor decides what a choice changes. It only keeps that choice in
     *       the one place a participant is already looking at a term, so picking another one never costs them the name
     *       and the e-mail they have just typed.
     */
    readonly connectionTermPicker?: ReactNode;
};

export type WorkshopConnectionDetails = {
    readonly title: string;
    readonly description: string;
    readonly dateLabel: string;
    readonly durationLabel: string;
    readonly roomLabel?: string;
    readonly connectionHeading?: string;
    readonly connectionDescription?: string;
    readonly submitLabel?: string;
    readonly language?: SupportedHomepageLanguage;
};

export function WorkshopConnectionForm({
    connectionDetails,
    initialEmail,
    initialFullname,
    errorMessage,
    onConnect,
    connectionTermPicker,
}: WorkshopConnectionFormProps) {
    const [fullname, setFullname] = useState(initialFullname);
    const [email, setEmail] = useState(initialEmail);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidationVisible, setIsValidationVisible] = useState(false);
    const isFullnameValid = isWorkshopParticipantFullnameValid(fullname);
    const isEmailValid = isEmailAddressValid(email.trim());
    const roomLabel = connectionDetails.roomLabel ?? 'Živě online';
    const connectionHeading = connectionDetails.connectionHeading ?? 'Připojit se k workshopu';
    const connectionDescription =
        connectionDetails.connectionDescription ?? 'Jméno se zobrazí u vašich komentářů. E-mail ostatní účastníci neuvidí.';
    const submitLabel = connectionDetails.submitLabel ?? 'Připojit se';

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsValidationVisible(true);
        if (!isFullnameValid || !isEmailValid) {
            return;
        }

        setIsSubmitting(true);
        const isConnected = await onConnect({ fullname, email });
        if (!isConnected) {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07151d] px-4 py-8 text-white sm:px-5 sm:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(48,168,189,0.22),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(122,255,235,0.12),transparent_30%)]" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]">
                <section className="border-b border-white/10 bg-cyan-400/5 p-6 sm:p-8 md:border-b-0 md:border-r md:p-10">
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        <Radio className="h-3.5 w-3.5" /> {roomLabel}
                    </span>
                    <h1 className="mt-7 text-3xl font-extrabold leading-tight sm:text-4xl">
                        {connectionDetails.title}
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{connectionDetails.description}</p>
                    <dl className="mt-8 space-y-4 text-sm">
                        <div>
                            <dt className="text-slate-500">Kdy</dt>
                            <dd className="mt-1 font-semibold text-slate-100">{connectionDetails.dateLabel}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Délka</dt>
                            <dd className="mt-1 font-semibold text-slate-100">{connectionDetails.durationLabel}</dd>
                        </div>
                    </dl>
                </section>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                        <LockKeyhole className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 text-2xl font-bold sm:text-3xl">{connectionHeading}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{connectionDescription}</p>

                    <div className="mt-7 space-y-5">
                        <div>
                            <label htmlFor="participant-fullname" className="text-sm font-medium text-slate-200">
                                Jméno a příjmení
                            </label>
                            <Input
                                id="participant-fullname"
                                value={fullname}
                                onChange={(event) => setFullname(event.target.value)}
                                autoComplete="name"
                                maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH}
                                required
                                placeholder="Jana Nováková"
                                className="mt-2 h-11 border-white/15 bg-white/5 text-white placeholder:text-slate-600"
                                aria-invalid={isValidationVisible && !isFullnameValid}
                            />
                            {isValidationVisible && !isFullnameValid && (
                                <p className="mt-1 text-xs text-rose-300">Vyplňte prosím své jméno.</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="participant-email" className="text-sm font-medium text-slate-200">
                                E-mail
                            </label>
                            <Input
                                id="participant-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH}
                                required
                                placeholder="jmeno@firma.cz"
                                className="mt-2 h-11 border-white/15 bg-white/5 text-white placeholder:text-slate-600"
                                aria-invalid={isValidationVisible && !isEmailValid}
                            />
                            {isValidationVisible && !isEmailValid && (
                                <p className="mt-1 text-xs text-rose-300">Zadejte platný e-mail.</p>
                            )}
                        </div>
                    </div>

                    {errorMessage && (
                        <p className="mt-5 break-words rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                            {errorMessage}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 h-12 w-full rounded-full bg-cyan-300 text-base font-bold text-slate-950 hover:bg-cyan-200"
                    >
                        {isSubmitting ? (
                            'Připojuji…'
                        ) : (
                            <>
                                {submitLabel} <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                    <PersonalDataConsentNote
                        language={connectionDetails.language ?? 'cs'}
                        addressForm="formal"
                        className="mt-4 text-center text-xs text-slate-500"
                    />
                </form>

                {/*
                  * Note: The choice closes the door rather than standing in it. A participant who came for one very
                  *       workshop connects to it without ever reading this, while a participant who came for another
                  *       one finds it right below the term they were offered.
                  */}
                {connectionTermPicker !== undefined && (
                    <section className="border-t border-white/10 bg-white/[0.02] p-6 sm:p-8 md:col-span-2 md:p-10">
                        {connectionTermPicker}
                    </section>
                )}
            </div>
        </main>
    );
}
