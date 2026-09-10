'use client';

import {
    ONLINE_WORKSHOP_REGISTRATION_PLACE_NAME,
    ONLINE_WORKSHOP_THANK_YOU_PATH,
} from '@/businesses/online-workshop/config';
import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
import { EventTermOptionList } from '@/components/events/EventTermOptionList';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import {
    formatCzechWorkshopDate,
    formatCzechWorkshopDuration,
    formatCzechWorkshopMoment,
    formatCzechWorkshopTime,
} from '@/lib/workshops/workshopDate';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import {
    REGISTRATION_TERM_MOMENT_LINE_PREFIX,
    REGISTRATION_TERM_SLUG_LINE_PREFIX,
} from '@/lib/workshops/workshopRegistrations';
import { createWorkshopRegistrationThankYouPath } from '@/lib/workshops/workshopRegistrationTiming';
import { cn } from '@/lib/utils';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import { Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, type FormEvent } from 'react';

function getFieldErrors({ fullname, email }: { fullname: string; email: string }) {
    return {
        fullnameError: fullname.trim() ? null : 'Vyplňte jméno a příjmení.',
        emailError: email.trim()
            ? isEmailAddressValid(email)
                ? null
                : 'Zadejte prosím platný e-mail.'
            : 'Vyplňte e-mail.',
    };
}

/**
 * Note: The term is named on the very lines the administration counts the people registered for it from, so the note a
 *       registration is written with and the note that count is read from can never drift apart.
 */
function createOnlineWorkshopRegistrationNote(workshop: EventOccurrence): string {
    return [
        'Online workshop registration',
        `Workshop: ${workshop.title}`,
        `${REGISTRATION_TERM_SLUG_LINE_PREFIX} ${workshop.slug}`,
        `${REGISTRATION_TERM_MOMENT_LINE_PREFIX} ${formatCzechWorkshopMoment(workshop.startsAt)}`,
    ].join('\n');
}

type OnlineWorkshopRegistrationFormProps = {
    /**
     * The published terms a visitor can choose from. One form deliberately serves all of them, so a person never has
     * to retype their contact details just to choose another date.
     */
    readonly workshops: readonly EventOccurrence[];
};

type OnlineWorkshopTermPickerProps = {
    readonly workshops: readonly EventOccurrence[];
    readonly selectedWorkshop: EventOccurrence;
    readonly onSelectWorkshop: (workshop: EventOccurrence) => void;
};

/**
 * Lets a visitor select one online-workshop occurrence without owning any registration-field state.
 *
 * Note: Every term of this event is a workshop about something of its own, so each card names its subject and says
 *       what it is about rather than leaving a visitor to choose between dates alone.
 */
function OnlineWorkshopTermPicker({ workshops, selectedWorkshop, onSelectWorkshop }: OnlineWorkshopTermPickerProps) {
    return (
        <fieldset>
            <legend className="text-sm font-semibold text-slate-700">Vyber termín workshopu</legend>
            <EventTermOptionList
                terms={workshops}
                selectedTermSlug={selectedWorkshop.slug}
                onSelectTerm={onSelectWorkshop}
                isTopicShown={true}
                noteIcon={Clock}
                createNoteText={createOnlineWorkshopTermNoteText}
                className="mt-3"
            />
        </fieldset>
    );
}

function OnlineWorkshopNoTermNotice() {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-xl">
            Zatím není vypsaný další termín. Sleduj Promptbook, nový workshop sem přidáme hned po zveřejnění.
        </div>
    );
}

export function OnlineWorkshopRegistrationForm({ workshops }: OnlineWorkshopRegistrationFormProps) {
    const [firstWorkshop] = workshops;

    if (firstWorkshop === undefined) {
        return <OnlineWorkshopNoTermNotice />;
    }

    return <OnlineWorkshopSelectedTermRegistrationForm workshops={workshops} firstWorkshop={firstWorkshop} />;
}

type OnlineWorkshopSelectedTermRegistrationFormProps = {
    readonly workshops: readonly EventOccurrence[];
    readonly firstWorkshop: EventOccurrence;
};

/**
 * The one registration form shared by every published online-workshop term.
 */
