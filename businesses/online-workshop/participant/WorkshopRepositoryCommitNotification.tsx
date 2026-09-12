'use client';

import { WorkshopRepositoryCommitCard } from '@/businesses/online-workshop/participant/WorkshopRepositoryCommitCard';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { GithubRepository } from '@/lib/github/githubRepository';
import { GitCommitHorizontal } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type WorkshopRepositoryCommitNotificationProps = {
    readonly repository: GithubRepository;
    readonly commit: GithubCommit;
};

/**
 * Announces a repository commit over the live workshop stage
 *
 * Note: The commit card remains the one shared rendering of commit details. This component only adds the temporary
 * stage placement and its announcement label.
 */
export function WorkshopRepositoryCommitNotification({
    repository,
    commit,
}: WorkshopRepositoryCommitNotificationProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    return (
        <motion.aside
            role="status"
            aria-live="polite"
            initial={isReducedMotionPreferred ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto absolute left-3 right-3 top-3 z-20 rounded-2xl border border-amber-200/50 bg-slate-950/95 p-3 shadow-2xl backdrop-blur sm:left-6 sm:right-32 sm:top-5 sm:max-w-2xl sm:p-4"
        >
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
                <GitCommitHorizontal className="h-3.5 w-3.5" aria-hidden="true" /> Nový commit na projektu
            </p>
            <WorkshopRepositoryCommitCard
                repository={repository}
                commit={commit}
                isNew
                className="mt-2 bg-amber-300/[0.04]"
            />
        </motion.aside>
    );
}
