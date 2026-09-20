'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { WorkshopRepositoryWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { fetchAdminWorkshopRepositoryCommit } from '@/businesses/workshop-admin/workshopRepositoryCommitApi';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import { normalizeGithubCommitSha } from '@/lib/github/githubCommitSha';
import { createGithubCommitUrl, extractGithubRepository } from '@/lib/github/githubRepository';
import { formatGithubCommitDate } from '@/lib/github/formatGithubCommitDate';
import type { WorkshopRepositoryCommitBoundary } from '@/lib/workshops/workshopRepositoryCommitRange';

const COMMIT_PREVIEW_DELAY_MILLISECONDS = 400;

type WorkshopRepositoryCommitFieldProps = {
    readonly repository: WorkshopRepositoryWriteValues | null;
    readonly boundary: WorkshopRepositoryCommitBoundary;
    readonly commitId: string;
    readonly date: string | null;
    readonly onChange: (commitId: string) => void;
};

/** Start and end deliberately share one independent control and lookup lifecycle. */
export function WorkshopRepositoryCommitField({ repository, boundary, commitId, date, onChange }: WorkshopRepositoryCommitFieldProps) {
    const [commit, setCommit] = useState<GithubCommit | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const requestKey = JSON.stringify([repository?.url, repository?.branch, boundary, commitId, date]);
    const currentRequestKey = useRef(requestKey);
    currentRequestKey.current = requestKey;
    const currentOnChange = useRef(onChange);
    const lookupController = useRef<AbortController | null>(null);
    currentOnChange.current = onChange;
    const connectedRepository = extractGithubRepository(repository?.url ?? null);
    const isStart = boundary === 'start';
    const inputId = `workshop-repository-${boundary}-commit`;

    useEffect(() => () => { lookupController.current?.abort(); }, [requestKey]);

    useEffect(() => {
        setCommit(null);
        setError(null);
        setIsLoading(false);
        if (commitId.trim() === '' || repository === null || connectedRepository === null) return;
        if (normalizeGithubCommitSha(commitId) === null) {
            setError('Zadejte ID commitu (7 až 40 hexadecimálních znaků).');
            return;
        }
        const controller = new AbortController();
        lookupController.current = controller;
        const timeout = window.setTimeout(async () => {
            if (controller.signal.aborted) return;
            setIsLoading(true);
            try {
                const result = await fetchAdminWorkshopRepositoryCommit(repository, { kind: 'id', commitId }, controller.signal);
                if (!controller.signal.aborted) setCommit(result);
            } catch (lookupError) {
                if (!controller.signal.aborted) setError(lookupError instanceof Error ? lookupError.message : 'Commit se nepodařilo načíst.');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }, COMMIT_PREVIEW_DELAY_MILLISECONDS);
        return () => { controller.abort(); window.clearTimeout(timeout); };
        // The key captures the repository, branch selection, ID and date without resetting for unrelated form edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestKey]);

    const autoFill = async () => {
        if (repository === null || date === null) return;
        lookupController.current?.abort();
        const controller = new AbortController();
        lookupController.current = controller;
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchAdminWorkshopRepositoryCommit(repository, { kind: 'date', boundary, date }, controller.signal);
            if (controller.signal.aborted || currentRequestKey.current !== requestKey) return;
            setCommit(result);
            currentOnChange.current(result.sha);
        } catch (lookupError) {
            if (!controller.signal.aborted && currentRequestKey.current === requestKey) setError(lookupError instanceof Error ? lookupError.message : 'Commit se nepodařilo načíst.');
        } finally {
            if (!controller.signal.aborted && currentRequestKey.current === requestKey) setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <label htmlFor={inputId} className="font-medium text-slate-700">{isStart ? 'Počáteční commit' : 'Koncový commit'}</label>
            <Input id={inputId} value={commitId} onChange={(event) => onChange(event.target.value)}
                className="font-mono" placeholder="ID commitu · nepovinné" aria-describedby={`${inputId}-help`}
                aria-invalid={error !== null} />
            <Button type="button" variant="outline" size="sm" onClick={() => void autoFill()}
                disabled={isLoading || date === null || connectedRepository === null}>
                {isStart ? 'Doplnit podle začátku workshopu' : 'Doplnit podle konce workshopu'}
            </Button>
            <p id={`${inputId}-help`} className="text-xs text-slate-500">
                {isStart ? 'První commit v čase začátku nebo po něm.' : 'Poslední commit v čase konce nebo před ním.'}
                {' '}Pouze z vybraných větví. Prázdné pole tuto hranici neomezuje.
                {!isStart && date === null && ' Pro automatické doplnění nejdříve zadejte konec workshopu.'}
            </p>
            {isLoading && <p role="status" className="text-xs text-slate-500">Načítám commit…</p>}
            {error !== null && <p role="alert" className="text-xs text-red-700">{error}</p>}
            {commit !== null && connectedRepository !== null && (
                <a href={createGithubCommitUrl(connectedRepository, commit.sha)} target="_blank" rel="noopener noreferrer"
                    className="block rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:border-blue-400">
                    <span className="block break-words font-medium">{commit.message}</span>
                    <span className="text-xs">{commit.authorName ?? 'Neznámý autor'} · {formatGithubCommitDate(commit.committedAt)}</span>
                    <span className="block break-all font-mono text-xs text-slate-500">{commit.sha}</span>
                </a>
            )}
        </div>
    );
}
