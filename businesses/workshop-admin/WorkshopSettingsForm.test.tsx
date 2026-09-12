/**
 * @vitest-environment jsdom
 */

import { WorkshopSettingsForm } from '@/businesses/workshop-admin/WorkshopSettingsForm';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    youtubeVideoId: 'dQw4w9WgXcQ',
    previewYoutubeVideoId: 'M7lc1UVf-VE',
    repository: { owner: 'hejny', name: 'promptbook', branch: 'main', deploymentUrl: 'https://workshop.example/app' },
    isPublished: true,
    allowedReactions: ['👍', '❤️'],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

const COMMUNITY: WorkshopDetails = {
    ...WORKSHOP,
    id: '0d6b0f1c-9b0a-4b7e-9c02-6f2f7a3f5f31',
    kind: 'community',
    slug: 'komunita',
    title: 'Komunita Promptbooku',
    description: 'Společný prostor pro účastníky workshopů Promptbooku.',
    youtubeVideoId: null,
    previewYoutubeVideoId: null,
    repository: null,
};

/**
 * A workshop which is running with no end recorded, whatever moment this test is run at
 */
const OPEN_ENDED_WORKSHOP: WorkshopDetails = {
    ...WORKSHOP,
    startsAt: '2020-01-01T10:00:00+01:00',
    endsAt: null,
};

const SCHEDULE_LABELS = ['Začátek', 'Konec'];
const END_WORKSHOP_LABEL = 'Ukončit workshop';
const OPEN_WORKSHOP_END_LABEL = 'Nechat workshop bez konce';
const END_ONE_HOUR_AFTER_START_LABEL = 'Nastavit konec 1 hodinu po začátku';
const END_TWO_HOURS_AFTER_START_LABEL = 'Nastavit konec 2 hodiny po začátku';
const STAGE_LABEL = 'YouTube URL nebo video ID';
const STAGE_PREVIEW_LABEL = 'YouTube URL nebo video ID ukázky';
const REPOSITORY_LABEL = 'GitHub repozitář projektu';
const REPOSITORY_BRANCH_LABEL = 'Větev repozitáře';
const REPOSITORY_DEPLOYMENT_LABEL = 'URL nasazení projektu';
const REACTION_LABEL = 'Reakce oddělené mezerou';

function renderWorkshopSettingsForm(workshop: WorkshopDetails, onSave = vi.fn().mockResolvedValue(true)) {
    const { container } = render(<WorkshopSettingsForm workshop={workshop} onSave={onSave} />);

    return {
        onSave,
        submit: () => fireEvent.submit(container.querySelector('form') as HTMLFormElement),
    };
}

afterEach(cleanup);

