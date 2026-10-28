import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { loadAdminJoinedContacts } from '@/lib/admin/adminContactDatabase';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    CONTACT_DRAFT_FIELD_NAMES,
    CONTACT_EDITABLE_TEXT_FIELD_NAMES,
    type ContactChanges,
} from '@/lib/contacts/Contact';
import {
    createContactsUnreachableResponse,
    getContactsTableOrNull,
    insertContact,
} from '@/lib/contacts/contactsDatabase';
import { readContactTextFields } from '@/lib/contacts/readContactTextFields';
import { getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { NextRequest, NextResponse } from 'next/server';

const MANUAL_CONTACT_USER_AGENT = 'Manual entry';
const CONTACT_ID_COLUMN = 'id';
const ONE_CONTACT_LIMIT = 1;

type ScopableContactMutation<ScopedMutation> = {
    eq(
        column: string,
        value: number,
    ): {
        order(column: string): {
            limit(count: number): ScopedMutation;
        };
    };
};

function scopeMutationToOneContact<ScopedMutation>(
    mutation: ScopableContactMutation<ScopedMutation>,
    contactId: number,
): ScopedMutation {
    return mutation.eq(CONTACT_ID_COLUMN, contactId).order(CONTACT_ID_COLUMN).limit(ONE_CONTACT_LIMIT);
}

function readContactId(body: Readonly<Record<string, unknown>>): number | null {
    return typeof body.id === 'number' && Number.isSafeInteger(body.id) && body.id > 0 ? body.id : null;
}

function readContactChanges(body: Readonly<Record<string, unknown>>): ContactChanges | null {
    const textChanges = readContactTextFields(body, CONTACT_EDITABLE_TEXT_FIELD_NAMES);
    if (textChanges === null) {
        return null;
    }

    if (body.isContacted !== undefined && typeof body.isContacted !== 'boolean') {
        return null;
    }

    return {
        ...textChanges,
        ...(body.isContacted === undefined ? {} : { isContacted: body.isContacted }),
    };
}

export async function GET(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createContactsUnreachableResponse();
    }

    const isLoadingAll = request.nextUrl.searchParams.get('showAll') === 'true';
    const { contacts, errorMessage } = await loadAdminJoinedContacts(supabase, { isLoadingAll });
    return contacts === null
        ? NextResponse.json({ error: errorMessage }, { status: 500 })
        : NextResponse.json({ contacts }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactId = readContactId(body);
    if (contactId === null) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const contactChanges = readContactChanges(body);
    if (contactChanges === null) {
        return NextResponse.json({ error: 'Contact fields must be text or boolean values' }, { status: 400 });
    }
    if (Object.keys(contactChanges).length === 0) {
        return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { data, error } = await scopeMutationToOneContact(contactsTable.update(contactChanges), contactId)
        .select()
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return data === null ? NextResponse.json({ error: 'Contact not found' }, { status: 404 }) : NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactDraft = readContactTextFields(body, CONTACT_DRAFT_FIELD_NAMES);
    if (contactDraft === null) {
        return NextResponse.json({ error: 'Contact fields must be text values' }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { contact, errorMessage } = await insertContact(contactsTable, {
        ...contactDraft,
        userAgent: MANUAL_CONTACT_USER_AGENT,
        ipAddress: null,
        referrer: null,
        url: null,
    });
    return contact === null ? NextResponse.json({ error: errorMessage }, { status: 500 }) : NextResponse.json(contact);
}

export async function DELETE(request: NextRequest) {
    const unauthorizedResponse = await getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactId = readContactId(body);
    if (contactId === null) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { data, error } = await scopeMutationToOneContact(contactsTable.delete(), contactId)
        .select('id')
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return data === null
        ? NextResponse.json({ error: 'Contact not found' }, { status: 404 })
        : NextResponse.json({ success: true });
}
