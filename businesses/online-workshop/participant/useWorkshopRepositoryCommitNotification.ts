'use client';

import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { SubscribeToWorkshopRepositoryCommits } from '@/lib/workshops/workshopRepositoryProgress';
import { useCallback, useEffect, useRef, useState } from 'react';

const NEW_REPOSITORY_COMMIT_NOTIFICATION_DURATION_MILLISECONDS = 10_000;

type UseWorkshopRepositoryCommitNotificationOptions = {
    readonly workshopSlug: string;
    readonly isWorkshopOngoing: boolean;
    readonly isEnabled: boolean;
    readonly subscribeToRepositoryCommits?: SubscribeToWorkshopRepositoryCommits;
};

/**
 * Keeps one newly detected repository commit on the live stage for a short, deduplicated announcement
 *
 * Note: Realtime and polling can report the same commit independently. The SHA set here makes both sources one
 * notification, while the polling source remains responsible for the persistent new-commit marking in the panel.
 */
export function useWorkshopRepositoryCommitNotification({
    workshopSlug,
    isWorkshopOngoing,
    isEnabled,
    subscribeToRepositoryCommits,
}: UseWorkshopRepositoryCommitNotificationOptions): GithubCommit | null {
    const [newRepositoryCommit, setNewRepositoryCommit] = useState<GithubCommit | null>(null);
    const repositoryCommitExpiryTimeoutReference = useRef<number | null>(null);
    const isWorkshopOngoingReference = useRef(false);
    const shownRepositoryCommitShasReference = useRef(new Set<string>());

    isWorkshopOngoingReference.current = isWorkshopOngoing;

    const showNewRepositoryCommit = useCallback((commit: GithubCommit) => {
        if (!isWorkshopOngoingReference.current || shownRepositoryCommitShasReference.current.has(commit.sha)) {
            return;
        }

        shownRepositoryCommitShasReference.current.add(commit.sha);
        setNewRepositoryCommit(commit);
        if (repositoryCommitExpiryTimeoutReference.current !== null) {
            window.clearTimeout(repositoryCommitExpiryTimeoutReference.current);
        }
        repositoryCommitExpiryTimeoutReference.current = window.setTimeout(() => {
            setNewRepositoryCommit((currentCommit) => (currentCommit?.sha === commit.sha ? null : currentCommit));
            repositoryCommitExpiryTimeoutReference.current = null;
        }, NEW_REPOSITORY_COMMIT_NOTIFICATION_DURATION_MILLISECONDS);
    }, []);

    useEffect(() => {
        shownRepositoryCommitShasReference.current.clear();
        setNewRepositoryCommit(null);
        if (repositoryCommitExpiryTimeoutReference.current !== null) {
            window.clearTimeout(repositoryCommitExpiryTimeoutReference.current);
            repositoryCommitExpiryTimeoutReference.current = null;
        }
    }, [isEnabled, workshopSlug]);

    useEffect(() => {
        if (!isEnabled || subscribeToRepositoryCommits === undefined) {
            return;
        }

        return subscribeToRepositoryCommits(showNewRepositoryCommit);
    }, [isEnabled, showNewRepositoryCommit, subscribeToRepositoryCommits]);

    useEffect(() => {
        if (isWorkshopOngoing) {
            return;
        }

        setNewRepositoryCommit(null);
        if (repositoryCommitExpiryTimeoutReference.current !== null) {
            window.clearTimeout(repositoryCommitExpiryTimeoutReference.current);
            repositoryCommitExpiryTimeoutReference.current = null;
        }
    }, [isWorkshopOngoing]);

    useEffect(
        () => () => {
            if (repositoryCommitExpiryTimeoutReference.current !== null) {
                window.clearTimeout(repositoryCommitExpiryTimeoutReference.current);
            }
        },
        [],
    );

    return newRepositoryCommit;
}
