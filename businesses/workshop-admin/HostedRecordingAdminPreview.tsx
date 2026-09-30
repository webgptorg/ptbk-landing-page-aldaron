'use client';

import { WorkshopHostedRecordingPlayer, type HostedRecordingAdminPreview,
    type PlayerManifest, type TrackRole } from '@/businesses/online-workshop/participant/WorkshopHostedRecordingPlayer';
import { useEffect, useState } from 'react';

type Props = { readonly workshopId: string; readonly revisionId: string };

/** The same synchronized player uses admin-only media routes while publication is being reviewed. */
export function HostedRecordingAdminPreview({ workshopId, revisionId }: Props) {
    const [preview, setPreview] = useState<HostedRecordingAdminPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const revisionUrl = `/api/admin/workshops/${encodeURIComponent(workshopId)}/hosted-recordings/${encodeURIComponent(revisionId)}`;
        setPreview(null); setError(null);
        void fetch(revisionUrl, { cache: 'no-store', signal: controller.signal }).then(async (response) => {
            if (!response.ok) throw new Error('Náhled záznamu nelze načíst.');
            return response.json() as Promise<{ revision: { player_metadata: PlayerManifest | null };
                assets: readonly { id: string; role: string; status: string }[] }>;
        }).then(({ revision, assets }) => {
            const manifest = revision.player_metadata;
            if (!manifest || manifest.schemaVersion !== 1 || !Array.isArray(manifest.tracks)) {
                throw new Error('Před náhledem dokončete ověření záznamu.');
            }
            const trackUrls: Partial<Record<TrackRole, string>> = {};
            for (const track of manifest.tracks) {
                const asset = assets.find((candidate) => candidate.role === track.role && candidate.status === 'complete');
                if (!asset) throw new Error(`Stopa ${track.role} pro náhled chybí.`);
                trackUrls[track.role] = `${revisionUrl}/assets/${encodeURIComponent(asset.id)}/media`;
            }
            setPreview({ manifest, trackUrls });
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Náhled záznamu nelze načíst.');
        });
        return () => controller.abort();
    }, [workshopId, revisionId]);

    if (error) return <p role="alert" className="text-red-700">{error}</p>;
    if (!preview) return <p role="status">Načítám synchronizovaný náhled…</p>;
    return <div className="max-w-3xl">
        <p className="mb-1 font-semibold">Synchronizovaný náhled před publikací</p>
        <WorkshopHostedRecordingPlayer adminPreview={preview} serverTime={new Date().toISOString()} />
    </div>;
}
