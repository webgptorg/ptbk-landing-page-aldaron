'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { mergeWorkshopRepositoryProgress, type WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';

/** History browsing never enters the live commit notification path. */
export function useWorkshopRepositoryHistory(
    workshopSlug: string,
    repositoryKey: string,
    progress: WorkshopRepositoryProgress | null,
) {
    const [rangeHistory, setRangeHistory] = useState<WorkshopRepositoryProgress | null>(null);
    const [expandedHistory, setExpandedHistory] = useState<WorkshopRepositoryProgress | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const currentKey = `${workshopSlug}|${repositoryKey}`;
    const currentKeyRef = useRef(currentKey);
    currentKeyRef.current = currentKey;
    const isRequestPending = useRef(false);
    const historySessionRef = useRef({});

    useEffect(() => {
        currentKeyRef.current = currentKey;
        setRangeHistory(null);
        setExpandedHistory(null);
        setIsExpanded(false);
        setIsLoadingHistory(false);
        setHistoryError(null);
        isRequestPending.current = false;
        return () => {
            currentKeyRef.current = '';
            // A request from an earlier visit stays stale even if the participant switches back to the same project.
            historySessionRef.current = {};
        };
    }, [currentKey]);

    const isRangeConfigured = progress?.range !== undefined
        && (progress.range.start !== null || progress.range.end !== null);
    const selectedHistory = isExpanded || !isRangeConfigured ? expandedHistory : rangeHistory;
    const nextPage = selectedHistory !== null ? selectedHistory.nextPage ?? null
        : isExpanded ? 1 : progress?.nextPage ?? null;

    const readHistory = async (isExpandedRequest: boolean, page: number) => {
        if (isRequestPending.current) return;
        const historySession = historySessionRef.current;
        const isCurrentRequest = () => currentKeyRef.current === currentKey && historySessionRef.current === historySession;
        isRequestPending.current = true;
        setIsLoadingHistory(true);
        setHistoryError(null);
        try {
            const result = await fetchWorkshopRepositoryProgress(workshopSlug, { page, isExpanded: isExpandedRequest });
            if (!isCurrentRequest()) return;
            if (result.progress === null) throw new Error('Historii se nepodařilo načíst. Zkuste to znovu.');
            const setHistory = isExpandedRequest ? setExpandedHistory : setRangeHistory;
            setHistory((previous) => mergeWorkshopRepositoryProgress(previous, result.progress));
        } catch (error) {
            if (isCurrentRequest()) setHistoryError(error instanceof Error ? error.message : 'Historii se nepodařilo načíst.');
        } finally {
            if (isCurrentRequest()) {
                isRequestPending.current = false;
                setIsLoadingHistory(false);
            }
        }
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded && expandedHistory === null) void readHistory(true, 1);
    };
    const loadMore = () => {
        if (nextPage !== null) void readHistory(isExpanded || !isRangeConfigured, nextPage);
    };
    const rangedProgress = mergeWorkshopRepositoryProgress(progress, rangeHistory);
    return {
        progress: isExpanded || !isRangeConfigured ? mergeWorkshopRepositoryProgress(rangedProgress, expandedHistory) : rangedProgress,
        isExpanded, toggleExpanded, loadMore, isLoadingHistory, historyError,
        isMoreHistoryAvailable: nextPage !== null,
    };
}