describe('workshop settings form', () => {
    it('offers a workshop occurrence its schedule, its stage, and its reactions', () => {
        renderWorkshopSettingsForm(WORKSHOP);

        SCHEDULE_LABELS.forEach((scheduleLabel) => expect(screen.queryByText(scheduleLabel)).not.toBeNull());
        expect(screen.queryByText(STAGE_LABEL)).not.toBeNull();
        expect(screen.queryByText(STAGE_PREVIEW_LABEL)).not.toBeNull();
        expect(screen.queryByText(REACTION_LABEL)).not.toBeNull();
        expect(screen.queryByText('Počet sledujících')).not.toBeNull();
    });

    it('asks a workshop occurrence which project it is about', () => {
        renderWorkshopSettingsForm(WORKSHOP);

        expect(screen.queryByText(REPOSITORY_LABEL)).not.toBeNull();
        expect(screen.queryByDisplayValue('https://github.com/hejny/promptbook')).not.toBeNull();
        expect(screen.queryByDisplayValue('main')).not.toBeNull();
        expect(screen.queryByDisplayValue('https://workshop.example/app')).not.toBeNull();
    });

    it('leaves a permanent room without a project it could be about', () => {
        renderWorkshopSettingsForm(COMMUNITY);

        expect(screen.queryByText(REPOSITORY_LABEL)).toBeNull();
        expect(screen.queryByText(REPOSITORY_BRANCH_LABEL)).toBeNull();
        expect(screen.queryByText(REPOSITORY_DEPLOYMENT_LABEL)).toBeNull();
    });

    it('leaves a permanent room without a schedule, a stage, and the panels only a live room keeps up to date', () => {
        renderWorkshopSettingsForm(COMMUNITY);

        SCHEDULE_LABELS.forEach((scheduleLabel) => expect(screen.queryByText(scheduleLabel)).toBeNull());
        expect(screen.queryByText(STAGE_LABEL)).toBeNull();
        expect(screen.queryByText(STAGE_PREVIEW_LABEL)).toBeNull();
        expect(screen.queryByText(REACTION_LABEL)).toBeNull();
        expect(screen.queryByText('Reakce účastníků')).toBeNull();
        expect(screen.queryByText('Počet sledujících')).toBeNull();
        expect(screen.queryByText('Chat')).not.toBeNull();
    });

    it('does not ask a permanent room for the URL it was given once and for all', () => {
        renderWorkshopSettingsForm(COMMUNITY);

        expect(screen.queryByDisplayValue(COMMUNITY.slug)).toBeNull();
    });

    it('keeps the URL of a workshop occurrence editable', () => {
        renderWorkshopSettingsForm(WORKSHOP);

        expect(screen.getByDisplayValue(WORKSHOP.slug).hasAttribute('readonly')).toBe(false);
    });

    it('saves a permanent room without sending settings its kind does not have', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(COMMUNITY);

        submit();

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith({
                title: COMMUNITY.title,
                description: COMMUNITY.description,
                isPublished: COMMUNITY.isPublished,
                disabledPanels: COMMUNITY.disabledPanels,
            }),
        );
    });

    it('offers every quick end choice for a running workshop whose end is still open', () => {
        renderWorkshopSettingsForm(OPEN_ENDED_WORKSHOP);

        expect(screen.queryByRole('button', { name: END_WORKSHOP_LABEL })).not.toBeNull();
        expect(screen.queryByRole('button', { name: END_ONE_HOUR_AFTER_START_LABEL })).not.toBeNull();
        expect(screen.queryByRole('button', { name: END_TWO_HOURS_AFTER_START_LABEL })).not.toBeNull();
    });

    it('offers to reopen a workshop with a defined end and does not end an upcoming workshop right now', () => {
        renderWorkshopSettingsForm(WORKSHOP);
        expect(screen.queryByRole('button', { name: END_WORKSHOP_LABEL })).toBeNull();
        expect(screen.queryByRole('button', { name: OPEN_WORKSHOP_END_LABEL })).not.toBeNull();

        cleanup();

        renderWorkshopSettingsForm({ ...OPEN_ENDED_WORKSHOP, startsAt: '2099-01-01T10:00:00+01:00' });
        expect(screen.queryByRole('button', { name: END_WORKSHOP_LABEL })).toBeNull();
        expect(screen.queryByRole('button', { name: END_ONE_HOUR_AFTER_START_LABEL })).not.toBeNull();
        expect(screen.queryByRole('button', { name: END_TWO_HOURS_AFTER_START_LABEL })).not.toBeNull();
    });

    it('ends a workshop by saving the current moment as its end', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const { onSave } = renderWorkshopSettingsForm(OPEN_ENDED_WORKSHOP);
        const momentBeforeEnding = Date.now();

        fireEvent.click(screen.getByRole('button', { name: END_WORKSHOP_LABEL }));

        await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
        const endsAt = Date.parse(onSave.mock.calls[0][0].endsAt);
        expect(endsAt).toBeGreaterThanOrEqual(momentBeforeEnding);
        expect(endsAt).toBeLessThanOrEqual(Date.now());
        confirmSpy.mockRestore();
    });

    it('leaves a workshop running when the ending of it is not confirmed', () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const { onSave } = renderWorkshopSettingsForm(OPEN_ENDED_WORKSHOP);

        fireEvent.click(screen.getByRole('button', { name: END_WORKSHOP_LABEL }));

        expect(onSave).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });

    it('sets an open workshop end to either usual duration after its start', async () => {
        const { onSave } = renderWorkshopSettingsForm(OPEN_ENDED_WORKSHOP);
        const startsAtMilliseconds = Date.parse(OPEN_ENDED_WORKSHOP.startsAt);

        fireEvent.click(screen.getByRole('button', { name: END_ONE_HOUR_AFTER_START_LABEL }));

        await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
        expect(Date.parse(onSave.mock.calls[0][0].endsAt) - startsAtMilliseconds).toBe(60 * 60 * 1_000);

        cleanup();
        onSave.mockClear();
        renderWorkshopSettingsForm(OPEN_ENDED_WORKSHOP, onSave);

        fireEvent.click(screen.getByRole('button', { name: END_TWO_HOURS_AFTER_START_LABEL }));

        await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
        expect(Date.parse(onSave.mock.calls[0][0].endsAt) - startsAtMilliseconds).toBe(2 * 60 * 60 * 1_000);
    });

    it('makes a workshop with a defined end open-ended again after confirmation', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const { onSave } = renderWorkshopSettingsForm(WORKSHOP);

        fireEvent.click(screen.getByRole('button', { name: OPEN_WORKSHOP_END_LABEL }));

        await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ endsAt: null })));
        confirmSpy.mockRestore();
    });

    it('keeps saving the settings of a workshop whose end is left open without an end', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(OPEN_ENDED_WORKSHOP);

        submit();

        await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ endsAt: null })));
    });

    it('saves a workshop occurrence with its schedule, its stage, and its reactions', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(WORKSHOP);

        submit();

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    startsAt: expect.any(String),
                    endsAt: expect.any(String),
                    youtubeVideoId: WORKSHOP.youtubeVideoId,
                    previewYoutubeVideoId: WORKSHOP.previewYoutubeVideoId,
                    allowedReactions: WORKSHOP.allowedReactions,
                }),
            ),
        );
    });

    it('saves the whole project of a workshop occurrence as one connection', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(WORKSHOP);

        fireEvent.change(screen.getByDisplayValue('main'), { target: { value: 'produkce' } });
        submit();

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    repository: {
                        url: 'https://github.com/hejny/promptbook',
                        branch: 'produkce',
                        deploymentUrl: 'https://workshop.example/app',
                    },
                }),
            ),
        );
    });

    it('saves several selected branches as one connection', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(WORKSHOP);

        fireEvent.change(screen.getByDisplayValue('main'), {
            target: { value: 'main\nfeature/rooms' },
        });
        submit();

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    repository: {
                        url: 'https://github.com/hejny/promptbook',
                        branch: ['main', 'feature/rooms'],
                        deploymentUrl: 'https://workshop.example/app',
                    },
                }),
            ),
        );
    });

    it('saves all branches as a distinct branch selection', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(WORKSHOP);
        const allBranchesCheckbox = screen.getByLabelText('Sledovat všechny větve');

        fireEvent.click(allBranchesCheckbox);
        submit();

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    repository: {
                        url: 'https://github.com/hejny/promptbook',
                        branch: [],
                        deploymentUrl: 'https://workshop.example/app',
                    },
                }),
            ),
        );
    });

    it('disconnects the whole project once the repository is cleared', async () => {
        const { onSave, submit } = renderWorkshopSettingsForm(WORKSHOP);

        fireEvent.change(screen.getByDisplayValue('https://github.com/hejny/promptbook'), {
            target: { value: '  ' },
        });
        submit();

        await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ repository: null })));
    });
});
