'use client';

import {
    fetchAdminCommunityProjects,
    moderateAdminCommunityProject,
} from '@/businesses/community/projects/communityProjectAdminApi';
import { CommunityProjectPreviewImage } from '@/businesses/community/projects/CommunityProjectPreviewImage';
import type {
    CommunityProject,
    CommunityProjectModerationStatus,
} from '@/lib/community-projects/communityProjectTypes';
import type { WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
import { Check, Clock3, ExternalLink, LoaderCircle, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const CZECH_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'short', timeStyle: 'short' });

const PROJECT_STATUS_LABELS: Readonly<Record<WorkshopSubmissionStatus, string>> = {
    pending: 'Čekající',
    approved: 'Schválené',
    rejected: 'Zamítnuté',
};

function getProjectStatusClassName(status: WorkshopSubmissionStatus): string {
    return status === 'approved'
        ? 'bg-emerald-100 text-emerald-800'
        : status === 'rejected'
          ? 'bg-slate-100 text-slate-600'
          : 'bg-amber-100 text-amber-800';
}

/**
 * The administrator's counterpart to the community-room moderation controls. It lists a single status queue at a
 * time, including rejected cards which deliberately remain invisible to community members after their decision.
 */
export function CommunityProjectModeration() {
    const [projects, setProjects] = useState<readonly CommunityProject[]>([]);
    const [status, setStatus] = useState<WorkshopSubmissionStatus>('pending');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingProjectId, setIsProcessingProjectId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            setProjects(await fetchAdminCommunityProjects(status));
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Projekty se nepodařilo načíst.');
        } finally {
            setIsLoading(false);
        }
    }, [status]);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    const handleModerate = async (projectId: string, nextStatus: CommunityProjectModerationStatus) => {
        setIsProcessingProjectId(projectId);
        try {
            await moderateAdminCommunityProject(projectId, nextStatus);
            setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Projekt se nepodařilo změnit.');
        } finally {
            setIsProcessingProjectId(null);
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">Moderace projektů</h2>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Stejná kontrola jako u chatu: projekty čekající na schválení posoudíte zde. Důvěryhodný člen
                        nebo moderátor je zveřejní rovnou.
                    </p>
                </div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Stav projektů
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value as WorkshopSubmissionStatus)}
                        className="mt-1 block h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-800"
                    >
                        {(Object.keys(PROJECT_STATUS_LABELS) as WorkshopSubmissionStatus[]).map((projectStatus) => (
                            <option key={projectStatus} value={projectStatus}>
                                {PROJECT_STATUS_LABELS[projectStatus]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {errorMessage !== null && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                    <span>{errorMessage}</span>
                    <button type="button" onClick={() => void loadProjects()} className="font-semibold underline underline-offset-4">
                        Zkusit znovu
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-cyan-600" /> Načítám projekty…
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {projects.length === 0 && (
                        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-5 text-center text-sm text-slate-400">
                            <Clock3 className="mb-2 h-6 w-6" /> V tomto stavu zatím žádný projekt není.
                        </div>
                    )}
                    {projects.map((project) => {
                        const isProcessing = isProcessingProjectId === project.id;
                        return (
                            <article key={project.id} className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="grid gap-4 p-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                                    <div className="aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
                                        <CommunityProjectPreviewImage imageUrl={project.previewImageUrl} title={project.title} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-950">{project.title}</h3>
                                                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                    <span className="inline-flex items-center gap-1">
                                                        <UserRound className="h-3.5 w-3.5" /> {project.authorName}
                                                    </span>
                                                    {CZECH_DATE_FORMAT.format(new Date(project.createdAt))}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getProjectStatusClassName(project.status)}`}
                                            >
                                                {PROJECT_STATUS_LABELS[project.status]}
                                            </span>
                                        </div>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                            {project.description || 'Autor zatím nepřidal podrobnější popis projektu.'}
                                        </p>
                                        <a
                                            href={project.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 hover:underline"
                                        >
                                            <ExternalLink className="h-4 w-4" /> Otevřít projekt
                                        </a>
                                        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                                            {project.status !== 'approved' && (
                                                <button
                                                    type="button"
                                                    disabled={isProcessing}
                                                    onClick={() => void handleModerate(project.id, 'approved')}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" /> Schválit
                                                </button>
                                            )}
                                            {project.status !== 'rejected' && (
                                                <button
                                                    type="button"
                                                    disabled={isProcessing}
                                                    onClick={() => void handleModerate(project.id, 'rejected')}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                                                >
                                                    <X className="h-4 w-4" /> Zamítnout
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
