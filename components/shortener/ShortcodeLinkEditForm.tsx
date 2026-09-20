'use client';

import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { runAfterAdminSaves } from '@/lib/admin/adminPendingSaves';

import { ShortcodeLinkUrlListInput } from '@/components/shortener/ShortcodeLinkUrlListInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { isAbsoluteUrl } from '@/lib/shortener/isAbsoluteUrl';
import {
    createPublicShortcodeLinkUrl,
    type ShortcodeLink,
    type ShortcodeLinkValues,
} from '@/lib/shortener/shortcodeLink';
import { Save, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const LANDING_PAGE_PLACEHOLDER = '# Title\n> Description shown when the link is shared\n\n[Go to link](#url)';

type ShortcodeLinkEditFormProps = {
    readonly shortcodeLink: ShortcodeLink;
    readonly onSave: (values: ShortcodeLinkValues) => Promise<boolean>;
    readonly onCancelEditing: () => void;
};

function createShortcodeLinkValues(shortcodeLink: ShortcodeLink): ShortcodeLinkValues {
    return {
        shortcode: shortcodeLink.shortcode,
        urls: shortcodeLink.urls.length === 0 ? [''] : shortcodeLink.urls,
        note: shortcodeLink.note,
        landingPage: shortcodeLink.landingPage,
    };
}

/**
 * Edits one complete short link, so that an address which has already been handed out can be pointed elsewhere,
 * renamed, annotated or given a landing page without a second link being created for it.
 */
export function ShortcodeLinkEditForm({ shortcodeLink, onSave, onCancelEditing }: ShortcodeLinkEditFormProps) {
    const [values, setValues] = useState<ShortcodeLinkValues>(() => createShortcodeLinkValues(shortcodeLink));
    const [validationError, setValidationError] = useState<string | null>(null);

    const updateValue = <TField extends keyof ShortcodeLinkValues>(
        field: TField,
        value: ShortcodeLinkValues[TField],
    ) => {
        setValues((currentValues) => ({ ...currentValues, [field]: value }));
    };

    const saveValues = async () => {
        const filledUrls = values.urls.map((url) => url.trim()).filter((url) => url !== '');
        if (filledUrls.length === 0) {
            setValidationError('Please enter at least one URL');
            return false;
        }
        if (!filledUrls.every(isAbsoluteUrl)) {
            setValidationError('Every URL must be a valid absolute URL');
            return false;
        }

        setValidationError(null);
        return onSave({ ...values, urls: filledUrls });
    };

    const autosave = useAdminAutosave({ value: values, onSave: saveValues });
    const isSaving = autosave.isSaving;
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void autosave.saveNow();
    };

    return (
        <form ref={autosave.formRef} onSubmit={handleSubmit} className="rounded-2xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">Edit short link</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Renaming the shortcode changes the public address, so links already handed out stop working.
                    </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => void runAfterAdminSaves(onCancelEditing)} disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" /> Close
                </Button>
            </div>

            <div className="mt-6 space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                    Shortcode
                    <Input
                        value={values.shortcode}
                        onChange={(event) => updateValue('shortcode', event.target.value)}
                        className="mt-2 font-mono"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                    />
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                        {createPublicShortcodeLinkUrl(values.shortcode)}
                    </span>
                </label>

                <div className="text-sm font-medium text-slate-700">
                    URLs
                    <div className="mt-2">
                        <ShortcodeLinkUrlListInput
                            urls={values.urls}
                            onUrlsChange={(urls) => updateValue('urls', urls)}
                        />
                    </div>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                    Note (private)
                    <Input
                        value={values.note ?? ''}
                        onChange={(event) => updateValue('note', event.target.value)}
                        className="mt-2"
                        placeholder="What this link is for"
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Landing page (optional Markdown or HTML)
                    <Textarea
                        value={values.landingPage ?? ''}
                        onChange={(event) => updateValue('landingPage', event.target.value)}
                        className="mt-2 min-h-[160px] font-mono text-xs"
                        placeholder={LANDING_PAGE_PLACEHOLDER}
                    />
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                        Left empty, the link redirects straight away. Filled in, the visitor is shown this page, where
                        the <code>#url</code> header and link stand for the destination.
                    </span>
                </label>
            </div>

            {validationError !== null && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <AdminAutosaveStatus {...autosave} />
                <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
            </div>
        </form>
    );
}
