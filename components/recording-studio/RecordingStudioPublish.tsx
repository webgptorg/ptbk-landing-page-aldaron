'use client';

import { Button } from '@/components/ui/button';
import { HostedRecordingAdminPreview } from '@/businesses/workshop-admin/HostedRecordingAdminPreview';
import { toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { createRecordingArchiveManifest, recordingFileStem, recordingPreparedFilename } from
    '@/lib/recording-studio/recordingStudioExport';
import { getRecordingDerivedFiles } from '@/lib/recording-studio/recordingStudioDerivedExport';
import { createRecordingEditRecipe, getRecordingPartForSelection, getRecordingPartTrack, getRecordingSelection } from
    '@/lib/recording-studio/recordingStudioSessionTime';
import { readRecordingPart } from '@/lib/recording-studio/recordingStudioStorage';
import { withTrimmedRecordingTrack, type RecordingPreparedTiming } from '@/lib/recording-studio/recordingStudioTrim';
import type { RecordingArchiveTrack, RecordingTrack, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { createRecordingWorkshopSidecar, validateRecordingWorkshopMetadata } from
    '@/lib/recording-studio/recordingStudioWorkshop';
import { cancelHostedRecordingRevision, createHostedRecordingRevision, publishHostedRecordingRevision, uploadHostedRecordingAsset,
    validateHostedRecordingRevision } from '@/lib/workshops/hostedRecording/hostedRecordingUploadClient';
import type { HostedRecordingValidationReport, HostedRecordingVideoRole } from
    '@/lib/workshops/hostedRecording/hostedRecordingValidation';
import { useEffect, useRef, useState } from 'react';

type WorkshopOption = { readonly id: string; readonly title: string; readonly startsAt: string };
type Props = { readonly recording: StudioRecording; readonly isDisabled: boolean };
const VIDEO_ROLES: readonly HostedRecordingVideoRole[] = ['editor', 'application', 'camera'];
const VIDEO_ROLE_LABELS: Record<HostedRecordingVideoRole, string> = {
    editor: 'Editor (VS Code)', application: 'Aplikace', camera: 'Kamera',
};

/** A studio project uses the same upload and server validation as independent exported files. */
export function RecordingStudioPublish({ recording, isDisabled }: Props) {
    const [workshops, setWorkshops] = useState<readonly WorkshopOption[]>([]);
    const [workshopId, setWorkshopId] = useState('');
    const [liveStartAt, setLiveStartAt] = useState('');
    const [sourceIds, setSourceIds] = useState<Partial<Record<HostedRecordingVideoRole, string>>>({});
    const [revisionId, setRevisionId] = useState<string | null>(null);
    const [revisionLiveStartAt, setRevisionLiveStartAt] = useState<string | null>(null);
    const [report, setReport] = useState<HostedRecordingValidationReport | null>(null);
    const [previewAssetId, setPreviewAssetId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const controllerReference = useRef<AbortController | null>(null);

    useEffect(() => {
        void fetch('/api/admin/workshops?kind=workshop', { cache: 'no-store' })
            .then((response) => response.ok ? response.json() : Promise.reject(new Error('Workshopy nelze načíst.')))
            .then((data) => setWorkshops((data as { workshops: WorkshopOption[] }).workshops))
            .catch(() => setMessage('Seznam workshopů se nepodařilo načíst.'));
    }, []);
    useEffect(() => () => controllerReference.current?.abort(), []);

    const prepare = async () => {
        if (!workshopId || !liveStartAt) { setMessage('Vyberte workshop a začátek živého session času.'); return; }
        const selected = VIDEO_ROLES.flatMap((role) => {
            const track = recording.tracks.find((candidate) => candidate.id === sourceIds[role]);
            return track ? [{ role, track }] : [];
        });
        if (selected.length === 0 || new Set(selected.map(({ track }) => track.id)).size !== selected.length) {
            setMessage('Vyberte aspoň jednu obrazovou stopu a každou použijte jen jednou.'); return;
        }
        setIsBusy(true); setMessage(null); setReport(null);
        const controller = new AbortController(); controllerReference.current = controller;
        try {
            if (!await flushAdminSaves()) throw new Error('Nejprve uložte změny v editoru.');
            if (recording.status !== 'complete') throw new Error('Publikovat lze jen dokončený záznam.');
            const selection = getRecordingSelection(recording);
            const recordingForPublish = { ...recording, trim: selection, editRecipe: createRecordingEditRecipe(recording, selection) };
            validateRecordingWorkshopMetadata(recordingForPublish, selection);
            const selectedLiveStartAt = new Date(liveStartAt).toISOString();
            const revision = revisionId && report === null && !isPublished &&
                revisionLiveStartAt === selectedLiveStartAt ? revisionId :
                await createHostedRecordingRevision(workshopId, selectedLiveStartAt);
            setRevisionId(revision);
            setRevisionLiveStartAt(selectedLiveStartAt);
            setIsPublished(false);
            const preparedTracks = new Map<string, { readonly filename: string; readonly timing: RecordingPreparedTiming }>();
            let firstAssetId: string | null = null;
            for (const { role, track } of selected) {
                controller.signal.throwIfAborted();
                const part = getRecordingPartForSelection(track, selection);
                if (!part) throw new Error(`Stopa „${track.label}“ nemá jedinou připravitelnou část pro celý výběr. Vyberte interval v jedné části nebo nahrajte samostatně exportované soubory.`);
                setMessage(`Připravuji a nahrávám ${VIDEO_ROLE_LABELS[role]}…`);
                const filename = recordingPreparedFilename(recordingForPublish, track);
                const result = await withTrimmedRecordingTrack({
                    blob: await readRecordingPart(recording.id, part, controller.signal),
                    track: getRecordingPartTrack(track, part), trim: selection, signal: controller.signal,
                    onProgress: (progress) => setMessage(`${VIDEO_ROLE_LABELS[role]}: příprava ${Math.round(progress * 100)} %`),
                    consume: async (file, _extension, timing) => {
                        const assetId = await uploadHostedRecordingAsset(workshopId, revision, { role, file, filename,
                            sourceId: track.id }, controller.signal, (completedBytes, totalBytes) =>
                            setMessage(`${VIDEO_ROLE_LABELS[role]}: nahrávání ${Math.round(completedBytes / totalBytes * 100)} %`));
                        return { assetId, timing };
                    },
                });
                if (!firstAssetId) firstAssetId = result.assetId;
                preparedTracks.set(track.id, { filename, timing: result.timing });
            }
            setPreviewAssetId(firstAssetId);
            const workshopSidecar = await createRecordingWorkshopSidecar(recordingForPublish, true);
            const workshopFiles = workshopSidecar ? [{ filename: `metadata/prepared/${recordingFileStem(recording)}-workshop.json`,
                content: JSON.stringify(workshopSidecar), coordinate: 'prepared-export' as const,
                sourceRevision: workshopSidecar.sourceRevision, currentRevision: workshopSidecar.currentRevision }] : [];
            if (workshopFiles[0]) {
                const file = new File([workshopFiles[0].content], workshopFiles[0].filename.split('/').at(-1)!,
                    { type: 'application/json' });
                await uploadHostedRecordingAsset(workshopId, revision, { role: 'workshop', file }, controller.signal, () => undefined);
            }
            const derivedFiles = getRecordingDerivedFiles(recordingForPublish, recordingFileStem(recording), true);
            for (const { role, track } of selected) {
                const subtitle = derivedFiles.find((candidate) => candidate.sourceId === track.id &&
                    candidate.filename.endsWith('.srt'));
                if (subtitle) {
                    const file = new File([subtitle.content], subtitle.filename.split('/').at(-1)!, { type: 'application/x-subrip' });
                    await uploadHostedRecordingAsset(workshopId, revision, { role: `subtitle-${role}`, file },
                        controller.signal, () => undefined);
                }
            }
            const archiveTracks: RecordingArchiveTrack[] = recording.tracks.map((track: RecordingTrack) => {
                const prepared = preparedTracks.get(track.id);
                return { ...track, originalFile: null, trimmedFile: prepared?.filename ?? null,
                    ...(prepared ? { preparation: { status: 'prepared' as const,
                        preparedTimeZeroSessionSeconds: selection.startSeconds,
                        firstTimestampSeconds: prepared.timing.firstTimestampSeconds,
                        endTimestampSeconds: prepared.timing.endTimestampSeconds,
                        components: prepared.timing.components,
                        originalContainerOriginSeconds: prepared.timing.originalContainerOriginSeconds,
                        videoFrameRate: prepared.timing.videoFrameRate } } : {}) };
            });
            const manifest = createRecordingArchiveManifest(recordingForPublish, archiveTracks,
                preparedTracks.size === recording.tracks.length, derivedFiles, workshopFiles);
            const manifestFile = new File([JSON.stringify(manifest)], `${recordingFileStem(recording)}.json`,
                { type: 'application/json' });
            await uploadHostedRecordingAsset(workshopId, revision, { role: 'manifest', file: manifestFile },
                controller.signal, () => undefined);
            setMessage('Soubory jsou uložené. Server ověřuje čas a kodeky…');
            const validationReport = await validateHostedRecordingRevision(workshopId, revision);
            setReport(validationReport);
            setMessage(validationReport.isValid ? 'Náhled je připravený. Potvrďte publikaci do workshopu.' : 'Kontrola záznam odmítla.');
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Publikace selhala.'); }
        finally { controllerReference.current = null; setIsBusy(false); }
    };

    const publish = async () => {
        if (!workshopId || !revisionId || !report?.isValid) return;
        setIsBusy(true);
        try { await publishHostedRecordingRevision(workshopId, revisionId);
            setIsPublished(true);
            setMessage('Záznam je publikovaný. Workshop používá hostované video.'); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Publikace selhala.'); }
        finally { setIsBusy(false); }
    };

    const cancel = async () => {
        if (!workshopId || !revisionId || isPublished) return;
        setIsBusy(true);
        try {
            await cancelHostedRecordingRevision(workshopId, revisionId);
            setRevisionId(null); setRevisionLiveStartAt(null); setPreviewAssetId(null); setReport(null);
            setMessage('Rozpracovaná revize byla zrušena.');
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Revizi se nepodařilo zrušit.'); }
        finally { setIsBusy(false); }
    };

    return <section className="space-y-3 rounded-xl border bg-white p-4 text-sm" aria-label="Publikovat do workshopu">
        <h3 className="font-semibold">Publikovat do workshopu</h3>
        <p className="text-slate-600">Studio připraví vybrané stopy na společnou nulu, nahraje je do soukromého úložiště a před publikací ukáže serverovou kontrolu a náhled.</p>
        <label className="block">Workshop <select className="mt-1 block w-full rounded border p-2" value={workshopId} disabled={isBusy || isDisabled}
            onChange={(event) => { const selectedWorkshop = workshops.find((candidate) => candidate.id === event.target.value);
                setWorkshopId(event.target.value); setLiveStartAt(toDateTimeLocalValue(selectedWorkshop?.startsAt ?? null));
                setRevisionId(null); setRevisionLiveStartAt(null); setPreviewAssetId(null);
                setReport(null); setIsPublished(false); setMessage(null); }}>
            <option value="">Vyberte workshop</option>{workshops.map((workshop) => <option key={workshop.id} value={workshop.id}>{workshop.title}</option>)}
        </select></label>
        <label className="block">Začátek živého session času<input type="datetime-local" value={liveStartAt}
            onChange={(event) => { setLiveStartAt(event.target.value); setRevisionId(null);
                setRevisionLiveStartAt(null); setReport(null); setPreviewAssetId(null); setIsPublished(false); }}
            disabled={isBusy || isDisabled}
            className="mt-1 block rounded border p-2" /></label>
        <div className="grid gap-2 sm:grid-cols-3">{VIDEO_ROLES.map((role) => <label key={role}>{VIDEO_ROLE_LABELS[role]}
            <select className="mt-1 block w-full rounded border p-2" value={sourceIds[role] ?? ''}
                disabled={isBusy || isDisabled}
                onChange={(event) => { setSourceIds((current) => ({ ...current, [role]: event.target.value }));
                    setRevisionId(null); setRevisionLiveStartAt(null); setReport(null);
                    setPreviewAssetId(null); setIsPublished(false); }}>
                <option value="">Bez stopy</option>
                {recording.tracks.filter((track) => role === 'camera' ? track.kind === 'camera' : track.kind === 'screen')
                    .map((track) => <option key={track.id} value={track.id}>{track.label}</option>)}
            </select></label>)}</div>
        <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void prepare()} disabled={isBusy || isDisabled || !workshopId}>Připravit a nahrát</Button>
            <Button type="button" onClick={() => void publish()} disabled={isBusy || !report?.isValid || isPublished}>Publikovat do workshopu</Button>
            {isBusy && <Button type="button" variant="outline" onClick={() => controllerReference.current?.abort()}>Přerušit</Button>}
            {revisionId && !isBusy && !isPublished && <Button type="button" variant="outline" onClick={() => void cancel()}>Zrušit rozpracovanou revizi</Button>}
        </div>
        {message && <p role="status">{message}</p>}
        {report && <div className="rounded border p-3" role="status">
            <p>{report.isValid ? 'Kontrola prošla' : 'Kontrola selhala'} · {report.durationSeconds?.toFixed(2) ?? '—'} s</p>
            {report.tracks.map((track) => <p key={track.role}>{track.role}: {track.videoCodec} · {track.durationSeconds.toFixed(2)} s</p>)}
            {report.errors.map((error) => <p key={error} className="text-red-700">{error}</p>)}
        </div>}
        {workshopId && revisionId && report?.isValid && <HostedRecordingAdminPreview workshopId={workshopId} revisionId={revisionId} />}
        {workshopId && revisionId && !report?.isValid && previewAssetId && <video controls preload="metadata" className="w-full max-w-2xl rounded bg-black"
            src={`/api/admin/workshops/${workshopId}/hosted-recordings/${revisionId}/assets/${previewAssetId}/media`} />}
    </section>;
}
