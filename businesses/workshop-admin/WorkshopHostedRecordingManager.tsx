'use client';

import { Button } from '@/components/ui/button';
import { HostedRecordingAdminPreview } from '@/businesses/workshop-admin/HostedRecordingAdminPreview';
import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { requestAdminJson } from '@/lib/admin/requestAdminJson';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { mergeHostedRecordingManifests } from '@/lib/workshops/hostedRecording/hostedRecordingManifestImport';
import {
    cancelHostedRecordingRevision, createHostedRecordingRevision, publishHostedRecordingRevision,
    removeHostedRecording, uploadHostedRecordingAsset, validateHostedRecordingRevision,
    type HostedRecordingUploadFile,
} from '@/lib/workshops/hostedRecording/hostedRecordingUploadClient';
import type { HostedRecordingAssetRole, HostedRecordingValidationReport } from
    '@/lib/workshops/hostedRecording/hostedRecordingValidation';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

const FILE_FIELDS: readonly { readonly role: HostedRecordingAssetRole; readonly label: string; readonly accept: string }[] = [
    { role: 'editor', label: 'Editor (VS Code)', accept: 'video/mp4,video/webm,.mp4,.webm' },
    { role: 'application', label: 'Aplikace', accept: 'video/mp4,video/webm,.mp4,.webm' },
    { role: 'camera', label: 'Kamera', accept: 'video/mp4,video/webm,.mp4,.webm' },
    { role: 'manifest', label: 'Manifest schema 5 (společný nebo jeden za každou stopu)', accept: '.json,application/json' },
    { role: 'workshop', label: 'Workshop metadata (připravená)', accept: '.json,application/json' },
    { role: 'subtitle-editor', label: 'Titulky editoru (jen import)', accept: '.srt,.vtt,.json' },
    { role: 'subtitle-application', label: 'Titulky aplikace (jen import)', accept: '.srt,.vtt,.json' },
    { role: 'subtitle-camera', label: 'Titulky kamery (jen import)', accept: '.srt,.vtt,.json' },
    { role: 'activity', label: 'Samostatná aktivita JSON', accept: '.json' },
    { role: 'events', label: 'Samostatné události JSON', accept: '.json' },
    { role: 'commits', label: 'Samostatné commity JSON', accept: '.json' },
];

type AdminRevision = { readonly id: string; readonly status: string; readonly duration_seconds: number | null;
    readonly validation_report: HostedRecordingValidationReport | null; readonly created_at: string;
    readonly live_start_at: string };
type AdminAsset = { readonly id: string; readonly role: HostedRecordingAssetRole; readonly status: string;
    readonly filename: string };
type ManifestTrackChoice = { readonly id: string; readonly kind: string; readonly label: string;
    readonly trimmedFile: string | null };

type Props = {
    readonly workshop: WorkshopDetails;
    readonly onPublished: () => void;
    readonly onRemoved: () => void;
};

function createRevisionBase(workshopId: string): string {
    return `/api/admin/workshops/${encodeURIComponent(workshopId)}/hosted-recordings`;
}

