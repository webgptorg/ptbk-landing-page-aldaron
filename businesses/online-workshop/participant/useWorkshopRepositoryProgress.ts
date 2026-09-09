'use client';

import { fetchWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import {
    selectNewWorkshopRepositoryCommitShas,
    type WorkshopRepositoryProgress,
} from '@/lib/workshops/workshopRepositoryProgress';
import { useEffect, useRef, useState } from 'react';

/**
 * How often an open room asks what has been committed in the project of the workshop
 *
 * Note: The server reuses one answer of GitHub for a while, see `WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS`, so
 *       asking this often costs one request of this application per participant and no more requests to GitHub.
 */
const WORKSHOP_REPOSITORY_REFRESH_INTERVAL_MILLISECONDS = 60_000;

export type WorkshopRepositoryProgressController = {
    /**
     * How far the project has come, `null` while it is still being read or while GitHub could not be read at all
     */
    readonly progress: WorkshopRepositoryProgress | null;

    /**
     * Whether the room already has an answer about the repository, whatever that answer was
     */
    readonly isProgressRead: boolean;

    /**
     * The commits which arrived while this participant had the room open
     */
    readonly newCommitShas: ReadonlySet<string>;
};

/**
 * Follows the project of one workshop while its room is open
 *
 * Note: The commits which were already there when somebody entered the room are not new to them, so only what arrives
 *       afterwards is marked. A room which is not in front of anybody stops asking, exactly as the rest of the room
 *       does, and keeps the last answer it received rather than emptying itself when GitHub cannot be reached.
 */
export function useWorkshopRepositoryProgress(workshopSlug: string): WorkshopRepositoryProgressController {
    const [progress, setProgress] = useState<WorkshopRepositoryProgress | null>(null);
    const [isProgressRead, setIsProgressRead] = useState(false);
    const [newCommitShas, setNewCommitShas] = useState<ReadonlySet<string>>(new Set());
    /**
     * Every commit this room has already read, which is nothing at all until it has read the repository once
     */
    const knownCommitShasRef = useRef<Set<string> | null>(null);

    useEffect(() => {
        let isCurrentWorkshop = true;
        let isReadingProgress = false;
        knownCommitShasRef.current = null;
        setProgress(null);
        setIsProgressRead(false);
        setNewCommitShas(new Set());

        const rememberArrivedCommits = (readProgress: WorkshopRepositoryProgress | null) => {
            const commits = readProgress?.commits ?? [];
            const knownCommitShas = knownCommitShasRef.current;

            if (knownCommitShas === null) {
                knownCommitShasRef.current = new Set(commits.map((commit) => commit.sha));
                return;
            }

            const arrivedCommitShas = selectNewWorkshopRepositoryCommitShas(knownCommitShas, commits);
            if (arrivedCommitShas.length === 0) {
                return;
            }

            arrivedCommitShas.forEach((commitSha) => knownCommitShas.add(commitSha));
            setNewCommitShas((previousCommitShas) => {
                const markedCommitShas = new Set<string>();
                previousCommitShas.forEach((commitSha) => markedCommitShas.add(commitSha));
                arrivedCommitShas.forEach((commitSha) => markedCommitShas.add(commitSha));
                return markedCommitShas;
            });
        };

        // Note: A reading which is still waiting for an answer is left to finish rather than being asked again beside
        //       itself, so a GitHub which answers slowly is asked once instead of once per elapsed interval.
        const readRepositoryProgress = async () => {
            if (isReadingProgress) {
                return;
            }

            isReadingProgress = true;
            try {
                const { progress: readProgress } = await fetchWorkshopRepositoryProgress(workshopSlug);
                if (!isCurrentWorkshop) {
                    return;
                }

                rememberArrivedCommits(readProgress);
                setProgress(readProgress);
            } catch (repositoryError) {
                console.error('Failed to read the repository of the workshop:', repositoryError);
            } finally {
                isReadingProgress = false;
                if (isCurrentWorkshop) {
                    setIsProgressRead(true);
                }
            }
        };

        void readRepositoryProgress();
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                void readRepositoryProgress();
            }
        }, WORKSHOP_REPOSITORY_REFRESH_INTERVAL_MILLISECONDS);

        return () => {
            isCurrentWorkshop = false;
            window.clearInterval(intervalId);
        };
    }, [workshopSlug]);

    return { progress, isProgressRead, newCommitShas };
}
