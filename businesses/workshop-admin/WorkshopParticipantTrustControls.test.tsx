/** @vitest-environment jsdom */

import { WorkshopParticipantTrustControls } from '@/businesses/workshop-admin/WorkshopParticipantTrustControls';
import type { WorkshopParticipantTrustSummary } from '@/lib/workshops/workshopParticipantTrustPolicy';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchSummaryMock, saveSettingMock, trustAllMock } = vi.hoisted(() => ({
    fetchSummaryMock: vi.fn(),
    saveSettingMock: vi.fn(),
    trustAllMock: vi.fn(),
}));

vi.mock('@/businesses/workshop-admin/workshopAdminApiClient', () => ({
    fetchAdminWorkshopParticipantTrustSummary: fetchSummaryMock,
    saveAdminWorkshopAutomaticParticipantTrust: saveSettingMock,
    trustAllAdminWorkshopParticipants: trustAllMock,
}));

const SUMMARY: WorkshopParticipantTrustSummary = {
    trustedCount: 2,
    untrustedCount: 3,
    moderatorCount: 1,
    eligibleCount: 3,
    eligibilityToken: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    isAutomaticTrustEnabled: false,
};

function renderControls(refreshVersion = 0) {
    const onParticipantsChanged = vi.fn().mockResolvedValue(undefined);
    const view = render(
        <WorkshopParticipantTrustControls
            workshopId="room-a"
            roomTitle="Ukázkový workshop"
            refreshVersion={refreshVersion}
            onParticipantsChanged={onParticipantsChanged}
        />,
    );
    return { ...view, onParticipantsChanged };
}

beforeEach(() => {
    fetchSummaryMock.mockReset().mockResolvedValue(SUMMARY);
    saveSettingMock.mockReset();
    trustAllMock.mockReset();
});
afterEach(cleanup);

