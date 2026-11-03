import type { Contact } from '@/lib/contacts/Contact';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';

/**
 * One workshop attendance that belongs to an admin contact identity.
 *
 * Note: This is a read model assembled only for the administration. The workshop participant and Contact rows stay
 *       independent records in the database.
 */
export type AdminWorkshopParticipation = {
    readonly participantId: string;
    readonly workshopId: string;
    readonly workshopKind: WorkshopKind;
    readonly workshopTitle: string;
    readonly workshopStartsAt: string;
    readonly workshopEndsAt: string | null;
    readonly fullname: string;
    readonly email: string;
    readonly connectedAt: string;
    readonly lastSeenAt: string;
    readonly activeDurationSeconds: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly upvoteCount: number;
    readonly isInteractionBanned: boolean;
    readonly isTrusted: boolean;
};

/**
 * One post-workshop review in the same private identity projection as Contact rows and workshop attendances.
 *
 * The feedback remains stored against its workshop participant. This is only the admin read model which lets a
 * contact's history explain the context of their rating without duplicating the source row.
 */
export type AdminWorkshopFeedback = {
    readonly id: string;
    readonly workshopId: string;
    readonly workshopKind: WorkshopKind;
    readonly workshopTitle: string;
    readonly workshopStartsAt: string;
    readonly workshopEndsAt: string | null;
    readonly participantId: string;
    readonly fullname: string;
    readonly email: string;
    readonly rating: number;
    readonly whatWasGood: string | null;
    readonly whatWasBad: string | null;
    readonly note: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

/**
 * Every source record known for one normalized e-mail address.
 */
export type AdminContactGroup = {
    /**
     * `null` means that this source has no usable e-mail address and must stay separate from every other source.
     */
    readonly normalizedEmail: string | null;
    readonly contacts: readonly Contact[];
    readonly workshopParticipations: readonly AdminWorkshopParticipation[];
    readonly workshopFeedbacks: readonly AdminWorkshopFeedback[];
};

/**
 * Admin-only relationship attached to records sent to an authenticated administrator.
 *
 * The property is optional so base workshop data stays usable in public and database-only code which must never load
 * contact information. Admin routes always set it explicitly, including `null` when no matching identity exists.
 */
export type AdminContactJoin = {
    readonly contactGroup?: AdminContactGroup | null;
};

/**
 * One Contact-table row enriched with all same-person source records.
 */
export type AdminJoinedContact = Contact & {
    readonly contactGroup: AdminContactGroup;
};

type MutableAdminContactGroup = {
    normalizedEmail: string | null;
    contacts: Contact[];
    workshopParticipations: AdminWorkshopParticipation[];
    workshopFeedbacks: AdminWorkshopFeedback[];
};

/**
 * Normalize the e-mail identity used only for joining private admin views.
 *
 * E-mail delivery is case-insensitive in practice, and a `+tag` is commonly used to label the same mailbox. The
 * database preserves the submitted spelling; this helper only decides which rows are shown as one person.
 */
export function normalizeAdminContactEmail(email: string | null | undefined): string | null {
    const trimmedEmail = email?.trim();
    if (trimmedEmail === undefined || trimmedEmail === '') {
        return null;
    }

    const emailParts = trimmedEmail.split('@');
    if (emailParts.length !== 2) {
        return null;
    }

    const [localPart, domainPart] = emailParts;
    const localPartWithoutTag = localPart.split('+', 1)[0]?.trim();
    const normalizedDomainPart = domainPart.trim().toLowerCase();

    if (localPartWithoutTag === undefined || localPartWithoutTag === '' || normalizedDomainPart === '') {
        return null;
    }

    return `${localPartWithoutTag.toLowerCase()}@${normalizedDomainPart}`;
}

function createMutableAdminContactGroup(normalizedEmail: string | null): MutableAdminContactGroup {
    return { normalizedEmail, contacts: [], workshopParticipations: [], workshopFeedbacks: [] };
}

function freezeAdminContactGroup(group: MutableAdminContactGroup): AdminContactGroup {
    return {
        normalizedEmail: group.normalizedEmail,
        contacts: group.contacts,
        workshopParticipations: group.workshopParticipations,
        workshopFeedbacks: group.workshopFeedbacks,
    };
}

/**
 * Group Contact rows and workshop attendances by their normalized e-mail identity.
 *
 * Sources without a usable e-mail deliberately each receive their own group. Treating two missing e-mail values as a
 * match would incorrectly merge unrelated people.
 */
export function createAdminContactGroups(
    contacts: readonly Contact[],
    workshopParticipations: readonly AdminWorkshopParticipation[],
    workshopFeedbacks: readonly AdminWorkshopFeedback[] = [],
): readonly AdminContactGroup[] {
    const groupedContactsByEmail = new Map<string, MutableAdminContactGroup>();
    const groupsInSourceOrder: MutableAdminContactGroup[] = [];

    const getGroupForEmail = (email: string | null): MutableAdminContactGroup => {
        if (email === null) {
            const standaloneGroup = createMutableAdminContactGroup(null);
            groupsInSourceOrder.push(standaloneGroup);
            return standaloneGroup;
        }

        const existingGroup = groupedContactsByEmail.get(email);
        if (existingGroup !== undefined) {
            return existingGroup;
        }

        const newGroup = createMutableAdminContactGroup(email);
        groupedContactsByEmail.set(email, newGroup);
        groupsInSourceOrder.push(newGroup);
        return newGroup;
    };

    for (const contact of contacts) {
        getGroupForEmail(normalizeAdminContactEmail(contact.email)).contacts.push(contact);
    }

    for (const workshopParticipation of workshopParticipations) {
        getGroupForEmail(normalizeAdminContactEmail(workshopParticipation.email)).workshopParticipations.push(
            workshopParticipation,
        );
    }

    for (const workshopFeedback of workshopFeedbacks) {
        getGroupForEmail(normalizeAdminContactEmail(workshopFeedback.email)).workshopFeedbacks.push(workshopFeedback);
    }

    return groupsInSourceOrder.map(freezeAdminContactGroup);
}

/**
 * Find the group of one e-mail in an already prepared identity projection.
 */
export function findAdminContactGroup(
    groups: readonly AdminContactGroup[],
    email: string | null | undefined,
): AdminContactGroup | null {
    const normalizedEmail = normalizeAdminContactEmail(email);
    if (normalizedEmail === null) {
        return null;
    }

    return groups.find((group) => group.normalizedEmail === normalizedEmail) ?? null;
}

function getFirstFilledContactTextValue(
    contacts: readonly Contact[],
    fieldName: Exclude<keyof Contact, 'id' | 'isContacted' | 'isWaitlisted'>,
): string | null {
    for (const contact of contacts) {
        const value = contact[fieldName];
        if (typeof value === 'string' && value.trim() !== '') {
            return value;
        }
    }

    return null;
}

function getFirstKnownContactBooleanState(
    contacts: readonly Contact[],
    fieldName: 'isContacted' | 'isWaitlisted',
): boolean | null {
    for (const contact of contacts) {
        const value = contact[fieldName];

        if (value !== null) {
            return value;
        }
    }

    return null;
}

function createMergedContact(group: AdminContactGroup): Contact {
    const primaryContact = group.contacts[0];
    if (primaryContact === undefined) {
        throw new Error('An admin contact group needs a Contact row before it can be shown in the contacts table.');
    }

    return {
        id: primaryContact.id,
        submissionEvidence: primaryContact.submissionEvidence,
        createdAt: getFirstFilledContactTextValue(group.contacts, 'createdAt'),
        fullname: getFirstFilledContactTextValue(group.contacts, 'fullname'),
        email: getFirstFilledContactTextValue(group.contacts, 'email'),
        phone: getFirstFilledContactTextValue(group.contacts, 'phone'),
        userNote: getFirstFilledContactTextValue(group.contacts, 'userNote'),
        isContacted: getFirstKnownContactBooleanState(group.contacts, 'isContacted'),
        isWaitlisted: getFirstKnownContactBooleanState(group.contacts, 'isWaitlisted'),
        ourNote: getFirstFilledContactTextValue(group.contacts, 'ourNote'),
        userAgent: getFirstFilledContactTextValue(group.contacts, 'userAgent'),
        ipAddress: getFirstFilledContactTextValue(group.contacts, 'ipAddress'),
        referrer: getFirstFilledContactTextValue(group.contacts, 'referrer'),
        appName: getFirstFilledContactTextValue(group.contacts, 'appName'),
        placeName: getFirstFilledContactTextValue(group.contacts, 'placeName'),
        url: getFirstFilledContactTextValue(group.contacts, 'url'),
    };
}

/**
 * Collapse same-person Contact rows into the one primary row displayed by the contacts administration.
 *
 * The first Contact row remains primary, preserving the database's newest-first order. Missing scalar values are
 * filled from another record in the same group, while the full source history remains available in `contactGroup`.
 */
export function createAdminJoinedContacts(groups: readonly AdminContactGroup[]): readonly AdminJoinedContact[] {
    return groups
        .filter((group) => group.contacts.length > 0)
        .map((group) => ({ ...createMergedContact(group), contactGroup: group }));
}

/**
 * Add the same shared contact group to an arbitrary admin record that carries an e-mail address.
 */
export function joinAdminContactGroup<Value extends { readonly email: string }>(
    value: Value,
    groups: readonly AdminContactGroup[],
): Value & Required<AdminContactJoin> {
    return { ...value, contactGroup: findAdminContactGroup(groups, value.email) };
}

function getDistinctFilledTextValues(values: readonly (string | null)[]): readonly string[] {
    const uniqueValues = new Set<string>();

    for (const value of values) {
        const trimmedValue = value?.trim();
        if (trimmedValue !== undefined && trimmedValue !== '') {
            uniqueValues.add(trimmedValue);
        }
    }

    return Array.from(uniqueValues);
}

/**
 * Every phone number recorded for this person, including a number only supplied in an older duplicate Contact row.
 */
export function getAdminContactPhoneNumbers(contactGroup: AdminContactGroup | null | undefined): readonly string[] {
    return contactGroup === null || contactGroup === undefined
        ? []
        : getDistinctFilledTextValues(contactGroup.contacts.map((contact) => contact.phone));
}

/**
 * A complete, readable representation of all Contact-table rows in a group for exports.
 */
export function formatAdminContactRecords(contactGroup: AdminContactGroup | null | undefined): string {
    if (contactGroup === null || contactGroup === undefined || contactGroup.contacts.length === 0) {
        return '';
    }

    return contactGroup.contacts
        .map((contact) =>
            [
                `Contact #${contact.id}`,
                `Created at: ${contact.createdAt ?? ''}`,
                `Full name: ${contact.fullname ?? ''}`,
                `Email: ${contact.email ?? ''}`,
                `Phone: ${contact.phone ?? ''}`,
                `User note: ${contact.userNote ?? ''}`,
                `Submission evidence (source-specific, not a current mailing permission): ${contact.submissionEvidence ? JSON.stringify(contact.submissionEvidence) : 'Not recorded; do not infer consent.'}`,
                `Is contacted: ${contact.isContacted === true ? 'yes' : contact.isContacted === false ? 'no' : ''}`,
                `Is waitlisted: ${contact.isWaitlisted === true ? 'yes' : contact.isWaitlisted === false ? 'no' : ''}`,
                `Our note: ${contact.ourNote ?? ''}`,
                `User agent: ${contact.userAgent ?? ''}`,
                `IP address: ${contact.ipAddress ?? ''}`,
                `Referrer: ${contact.referrer ?? ''}`,
                `App name: ${contact.appName ?? ''}`,
                `Place name: ${contact.placeName ?? ''}`,
                `URL: ${contact.url ?? ''}`,
            ].join('\n'),
        )
        .join('\n\n');
}

function getWorkshopParticipationKindLabel(workshopKind: WorkshopKind): string {
    if (workshopKind === 'community') {
        return 'Community';
    }

    return workshopKind === 'project' ? 'Project' : 'Workshop';
}

/**
 * A complete, readable representation of all workshop attendances in a group for exports.
 */
export function formatAdminWorkshopParticipations(contactGroup: AdminContactGroup | null | undefined): string {
    if (contactGroup === null || contactGroup === undefined || contactGroup.workshopParticipations.length === 0) {
        return '';
    }

    return contactGroup.workshopParticipations
        .map((workshopParticipation) =>
            [
                `${getWorkshopParticipationKindLabel(workshopParticipation.workshopKind)}: ${workshopParticipation.workshopTitle}`,
                `Workshop ID: ${workshopParticipation.workshopId}`,
                `Workshop starts at: ${workshopParticipation.workshopStartsAt}`,
                `Workshop ends at: ${workshopParticipation.workshopEndsAt ?? ''}`,
                `Participant ID: ${workshopParticipation.participantId}`,
                `Participant full name: ${workshopParticipation.fullname}`,
                `Participant email: ${workshopParticipation.email}`,
                `Joined at: ${workshopParticipation.connectedAt}`,
                `Last seen at: ${workshopParticipation.lastSeenAt}`,
                `Active duration seconds: ${workshopParticipation.activeDurationSeconds}`,
                `Comments: ${workshopParticipation.commentCount}`,
                `Reactions: ${workshopParticipation.reactionCount}`,
                `Comment upvotes: ${workshopParticipation.upvoteCount}`,
                `Trusted: ${workshopParticipation.isTrusted ? 'yes' : 'no'}`,
                `Interaction banned: ${workshopParticipation.isInteractionBanned ? 'yes' : 'no'}`,
            ].join('\n'),
        )
        .join('\n\n');
}

/**
 * A complete, readable representation of the feedback connected to one contact identity for private exports.
 */
export function formatAdminWorkshopFeedbacks(contactGroup: AdminContactGroup | null | undefined): string {
    const workshopFeedbacks = contactGroup?.workshopFeedbacks ?? [];
    if (workshopFeedbacks.length === 0) {
        return '';
    }

    return workshopFeedbacks
        .map((workshopFeedback) =>
            [
                `${getWorkshopParticipationKindLabel(workshopFeedback.workshopKind)}: ${workshopFeedback.workshopTitle}`,
                `Workshop ID: ${workshopFeedback.workshopId}`,
                `Participant ID: ${workshopFeedback.participantId}`,
                `Rating: ${workshopFeedback.rating}/5`,
                `What was good: ${workshopFeedback.whatWasGood ?? ''}`,
                `What was bad: ${workshopFeedback.whatWasBad ?? ''}`,
                `Note: ${workshopFeedback.note ?? ''}`,
                `Created at: ${workshopFeedback.createdAt}`,
                `Updated at: ${workshopFeedback.updatedAt}`,
            ].join('\n'),
        )
        .join('\n\n');
}
