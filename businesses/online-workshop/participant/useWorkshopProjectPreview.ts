'use client';

import { fetchWorkshopProjectPreview } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { createWorkshopProjectPreviewFallback } from '@/lib/workshops/workshopProjectPreview';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopProjectPreview } from '@/lib/workshops/workshopTypes';
import { useEffect, useState } from 'react';

/** Keeps late metadata from a previous room or deployment out of the current project's preview. */
export function useWorkshopProjectPreview(workshopSlug: string, repository: WorkshopRepository): WorkshopProjectPreview {
    const fallbackPreview = createWorkshopProjectPreviewFallback(repository);
    const { repositoryName, deploymentUrl } = fallbackPreview;
    const previewKey = JSON.stringify([workshopSlug, repositoryName, deploymentUrl]);
    const [loadedPreview, setLoadedPreview] = useState<{
        readonly key: string;
        readonly preview: WorkshopProjectPreview;
    } | null>(null);

    useEffect(() => {
        setLoadedPreview(null);
        if (deploymentUrl === null) return;

        const abortController = new AbortController();
        let isCurrentPreview = true;
        void fetchWorkshopProjectPreview(workshopSlug, abortController.signal)
            .then(({ preview }) => {
                if (isCurrentPreview && preview?.repositoryName === repositoryName && preview.deploymentUrl === deploymentUrl) {
                    setLoadedPreview({ key: previewKey, preview });
                }
            })
            .catch(() => {
                // The application address and repository links remain useful without external metadata.
            });

        return () => {
            isCurrentPreview = false;
            abortController.abort();
        };
    }, [workshopSlug, repositoryName, deploymentUrl, previewKey]);

    return loadedPreview?.key === previewKey ? loadedPreview.preview : fallbackPreview;
}
