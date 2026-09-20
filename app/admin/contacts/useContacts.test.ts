/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { AdminJoinedContact } from '@/lib/admin/adminContactJoin';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';
import { EMPTY_CONTACT_DRAFT } from '@/lib/contacts/Contact';
import { createContact, fetchContacts, updateContact } from '@/lib/contacts/contactsApiClient';
import { useContacts } from './useContacts';

vi.mock('@/lib/contacts/contactsApiClient', () => ({
    createContact: vi.fn(), fetchContacts: vi.fn(), updateContact: vi.fn(), deleteContact: vi.fn(),
}));

const CONTACT: AdminJoinedContact = {
    id: 1, createdAt: null, fullname: 'Example', email: 'example@example.com', phone: null,
    userNote: null, isContacted: false, isWaitlisted: false, ourNote: 'Old note', userAgent: null,
    ipAddress: null, referrer: null, appName: null, placeName: null, url: null,
    contactGroup: { normalizedEmail: 'example@example.com', contacts: [], workshopParticipations: [], workshopFeedbacks: [] },
};

afterEach(async () => {
    cleanup();
    await settleAdminSavesForTest();
    vi.resetAllMocks();
});

it('preserves inline edits when adding another contact refreshes an older list', async () => {
    vi.mocked(fetchContacts).mockResolvedValue([CONTACT]);
    vi.mocked(createContact).mockResolvedValue({ ...CONTACT, id: 2 });
    vi.mocked(updateContact).mockResolvedValue(CONTACT);
    const { result } = renderHook(() => useContacts());
    await act(async () => undefined);
    act(() => result.current.changeContact(CONTACT.id, { ourNote: 'Keep this draft' }));
    await act(async () => { await result.current.addContact(EMPTY_CONTACT_DRAFT); });
    expect(result.current.contacts[0].ourNote).toBe('Keep this draft');
});

it('does not treat a failed list refresh as a failed creation that should be repeated', async () => {
    vi.mocked(fetchContacts).mockResolvedValueOnce([CONTACT]).mockRejectedValueOnce(new Error('Refresh failed'));
    vi.mocked(createContact).mockResolvedValue({ ...CONTACT, id: 2 });
    const { result } = renderHook(() => useContacts());
    await act(async () => undefined);
    await act(async () => expect(await result.current.addContact(EMPTY_CONTACT_DRAFT)).toBe(true));
    expect(result.current.errorMessage).toBe('Refresh failed');
    expect(createContact).toHaveBeenCalledOnce();
});
