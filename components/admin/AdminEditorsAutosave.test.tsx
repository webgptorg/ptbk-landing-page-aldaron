/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContactForm } from '@/app/admin/contacts/ContactForm';
import { WorkshopContentEditor } from '@/businesses/workshop-admin/WorkshopContentEditor';
import { ShortcodeLinkEditForm } from '@/components/shortener/ShortcodeLinkEditForm';
import { ADMIN_AUTOSAVE_DELAY_MILLISECONDS } from '@/lib/admin/AdminSaveQueue';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';
import { getPendingAdminSaves } from '@/lib/admin/adminPendingSaves';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { DiscountCodeForm } from './DiscountCodeForm';

const TIMESTAMP = '2026-09-01T12:00:00.000Z';
const MATERIAL: WorkshopContentBlock = {
    id: 'material', title: 'Original', bodyMarkdown: 'Material body', unlockAt: TIMESTAMP, sortOrder: 0,
    isPublished: true, isFollowUp: false, isPaidMembersOnly: false, linkClickCount: 0,
    createdAt: TIMESTAMP, updatedAt: TIMESTAMP,
};

beforeEach(() => vi.useFakeTimers());
afterEach(async () => { cleanup(); await settleAdminSavesForTest(); vi.useRealTimers(); });
async function saveChanges() {
    await act(async () => { await vi.advanceTimersByTimeAsync(ADMIN_AUTOSAVE_DELAY_MILLISECONDS); });
}

it('saves contact dialog edits without closing the dialog', async () => {
    const onSaveContact = vi.fn().mockResolvedValue(true);
    const onContactSaved = vi.fn();
    render(<ContactForm fieldNames={['email']} initialContactValues={{ email: 'old@example.com' }}
        saveButtonLabel="Save" isAutosaveEnabled onSaveContact={onSaveContact} onContactSaved={onContactSaved} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new@example.com' } });
    await saveChanges();
    expect(onSaveContact).toHaveBeenCalledWith({ email: 'new@example.com' });
    expect(onContactSaved).not.toHaveBeenCalled();
});

it('autosaves short-link destinations and keeps failed validation editable', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<ShortcodeLinkEditForm shortcodeLink={{ id: 1, shortcode: 'example', urls: ['https://example.com/'],
        note: '', landingPage: '', createdAt: TIMESTAMP, isAdHoc: false, sourceApp: 'admin-shortener' }}
        onSave={onSave} onCancelEditing={vi.fn()} />);
    fireEvent.change(screen.getByDisplayValue('https://example.com/'), { target: { value: 'invalid-url' } });
    await saveChanges();
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByDisplayValue('invalid-url'), { target: { value: 'https://new.example.com/' } });
    await saveChanges();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ urls: ['https://new.example.com/'] }));
});

it('autosaves existing discount codes without creating or closing them', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const onCancelEditing = vi.fn();
    render(<DiscountCodeForm discountCode={{ id: 'discount', code: 'EXAMPLE', percent: 10,
        startsAt: TIMESTAMP, endsAt: '2026-10-01T12:00:00.000Z', isEnabled: true, placeIds: [],
        maximumUseCount: null, subscriptionDiscountDurationMonths: null, useCount: 0, createdAt: TIMESTAMP, updatedAt: TIMESTAMP }}
        onSave={onSave} onCancelEditing={onCancelEditing} />);
    fireEvent.change(screen.getByLabelText('Slevový kód'), { target: { value: 'EDITED' } });
    await saveChanges();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ code: 'EDITED' }));
    expect(onCancelEditing).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Slevový kód')).toHaveProperty('value', 'EDITED');
    fireEvent.change(screen.getByLabelText('Konec platnosti'), { target: { value: '' } });
    await saveChanges();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Konec platnosti')).toHaveProperty('value', '');
    expect(getPendingAdminSaves()).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Konec platnosti'), { target: { value: '2026-10-02T14:00' } });
    await saveChanges();
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(getPendingAdminSaves()).toHaveLength(0);
});

it('unlocks a material with the latest unsaved text through the same save', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(<WorkshopContentEditor contentBlock={{ ...MATERIAL, isPublished: false }}
        defaultUnlockAt={TIMESTAMP} defaultSortOrder={0} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText('Markdown'), { target: { value: 'Latest material text' } });
    const unlockTimestamp = new Date().toISOString();
    fireEvent.click(screen.getByRole('button', { name: 'Odemknout hned' }));
    await saveChanges();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ bodyMarkdown: 'Latest material text',
        isPublished: true, unlockAt: unlockTimestamp }));
});

it('refreshes clean material fields without writing, and preserves a dirty material during refresh', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const props = { defaultUnlockAt: TIMESTAMP, defaultSortOrder: 0, onSave };
    const { rerender } = render(<WorkshopContentEditor contentBlock={MATERIAL} {...props} />);
    rerender(<WorkshopContentEditor contentBlock={{ ...MATERIAL, title: 'Remote change' }} {...props} />);
    expect(screen.getByLabelText('Nadpis')).toHaveProperty('value', 'Remote change');
    await saveChanges();
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Nadpis'), { target: { value: 'My draft' } });
    fireEvent.click(screen.getByLabelText('Jen pro placené členy'));
    rerender(<WorkshopContentEditor contentBlock={{ ...MATERIAL, title: 'Older snapshot' }} {...props} />);
    expect(screen.getByLabelText('Nadpis')).toHaveProperty('value', 'My draft');
    await saveChanges();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'My draft', isPaidMembersOnly: true }));
});
