/** @vitest-environment jsdom */
import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkshopRepositoryFields } from '@/businesses/workshop-admin/WorkshopRepositoryFields';
import { EMPTY_WORKSHOP_REPOSITORY_DRAFT } from '@/businesses/workshop-admin/workshopRepositoryDraft';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';

const { lookupMock } = vi.hoisted(() => ({ lookupMock: vi.fn() }));
vi.mock('@/businesses/workshop-admin/workshopRepositoryCommitApi', () => ({ fetchAdminWorkshopRepositoryCommit: lookupMock }));
const START_COMMIT: GithubCommit = { sha: 'a'.repeat(40), message: 'Build the workshop app', authorName: 'Alice', committedAt: '2026-09-01T10:00:00Z' };
const END_COMMIT: GithubCommit = { ...START_COMMIT, sha: 'b'.repeat(40), message: 'Finish the workshop app' };

function Fields({ endsAt = '2026-09-01T11:00:00Z' }: { endsAt?: string | null }) {
    const [repository, setRepository] = useState({ ...EMPTY_WORKSHOP_REPOSITORY_DRAFT, repositoryUrl: 'example/workshop', branch: 'main, client-*' });
    return <WorkshopRepositoryFields repository={repository} onChange={setRepository} startsAt="2026-09-01T10:00:00Z" endsAt={endsAt} />;
}

beforeEach(() => { lookupMock.mockReset(); lookupMock.mockResolvedValue(START_COMMIT); });
afterEach(cleanup);

describe('independent repository commit controls', () => {
    it('autofills and clears each bound separately, with commit metadata', async () => {
        render(<Fields />);
        fireEvent.click(screen.getByRole('button', { name: 'Doplnit podle začátku workshopu' }));
        await waitFor(() => expect((screen.getByLabelText('Počáteční commit') as HTMLInputElement).value).toBe(START_COMMIT.sha));
        expect((screen.getByLabelText('Koncový commit') as HTMLInputElement).value).toBe('');
        expect(lookupMock).toHaveBeenCalledWith(expect.objectContaining({ branch: ['main', 'client-*'] }),
            { kind: 'date', boundary: 'start', date: '2026-09-01T10:00:00Z' }, expect.any(AbortSignal));
        await screen.findByText('Build the workshop app');
        expect(screen.getByText(/Alice · 1\. 9\. 2026/)).not.toBeNull();
        lookupMock.mockResolvedValue(END_COMMIT);
        fireEvent.click(screen.getByRole('button', { name: 'Doplnit podle konce workshopu' }));
        await waitFor(() => expect((screen.getByLabelText('Koncový commit') as HTMLInputElement).value).toBe(END_COMMIT.sha));
        expect((screen.getByLabelText('Počáteční commit') as HTMLInputElement).value).toBe(START_COMMIT.sha);
        fireEvent.change(screen.getByLabelText('Počáteční commit'), { target: { value: '' } });
        expect((screen.getByLabelText('Koncový commit') as HTMLInputElement).value).toBe(END_COMMIT.sha);
    });

    it('shows metadata for a manually typed ID and disables end autofill without an end date', async () => {
        render(<Fields endsAt={null} />);
        expect((screen.getByRole('button', { name: 'Doplnit podle konce workshopu' }) as HTMLButtonElement).disabled).toBe(true);
        fireEvent.change(screen.getByLabelText('Počáteční commit'), { target: { value: 'aaaaaaa' } });
        await screen.findByText('Build the workshop app');
        expect(lookupMock).toHaveBeenCalledWith(expect.anything(), { kind: 'id', commitId: 'aaaaaaa' }, expect.any(AbortSignal));
    });

    it('preserves both bounds when their independent autofill requests finish together', async () => {
        let finishStartLookup!: (commit: GithubCommit) => void;
        let finishEndLookup!: (commit: GithubCommit) => void;
        lookupMock.mockImplementationOnce(() => new Promise<GithubCommit>((resolve) => { finishStartLookup = resolve; }))
            .mockImplementationOnce(() => new Promise<GithubCommit>((resolve) => { finishEndLookup = resolve; }));
        render(<Fields />);
        fireEvent.click(screen.getByRole('button', { name: 'Doplnit podle začátku workshopu' }));
        fireEvent.click(screen.getByRole('button', { name: 'Doplnit podle konce workshopu' }));

        await act(async () => {
            finishStartLookup(START_COMMIT);
            finishEndLookup(END_COMMIT);
        });

        expect((screen.getByLabelText('Počáteční commit') as HTMLInputElement).value).toBe(START_COMMIT.sha);
        expect((screen.getByLabelText('Koncový commit') as HTMLInputElement).value).toBe(END_COMMIT.sha);
    });

    it('ignores an autofill response after the selected branches changed', async () => {
        let finishLookup!: (commit: GithubCommit) => void;
        lookupMock.mockImplementation(() => new Promise<GithubCommit>((resolve) => { finishLookup = resolve; }));
        render(<Fields />);
        fireEvent.click(screen.getByRole('button', { name: 'Doplnit podle začátku workshopu' }));
        fireEvent.change(screen.getByLabelText('Větve repozitáře'), { target: { value: 'other' } });
        await act(async () => finishLookup(START_COMMIT));
        expect((screen.getByLabelText('Počáteční commit') as HTMLInputElement).value).toBe('');
    });
});
