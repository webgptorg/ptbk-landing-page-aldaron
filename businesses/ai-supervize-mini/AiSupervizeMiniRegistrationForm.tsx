'use client';

import {
    AI_SUPERVIZE_MINI_WORKSHOP_INTEREST_PLACE_NAME,
    getAiSupervizeMiniDiscountPlaceId,
} from '@/businesses/ai-supervize-mini/config';
import {
    AiSupervizeMiniWorkshopRegistrationError,
    submitAiSupervizeMiniWorkshopRegistration,
} from '@/businesses/ai-supervize-mini/workshopRegistrationApi';
import {
    createAiSupervizeMiniWorkshopPrice,
    formatCzechFreeSeatCount,
    getAiSupervizeMiniEventBySlug,
    getAiSupervizeMiniWorkshopAvailabilityByEventSlug,
    getAiSupervizeMiniWorkshopRegistrationState,
    getInitialAiSupervizeMiniEventSlug,
    isAiSupervizeMiniWorkshopFull,
    type AiSupervizeMiniInvoiceType,
    type AiSupervizeMiniWorkshopAvailability,
    type AiSupervizeMiniWorkshopRegistrationState,
} from '@/businesses/ai-supervize-mini/workshopRegistration';
import { DiscountCodeField } from '@/components/discounts/DiscountCodeField';
import { EventTermOptionList } from '@/components/events/EventTermOptionList';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { MAXIMAL_EVENT_PARTICIPANT_COUNT } from '@/lib/events/eventConstants';
import { formatEventFormat } from '@/lib/events/eventLocation';
import {
    isNonEmptyEventOccurrenceList,
    type EventOccurrence,
    type NonEmptyEventOccurrenceList,
} from '@/lib/events/eventOccurrence';
import { formatCzechKoruna } from '@/lib/events/eventPrice';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Loader2, Users } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

type InterestReason = 'date-does-not-work' | 'price-too-high' | 'different-format' | 'other';
type ContactFieldsState = {
    fullname: string;
    email: string;
    company: string;
    note: string;
};

const interestReasonOptions: ReadonlyArray<{ value: InterestReason; label: string }> = [
    { value: 'date-does-not-work', label: 'Datum mi nevyhovuje' },
    { value: 'price-too-high', label: 'Cena je pro mě příliš vysoká' },
    { value: 'different-format', label: 'Mám zájem o jiný formát (např. online)' },
    { value: 'other', label: 'Jiné (uveďte v poznámce)' },
];

function toggleInterestReason(
    current: ReadonlyArray<InterestReason>,
    reason: InterestReason,
    checked: boolean,
): InterestReason[] {
    if (checked) {
        return current.includes(reason) ? [...current] : [...current, reason];
    }

    return current.filter((value) => value !== reason);
}

function getContactFieldErrors({
    fullname,
    email,
    company,
}: Pick<ContactFieldsState, 'fullname' | 'email' | 'company'>) {
    return {
        fullnameError: fullname.trim() ? null : 'Vyplňte jméno a příjmení.',
        emailError: email.trim()
            ? isEmailAddressValid(email)
                ? null
                : 'Zadejte prosím platný e-mail.'
            : 'Vyplňte e-mail.',
        companyError: company.trim() ? null : 'Vyplňte firmu nebo fakturační jméno.',
    };
}

function buildContactNote(title: string, lines: ReadonlyArray<string>, payload: unknown) {
    return [title, ...lines, '', JSON.stringify(payload, null, 4)].join('\n');
}

type ContactFieldsProps = {
    idPrefix: string;
    state: ContactFieldsState;
    onChange: <TField extends keyof ContactFieldsState>(field: TField, value: ContactFieldsState[TField]) => void;
    showValidation: boolean;
    fullnameError: string | null;
    emailError: string | null;
    companyError: string | null;
    noteLabel?: string;
    notePlaceholder: string;
};

