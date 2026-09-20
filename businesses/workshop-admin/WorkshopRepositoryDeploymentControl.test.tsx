/** @vitest-environment jsdom */
import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkshopRepositoryFields } from '@/businesses/workshop-admin/WorkshopRepositoryFields';
import { EMPTY_WORKSHOP_REPOSITORY_DRAFT, type WorkshopRepositoryDraft } from '@/businesses/workshop-admin/workshopRepositoryDraft';
import { WORKSHOP_VERCEL_DEPLOYMENT_POLL_INTERVAL_MILLISECONDS, type WorkshopVercelDeployment } from '@/lib/workshops/workshopVercelDeployment';

const { startMock, statusMock } = vi.hoisted(() => ({ startMock: vi.fn(), statusMock: vi.fn() }));
vi.mock('@/businesses/workshop-admin/workshopRepositoryDeploymentApi', () => ({
    startWorkshopRepositoryDeployment: startMock, fetchWorkshopRepositoryDeployment: statusMock,
}));

const DRAFT = { ...EMPTY_WORKSHOP_REPOSITORY_DRAFT, repositoryUrl: 'example/workshop', branch: 'main, client-*' };
const BUILDING: WorkshopVercelDeployment = { id: 'dpl_example', state: 'BUILDING', deploymentUrl: null,
    inspectorUrl: 'https://vercel.com/example/workshop/deployment' };
const READY: WorkshopVercelDeployment = { ...BUILDING, state: 'READY', deploymentUrl: 'https://workshop.vercel.app/' };

function Fields({ initialDraft = DRAFT }: { initialDraft?: WorkshopRepositoryDraft }) {
    const [repository, setRepository] = useState(initialDraft);
    return <form><WorkshopRepositoryFields repository={repository} onChange={setRepository} startsAt={null} endsAt={null} /></form>;
}

function deploymentField() {
    return screen.getByLabelText('URL nasazení projektu') as HTMLTextAreaElement;
}

async function startDeployment() {
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Nasadit na Vercel' })));
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    startMock.mockResolvedValue(BUILDING);
    statusMock.mockResolvedValue(READY);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Vercel control in the existing workshop project fields', () => {
    it.each([
        { ...DRAFT, repositoryUrl: '' },
        { ...DRAFT, repositoryUrl: 'invalid' },
        { ...DRAFT, deploymentUrls: 'https://manual.example.com/' },
        { ...DRAFT, deploymentUrls: 'unfinished manual URL' },
    ])('offers deployment only for a valid repository and an empty deployment field', (initialDraft) => {
        render(<Fields initialDraft={initialDraft} />);
        expect(screen.queryByRole('button', { name: 'Nasadit na Vercel' })).toBeNull();
        expect(startMock).not.toHaveBeenCalled();
    });

    it('shows progress, prevents duplicate starts and fills only the URL after a successful build', async () => {
        render(<Fields initialDraft={{ ...DRAFT, deploymentUrls: ' \n ' }} />);
        const form = deploymentField().closest('form')!;
        const onSubmit = vi.fn((event: Event) => event.preventDefault());
        form.addEventListener('submit', onSubmit);
        await startDeployment();
        expect(startMock).toHaveBeenCalledWith(DRAFT.repositoryUrl, expect.any(AbortSignal));
        expect(screen.getByRole('status').textContent).toContain('připravuje nasazení');
        const button = screen.getByRole('button', { name: 'Nasazuji na Vercel…' }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        fireEvent.click(button);
        expect(startMock).toHaveBeenCalledOnce();
        expect(onSubmit).not.toHaveBeenCalled();
        expect(deploymentField().value.trim()).toBe('');

        await act(async () => vi.advanceTimersByTimeAsync(WORKSHOP_VERCEL_DEPLOYMENT_POLL_INTERVAL_MILLISECONDS));
        expect(deploymentField().value).toBe(READY.deploymentUrl);
        expect((screen.getByLabelText('Větve repozitáře') as HTMLTextAreaElement).value).toBe(DRAFT.branch);
        expect(screen.queryByRole('button', { name: 'Nasadit na Vercel' })).toBeNull();
    });

    it.each(['manual', 'repository', 'unmount'])('discards a pending result after a %s change', async (change) => {
        let finishDeployment!: (result: WorkshopVercelDeployment) => void;
        startMock.mockImplementationOnce(() => new Promise<WorkshopVercelDeployment>((resolve) => { finishDeployment = resolve; }));
        const rendered = render(<Fields />);
        await startDeployment();
        const signal = startMock.mock.calls[0][1] as AbortSignal;
        if (change === 'manual') fireEvent.change(deploymentField(), { target: { value: 'https://manual.example.com/' } });
        if (change === 'repository') fireEvent.change(screen.getByDisplayValue(DRAFT.repositoryUrl), { target: { value: 'example/other' } });
        if (change === 'unmount') rendered.unmount();
        expect(signal.aborted).toBe(true);
        await act(async () => finishDeployment(READY));
        if (change === 'manual') expect(deploymentField().value).toBe('https://manual.example.com/');
        if (change === 'repository') expect(deploymentField().value).toBe('');
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('resumes a build after a status request fails instead of creating another deployment', async () => {
        statusMock.mockRejectedValueOnce(new Error('Temporary connection failure'));
        render(<Fields />);
        await startDeployment();
        await act(async () => vi.advanceTimersByTimeAsync(WORKSHOP_VERCEL_DEPLOYMENT_POLL_INTERVAL_MILLISECONDS));
        expect(screen.getByRole('alert').textContent).toContain('Temporary connection failure');
        expect(screen.getByRole('link', { name: /Otevřít nasazení/ }).getAttribute('href')).toBe(BUILDING.inspectorUrl);
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Ověřit stav nasazení' })));
        expect(startMock).toHaveBeenCalledOnce();
        expect(deploymentField().value).toBe(READY.deploymentUrl);
    });

    it('keeps the URL empty on build failure and allows a new attempt', async () => {
        startMock.mockResolvedValueOnce({ ...BUILDING, state: 'ERROR' });
        render(<Fields />);
        await startDeployment();
        expect(screen.getByRole('alert').textContent).toContain('Nasazení se nezdařilo');
        expect(deploymentField().value).toBe('');
        startMock.mockResolvedValueOnce(READY);
        await startDeployment();
        expect(startMock).toHaveBeenCalledTimes(2);
        expect(deploymentField().value).toBe(READY.deploymentUrl);
    });
});
