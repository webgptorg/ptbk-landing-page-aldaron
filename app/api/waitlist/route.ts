import { readContactSubmissionEvidence } from '@/lib/contacts/contactSubmissionPolicy';
// app/api/waitlist/route.ts
import { APP_NAME } from '@/config';
import { readClientIpAddress } from '@/lib/api/readClientIpAddress';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { CONTACT_SUBMISSION_FIELD_NAMES } from '@/lib/contacts/Contact';
import {
    createContactsUnreachableResponse,
    getContactsTableOrNull,
    insertContact,
} from '@/lib/contacts/contactsDatabase';
import { readContactTextFields } from '@/lib/contacts/readContactTextFields';
import { isEmailAddressValid } from '@/lib/isEmailAddressValid';
import { NextRequest, NextResponse } from 'next/server';

/**
 * What is answered when the contact could not be written
 *
 * Note: Whatever the database said stays in the log of the server, an endpoint which anybody may ask never describes
 *       the inside of the database to them.
 */
const CONTACT_NOT_WRITTEN_ERROR_MESSAGE = 'The contact could not be saved, please try again';

/**
 * Write one contact which somebody left in a public form of the site
 *
 * Note: This is the only way a visitor reaches the `Contact` table, which row level security keeps closed for the
 *       public key of the database. The browser therefore says only what the person filled in and where they filled it
 *       in, everything else about them is read from the request here on the server.
 */
export async function POST(request: NextRequest) {
    const body = await readJsonObjectOrNull(request);
    if (body === null) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const contactTextFields = readContactTextFields(body, CONTACT_SUBMISSION_FIELD_NAMES);
    if (contactTextFields === null) {
        return NextResponse.json({ error: 'Contact fields must be text values' }, { status: 400 });
    }

    const email = contactTextFields.email;
    if (!email || !isEmailAddressValid(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const submissionEvidence = readContactSubmissionEvidence(body, contactTextFields.placeName ?? '');
    if (!submissionEvidence) {
        return NextResponse.json({ error: 'The form has changed. Reload the page and confirm your choice. / Formulář se změnil. Obnovte stránku a potvrďte svou volbu.' }, { status: 400 });
    }

    const contactsTable = getContactsTableOrNull();
    if (contactsTable === null) {
        return createContactsUnreachableResponse();
    }

    const { errorMessage } = await insertContact(contactsTable, {
        ...contactTextFields,
        submissionEvidence,
        appName: APP_NAME,
        userAgent: request.headers.get('user-agent'),
        ipAddress: readClientIpAddress(request),
    });

    if (errorMessage !== null) {
        console.error('Failed to write a gathered contact:', errorMessage);
        return NextResponse.json({ error: CONTACT_NOT_WRITTEN_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