describe('room participant trust controls', () => {
    it('shows room-wide, non-overlapping counts and disables the zero-person action', async () => {
        fetchSummaryMock.mockResolvedValue({ ...SUMMARY, trustedCount: 2, untrustedCount: 0, eligibleCount: 0 });
        renderControls();
        expect(await screen.findByText('Důvěryhodní: 2')).not.toBeNull();
        expect(screen.getByText('Nedůvěryhodní: 0')).not.toBeNull();
        expect(screen.getByText('Moderátoři: 1')).not.toBeNull();
        expect(screen.getByText(/včetně lidí mimo aktuální filtr a stránku/)).not.toBeNull();
        expect((screen.getByRole('button', { name: 'Důvěřovat všem (0)' }) as HTMLButtonElement).disabled).toBe(true);
        expect(trustAllMock).not.toHaveBeenCalled();
    });

    it('refreshes complete room counts when moderation or a new arrival refreshes the dashboard', async () => {
        const { rerender, onParticipantsChanged } = renderControls();
        expect(await screen.findByText('Nedůvěryhodní: 3')).not.toBeNull();
        fetchSummaryMock.mockResolvedValue({ ...SUMMARY, trustedCount: 3, untrustedCount: 2, eligibleCount: 2 });
        rerender(
            <WorkshopParticipantTrustControls
                workshopId="room-a"
                roomTitle="Ukázkový workshop"
                refreshVersion={1}
                onParticipantsChanged={onParticipantsChanged}
            />,
        );
        expect(await screen.findByText('Důvěryhodní: 3')).not.toBeNull();
        expect(screen.getByText('Nedůvěryhodní: 2')).not.toBeNull();
    });

    it('requires confirmation on every activation and cancellation changes nothing', async () => {
        trustAllMock.mockResolvedValue({
            kind: 'completed',
            changedCount: 3,
            summary: {
                ...SUMMARY,
                trustedCount: 5,
                untrustedCount: 0,
                eligibleCount: 0,
            },
        });
        const { onParticipantsChanged } = renderControls();
        fireEvent.click(await screen.findByRole('button', { name: 'Důvěřovat všem (3)' }));
        expect(await screen.findByText('Počet účastníků, kteří získají důvěru: 3.')).not.toBeNull();
        expect(screen.getByText(/čekající komentáře, odpovědi v anketách a komunitní projekty/)).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }));
        expect(trustAllMock).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Důvěřovat všem (3)' }));
        await screen.findByText('Počet účastníků, kteří získají důvěru: 3.');
        fireEvent.click(screen.getByRole('button', { name: 'Potvrdit udělení důvěry' }));
        await waitFor(() => expect(trustAllMock).toHaveBeenCalledExactlyOnceWith('room-a', SUMMARY.eligibilityToken));
        expect(await screen.findByText(/Počet dotčených účastníků: 3/)).not.toBeNull();
        expect(onParticipantsChanged).toHaveBeenCalledTimes(1);
    });

    it('reviews a changed set again before a second submission', async () => {
        const changedSummary = {
            ...SUMMARY,
            untrustedCount: 4,
            eligibleCount: 4,
            eligibilityToken: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        };
        trustAllMock.mockResolvedValueOnce({ kind: 'stale', summary: changedSummary }).mockResolvedValueOnce({
            kind: 'completed',
            changedCount: 4,
            summary: {
                ...changedSummary,
                trustedCount: 6,
                untrustedCount: 0,
                eligibleCount: 0,
            },
        });
        renderControls();
        fireEvent.click(await screen.findByRole('button', { name: 'Důvěřovat všem (3)' }));
        await screen.findByText('Počet účastníků, kteří získají důvěru: 3.');
        fireEvent.click(screen.getByRole('button', { name: 'Potvrdit udělení důvěry' }));
        expect(await screen.findByText(/Zkontrolujte nový počet a potvrďte akci znovu/)).not.toBeNull();
        expect(screen.getByText('Počet účastníků, kteří získají důvěru: 4.')).not.toBeNull();
        expect(trustAllMock).toHaveBeenCalledTimes(1);
        fireEvent.click(screen.getByRole('button', { name: 'Potvrdit udělení důvěry' }));
        await waitFor(() => expect(trustAllMock).toHaveBeenNthCalledWith(2, 'room-a', changedSummary.eligibilityToken));
    });

    it('keeps failed bulk and setting writes visible without claiming a new persisted state', async () => {
        trustAllMock.mockRejectedValue(new Error('Bulk write failed'));
        saveSettingMock.mockRejectedValue(new Error('Setting write failed'));
        renderControls();
        const switchControl = await screen.findByRole('switch', { name: /Automaticky důvěřovat/ });
        fireEvent.click(switchControl);
        expect(await screen.findByText(/Nastavení se nepodařilo uložit: Setting write failed/)).not.toBeNull();
        expect(switchControl.getAttribute('aria-checked')).toBe('false');

        fireEvent.click(screen.getByRole('button', { name: 'Důvěřovat všem (3)' }));
        await screen.findByText('Počet účastníků, kteří získají důvěru: 3.');
        fireEvent.click(screen.getByRole('button', { name: 'Potvrdit udělení důvěry' }));
        expect(await screen.findByText('Bulk write failed')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Zrušit' })).not.toBeNull();
    });

    it('reads the persisted automatic setting and shows its active warning', async () => {
        fetchSummaryMock.mockResolvedValue({ ...SUMMARY, isAutomaticTrustEnabled: true });
        saveSettingMock.mockResolvedValue({ ...SUMMARY, isAutomaticTrustEnabled: false });
        renderControls();
        const switchControl = await screen.findByRole('switch', { name: /Automaticky důvěřovat/ });
        await waitFor(() => expect(switchControl.getAttribute('aria-checked')).toBe('true'));
        expect(screen.getByText(/Automatická důvěra je aktivní/)).not.toBeNull();
        fireEvent.click(switchControl);
        await waitFor(() => expect(saveSettingMock).toHaveBeenCalledWith('room-a', false));
        await waitFor(() => expect(switchControl.getAttribute('aria-checked')).toBe('false'));
        expect(screen.queryByText(/Automatická důvěra je aktivní/)).toBeNull();
    });
});
