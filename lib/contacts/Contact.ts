import type { ContactSubmissionEvidence } from './contactSubmissionPolicy';
/**
 * One contact (lead) as stored in the `Contact` table
 *
 * Note: The shape mirrors the database table, the admin dashboard only reads it, never changes its structure
 */
export type Contact = {
    readonly submissionEvidence?: ContactSubmissionEvidence | null;
    readonly id: number;
    readonly createdAt: string | null;
    readonly fullname: string | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly userNote: string | null;
    readonly isContacted: boolean | null;
    readonly isWaitlisted: boolean | null;
    readonly ourNote: string | null;
    readonly userAgent: string | null;
    readonly ipAddress: string | null;
    readonly referrer: string | null;
    readonly appName: string | null;
    readonly placeName: string | null;
    readonly url: string | null;
};

/**
 * Key of the contact field which is shown as one column of the contacts table
 *
 * Note: `id` is only a technical identifier, it is never shown as a column
 */
export type ContactColumnKey = Exclude<keyof Contact, 'id' | 'submissionEvidence'>;

/**
 * Key of a contact field which holds a text rather than a yes or no answer
 */
export type ContactTextColumnKey = Exclude<ContactColumnKey, 'isContacted' | 'isWaitlisted'>;

/**
 * Longest text one field of a contact may carry
 *
 * Note: The limit is far above anything a person fills into a form, it is here so that one request cannot fill the
 *       database with a single enormous note.
 */
export const MAXIMAL_CONTACT_TEXT_LENGTH = 10000;

/**
 * Fields which may be filled in when a contact is added manually through the dashboard
 */
export const CONTACT_DRAFT_FIELD_NAMES = ['fullname', 'email', 'phone', 'userNote', 'appName', 'placeName'] as const;

/**
 * Name of one manually maintained contact field
 */
export type ContactDraftFieldName = (typeof CONTACT_DRAFT_FIELD_NAMES)[number];

/**
 * Text fields which can be changed on an existing contact
 *
 * Note: `ourNote` is written only by us, so it is offered once the contact exists and never while it is being added
 */
export const CONTACT_EDITABLE_TEXT_FIELD_NAMES = [...CONTACT_DRAFT_FIELD_NAMES, 'ourNote'] as const;

/**
 * Name of one editable text field of an existing contact
 */
export type ContactEditableTextFieldName = (typeof CONTACT_EDITABLE_TEXT_FIELD_NAMES)[number];

/**
 * Fields which one of the public forms of the site fills in about the contact it gathers
 *
 * Note: Everything else which is stored about a contact - who the visitor is, from which address they came and whether
 *       we already answered them - is decided by the server, so that a forged request cannot pretend to be a different
 *       visitor or an already contacted lead.
 */
export const CONTACT_SUBMISSION_FIELD_NAMES = [
    'fullname',
    'email',
    'phone',
    'userNote',
    'placeName',
    'url',
    'referrer',
] as const;

/**
 * Name of one field which a public form fills in
 */
export type ContactSubmissionFieldName = (typeof CONTACT_SUBMISSION_FIELD_NAMES)[number];

/**
 * Values of the contact text fields which are filled in together by one form
 *
 * Note: A form works with empty strings while the database works with `null`, the contacts api turns one into the other
 */
export type ContactTextValues<FieldName extends ContactTextColumnKey = ContactEditableTextFieldName> = Readonly<
    Record<FieldName, string>
>;

/**
 * Values which one of the public forms sends when somebody leaves their contact
 */
export type ContactSubmission = ContactTextValues<ContactSubmissionFieldName>;

/**
 * Values which can be filled in when a contact is added manually through the dashboard
 */
export type ContactDraft = ContactTextValues<ContactDraftFieldName>;

/**
 * Read the given text fields of one contact, with every value which is not filled in as an empty string
 */
export function pickContactTextValues<FieldName extends ContactTextColumnKey>(
    contact: Readonly<Partial<Contact>>,
    fieldNames: readonly FieldName[],
): ContactTextValues<FieldName> {
    return Object.fromEntries(
        fieldNames.map((fieldName) => [fieldName, contact[fieldName] ?? ''] as const),
    ) as ContactTextValues<FieldName>;
}

/**
 * Empty contact draft used as the initial state of the "add contact" form
 */
export const EMPTY_CONTACT_DRAFT: ContactDraft = pickContactTextValues({}, CONTACT_DRAFT_FIELD_NAMES);

/**
 * Fields of an existing contact which can be changed from the dashboard
 */
export type ContactChanges = {
    readonly [fieldName in ContactEditableTextFieldName]?: string | null;
} & {
    readonly isContacted?: boolean;
};

/**
 * Everything which is known about a contact at the moment it is gathered
 *
 * Note: `isContacted` is deliberately not part of it - a contact which has just arrived was by definition not
 *       contacted yet, so nobody may say otherwise while writing it.
 */
export type NewContact = Readonly<Partial<Omit<Contact, 'id' | 'createdAt' | 'isContacted'>>>;
