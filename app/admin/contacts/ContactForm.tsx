'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ContactEditableTextFieldName, ContactTextValues } from '@/lib/contacts/Contact';
import { getContactColumnDefinition } from '@/lib/contacts/contactColumnDefinitions';
import type { FormEvent } from 'react';
import { useId, useState } from 'react';

/**
 * How one contact field is filled in
 *
 * Note: The label is not written down here, both the contacts table and this form read it from the column definition
 */
type ContactFormFieldControl = {
    readonly fieldName: ContactEditableTextFieldName;
    readonly inputType?: string;
    readonly isMultiline?: boolean;
};

/**
 * Every field a contact form can offer, in the order in which they are shown
 *
 * Note: The notes come last, because each of them takes the full width of the form
 */
const CONTACT_FORM_FIELD_CONTROLS: readonly ContactFormFieldControl[] = [
    { fieldName: 'fullname', inputType: 'text' },
    { fieldName: 'email', inputType: 'email' },
    { fieldName: 'phone', inputType: 'tel' },
    { fieldName: 'appName', inputType: 'text' },
    { fieldName: 'placeName', inputType: 'text' },
    { fieldName: 'userNote', isMultiline: true },
    { fieldName: 'ourNote', isMultiline: true },
];

type ContactFormProps<FieldName extends ContactEditableTextFieldName> = {
    readonly fieldNames: readonly FieldName[];
    readonly initialContactValues: ContactTextValues<FieldName>;
    readonly saveButtonLabel: string;
    readonly onSaveContact: (contactValues: ContactTextValues<FieldName>, isContacted: boolean) => Promise<boolean>;
    readonly onContactSaved?: () => void;
    readonly onCancel?: () => void;
    readonly isAutosaveEnabled?: boolean;
    readonly initialIsContacted?: boolean;
};

/**
 * Fields shared by the create-contact and edit-contact dialogs, only the ones the caller asks for
 */
export function ContactForm<FieldName extends ContactEditableTextFieldName>(props: ContactFormProps<FieldName>) {
    const { fieldNames, initialContactValues, saveButtonLabel, onSaveContact, onContactSaved, onCancel, isAutosaveEnabled = false, initialIsContacted } = props;
    const formId = useId();

    const [contactValues, setContactValues] = useState<ContactTextValues<FieldName>>(initialContactValues);
    const [isContacted, setIsContacted] = useState(initialIsContacted ?? false);
    const [isCreating, setIsCreating] = useState(false);
    const autosave = useAdminAutosave({ value: { contactValues, isContacted }, onSave: () => onSaveContact(contactValues, isContacted), isEnabled: isAutosaveEnabled });
    const isSaving = isCreating || autosave.isSaving;

    const shownFieldControls = CONTACT_FORM_FIELD_CONTROLS.filter(
        (fieldControl): fieldControl is ContactFormFieldControl & { readonly fieldName: FieldName } =>
            (fieldNames as readonly ContactEditableTextFieldName[]).includes(fieldControl.fieldName),
    );

    const changeContactValue = (fieldName: FieldName, fieldValue: string) => {
        setContactValues((previousContactValues) => ({ ...previousContactValues, [fieldName]: fieldValue }));
    };

    const handleSaveContact = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsCreating(!isAutosaveEnabled);

        let isSaved = false;
        try {
            isSaved = await (isAutosaveEnabled ? autosave.saveNow() : onSaveContact(contactValues, isContacted));
        } finally {
            setIsCreating(false);
        }

        if (isSaved) {
            onContactSaved?.();
        }
    };

    return (
        <form ref={autosave.formRef} onSubmit={handleSaveContact}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {shownFieldControls.map((fieldControl) => (
                    <label
                        key={fieldControl.fieldName}
                        className={fieldControl.isMultiline ? 'sm:col-span-2' : undefined}
                    >
                        <span id={`${formId}-${fieldControl.fieldName}`} className="mb-1 block text-sm font-medium">
                            {getContactColumnDefinition(fieldControl.fieldName).label}
                        </span>
                        {fieldControl.isMultiline ? (
                            <Textarea
                                aria-labelledby={`${formId}-${fieldControl.fieldName}`}
                                className="w-full"
                                value={contactValues[fieldControl.fieldName]}
                                onChange={(event) => changeContactValue(fieldControl.fieldName, event.target.value)}
                            />
                        ) : (
                            <Input
                                aria-labelledby={`${formId}-${fieldControl.fieldName}`}
                                type={fieldControl.inputType}
                                value={contactValues[fieldControl.fieldName]}
                                onChange={(event) => changeContactValue(fieldControl.fieldName, event.target.value)}
                            />
                        )}
                    </label>
                ))}
            </div>
            {initialIsContacted !== undefined && (
                <label className="mt-4 flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={isContacted} onChange={(event) => setIsContacted(event.target.checked)} /> Contacted
                </label>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : saveButtonLabel}
                </Button>
                {onCancel !== undefined && (
                    <Button type="button" variant="outline" disabled={isSaving} onClick={() => void runAfterAdminSaves(onCancel)}>
                        {isAutosaveEnabled ? 'Close' : 'Cancel'}
                    </Button>
                )}
            </div>
            {isAutosaveEnabled && <div className="mt-3"><AdminAutosaveStatus {...autosave} /></div>}
        </form>
    );
}