export function WorkshopHostedRecordingManager({ workshop, onPublished, onRemoved }: Props) {
    const [files, setFiles] = useState<Partial<Record<HostedRecordingAssetRole, File>>>({});
    const [sourceIds, setSourceIds] = useState<Partial<Record<HostedRecordingAssetRole, string>>>({});
    const [manifestTracks, setManifestTracks] = useState<readonly ManifestTrackChoice[]>([]);
    const [liveStart, setLiveStart] = useState(() => toDateTimeLocalValue(workshop.startsAt));
    const [revisionId, setRevisionId] = useState<string | null>(null);
    const [revisions, setRevisions] = useState<readonly AdminRevision[]>([]);
    const [assets, setAssets] = useState<readonly AdminAsset[]>([]);
    const [publishedRevisionId, setPublishedRevisionId] = useState<string | null>(workshop.hostedRecordingRevisionId ?? null);
    const [report, setReport] = useState<HostedRecordingValidationReport | null>(null);
    const [progress, setProgress] = useState({ completedBytes: 0, totalBytes: 0 });
    const [message, setMessage] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const uploadController = useRef<AbortController | null>(null);
    const revisionBase = createRevisionBase(workshop.id);

    const refresh = useCallback(async (selectedRevisionId?: string | null) => {
        const response = await fetch(revisionBase, { cache: 'no-store' });
        if (!response.ok) throw new Error('Seznam záznamů se nepodařilo načíst.');
        const data = await response.json() as { revisions?: AdminRevision[]; publishedRevisionId?: string | null };
        if (!Array.isArray(data.revisions)) throw new Error('Seznam záznamů má neplatný formát.');
        setRevisions(data.revisions);
        setPublishedRevisionId(data.publishedRevisionId ?? null);
        if (selectedRevisionId) {
            const revisionResponse = await fetch(`${revisionBase}/${selectedRevisionId}`, { cache: 'no-store' });
            if (revisionResponse.ok) {
                const detail = await revisionResponse.json() as { revision: AdminRevision; assets: AdminAsset[] };
                setAssets(detail.assets);
                setReport(detail.revision.validation_report);
            }
        }
    }, [revisionBase]);
    useEffect(() => {
        void refresh().catch((error: unknown) =>
            setMessage(error instanceof Error ? error.message : 'Seznam záznamů se nepodařilo načíst.'));
        return () => uploadController.current?.abort();
    }, [refresh]);

    const invalidateReadySelection = () => {
        if (revisions.find((revision) => revision.id === revisionId)?.status === 'ready') {
            setRevisionId(null); setAssets([]); setReport(null);
        }
    };

    const selectFile = (role: HostedRecordingAssetRole, file: File | null) => {
        invalidateReadySelection();
        setFiles((current) => ({ ...current, [role]: file ?? undefined }));
    };

    const selectManifests = (selectedFiles: FileList | null) => {
        const manifestFiles = Array.from(selectedFiles ?? []);
        if (manifestFiles.length === 0) {
            selectFile('manifest', null);
            setManifestTracks([]);
            return;
        }
        void mergeHostedRecordingManifests(manifestFiles).then(({ file, tracks }) => {
            selectFile('manifest', file);
            setSourceIds({});
            setManifestTracks(tracks.filter((track) => ['screen', 'camera'].includes(track.kind))
                .map((track) => ({ id: track.id, kind: track.kind, label: track.label ?? track.id,
                    trimmedFile: track.trimmedFile ?? null })));
            setMessage(null);
        }).catch((error: unknown) => {
            selectFile('manifest', null);
            setManifestTracks([]);
            setMessage(error instanceof Error ? error.message : 'Manifesty se nepodařilo spojit.');
        });
    };

    const startUpload = async () => {
        if (!files.manifest || !Object.keys(files).some((role) => ['editor', 'application', 'camera'].includes(role))) {
            setMessage('Vyberte manifest a alespoň jednu obrazovou stopu.'); return;
        }
        const liveStartAt = fromDateTimeLocalValue(liveStart);
        if (!liveStartAt) { setMessage('Vyberte platný začátek společného živého času.'); return; }
        setIsBusy(true); setMessage(null); setReport(null);
        const controller = new AbortController();
        uploadController.current = controller;
        const selectedRevision = revisions.find((revision) => revision.id === revisionId);
        let newRevisionId: string | null = revisionId && selectedRevision &&
            ['draft', 'failed'].includes(selectedRevision.status) &&
            Date.parse(selectedRevision.live_start_at) === Date.parse(liveStartAt)
            ? revisionId : null;
        try {
            newRevisionId ??= await createHostedRecordingRevision(workshop.id, liveStartAt);
            setRevisionId(newRevisionId);
            const selectedFiles: HostedRecordingUploadFile[] = FILE_FIELDS.flatMap(({ role }) => {
                const file = files[role];
                return file ? [{ role, file, sourceId: sourceIds[role] || null }] : [];
            });
            const totalBytes = selectedFiles.reduce((sum, asset) => sum + asset.file.size, 0);
            let previousBytes = 0;
            setProgress({ completedBytes: 0, totalBytes });
            for (const asset of selectedFiles) {
                controller.signal.throwIfAborted();
                await uploadHostedRecordingAsset(workshop.id, newRevisionId, asset, controller.signal,
                    (completedFileBytes) => setProgress({ completedBytes: previousBytes + completedFileBytes, totalBytes }));
                previousBytes += asset.file.size;
            }
            setMessage('Soubory jsou uložené. Kontroluji kodeky, časovou osu a metadata…');
            const validationReport = await validateHostedRecordingRevision(workshop.id, newRevisionId);
            setReport(validationReport);
            setMessage(validationReport.isValid ? 'Kontrola prošla. Prohlédněte náhled a potvrďte publikaci.' : 'Kontrola našla chyby.');
        } catch (error) {
            setMessage(controller.signal.aborted ? 'Nahrávání bylo přerušeno. Původní publikovaný záznam zůstal beze změny.' :
                error instanceof Error ? error.message : 'Nahrávání selhalo.');
        } finally {
            uploadController.current = null;
            setIsBusy(false);
            await refresh(newRevisionId).catch(() => undefined);
        }
    };

    const publish = async () => {
        if (!revisionId || !report?.isValid) return;
        setIsBusy(true); setMessage(null);
        try {
            if (!await flushAdminSaves()) throw new Error('Nejprve uložte změny nastavení workshopu.');
            await publishHostedRecordingRevision(workshop.id, revisionId);
            setMessage('Nová revize je publikovaná. Připojení diváci dokončí starou revizi.');
            onPublished();
            await refresh(revisionId);
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Publikace selhala.'); }
        finally { setIsBusy(false); }
    };

    const cancel = async () => {
        if (uploadController.current) {
            uploadController.current.abort();
            setMessage('Nahrávání se zastavuje. Rozpracovanou revizi můžete později obnovit nebo zrušit.');
            return;
        }
        if (!revisionId) return;
        setIsBusy(true);
        try { await cancelHostedRecordingRevision(workshop.id, revisionId); setMessage('Rozpracovaná revize byla zrušena.');
            setRevisionId(null); setAssets([]); setReport(null); await refresh(); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Zrušení selhalo.'); }
        finally { setIsBusy(false); }
    };

    const removeDraftAsset = async (assetId: string) => {
        if (!revisionId) return;
        setIsBusy(true); setMessage(null);
        try {
            await requestAdminJson(`${revisionBase}/${encodeURIComponent(revisionId)}/assets/${encodeURIComponent(assetId)}`,
                { method: 'DELETE' });
            setReport(null);
            await refresh(revisionId);
            setMessage('Soubor byl odstraněn. Vyberte náhradní soubor a znovu ověřte revizi.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Soubor se nepodařilo odstranit.');
        } finally { setIsBusy(false); }
    };

    const remove = async () => {
        if (!window.confirm('Odpojit publikovaný záznam a přepnout workshop zpět na YouTube?')) return;
        setIsBusy(true);
        try { if (!await flushAdminSaves()) throw new Error('Nejprve uložte změny nastavení workshopu.');
            await removeHostedRecording(workshop.id); setMessage('Hostovaný záznam byl odpojen.');
            onRemoved(); await refresh(); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Odpojení selhalo.'); }
        finally { setIsBusy(false); }
    };

    const selectedRevision = revisions.find((revision) => revision.id === revisionId);
    const firstVideoAsset = assets.find((asset) => ['editor', 'application', 'camera'].includes(asset.role) && asset.status === 'complete');
    const isPublishable = selectedRevision?.status === 'ready' && report?.isValid === true;

    return <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm md:col-span-2" aria-label="Hostovaný záznam workshopu">
        <div><h3 className="font-semibold text-slate-900">Hostovaný synchronizovaný záznam</h3>
            <p className="text-slate-600">Nahrávejte připravené samostatné stopy a manifest schema 5. Stávající záznam zůstane dostupný až do ověřené publikace nové revize.</p></div>
        <p>Publikovaná revize: <strong>{publishedRevisionId ?? 'žádná'}</strong></p>
        {revisions.some((revision) => ['draft', 'failed', 'ready'].includes(revision.status)) && <label className="block">
            Rozpracovaná revize
            <select className="mt-1 block w-full max-w-xl rounded border border-slate-300 bg-white p-2"
                value={revisionId && ['draft', 'failed', 'ready'].includes(revisions.find((revision) => revision.id === revisionId)?.status ?? '')
                    ? revisionId : ''}
                onChange={(event) => {
                    const selectedId = event.target.value || null;
                    setRevisionId(selectedId);
                    setAssets([]); setReport(null); setFiles({}); setSourceIds({});
                    const selectedRevision = revisions.find((revision) => revision.id === selectedId);
                    if (selectedRevision) setLiveStart(toDateTimeLocalValue(selectedRevision.live_start_at));
                    if (selectedId) void refresh(selectedId).catch((error: unknown) =>
                        setMessage(error instanceof Error ? error.message : 'Revizi se nepodařilo načíst.'));
                }} disabled={isBusy}>
                <option value="">Nová revize</option>
                {revisions.filter((revision) => ['draft', 'failed', 'ready'].includes(revision.status))
                    .map((revision) => <option key={revision.id} value={revision.id}>
                        {new Date(revision.created_at).toLocaleString('cs-CZ')} · {revision.status === 'ready' ? 'ověřená k publikaci' :
                            revision.status === 'failed' ? 'kontrola selhala' : 'rozpracovaná'}
                    </option>)}
            </select>
            <span className="block text-xs text-slate-500">U rozpracovaného nahrávání vyberte stejné soubory; nahrané části se ověří podle SHA-256. Ověřenou revizi lze po obnovení rovnou publikovat.</span>
        </label>}
        <label className="block">Začátek živého session času
            <input type="datetime-local" value={liveStart} onChange={(event) => {
                invalidateReadySelection(); setLiveStart(event.target.value);
            }}
                className="mt-1 block rounded border border-slate-300 bg-white p-2" disabled={isBusy} />
            <span className="block text-xs text-slate-500">Nula připravených souborů odpovídá přesně tomuto okamžiku.
                U oříznutého exportu zohledněte začátek výběru i případná pozastavení. YouTube offset se znovu nepoužije.</span>
        </label>
        <div className="grid gap-3 md:grid-cols-2">{FILE_FIELDS.map(({ role, label, accept }) => {
            const isVideo = ['editor', 'application', 'camera'].includes(role);
            const matchingTracks = manifestTracks.filter((track) => role === 'camera' ? track.kind === 'camera' : track.kind === 'screen');
            return <div key={role} className="rounded border border-slate-200 bg-white p-3">
                <label className="block font-medium">{label}<input className="mt-1 block w-full text-xs" type="file" accept={accept}
                    multiple={role === 'manifest'} disabled={isBusy}
                    onChange={(event) => role === 'manifest' ? selectManifests(event.target.files) :
                        selectFile(role, event.target.files?.[0] ?? null)} /></label>
                {isVideo && files[role] && matchingTracks.length > 0 && <label className="mt-2 block text-xs">Zdroj v manifestu
                    <select className="mt-1 w-full rounded border p-1" value={sourceIds[role] ?? ''}
                        onChange={(event) => { invalidateReadySelection();
                            setSourceIds((current) => ({ ...current, [role]: event.target.value })); }}>
                        <option value="">Podle názvu souboru</option>
                        {matchingTracks.map((track) => <option key={track.id} value={track.id}>{track.label} · {track.id}</option>)}
                    </select></label>}
            </div>;
        })}</div>
        {assets.length > 0 && <div className="rounded border border-slate-200 bg-white p-3">
            <p className="mb-2 font-semibold">Soubory této revize</p>
            <ul className="space-y-2">{assets.map((asset) => <li key={asset.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{asset.role}: {asset.filename} · {asset.status}</span>
                {['draft', 'failed'].includes(selectedRevision?.status ?? '') && <Button type="button" variant="outline"
                    disabled={isBusy} onClick={() => void removeDraftAsset(asset.id)}>Odstranit soubor</Button>}
            </li>)}</ul>
        </div>}
        <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void startUpload()} disabled={isBusy}>Nahrát a ověřit novou revizi</Button>
            {revisionId && (uploadController.current !== null ||
                ['draft', 'failed', 'ready'].includes(selectedRevision?.status ?? '')) &&
                <Button type="button" variant="outline" onClick={() => void cancel()}
                    disabled={isBusy && !uploadController.current}>Zrušit nahrávání / revizi</Button>}
            <Button type="button" onClick={() => void publish()} disabled={isBusy || !isPublishable}>Publikovat záznam</Button>
            {publishedRevisionId && <Button type="button" variant="outline" onClick={() => void remove()} disabled={isBusy}>Odpojit záznam</Button>}
        </div>
        {isBusy && progress.totalBytes > 0 && <progress className="w-full" value={progress.completedBytes} max={progress.totalBytes} aria-label="Průběh nahrávání" />}
        {message && <p role="status" className="text-slate-700">{message}</p>}
        {report && <div className="space-y-2 rounded border bg-white p-3" role="status">
            <h4 className="font-semibold">Výsledek kontroly: {report.isValid ? 'připraveno k publikaci' : 'nelze publikovat'}</h4>
            {report.durationSeconds !== null && <p>Společná délka: {report.durationSeconds.toFixed(2)} s</p>}
            {report.tracks.map((track) => <p key={track.role}>{track.role}: {track.durationSeconds.toFixed(2)} s · {track.videoCodec}{track.audioCodec ? ` + ${track.audioCodec}` : ''}</p>)}
            {report.errors.map((error) => <p key={error} className="text-red-700">{error}</p>)}
            {report.warnings.map((warning) => <p key={warning} className="text-amber-700">{warning}</p>)}
        </div>}
        {revisionId && report?.isValid && <HostedRecordingAdminPreview workshopId={workshop.id} revisionId={revisionId} />}
        {revisionId && !report?.isValid && firstVideoAsset && <div className="max-w-2xl"><p className="mb-1 font-semibold">Náhled souboru</p>
            <video controls preload="metadata" className="w-full rounded bg-black"
                src={`${revisionBase}/${revisionId}/assets/${firstVideoAsset.id}/media`} /></div>}
    </section>;
}