function ContactFields({
    idPrefix,
    state,
    onChange,
    showValidation,
    fullnameError,
    emailError,
    companyError,
    noteLabel = 'Poznámka',
    notePlaceholder,
}: ContactFieldsProps) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${idPrefix}-fullname`} className="text-sm font-semibold text-slate-700">
                        Jméno a příjmení
                    </label>
                    <Input
                        id={`${idPrefix}-fullname`}
                        name={`${idPrefix}-fullname`}
                        value={state.fullname}
                        onChange={(event) => onChange('fullname', event.target.value)}
                        placeholder="Jana Nováková"
                        aria-invalid={showValidation && !!fullnameError}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && fullnameError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                        autoComplete="name"
                    />
                    {showValidation && fullnameError && <p className="mt-1 text-xs text-red-600">{fullnameError}</p>}
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-email`} className="text-sm font-semibold text-slate-700">
                        E-mail
                    </label>
                    <Input
                        id={`${idPrefix}-email`}
                        name={`${idPrefix}-email`}
                        type="email"
                        value={state.email}
                        onChange={(event) => onChange('email', event.target.value)}
                        placeholder="jmeno@firma.cz"
                        aria-invalid={showValidation && !!emailError}
                        className={cn(
                            'mt-2 h-11',
                            showValidation && emailError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                        autoComplete="email"
                    />
                    {showValidation && emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                </div>
            </div>

            <div>
                <label htmlFor={`${idPrefix}-company`} className="text-sm font-semibold text-slate-700">
                    Firma / organizace
                </label>
                <Input
                    id={`${idPrefix}-company`}
                    name={`${idPrefix}-company`}
                    value={state.company}
                    onChange={(event) => onChange('company', event.target.value)}
                    placeholder="Firma s.r.o. / fyzická osoba"
                    aria-invalid={showValidation && !!companyError}
                    className={cn(
                        'mt-2 h-11',
                        showValidation && companyError && 'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                    )}
                    autoComplete="organization"
                />
                {showValidation && companyError && <p className="mt-1 text-xs text-red-600">{companyError}</p>}
            </div>

            <div>
                <label htmlFor={`${idPrefix}-note`} className="text-sm font-semibold text-slate-700">
                    {noteLabel}
                </label>
                <Textarea
                    id={`${idPrefix}-note`}
                    name={`${idPrefix}-note`}
                    value={state.note}
                    onChange={(event) => onChange('note', event.target.value)}
                    placeholder={notePlaceholder}
                    className="mt-2 min-h-[96px]"
                />
            </div>
        </>
    );
}

function clampParticipantCount(value: number, maximumParticipantCount: number): number {
    if (!Number.isFinite(value)) {
        return 1;
    }

    return Math.min(Math.max(Math.round(value), 1), Math.max(1, maximumParticipantCount));
}

function getParticipantCountError(
    registrationState: AiSupervizeMiniWorkshopRegistrationState,
    availableSeatCount: number,
): string | null {
    if (registrationState === 'unavailable') {
        return 'Aktuální počet volných míst se nepodařilo ověřit.';
    }

    return registrationState === 'does-not-fit'
        ? `Počet účastníků musí být mezi 1 a ${availableSeatCount}.`
        : null;
}

/**
 * How many people still fit into one term, as the term picker says it
 *
 * Note: A term whose capacity could not be read says so, a term nobody has to be turned away from says it has room,
 *       and a full term offers the waiting list instead of a number.
 */
function formatEventSeatCount(
    event: EventOccurrence,
    workshopAvailability: AiSupervizeMiniWorkshopAvailability | null,
): string {
    if (workshopAvailability === null) {
        return 'Kapacitu ověřujeme';
    }

    if (isAiSupervizeMiniWorkshopFull(workshopAvailability)) {
        return 'Termín je obsazený · čekací listina';
    }

    if (workshopAvailability.remainingSeatCount === null || event.event.maximumParticipantCount === null) {
        return 'Volná kapacita';
    }

    return `${formatCzechFreeSeatCount(workshopAvailability.remainingSeatCount)} z ${
        event.event.maximumParticipantCount
    }`;
}

type AiSupervizeMiniRegistrationFormProps = {
    /**
     * The published terms a visitor can register for, as the administration of events published them
     */
    readonly events: readonly EventOccurrence[];
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;
    readonly initialWorkshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[] | null;
};

/**
 * What the page offers while no term of the workshop is published
 *
 * Note: A workshop without a published term deliberately offers nothing to register for rather than a form which
 *       could not be submitted.
 */
function AiSupervizeMiniNoEventNotice() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-slate-950">Připravujeme další termín</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Teď není vypsaný žádný termín. Nový sem přidáme, jakmile ho potvrdíme.
            </p>
        </div>
    );
}

export function AiSupervizeMiniRegistrationForm(props: AiSupervizeMiniRegistrationFormProps) {
    if (!isNonEmptyEventOccurrenceList(props.events)) {
        return <AiSupervizeMiniNoEventNotice />;
    }

    return <AiSupervizeMiniEventRegistrationForm {...props} events={props.events} />;
}

type AiSupervizeMiniEventRegistrationFormProps = AiSupervizeMiniRegistrationFormProps & {
    readonly events: NonEmptyEventOccurrenceList;
};

function AiSupervizeMiniEventRegistrationForm({
    events,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
    initialWorkshopAvailabilities,
}: AiSupervizeMiniEventRegistrationFormProps) {
    const [firstEvent] = events;
    const [selectedEventSlug, setSelectedEventSlug] = useState<string>(
        () => getInitialAiSupervizeMiniEventSlug(events, initialActiveDiscountByPlaceId) ?? firstEvent.slug,
    );
    const selectedEvent = getAiSupervizeMiniEventBySlug(events, selectedEventSlug) ?? firstEvent;
    const [workshopAvailabilities, setWorkshopAvailabilities] = useState(initialWorkshopAvailabilities);
    const selectedWorkshopAvailability =
        workshopAvailabilities === null
            ? null
            : getAiSupervizeMiniWorkshopAvailabilityByEventSlug(workshopAvailabilities, selectedEvent.slug);
    const isAvailabilityKnown = selectedWorkshopAvailability !== null;

    // A term nobody has to be turned away from has no number of free seats, so it is only ever limited by the highest
    // number of people one registration can be written for.
    const remainingSeatCount = selectedWorkshopAvailability?.remainingSeatCount ?? null;
    const availableSeatCount = remainingSeatCount ?? MAXIMAL_EVENT_PARTICIPANT_COUNT;
    const [participantCount, setParticipantCount] = useState(1);
    const registrationState = getAiSupervizeMiniWorkshopRegistrationState(
        selectedWorkshopAvailability,
        participantCount,
    );
    const isSelectedWorkshopFull = registrationState === 'waitlisted';
    const maximumRegistrationParticipantCount = isSelectedWorkshopFull
        ? selectedEvent.event.maximumParticipantCount ?? MAXIMAL_EVENT_PARTICIPANT_COUNT
        : availableSeatCount;
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [invoiceType, setInvoiceType] = useState<AiSupervizeMiniInvoiceType>('company');
    const [billingDetails, setBillingDetails] = useState('');
    const discountCodeValidation = useDiscountCodeValidation({
        initialDiscountCode,
        initialActiveDiscountByPlaceId,
        discountPlaceId: getAiSupervizeMiniDiscountPlaceId(selectedEvent.event.locationKind),
    });
    const activeDiscount = discountCodeValidation.activeDiscount;
    const isDiscountApplied = activeDiscount !== null;
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionOutcome, setSubmissionOutcome] = useState<'confirmed' | 'waitlisted' | null>(null);
    const [showValidation, setShowValidation] = useState(false);
    const [isInterestDialogOpen, setIsInterestDialogOpen] = useState(false);
    const [interestForm, setInterestForm] = useState<ContactFieldsState>({
        fullname: '',
        email: '',
        company: '',
        note: '',
    });
    const [interestReasons, setInterestReasons] = useState<InterestReason[]>([]);
    const [isInterestSubmitting, setIsInterestSubmitting] = useState(false);
    const [interestError, setInterestError] = useState<string | null>(null);
    const [interestSuccess, setInterestSuccess] = useState(false);
    const [showInterestValidation, setShowInterestValidation] = useState(false);

    useEffect(() => {
        setWorkshopAvailabilities(initialWorkshopAvailabilities);
    }, [initialWorkshopAvailabilities]);

    useEffect(() => {
        setParticipantCount((count) => clampParticipantCount(count, maximumRegistrationParticipantCount));
    }, [maximumRegistrationParticipantCount]);

    const price = useMemo(() => {
        return createAiSupervizeMiniWorkshopPrice(selectedEvent, participantCount, activeDiscount);
    }, [activeDiscount, participantCount, selectedEvent]);

    const participantError = getParticipantCountError(registrationState, availableSeatCount);
    const { fullnameError, emailError, companyError } = getContactFieldErrors({ fullname, email, company });
    const billingDetailsError = billingDetails.trim() ? null : 'Vyplňte fakturační údaje.';
    const canSubmit =
        isAvailabilityKnown && !participantError && !fullnameError && !emailError && !companyError && !billingDetailsError;
    const interestFieldErrors = getContactFieldErrors(interestForm);
    const interestReasonsError =
        interestReasons.length > 0 ? null : 'Vyberte alespoň jeden důvod, proč se nemůžete zúčastnit.';
    const canSubmitInterest =
        !interestFieldErrors.fullnameError &&
        !interestFieldErrors.emailError &&
        !interestFieldErrors.companyError &&
        !interestReasonsError;

    const updateInterestField = <TField extends keyof ContactFieldsState>(
        field: TField,
        value: ContactFieldsState[TField],
    ) => {
        setInterestForm((current) => ({ ...current, [field]: value }));
    };

    const resetInterestForm = () => {
        setInterestForm({
            fullname: '',
            email: '',
            company: '',
            note: '',
        });
        setInterestReasons([]);
        setInterestError(null);
        setInterestSuccess(false);
        setShowInterestValidation(false);
        setIsInterestSubmitting(false);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmit) {
            setShowValidation(true);
            setError('Vyplňte prosím jméno, platný e-mail, firmu/fakturační jméno a fakturační údaje.');
            return;
        }

        setShowValidation(false);
        setIsSubmitting(true);
        setError(null);

        try {
            const registrationResult = await submitAiSupervizeMiniWorkshopRegistration({
                eventSlug: selectedEvent.slug,
                participantCount,
                fullname,
                email,
                company,
                invoiceType,
                billingDetails,
                userNote: note,
                discountCode: discountCodeValidation.discountCode,
            });
            setWorkshopAvailabilities(registrationResult.workshopAvailabilities);
            setSubmissionOutcome(registrationResult.isWaitlisted ? 'waitlisted' : 'confirmed');
        } catch (error) {
            if (error instanceof AiSupervizeMiniWorkshopRegistrationError && error.workshopAvailabilities !== null) {
                setWorkshopAvailabilities(error.workshopAvailabilities);
            }

            setError(error instanceof Error ? error.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInterestSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canSubmitInterest) {
            setShowInterestValidation(true);
            setInterestError('Vyplňte prosím jméno, platný e-mail, firmu a alespoň jeden důvod.');
            return;
        }

        setShowInterestValidation(false);
        setIsInterestSubmitting(true);
        setInterestError(null);

        const selectedReasons = interestReasonOptions
            .filter((reason) => interestReasons.includes(reason.value))
            .map((reason) => reason.label);

        const payload = {
            workshop: 'AI Supervize Mini',
            leadType: 'Interested, but cannot attend current workshop',
            reasons: selectedReasons,
            fullname: interestForm.fullname,
            email: interestForm.email,
            company: interestForm.company,
            userNote: interestForm.note || null,
        };

        const contactNote = buildContactNote(
            'AI Supervize Mini interest without current attendance',
            [
                `Reason count: ${selectedReasons.length}`,
                `Reasons: ${selectedReasons.join(', ')}`,
                `Original registration CTA opened from current workshop section: yes`,
            ],
            payload,
        );

        try {
            await subscribeToWaitlist({
                fullname: interestForm.fullname,
                email: interestForm.email,
                placeName: AI_SUPERVIZE_MINI_WORKSHOP_INTEREST_PLACE_NAME,
                note: contactNote,
            });
            setInterestSuccess(true);
        } catch (err) {
            setInterestError(err instanceof Error ? err.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
        } finally {
            setIsInterestSubmitting(false);
        }
    };

    if (submissionOutcome !== null) {
        return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                    {submissionOutcome === 'waitlisted' ? 'Jste na čekací listině' : 'Přihláška je odeslaná'}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {submissionOutcome === 'waitlisted'
                        ? 'Termín je plný. Máme vás na čekací listině a ozveme se, jakmile se místo uvolní.'
                        : 'Ozveme se e-mailem. Pošleme potvrzení termínu, fakturu a praktické informace k workshopu.'}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase text-cyan-700">Registrace</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Vyberte termín a formát</h2>
                </div>
                <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
                    <div className="text-xs text-slate-300">{formatEventFormat(selectedEvent.event)}</div>
                    <div className="text-2xl font-bold">{formatCzechKoruna(price.finalPriceCzk)}</div>
                    {activeDiscount !== null && (
                        <div className="text-xs text-cyan-300">Sleva {activeDiscount.percent} % započtena</div>
                    )}
                </div>
            </div>

            <div className="mt-6 space-y-6">
                <div>
                    <label className="text-sm font-semibold text-slate-700">Termín workshopu</label>
                    <EventTermOptionList
                        terms={events}
                        selectedTermSlug={selectedEvent.slug}
                        onSelectTerm={(event) => setSelectedEventSlug(event.slug)}
                        noteIcon={Users}
                        createNoteText={(event) =>
                            formatEventSeatCount(
                                event,
                                workshopAvailabilities === null
                                    ? null
                                    : getAiSupervizeMiniWorkshopAvailabilityByEventSlug(
                                          workshopAvailabilities,
                                          event.slug,
                                      ),
                            )
                        }
                        className="mt-3"
                    />
                </div>

                {isSelectedWorkshopFull && (
                    <div
                        role="alert"
                        className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
                    >
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <div>
                            <p className="font-semibold">Tento termín je už plně obsazený.</p>
                            <p className="mt-1 leading-relaxed text-amber-900">
                                Přihlášku i tak pošlete. Dáme vás na čekací listinu a ozveme se, jakmile se místo
                                uvolní.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="participants" className="text-sm font-semibold text-slate-700">
                            Počet účastníků
                        </label>
                        <Input
                            id="participants"
                            name="participants"
                            type="number"
                            min={1}
                            max={Math.max(1, maximumRegistrationParticipantCount)}
                            value={participantCount}
                            onChange={(event) =>
                                setParticipantCount(
                                    clampParticipantCount(Number(event.target.value), maximumRegistrationParticipantCount),
                                )
                            }
                            disabled={!isAvailabilityKnown}
                            aria-invalid={showValidation && !!participantError}
                            className={cn(
                                'mt-2 h-11',
                                showValidation &&
                                    participantError &&
                                    'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                            )}
                        />
                        <p
                            className={cn(
                                'mt-1 text-xs text-slate-500',
                                showValidation && participantError && 'text-red-600',
                            )}
                        >
                            {showValidation && participantError
                                ? participantError
                                : isAvailabilityKnown
                                ? isSelectedWorkshopFull
                                    ? `Na čekací listinu můžete přihlásit až ${maximumRegistrationParticipantCount} účastníků.`
                                    : remainingSeatCount === null
                                    ? 'Počet účastníků u tohoto termínu neomezujeme.'
                                    : `Maximum pro tento termín: ${remainingSeatCount}`
                                : 'Kapacitu ověřujeme.'}
                        </p>
                    </div>
                    <DiscountCodeField inputId="discount" validation={discountCodeValidation} />
                </div>

                <ContactFields
                    idPrefix="registration"
                    state={{ fullname, email, company, note }}
                    onChange={(field, value) => {
                        if (field === 'fullname') setFullname(value);
                        if (field === 'email') setEmail(value);
                        if (field === 'company') setCompany(value);
                        if (field === 'note') setNote(value);
                    }}
                    showValidation={showValidation}
                    fullnameError={fullnameError}
                    emailError={emailError}
                    companyError={companyError}
                    notePlaceholder="Co řešíte, kolik lidí posíláte, na co se chcete zeptat..."
                />

                <div>
                    <label className="text-sm font-semibold text-slate-700">Fakturace</label>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {[
                            { id: 'company' as const, label: 'Firma' },
                            { id: 'individual' as const, label: 'Jednotlivec' },
                        ].map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={invoiceType === option.id}
                                onClick={() => setInvoiceType(option.id)}
                                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                                    invoiceType === option.id
                                        ? 'border-cyan-500 bg-cyan-50 text-slate-950 ring-2 ring-cyan-100'
                                        : 'border-slate-200 text-slate-600 hover:border-cyan-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="billingDetails" className="text-sm font-semibold text-slate-700">
                        Fakturační údaje
                    </label>
                    <Textarea
                        id="billingDetails"
                        name="billingDetails"
                        value={billingDetails}
                        onChange={(event) => setBillingDetails(event.target.value)}
                        placeholder="Název, IČO/DIČ nebo adresa pro fakturaci"
                        aria-invalid={showValidation && !!billingDetailsError}
                        className={cn(
                            'mt-2 min-h-[96px]',
                            showValidation &&
                                billingDetailsError &&
                                'border-red-300 bg-red-50/70 focus-visible:ring-red-200',
                        )}
                    />
                    {showValidation && billingDetailsError && (
                        <p className="mt-1 text-xs text-red-600">{billingDetailsError}</p>
                    )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex justify-between gap-4">
                        <span>Základní cena</span>
                        <strong className="text-slate-900">{formatCzechKoruna(price.basePriceCzk)}</strong>
                    </div>
                    <div className="mt-2 flex justify-between gap-4">
                        <span>Sleva</span>
                        <strong className={isDiscountApplied ? 'text-emerald-700' : 'text-slate-900'}>
                            {isDiscountApplied ? `-${formatCzechKoruna(price.discountAmountCzk)}` : '0 Kč'}
                        </strong>
                    </div>
                    <div className="mt-3 flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
                        <span className="font-semibold text-slate-900">Celkem</span>
                        <strong className="text-slate-950">{formatCzechKoruna(price.finalPriceCzk)}</strong>
                    </div>
                    <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500">Nejsme plátci DPH.</p>
                </div>

                {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="h-12 w-full rounded-xl bg-promptbook-blue-dark text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Odesílám registraci
                        </>
                    ) : (
                        isSelectedWorkshopFull ? 'Přidat na čekací listinu' : 'Rezervovat workshop'
                    )}
                </Button>

                <PersonalDataConsentNote language="cs" className="text-center" />

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsInterestDialogOpen(true)}
                        className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-700"
                    >
                        Nemůžu se zúčastnit, ale mám zájem o další termíny nebo jiný formát
                    </button>
                </div>
            </div>

            <Dialog
                open={isInterestDialogOpen}
                onOpenChange={(open) => {
                    if (isInterestSubmitting) {
                        return;
                    }

                    setIsInterestDialogOpen(open);
                    if (!open) {
                        resetInterestForm();
                    }
                }}
            >
                <DialogContent className="max-w-2xl rounded-2xl border-slate-200 p-0">
                    {interestSuccess ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="mt-5 text-2xl font-bold text-slate-950">Děkujeme za zájem</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Máme to zapsané. Ozveme se, až vypíšeme termín nebo formát, který by vám mohl sednout.
                            </p>
                            <Button
                                type="button"
                                onClick={() => {
                                    setIsInterestDialogOpen(false);
                                    resetInterestForm();
                                }}
                                className="mt-6 bg-promptbook-blue-dark hover:bg-promptbook-blue-dark/90"
                            >
                                Zavřít
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleInterestSubmit} className="space-y-6 p-6 sm:p-8">
                            <DialogHeader className="space-y-3 text-left">
                                <DialogTitle className="text-2xl font-bold text-slate-950">
                                    Tenhle termín vám nevyjde?
                                </DialogTitle>
                                <DialogDescription className="text-sm leading-relaxed text-slate-600">
                                    Napište nám, co nesedí. Podle toho vypisujeme další termíny a formáty.
                                </DialogDescription>
                            </DialogHeader>

                            <div>
                                <p className="text-sm font-semibold text-slate-700">Co vám nesedí</p>
                                <div className="mt-3 grid gap-3">
                                    {interestReasonOptions.map((reason) => (
                                        <label
                                            key={reason.value}
                                            className={cn(
                                                'flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 transition-colors',
                                                showInterestValidation &&
                                                    interestReasonsError &&
                                                    'border-red-300 bg-red-50/40',
                                            )}
                                        >
                                            <Checkbox
                                                checked={interestReasons.includes(reason.value)}
                                                onCheckedChange={(checked) => {
                                                    setInterestReasons((current) =>
                                                        toggleInterestReason(current, reason.value, checked === true),
                                                    );
                                                }}
                                                className="mt-0.5"
                                            />
                                            <span>{reason.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {showInterestValidation && interestReasonsError && (
                                    <p className="mt-2 text-xs text-red-600">{interestReasonsError}</p>
                                )}
                            </div>

                            <ContactFields
                                idPrefix="interest"
                                state={interestForm}
                                onChange={updateInterestField}
                                showValidation={showInterestValidation}
                                fullnameError={interestFieldErrors.fullnameError}
                                emailError={interestFieldErrors.emailError}
                                companyError={interestFieldErrors.companyError}
                                notePlaceholder="Jaký termín nebo formát by vám sedl líp?"
                            />

                            {interestError && (
                                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{interestError}</p>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsInterestDialogOpen(false);
                                        resetInterestForm();
                                    }}
                                    disabled={isInterestSubmitting}
                                >
                                    Zrušit
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isInterestSubmitting}
                                    className="bg-promptbook-blue-dark hover:bg-promptbook-blue-dark/90"
                                >
                                    {isInterestSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Odesílám odpověď
                                        </>
                                    ) : (
                                        'Odeslat odpověď'
                                    )}
                                </Button>
                            </div>

                            <PersonalDataConsentNote language="cs" />
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </form>
    );
}
