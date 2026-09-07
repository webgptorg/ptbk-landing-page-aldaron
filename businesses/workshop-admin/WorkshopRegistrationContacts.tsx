'use client';

import { formatWorkshopRegisteredParticipantCount } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { Button } from '@/components/ui/button';
import { CONTACTS_EXPORT_FORMATS } from '@/lib/contacts/contactsExportFormats';
import { createWorkshopRegistrationContactsSelection } from '@/lib/contacts/contactsSelection';
import { buildContactsDashboardUrl, buildContactsExportUrl } from '@/lib/contacts/exportContacts';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { Download, ExternalLink, UserPlus } from 'lucide-react';
import Link from 'next/link';

type WorkshopRegistrationContactsProps = {
    /**
     * The selected term, including its durable registration identifiers and the count already shown in the picker.
     */
    readonly workshop: WorkshopAdminSummary;
};

/**
 * Gives an event term access to its landing-page registrations without creating another contact table or export path.
 *
 * Note: A registration may sign up a group, so the count names people while the list and exports name the Contact rows
 *       which recorded those registrations. Contacts remain maintained in their one administration.
 */
export function WorkshopRegistrationContacts({ workshop }: WorkshopRegistrationContactsProps) {
    if (workshop.event === null || workshop.registeredParticipantCount === null) {
        return null;
    }

    const contactsSelection = createWorkshopRegistrationContactsSelection(workshop);
    const contactsDashboardUrl = buildContactsDashboardUrl(contactsSelection);

    return (
        <section className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <UserPlus className="h-5 w-5 text-cyan-600" /> Registrovaní na webu
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {formatWorkshopRegisteredParticipantCount(workshop.registeredParticipantCount)} se přihlásilo
                        přes registrační formulář tohoto termínu.
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        Jejich kontakty zůstávají v jedné správě kontaktů; jeden záznam může přihlašovat více lidí.
                    </p>
                </div>
                <Button asChild type="button" variant="secondary" size="sm">
                    <Link href={contactsDashboardUrl}>
                        <ExternalLink className="mr-1.5 h-4 w-4" /> Otevřít kontakty
                    </Link>
                </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cyan-200 pt-4">
                <span className="text-sm font-medium text-slate-700">Exportovat registrované kontakty:</span>
                {CONTACTS_EXPORT_FORMATS.map((format) => (
                    <Button key={format.id} asChild type="button" variant="outline" size="sm">
                        <a
                            href={buildContactsExportUrl(format, contactsSelection)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download className="mr-1.5 h-4 w-4" /> {format.label}
                        </a>
                    </Button>
                ))}
            </div>
        </section>
    );
}