function OnlineWorkshopSelectedTermRegistrationForm({
    workshops,
    firstWorkshop,
}: OnlineWorkshopSelectedTermRegistrationFormProps) {
    const [selectedWorkshopSlug, setSelectedWorkshopSlug] = useState(firstWorkshop.slug);
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isValidationShown, setIsValidationShown] = useState(false);

    const { fullnameError, emailError } = getFieldErrors({ fullname, email });
    const isSubmissionAllowed = !fullnameError && !emailError;
    const selectedWorkshop = workshops.find((workshop) => workshop.slug === selectedWorkshopSlug) ?? firstWorkshop;
    const dateLabel = formatCzechWorkshopDate(selectedWorkshop.startsAt);
    const timeLabel = formatCzechWorkshopTime(selectedWorkshop.startsAt);
    const durationLabel = formatCzechWorkshopDuration(selectedWorkshop.startsAt, selectedWorkshop.endsAt);
    const fieldIdPrefix = `workshop-${selectedWorkshop.slug}`;

    const handleWorkshopSelection = (workshop: EventOccurrence) => {
        setSelectedWorkshopSlug(workshop.slug);
        setErrorMessage(null);
        setIsValidationShown(false);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isSubmissionAllowed) {
            setIsValidationShown(true);
            setErrorMessage('Vyplň jméno a platný e-mail.');
            return;
        }

        setIsValidationShown(false);
        setIsSubmitting(true);
        setErrorMessage(null);
        const registrationAtMilliseconds = Date.now();

        try {
            await subscribeToWaitlist({
                fullname,
                email,
                phone: phone.trim() || undefined,
                placeName: ONLINE_WORKSHOP_REGISTRATION_PLACE_NAME,
                note: createOnlineWorkshopRegistrationNote(selectedWorkshop),
            });

            // Note: A full page load, not a client side route change - only that runs the Meta Pixel again and reports
            //       a `PageView` of the thank you url, which is what the ad campaign optimizes on.
            //       `isSubmitting` intentionally stays `true`, so the form cannot be sent twice while the browser
            //       is still loading the thank you page.
            window.location.assign(
                createWorkshopRegistrationThankYouPath({
                    thankYouPath: ONLINE_WORKSHOP_THANK_YOU_PATH,
                    workshopSlug: selectedWorkshop.slug,
                    startsAt: selectedWorkshop.startsAt,
                    participantIdentity: { email, fullname },
                    registrationAtMilliseconds,
                }),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Registraci se nepodařilo odeslat. Zkus to znovu.');
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
        >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <p className="text-sm font-semibold uppercase text-cyan-700">Registrace</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-950">Vyber si termín</h3>
                </div>
                <div className="rounded-xl bg-slate-950 px-4 py-3 text-right text-white">
                    <p className="text-xs text-slate-300">Online workshop</p>
                    <p className="text-xl font-bold">Zdarma</p>
                </div>
            </div>

            <OnlineWorkshopTermPicker
                workshops={workshops}
                selectedWorkshop={selectedWorkshop}
                onSelectWorkshop={handleWorkshopSelection}
            />

            <div className="flex items-center gap-3 border-y border-slate-100 py-5" aria-live="polite">
                <span className="flex shrink-0">
                    <Image
                        src={pavolHejny}
                        alt="Pavol Hejný"
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                    <Image
                        src={jiriJahn}
                        alt="Jiří Jahn"
                        width={44}
                        height={44}
                        className="-ml-3 h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                </span>
                <div>
                    <p className="text-sm font-semibold text-slate-950">{selectedWorkshop.title}</p>
                    <p className="text-xs text-slate-400">
                        {dateLabel} · {timeLabel} · {durationLabel} · online
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor={`${fieldIdPrefix}-fullname`} className="text-sm font-semibold text-slate-700">
                        Jméno
                    </label>
                    <Input
                        id={`${fieldIdPrefix}-fullname`}
                        name="fullname"
                        value={fullname}
                        onChange={(event) => setFullname(event.target.value)}
                        placeholder="Jana Nováková"
                        autoComplete="name"
                        aria-invalid={isValidationShown && !!fullnameError}
                        className={cn(
                            'mt-2 h-11',
                            isValidationShown &&
                                fullnameError &&
                                'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {isValidationShown && fullnameError && (
                        <p className="mt-1 text-xs text-red-600">{fullnameError}</p>
                    )}
                </div>

                <div>
                    <label htmlFor={`${fieldIdPrefix}-email`} className="text-sm font-semibold text-slate-700">
                        E-mail
                    </label>
                    <Input
                        id={`${fieldIdPrefix}-email`}
                        name="email"
                        type="email"
                        inputMode="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="jmeno@firma.cz"
                        autoComplete="email"
                        aria-invalid={isValidationShown && !!emailError}
                        className={cn(
                            'mt-2 h-11',
                            isValidationShown &&
                                emailError &&
                                'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {isValidationShown && emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                </div>

                <div>
                    <label htmlFor={`${fieldIdPrefix}-phone`} className="text-sm font-semibold text-slate-700">
                        Telefon <span className="font-normal text-slate-400">(nepovinný, kvůli SMS připomínce)</span>
                    </label>
                    <Input
                        id={`${fieldIdPrefix}-phone`}
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+420 000 000 000"
                        autoComplete="tel"
                        className="mt-2 h-11"
                    />
                </div>

                {errorMessage && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-full bg-promptbook-blue-dark text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Odesílám registraci...
                        </>
                    ) : (
                        'Rezervovat místo zdarma'
                    )}
                </Button>

                <PersonalDataConsentNote language="cs" addressForm="informal" className="text-center">
                    Odkaz k připojení ti přijde e-mailem.
                </PersonalDataConsentNote>
            </div>
        </form>
    );
}
