import { ContactSubmissionEvidenceDetails } from './ContactSubmissionEvidenceDetails';
import { formatWorkshopPresenceDuration, formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { CONTACT_COLUMN_DEFINITIONS } from '@/lib/contacts/contactColumnDefinitions';
import { formatContactValueForDisplay } from '@/lib/contacts/contactValues';
import { getAdminContactPhoneNumbers, type AdminContactGroup } from '@/lib/admin/adminContactJoin';

type AdminContactDetailsProps = {
    readonly contactGroup: AdminContactGroup | null | undefined;
    readonly isContactRecordsIncluded: boolean;
    readonly isWorkshopParticipationsIncluded: boolean;
    readonly isWorkshopFeedbackIncluded?: boolean;
};

function getWorkshopParticipationLabel(contactGroup: AdminContactGroup): string {
    const workshopParticipationCount = contactGroup.workshopParticipations.length;
    return workshopParticipationCount === 1 ? '1 účast' : `${workshopParticipationCount} účasti`;
}

function AdminWorkshopParticipationDetails({ contactGroup }: { readonly contactGroup: AdminContactGroup }) {
    if (contactGroup.workshopParticipations.length === 0) {
        return <p className="text-xs text-slate-400">Bez účasti ve workshopu.</p>;
    }

    return (
        <details className="text-xs text-slate-600">
            <summary className="cursor-pointer font-medium text-cyan-800">
                {getWorkshopParticipationLabel(contactGroup)}
            </summary>
            <ul className="mt-2 space-y-2">
                {contactGroup.workshopParticipations.map((workshopParticipation) => (
                    <li key={workshopParticipation.participantId} className="border-l-2 border-cyan-200 pl-2">
                        <p className="font-medium text-slate-800">{workshopParticipation.workshopTitle}</p>
                        <p>
                            {formatWorkshopAdminDateTime(workshopParticipation.connectedAt)} · v místnosti{' '}
                            {formatWorkshopPresenceDuration(workshopParticipation.activeDurationSeconds)}
                        </p>
                    </li>
                ))}
            </ul>
        </details>
    );
}

function getWorkshopFeedbackLabel(contactGroup: AdminContactGroup): string {
    const workshopFeedbackCount = contactGroup.workshopFeedbacks?.length ?? 0;
    return workshopFeedbackCount === 1 ? '1 zpětná vazba' : `${workshopFeedbackCount} zpětné vazby`;
}

function AdminWorkshopFeedbackDetails({ contactGroup }: { readonly contactGroup: AdminContactGroup }) {
    const workshopFeedbacks = contactGroup.workshopFeedbacks ?? [];
    if (workshopFeedbacks.length === 0) {
        return <p className="text-xs text-slate-400">Bez zpětné vazby z workshopu.</p>;
    }

    return (
        <details className="text-xs text-slate-600">
            <summary className="cursor-pointer font-medium text-cyan-800">{getWorkshopFeedbackLabel(contactGroup)}</summary>
            <ul className="mt-2 space-y-3">
                {workshopFeedbacks.map((workshopFeedback) => (
                    <li key={workshopFeedback.id} className="border-l-2 border-amber-200 pl-2">
                        <p className="font-medium text-slate-800">
                            {workshopFeedback.workshopTitle} · {workshopFeedback.rating}/5 ★
                        </p>
                        <p>{formatWorkshopAdminDateTime(workshopFeedback.updatedAt)}</p>
                        {workshopFeedback.whatWasGood !== null && workshopFeedback.whatWasGood.trim() !== '' && (
                            <p className="mt-1 whitespace-pre-wrap break-words">
                                <span className="font-medium text-slate-700">Přínosné: </span>
                                {workshopFeedback.whatWasGood}
                            </p>
                        )}
                        {workshopFeedback.whatWasBad !== null && workshopFeedback.whatWasBad.trim() !== '' && (
                            <p className="mt-1 whitespace-pre-wrap break-words">
                                <span className="font-medium text-slate-700">Zlepšit: </span>
                                {workshopFeedback.whatWasBad}
                            </p>
                        )}
                        {workshopFeedback.note !== null && workshopFeedback.note.trim() !== '' && (
                            <p className="mt-1 whitespace-pre-wrap break-words">
                                <span className="font-medium text-slate-700">Vzkaz: </span>
                                {workshopFeedback.note}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </details>
    );
}

function AdminContactRecordDetails({ contactGroup }: { readonly contactGroup: AdminContactGroup }) {
    if (contactGroup.contacts.length === 0) {
        return <p className="text-xs text-slate-400">Bez odpovídajícího záznamu kontaktu.</p>;
    }

    const phoneNumbers = getAdminContactPhoneNumbers(contactGroup);

    return (
        <div className="space-y-2 text-xs text-slate-600">
            {phoneNumbers.length > 0 && (
                <p>
                    <span className="font-medium text-slate-700">Telefon: </span>
                    {phoneNumbers.join(', ')}
                </p>
            )}
            <details>
                <summary className="cursor-pointer font-medium text-cyan-800">
                    {contactGroup.contacts.length === 1
                        ? 'Úplné údaje kontaktu'
                        : `Úplné údaje kontaktu (${contactGroup.contacts.length} záznamy)`}
                </summary>
                <div className="mt-2 space-y-3">
                    {contactGroup.contacts.map((contact) => (
                        <dl key={contact.id} className="space-y-1 border-l-2 border-slate-200 pl-2">
                            <div><dt className="font-medium">Účel a zaznamenaná volba</dt><dd><ContactSubmissionEvidenceDetails evidence={contact.submissionEvidence} /></dd></div>
                            {CONTACT_COLUMN_DEFINITIONS.map((column) => {
                                const value = formatContactValueForDisplay(contact, column.key);
                                if (value === '') {
                                    return null;
                                }

                                return (
                                    <div key={column.key}>
                                        <dt className="inline font-medium text-slate-700">{column.label}: </dt>
                                        <dd className="inline break-words">{value}</dd>
                                    </div>
                                );
                            })}
                        </dl>
                    ))}
                </div>
            </details>
        </div>
    );
}

/**
 * Shows the information joined from another admin contact source without making any of that source public.
 */
export function AdminContactDetails({
    contactGroup,
    isContactRecordsIncluded,
    isWorkshopParticipationsIncluded,
    isWorkshopFeedbackIncluded = false,
}: AdminContactDetailsProps) {
    if (contactGroup === null || contactGroup === undefined) {
        return <span className="text-xs text-slate-400">Bez odpovídajícího kontaktu.</span>;
    }

    return (
        <div className="space-y-3">
            {isContactRecordsIncluded && <AdminContactRecordDetails contactGroup={contactGroup} />}
            {isWorkshopParticipationsIncluded && <AdminWorkshopParticipationDetails contactGroup={contactGroup} />}
            {isWorkshopFeedbackIncluded && <AdminWorkshopFeedbackDetails contactGroup={contactGroup} />}
        </div>
    );
}
