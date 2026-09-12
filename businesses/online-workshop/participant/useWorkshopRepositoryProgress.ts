'use client';

import { fetchWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import {
    selectNewWorkshopRepositoryCommits,
    type WorkshopRepositoryCommitListener,
    type SubscribeToWorkshopRepositoryCommits,
    type WorkshopRepositoryProgress,
} from '@/lib/workshops/workshopRepositoryProgress';
import { WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * How often an open room asks what has been committed in the project of the workshop
 *
 * Note: The server reuses one answer of GitHub for a while, see `WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS`, so
 *       asking this often costs one request of this application per participant and no more requests to GitHub.
 */
const WORKSHOP_REPOSITORY_REFRESH_INTERVAL_MILLISECONDS = WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000;

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

    /**
     * Lets the stage hear about a commit as soon as the repository monitor or the polling fallback finds it
     */
    readonly subscribeToNewCommits: SubscribeToWorkshopRepositoryCommits;
};

/**
 * Follows the project of one workshop while its room is open
 *
 * Note: The commits which were already there when somebody entered the room are not new to them, so only what arrives
 *       afterwards is marked. A room which is not in front of anybody stops asking, exactly as the rest of the room
 *       does, and keeps the last answer it received rather than emptying itself when GitHub cannot be reached.
 */
export function useWorkshopRepositoryProgress(
    workshopSlug: string,
    isEnabled = true,
): WorkshopRepositoryProgressController {
    const [progress, setProgress] = useState<WorkshopRepositoryProgress | null>(null);
    const [isProgressRead, setIsProgressRead] = useState(false);
    const [newCommitShas, setNewCommitShas] = useState<ReadonlySet<string>>(new Set());
    const commitListenersRef = useRef(new Set<WorkshopRepositoryCommitListener>());
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

        if (!isEnabled) {
            return;
        }

        const rememberArrivedCommits = (readProgress: WorkshopRepositoryProgress | null) => {
            const commits = readProgress?.commits ?? [];
            const knownCommitShas = knownCommitShasRef.current;

            if (knownCommitShas === null) {
                knownCommitShasRef.current = new Set(commits.map((commit) => commit.sha));
                return;
            }

            const arrivedCommits = selectNewWorkshopRepositoryCommits(knownCommitShas, commits);
            if (arrivedCommits.length === 0) {
                return;
            }

            arrivedCommits.forEach((commit) => knownCommitShas.add(commit.sha));
            setNewCommitShas((previousCommitShas) => {
                const markedCommitShas = new Set<string>();
                previousCommitShas.forEach((commitSha) => markedCommitShas.add(commitSha));
                arrivedCommits.forEach((commit) => markedCommitShas.add(commit.sha));
                return markedCommitShas;
            });

            // The response is newest-first. Announcing oldest-first leaves the newest commit on top when several
            // commits arrived between two reads, while the persistent list still marks all of them.
            [...arrivedCommits].reverse().forEach((commit) => {
                commitListenersRef.current.forEach((listener) => listener(commit));
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
    }, [isEnabled, workshopSlug]);

    const subscribeToNewCommits = useCallback<SubscribeToWorkshopRepositoryCommits>((listener) => {
        commitListenersRef.current.add(listener);
        return () => {
            commitListenersRef.current.delete(listener);
        };
    }, []);

    return { progress, isProgressRead, newCommitShas, subscribeToNewCommits };
}
