'use client';

import { CZECH_COMMUNITY_ROOM_COPY } from '@/businesses/community/communityContent';
import { COMMUNITY_PROJECTS_PATH } from '@/businesses/community/config';
import {
    CommunityProjectApiError,
    fetchCommunityProjects,
    moderateCommunityProject,
    voteOnCommunityProject,
} from '@/businesses/community/projects/communityProjectsApi';
import { CommunityProjectCard } from '@/businesses/community/projects/CommunityProjectCard';
import { CommunityProjectCreationWizard } from '@/businesses/community/projects/CommunityProjectCreationWizard';
import type {
    CommunityProject,
    CommunityProjectModerationStatus,
    CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';
import { FolderOpen, LoaderCircle, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const COMMUNITY_HOME_PROJECT_COUNT = 5;

type CommunityProjectsSectionProps = {
    readonly isLimited: boolean;
};

function sortCommunityProjects(projects: readonly CommunityProject[]): readonly CommunityProject[] {
    return [...projects].sort(
        (firstProject, secondProject) =>
            secondProject.upvoteCount - firstProject.upvoteCount ||
            Date.parse(secondProject.createdAt) - Date.parse(firstProject.createdAt),
    );
}

function limitCommunityProjectsForHome(projects: readonly CommunityProject[], isLimited: boolean): readonly CommunityProject[] {
    if (!isLimited) {
        return projects;
    }

    const sortedProjects = sortCommunityProjects(projects);
    return [
        ...sortedProjects
            .filter((project) => project.status === 'approved')
            .slice(0, COMMUNITY_HOME_PROJECT_COUNT),
        ...sortedProjects.filter((project) => project.status !== 'approved'),
    ];
}

function getCommunityProjectsErrorMessage(error: unknown): string {
    if (error instanceof CommunityProjectApiError && error.status === 401) {
        return 'Nejdřív se připojte do komunity. Projekty jsou dostupné jejím členům.';
    }

    return 'Projekty se teď nepodařilo načíst. Zkuste stránku obnovit.';
}

/**
 * One card grid serves both the compact home view and the full catalogue. The only difference is its server-backed
 * limit, so vote updates and the creation wizard never grow a second implementation for `/cs/komunita/projects`.
 */
export function CommunityProjectsSection({ isLimited }: CommunityProjectsSectionProps) {
    const [projects, setProjects] = useState<readonly CommunityProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreationOpen, setIsCreationOpen] = useState(false);
    const [isVotingProjectId, setIsVotingProjectId] = useState<string | null>(null);
    const [isModeratingProjectId, setIsModeratingProjectId] = useState<string | null>(null);
    const [isModerationOffered, setIsModerationOffered] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const loadedProjects = await fetchCommunityProjects(isLimited ? COMMUNITY_HOME_PROJECT_COUNT : null);
            setProjects(sortCommunityProjects(loadedProjects.projects));
            setIsModerationOffered(loadedProjects.isModerationOffered);
        } catch (error) {
            setErrorMessage(getCommunityProjectsErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }, [isLimited]);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    const handleVote = async (projectId: string, vote: CommunityProjectVote) => {
        setIsVotingProjectId(projectId);
        setErrorMessage(null);
        try {
            const savedVote = await voteOnCommunityProject(projectId, vote);
            setProjects((currentProjects) =>
                sortCommunityProjects(
                    currentProjects.map((project) =>
                        project.id === projectId
                            ? {
                                  ...project,
                                  voteByParticipant: savedVote.vote,
                                  upvoteCount: savedVote.upvoteCount,
                                  downvoteCount: savedVote.downvoteCount,
                              }
                            : project,
                    ),
                ),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Hlas se nepodařilo uložit.');
        } finally {
            setIsVotingProjectId(null);
        }
    };

    const handleProjectCreated = (project: CommunityProject) => {
        setProjects((currentProjects) =>
            limitCommunityProjectsForHome([project, ...currentProjects], isLimited),
        );
    };

    const handleModerate = async (projectId: string, status: CommunityProjectModerationStatus) => {
        setIsModeratingProjectId(projectId);
        setErrorMessage(null);
        try {
            await moderateCommunityProject(projectId, status);
            setProjects((currentProjects) =>
                status === 'rejected'
                    ? currentProjects.filter((project) => project.id !== projectId)
                    : currentProjects.map((project) =>
                          project.id === projectId ? { ...project, status } : project,
                      ),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Projekt se nepodařilo změnit.');
        } finally {
            setIsModeratingProjectId(null);
        }
    };

    return (
        <section aria-labelledby="community-projects-title" className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Tvoříme spolu</p>
                    <h2 id="community-projects-title" className="mt-1 text-xl font-bold text-white">
                        {CZECH_COMMUNITY_ROOM_COPY.projectsTitle}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                        Podívejte se, co členové vytvořili, podpořte nejlepší nápady a přidejte vlastní tvorbu.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreationOpen(true)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                >
                    <Plus className="h-4 w-4" /> Sdílet projekt
                </button>
            </div>

            {errorMessage !== null && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-3 py-2.5 text-sm text-rose-100">
                    <span>{errorMessage}</span>
                    <button type="button" onClick={() => void loadProjects()} className="font-semibold underline underline-offset-4">
                        Zkusit znovu
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-cyan-300" /> Načítám projekty…
                </div>
            ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {projects.map((project) => (
                        <CommunityProjectCard
                            key={project.id}
                            project={project}
                            isVoting={isVotingProjectId === project.id}
                            isModerating={isModeratingProjectId === project.id}
                            isModerationOffered={isModerationOffered}
                            onVote={handleVote}
                            onModerate={handleModerate}
                        />
                    ))}
                    {projects.length === 0 && (
                        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-950/25 px-5 text-center md:col-span-3">
                            <Sparkles className="h-7 w-7 text-cyan-300" />
                            <p className="mt-3 font-semibold text-slate-100">Zatím tu žádný projekt není.</p>
                            <p className="mt-1 text-sm text-slate-400">Buďte první, kdo komunitě ukáže svou tvorbu.</p>
                        </div>
                    )}
                    {isLimited && (
                        <Link
                            href={COMMUNITY_PROJECTS_PATH}
                            className="group flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-300/35 bg-cyan-300/[0.04] px-5 text-center transition hover:border-cyan-200 hover:bg-cyan-300/[0.09]"
                        >
                            <FolderOpen className="h-8 w-8 text-cyan-200 transition group-hover:scale-110" />
                            <span className="mt-3 font-bold text-cyan-100">Další projekty</span>
                            <span className="mt-1 text-sm text-slate-400">Otevřít všechny projekty komunity</span>
                        </Link>
                    )}
                </div>
            )}

            <CommunityProjectCreationWizard
                isOpen={isCreationOpen}
                onOpenChange={setIsCreationOpen}
                onProjectCreated={handleProjectCreated}
            />
        </section>
    );
}
