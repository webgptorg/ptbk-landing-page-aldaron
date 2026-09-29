'use client';

import { Button } from '@/components/ui/button';
import { extractGithubBranchPattern, extractGithubRepository, formatGithubRepositoryName } from '@/lib/github/githubRepository';
import { getRecordingMediaRevision } from '@/lib/recording-studio/recordingStudioDerived';
import { formatRecordingTimecode, getRecordingSessionDuration } from '@/lib/recording-studio/recordingStudioSessionTime';
import { createRecordingWorkshopMetadata, getRecordingWorkshopCommitAt, getRecordingWorkshopSceneAt,
    mergeRecordingWorkshopActivity, moveRecordingWorkshopActivityBoundary, splitRecordingWorkshopActivity,
    suggestRecordingWorkshopSpeechBoundaries, validateRecordingWorkshopMetadata } from '@/lib/recording-studio/recordingStudioWorkshop';
import type { RecordingDerivedTrack, RecordingWorkshopCommit, RecordingWorkshopMetadata, RecordingWorkshopScene, StudioRecording } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useState } from 'react';

const MAXIMUM_VISIBLE_ROWS = 80;
const COMMIT_SHA_PATTERN = /^[0-9a-f]{7,40}$/i;
const ISO_WITH_TIMEZONE_PATTERN = /(?:Z|[+-]\d\d:\d\d)$/i;

type WorkshopEditorProps = { readonly recording: StudioRecording; readonly metadata: RecordingWorkshopMetadata | undefined;
    readonly onChange: (metadata: RecordingWorkshopMetadata) => void; readonly derivedTracks: readonly RecordingDerivedTrack[];
    readonly seconds: number; readonly onSeek: (seconds: number) => void; readonly isDisabled: boolean };

function sortedBySeconds<Value extends { readonly seconds: number }>(values: readonly Value[]): Value[] {
    return [...values].sort((first, second) => first.seconds - second.seconds);
}

function updateMetadata(metadata: RecordingWorkshopMetadata, onChange: WorkshopEditorProps['onChange'], change: Partial<RecordingWorkshopMetadata>) {
    onChange({ ...metadata, ...change });
}

export function RecordingWorkshopEditor({ recording, metadata, onChange, derivedTracks, seconds, onSeek, isDisabled }: WorkshopEditorProps) {
    const [currentRevision, setCurrentRevision] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useEffect(() => { let isCurrent = true; void getRecordingMediaRevision(recording).then((revision) => {
        if (isCurrent) setCurrentRevision(revision);
    }).catch(() => { if (isCurrent) setCurrentRevision(null); }); return () => { isCurrent = false; }; }, [recording]);
    const durationSeconds = getRecordingSessionDuration(recording);
    const create = () => {
        setErrorMessage(null);
        void getRecordingMediaRevision(recording).then((revision) => onChange(createRecordingWorkshopMetadata(recording, revision)))
            .catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'Metadata se nepodařilo založit.'));
    };
    if (!metadata) return <section className="rounded-xl border p-4" aria-label="Metadata workshopu">
        <h3 className="font-semibold">Metadata přehrávače workshopu</h3>
        <p className="mt-1 text-sm text-slate-600">Aktivita, události, Auto-view a Git se ukládají jen v místním záznamu. Samotná média se nezveřejní.</p>
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={create} disabled={isDisabled}>Založit metadata workshopu</Button>
        {errorMessage && <p role="alert" className="mt-2 text-sm text-red-700">{errorMessage}</p>}
    </section>;
    let validationMessage: string | null = null;
    try { validateRecordingWorkshopMetadata({ ...recording, workshopMetadata: metadata }); }
    catch (error) { validationMessage = error instanceof Error ? error.message : 'Metadata nejsou připravená k exportu.'; }
    const commitAtPlayhead = getRecordingWorkshopCommitAt(metadata, seconds);
    return <section className="rounded-xl border p-4" aria-label="Metadata workshopu"><fieldset disabled={isDisabled} className="space-y-5">
        <div><h3 className="font-semibold">Metadata přehrávače workshopu</h3>
            <p className="text-sm text-slate-600">Časy jsou na společných hodinách záznamu. Výběr IN/OUT se použije při exportu. Nezařazený úsek znamená běžné přehrávání 1×; přepis zůstává soukromým pracovním podkladem.</p>
            {currentRevision && metadata.sourceRevision !== currentRevision && <p role="status" className="mt-2 text-sm text-amber-800">Zdroj záznamu se od posledního založení metadat změnil. Ruční opravy zůstaly, ale ověřte je proti novým částem.</p>}
            {currentRevision && metadata.sourceRevision !== currentRevision && <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => onChange({ ...metadata, sourceRevision: currentRevision! })}>Potvrdit kontrolu nové revize zdroje</Button>}
            {validationMessage ? <p role="status" className="mt-2 text-sm text-amber-800">Před exportem: {validationMessage}</p> :
                <p role="status" className="mt-2 text-sm text-emerald-800">Metadata jsou připravená k exportu.</p>}
            <p className="mt-1 text-xs text-slate-500">Commit u hlavy {formatRecordingTimecode(seconds)}: {commitAtPlayhead.state === 'known' ? commitAtPlayhead.sha : commitAtPlayhead.state === 'unavailable' ? 'nedostupný v aktuálním ověření' : 'neznámý'}</p>
        </div>
        <WorkshopActivityEditor metadata={metadata} onChange={onChange} derivedTracks={derivedTracks} seconds={seconds} onSeek={onSeek} durationSeconds={durationSeconds} />
        <WorkshopEventsEditor metadata={metadata} onChange={onChange} seconds={seconds} onSeek={onSeek} durationSeconds={durationSeconds} />
        <WorkshopAutoViewEditor metadata={metadata} onChange={onChange} recording={recording} seconds={seconds} onSeek={onSeek} durationSeconds={durationSeconds} />
        <WorkshopRepositoryEditor metadata={metadata} onChange={onChange} durationSeconds={durationSeconds} seconds={seconds} onSeek={onSeek} />
    </fieldset></section>;
}

function WorkshopActivityEditor({ metadata, onChange, derivedTracks, seconds, onSeek, durationSeconds }: Pick<WorkshopEditorProps, 'metadata' | 'onChange' | 'derivedTracks' | 'seconds' | 'onSeek'> & { readonly metadata: RecordingWorkshopMetadata; readonly durationSeconds: number }) {
    const speechTracks = derivedTracks.filter((track) => track.kind === 'speech-activity');
    const [speechTrackId, setSpeechTrackId] = useState(speechTracks.at(-1)?.id ?? '');
    const [page, setPage] = useState(0);
    const active = metadata.activityIntervals.find((interval) => seconds >= interval.startSeconds && seconds < interval.endSeconds);
    const selectedSpeechTrack = speechTracks.find((track) => track.id === speechTrackId);
    const updateInterval = (id: string, change: Partial<RecordingWorkshopMetadata['activityIntervals'][number]>) => updateMetadata(metadata, onChange, {
        activityIntervals: metadata.activityIntervals.map((interval) => interval.id === id ? { ...interval, ...change, origin: 'manual' } : interval),
    });
    return <div className="space-y-2 border-t pt-4"><h4 className="font-medium">Aktivita</h4>
        <p className="text-sm">U hlavy: {active?.classification ?? 'nezařazeno'} · automatické kódování se nikdy neurčuje podle ticha.</p>
        <div className="flex flex-wrap items-center gap-2"><Button type="button" size="sm" variant="outline" onClick={() => onChange(splitRecordingWorkshopActivity(metadata, seconds))}>Rozdělit u hlavy</Button>
            <select aria-label="Stopa řeči pro návrhy hranic" className="rounded border p-2 text-sm" value={speechTrackId} onChange={(event) => setSpeechTrackId(event.target.value)}><option value="">Bez stopy řeči</option>{speechTracks.map((track) => <option key={track.id} value={track.id}>{track.provenance.sourceLabel} · {track.provenance.createdAt}</option>)}</select>
            <Button type="button" size="sm" variant="outline" disabled={!selectedSpeechTrack} onClick={() => {
                if (selectedSpeechTrack?.kind === 'speech-activity') onChange(suggestRecordingWorkshopSpeechBoundaries(metadata, selectedSpeechTrack));
            }}>Navrhnout hranice z řeči</Button></div>
        {metadata.activityIntervals.length > MAXIMUM_VISIBLE_ROWS && <div className="flex items-center gap-2 text-sm"><Button type="button" size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Předchozí</Button><span>{page + 1} / {Math.ceil(metadata.activityIntervals.length / MAXIMUM_VISIBLE_ROWS)}</span><Button type="button" size="sm" variant="outline" disabled={(page + 1) * MAXIMUM_VISIBLE_ROWS >= metadata.activityIntervals.length} onClick={() => setPage(page + 1)}>Další</Button></div>}
        <div className="max-h-96 space-y-2 overflow-auto">{metadata.activityIntervals.slice(page * MAXIMUM_VISIBLE_ROWS, (page + 1) * MAXIMUM_VISIBLE_ROWS).map((interval, localIndex) => {
            const index = page * MAXIMUM_VISIBLE_ROWS + localIndex;
            return <div key={interval.id} className="flex flex-wrap items-center gap-2 rounded border p-2 text-sm">
                <button type="button" className="text-cyan-800 underline" onClick={() => onSeek(interval.startSeconds)}>{formatRecordingTimecode(interval.startSeconds)}</button>
                {index < metadata.activityIntervals.length - 1 ? <label>Konec <input aria-label="Hranice aktivity" type="number" min={interval.startSeconds} max={metadata.activityIntervals[index + 1]!.endSeconds} step="0.001" className="w-24 rounded border p-1" value={interval.endSeconds} onChange={(event) => onChange(moveRecordingWorkshopActivityBoundary(metadata, index, Number(event.target.value)))} /></label> : <span>do {formatRecordingTimecode(Math.min(interval.endSeconds, durationSeconds))}</span>}
                <label>Typ <select className="rounded border p-1" value={interval.classification} onChange={(event) => { const classification = event.target.value as typeof interval.classification;
                    updateInterval(interval.id, { classification, isReviewed: classification === 'active' }); }}><option value="unclassified">Nezařazeno · 1×</option><option value="active">Aktivní</option><option value="automatic-coding">Automatické kódování</option></select></label>
                {interval.classification === 'automatic-coding' && <label><input type="checkbox" checked={interval.isReviewed} onChange={(event) => updateInterval(interval.id, { isReviewed: event.target.checked })} /> Ručně potvrzeno</label>}
                {index < metadata.activityIntervals.length - 1 && <Button type="button" size="sm" variant="outline" onClick={() => onChange(mergeRecordingWorkshopActivity(metadata, index))}>Sloučit s dalším</Button>}
                <span className="text-xs text-slate-500">{interval.origin === 'speech-suggestion' ? 'Hranice z řeči · ke kontrole' : interval.origin === 'manual' ? 'Ručně' : 'Výchozí'}</span>
            </div>;
        })}</div>
    </div>;
}

function WorkshopEventsEditor({ metadata, onChange, seconds, onSeek, durationSeconds }: Pick<WorkshopEditorProps, 'onChange' | 'seconds' | 'onSeek'> & { readonly metadata: RecordingWorkshopMetadata; readonly durationSeconds: number }) {
    const updateEvent = (id: string, change: Partial<RecordingWorkshopMetadata['events'][number]>) => updateMetadata(metadata, onChange, {
        events: sortedBySeconds(metadata.events.map((event) => event.id === id ? { ...event, ...change } : event)),
    });
    return <div className="space-y-2 border-t pt-4"><h4 className="font-medium">Události</h4>
        <Button type="button" size="sm" variant="outline" onClick={() => updateMetadata(metadata, onChange, { events: sortedBySeconds([...metadata.events,
            { id: crypto.randomUUID(), seconds: Math.min(seconds, durationSeconds - 0.001), title: 'Nová událost', detail: '', type: '' }]) })}>Přidat událost u hlavy</Button>
        <div className="max-h-80 space-y-2 overflow-auto">{metadata.events.map((event) => <div key={event.id} className="flex flex-wrap items-center gap-2 rounded border p-2 text-sm">
            <label>Čas <input aria-label="Čas události" type="number" min="0" max={durationSeconds} step="0.001" className="w-24 rounded border p-1" value={event.seconds} onChange={(input) => updateEvent(event.id, { seconds: Number(input.target.value) })} /></label>
            <label>Název <input aria-label="Název události" className="w-44 rounded border p-1" maxLength={120} value={event.title} onChange={(input) => updateEvent(event.id, { title: input.target.value })} /></label>
            <label>Typ <input aria-label="Typ události" className="w-28 rounded border p-1" maxLength={80} value={event.type} onChange={(input) => updateEvent(event.id, { type: input.target.value })} /></label>
            <label>Detail <input aria-label="Detail události" className="w-52 rounded border p-1" maxLength={2_000} value={event.detail} onChange={(input) => updateEvent(event.id, { detail: input.target.value })} /></label>
            <button type="button" className="text-cyan-800 underline" onClick={() => onSeek(event.seconds)}>Přejít</button>
            <button type="button" className="text-red-700 underline" onClick={() => updateMetadata(metadata, onChange, { events: metadata.events.filter((candidate) => candidate.id !== event.id) })}>Smazat</button>
        </div>)}</div>
    </div>;
}

function WorkshopAutoViewEditor({ metadata, onChange, recording, seconds, onSeek, durationSeconds }: Pick<WorkshopEditorProps, 'recording' | 'onChange' | 'seconds' | 'onSeek'> & { readonly metadata: RecordingWorkshopMetadata; readonly durationSeconds: number }) {
    const view = metadata.autoView;
    const updateView = (change: Partial<typeof view>) => updateMetadata(metadata, onChange, { autoView: { ...view, ...change } });
    const updateTransition = (id: string, change: Partial<typeof view.transitions[number]>) => updateView({ transitions: sortedBySeconds(view.transitions.map((transition) => transition.id === id ? { ...transition, ...change } : transition)) });
    const sceneNow = getRecordingWorkshopSceneAt(metadata, seconds);
    return <div className="space-y-2 border-t pt-4"><h4 className="font-medium">Auto-view · pouze složený obraz účastníka</h4>
        <p className="text-sm text-slate-600">Zdrojové video soubory zůstávají samostatné. Volba musí mít obraz po celý svůj interval.</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">{(['editor', 'application'] as const).map((scene) => <label key={scene}>{scene === 'editor' ? 'Editor' : 'Aplikace'} <select aria-label={`Zdroj ${scene}`} className="rounded border p-1" value={scene === 'editor' ? view.editorSourceId ?? '' : view.applicationSourceId ?? ''} onChange={(event) => updateView({ [scene === 'editor' ? 'editorSourceId' : 'applicationSourceId']: event.target.value || null, isDefaultReviewed: false })}><option value="">Vyberte zdroj</option>{recording.tracks.filter((track) => track.kind !== 'microphone').map((track) => <option key={track.id} value={track.id}>{track.label}</option>)}</select></label>)}</div>
        <div className="flex flex-wrap items-center gap-3 text-sm"><label>Výchozí scéna <select className="rounded border p-1" value={view.defaultScene} onChange={(event) => updateView({ defaultScene: event.target.value as RecordingWorkshopScene, isDefaultReviewed: false })}><option value="editor">Editor</option><option value="application">Aplikace</option></select></label>
            <label><input type="checkbox" checked={view.isDefaultReviewed} onChange={(event) => updateView({ isDefaultReviewed: event.target.checked })} /> Výchozí scénu jsem zkontroloval(a)</label>
            <Button type="button" size="sm" variant="outline" onClick={() => updateView({ transitions: sortedBySeconds([...view.transitions, { id: crypto.randomUUID(), seconds: Math.min(seconds, durationSeconds - 0.001), scene: sceneNow === 'editor' ? 'application' : 'editor', isReviewed: false }]) })}>Přechod u hlavy</Button></div>
        <div className="max-h-72 space-y-2 overflow-auto">{view.transitions.map((transition) => <div key={transition.id} className="flex flex-wrap items-center gap-2 rounded border p-2 text-sm">
            <label>Čas <input aria-label="Čas změny scény" type="number" min="0" max={durationSeconds} step="0.001" className="w-24 rounded border p-1" value={transition.seconds} onChange={(event) => updateTransition(transition.id, { seconds: Number(event.target.value), isReviewed: false })} /></label>
            <label>Scéna <select className="rounded border p-1" value={transition.scene} onChange={(event) => updateTransition(transition.id, { scene: event.target.value as RecordingWorkshopScene, isReviewed: false })}><option value="editor">Editor</option><option value="application">Aplikace</option></select></label>
            <label><input type="checkbox" checked={transition.isReviewed} onChange={(event) => updateTransition(transition.id, { isReviewed: event.target.checked })} /> Zkontrolováno</label>
            <button type="button" className="text-cyan-800 underline" onClick={() => onSeek(transition.seconds)}>Přejít</button>
            <button type="button" className="text-red-700 underline" onClick={() => updateView({ transitions: view.transitions.filter((candidate) => candidate.id !== transition.id) })}>Smazat</button>
        </div>)}</div>
    </div>;
}

type CommitResponse = { readonly commit?: { readonly sha: string; readonly committedAt: string; readonly message: string }; readonly error?: string };
type ProposalResponse = { readonly proposals?: readonly { readonly sha: string; readonly committedAt: string; readonly message: string; readonly seconds: number }[];
    readonly isComplete?: boolean; readonly error?: string };

async function requestRepositoryJson<Response>(path: string, body: unknown): Promise<Response> {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const value: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof value === 'object' && value && 'error' in value && typeof value.error === 'string'
        ? value.error : 'Historii GitHubu se nepodařilo načíst.');
    return value as Response;
}

function WorkshopRepositoryEditor({ metadata, onChange, durationSeconds, seconds, onSeek }: Pick<WorkshopEditorProps, 'onChange' | 'seconds' | 'onSeek'> & { readonly metadata: RecordingWorkshopMetadata; readonly durationSeconds: number }) {
    const [repositoryText, setRepositoryText] = useState(metadata.repository ? formatGithubRepositoryName(metadata.repository) : '');
    const [branchText, setBranchText] = useState(() => {
        const branchSelection = metadata.repository?.branch;
        return Array.isArray(branchSelection) ? branchSelection.join(', ') : typeof branchSelection === 'string' ? branchSelection : '';
    });
    const [startingSha, setStartingSha] = useState(metadata.startingCommit?.sha ?? '');
    const [anchorSha, setAnchorSha] = useState('');
    const [calibrationTime, setCalibrationTime] = useState(metadata.calibration?.wallClockAtSessionSeconds ?? '');
    const [calibrationSeconds, setCalibrationSeconds] = useState(String(metadata.calibration?.sessionSeconds ?? 0));
    const [isWorking, setIsWorking] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const update = (change: Partial<RecordingWorkshopMetadata>) => updateMetadata(metadata, onChange, change);
    const repositoryPayload = metadata.repository ? { url: formatGithubRepositoryName(metadata.repository), branch: metadata.repository.branch, deploymentUrls: [] } : null;
    const saveRepository = () => {
        const repository = extractGithubRepository(repositoryText);
        if (repositoryText.trim() && !repository) { setMessage('Zadejte GitHub repozitář jako owner/name nebo jeho URL.'); return; }
        const branchPatterns = branchText.split(',').map((value) => value.trim()).filter(Boolean);
        const branches = branchPatterns.map(extractGithubBranchPattern);
        if (branches.some((value) => value === null)) { setMessage('Zadejte platné názvy nebo vzory větví oddělené čárkou.'); return; }
        const branch = branches.length === 0 ? null : branches.length === 1 ? branches[0]! : branches as string[];
        const next = repository ? { ...repository, branch } : null;
        if (JSON.stringify(next) !== JSON.stringify(metadata.repository)) {
            update({ repository: next, startingCommit: null, commitAnchors: [], calibration: null });
            setStartingSha(''); setCalibrationTime('');
            setMessage(repository ? 'Repozitář uložen. Připojte počáteční commit.' : 'Repozitář odebrán.');
        } else setMessage('Výběr repozitáře se nezměnil.');
    };
    const resolve = async (sha: string): Promise<RecordingWorkshopCommit> => {
        if (!repositoryPayload || !COMMIT_SHA_PATTERN.test(sha)) throw new Error('Vyberte repozitář a zadejte platné SHA commitu.');
        const result = await requestRepositoryJson<CommitResponse>('/api/admin/workshops/repository/commit', {
            repository: repositoryPayload, lookup: { kind: 'id', commitId: sha.trim() } });
        if (!result.commit || !/^[0-9a-f]{40}$/i.test(result.commit.sha)) throw new Error('GitHub nevrátil úplné SHA.');
        return { sha: result.commit.sha.toLowerCase(), availability: 'verified', checkedAt: new Date().toISOString(),
            committedAt: result.commit.committedAt, message: result.commit.message };
    };
    const run = (operation: () => Promise<void>) => { setIsWorking(true); setMessage(null); void operation().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Operace se nezdařila.'))
        .finally(() => setIsWorking(false)); };
    const saveCalibration = () => {
        const parsedSeconds = Number(calibrationSeconds);
        if (!Number.isFinite(parsedSeconds) || parsedSeconds < 0 || parsedSeconds >= durationSeconds ||
            !ISO_WITH_TIMEZONE_PATTERN.test(calibrationTime.trim()) || !Number.isFinite(Date.parse(calibrationTime))) {
            setMessage('Kalibrace vyžaduje sekundu relace a ISO čas s pásmem, například 2026-09-29T10:00:00+02:00.'); return;
        }
        update({ calibration: { sessionSeconds: parsedSeconds, wallClockAtSessionSeconds: calibrationTime.trim() } });
        setMessage('Kalibrace uložena. Před přijetím návrhů porovnejte skutečný obraz a časy commitů.');
    };
    const recheck = () => run(async () => {
        if (!repositoryPayload) throw new Error('Vyberte repozitář.');
        const check = async (commit: RecordingWorkshopCommit): Promise<RecordingWorkshopCommit> => {
            try { return await resolve(commit.sha); }
            catch { return { ...commit, availability: 'unverified', checkedAt: new Date().toISOString() }; }
        };
        const startingCommit = metadata.startingCommit ? await check(metadata.startingCommit) : null;
        const commitAnchors = await Promise.all(metadata.commitAnchors.map(async (anchor) => ({ ...anchor, commit: await check(anchor.commit) })));
        update({ startingCommit, commitAnchors });
        setMessage('SHA byla znovu zkontrolována. Neúspěšné dotazy zůstávají neověřené; po potvrzení chybějícího commitu jej výslovně označte za nedostupný.');
    });
    const propose = () => run(async () => {
        if (!repositoryPayload || !metadata.calibration) throw new Error('Nejprve uložte repozitář a kalibraci času.');
        const result = await requestRepositoryJson<ProposalResponse>('/api/admin/recording-studio/commit-proposal', {
            repository: repositoryPayload, durationSeconds, calibration: metadata.calibration });
        if (!result.proposals) throw new Error('Server nevrátil návrhy commitů.');
        const existingTimes = new Set(metadata.commitAnchors.map((anchor) => anchor.seconds));
        let isAmbiguous = false;
        const candidates = result.proposals.flatMap((proposal) => {
            if (existingTimes.has(proposal.seconds)) { isAmbiguous = true; return []; }
            existingTimes.add(proposal.seconds);
            return [{ id: crypto.randomUUID(), seconds: proposal.seconds, origin: 'timestamp-proposal' as const, isReviewed: false,
                commit: { sha: proposal.sha, availability: 'verified' as const, checkedAt: new Date().toISOString(),
                    committedAt: proposal.committedAt, message: proposal.message } }];
        });
        update({ commitAnchors: sortedBySeconds([...metadata.commitAnchors, ...candidates]) });
        setMessage(`${candidates.length} návrhů čeká na kontrolu. ${result.isComplete ? '' : 'Historie byla zkrácena limitem stránek. '}${isAmbiguous ? 'Commity se stejným časem nebo již ukotveným místem doplňte ručně. ' : ''}Časy GitHubu mohou být posunuté, přepsané rebasem nebo pozdě zveřejněné.`);
    });
    return <div className="border-t pt-4"><fieldset disabled={isWorking} className="space-y-3"><h4 className="font-medium">Git timeline</h4>
        <p className="text-sm text-slate-600">Přiřaďte skutečná SHA k časům záznamu. Čas commitu je jen návrh po výslovné kalibraci, protože push, rebase, hodiny a neuložená práce jej mohou posunout.</p>
        <div className="flex flex-wrap items-end gap-2 text-sm"><label>Repozitář <input aria-label="Repozitář workshopu" className="block w-56 rounded border p-2" value={repositoryText} onChange={(event) => setRepositoryText(event.target.value)} placeholder="owner/name" /></label>
            <label>Větve / vzory <input aria-label="Větve workshopu" className="block w-52 rounded border p-2" value={branchText} onChange={(event) => setBranchText(event.target.value)} placeholder="výchozí, nebo main, feature/*" /></label>
            <Button type="button" size="sm" variant="outline" onClick={saveRepository}>Uložit repozitář</Button></div>
        <div className="flex flex-wrap items-end gap-2 text-sm"><label>Počáteční SHA <input aria-label="Počáteční SHA" className="block w-80 rounded border p-2 font-mono" value={startingSha} onChange={(event) => setStartingSha(event.target.value)} placeholder="7–40 hexadecimálních znaků" /></label>
            <Button type="button" size="sm" variant="outline" disabled={isWorking || !repositoryPayload} onClick={() => run(async () => { const commit = await resolve(startingSha); update({ startingCommit: commit }); setStartingSha(commit.sha); setMessage(`Počáteční commit ověřen: ${commit.sha}`); })}>Ověřit a uložit</Button>
            <Button type="button" size="sm" variant="outline" disabled={isWorking || !metadata.startingCommit} onClick={recheck}>Znovu ověřit všechna SHA</Button></div>
        {metadata.startingCommit && <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">Počáteční commit: {metadata.startingCommit.sha} · {metadata.startingCommit.availability === 'verified' ? 'dostupný' : metadata.startingCommit.availability === 'unavailable' ? 'nedostupný' : 'neověřený'} · kontrola {metadata.startingCommit.checkedAt}
            <button type="button" className="text-amber-800 underline" onClick={() => update({ startingCommit: { ...metadata.startingCommit!, availability: 'unavailable', checkedAt: new Date().toISOString() } })}>Potvrdit nedostupnost</button></div>}
        <div className="flex flex-wrap items-end gap-2 text-sm"><label>SHA pro kotvu u hlavy <input aria-label="SHA nové kotvy" className="block w-80 rounded border p-2 font-mono" value={anchorSha} onChange={(event) => setAnchorSha(event.target.value)} /></label>
            <Button type="button" size="sm" variant="outline" disabled={isWorking || !repositoryPayload} onClick={() => run(async () => { const commit = await resolve(anchorSha);
                if (metadata.commitAnchors.some((anchor) => anchor.seconds === seconds)) throw new Error('V tomto čase už kotva je. Posuňte hlavu nebo upravte existující kotvu.');
                update({ commitAnchors: sortedBySeconds([...metadata.commitAnchors, { id: crypto.randomUUID(), seconds: Math.min(seconds, durationSeconds - 0.001), commit, origin: 'manual', isReviewed: true }]) });
                setAnchorSha(''); setMessage(`Kotva ${commit.sha} ověřena.`); })}>Ověřit a přidat kotvu</Button></div>
        <div className="flex flex-wrap items-end gap-2 text-sm"><label>Kalibrační sekunda <input aria-label="Kalibrační sekunda" type="number" min="0" max={durationSeconds} step="0.001" className="block w-28 rounded border p-2" value={calibrationSeconds} onChange={(event) => setCalibrationSeconds(event.target.value)} /></label>
            <label>Skutečný čas včetně pásma <input aria-label="Kalibrační čas s pásmem" className="block w-80 rounded border p-2" value={calibrationTime} onChange={(event) => setCalibrationTime(event.target.value)} placeholder="2026-09-29T10:00:00+02:00" /></label>
            <Button type="button" size="sm" variant="outline" onClick={saveCalibration}>Uložit kalibraci</Button>
            <Button type="button" size="sm" variant="outline" disabled={isWorking || !metadata.calibration || !repositoryPayload} onClick={propose}>Navrhnout kotvy z časů commitů</Button></div>
        <div className="max-h-80 space-y-2 overflow-auto">{metadata.commitAnchors.map((anchor) => <div key={anchor.id} className="flex flex-wrap items-center gap-2 rounded border p-2 text-sm">
            <label>Čas <input aria-label="Čas kotvy commitu" type="number" min="0" max={durationSeconds} step="0.001" className="w-24 rounded border p-1" value={anchor.seconds} onChange={(event) => update({ commitAnchors: sortedBySeconds(metadata.commitAnchors.map((candidate) => candidate.id === anchor.id ? { ...candidate, seconds: Number(event.target.value), isReviewed: false } : candidate)) })} /></label>
            <span className="font-mono" title={anchor.commit.message ?? ''}>{anchor.commit.sha.slice(0, 12)}</span><span>{anchor.commit.availability === 'verified' ? 'dostupný' : anchor.commit.availability === 'unavailable' ? 'nedostupný' : 'neověřený'}</span>
            <label><input type="checkbox" checked={anchor.isReviewed} onChange={(event) => update({ commitAnchors: metadata.commitAnchors.map((candidate) => candidate.id === anchor.id ? { ...candidate, isReviewed: event.target.checked } : candidate) })} /> Čas a obraz zkontrolovány</label>
            <button type="button" className="text-amber-800 underline" onClick={() => update({ commitAnchors: metadata.commitAnchors.map((candidate) => candidate.id === anchor.id ?
                { ...candidate, commit: { ...candidate.commit, availability: 'unavailable', checkedAt: new Date().toISOString() } } : candidate) })}>Potvrdit nedostupnost</button>
            <button type="button" className="text-cyan-800 underline" onClick={() => onSeek(anchor.seconds)}>Přejít</button>
            <button type="button" className="text-red-700 underline" onClick={() => update({ commitAnchors: metadata.commitAnchors.filter((candidate) => candidate.id !== anchor.id) })}>Smazat</button>
            <span className="text-xs text-slate-500">{anchor.origin === 'timestamp-proposal' ? 'Návrh z času commitu' : 'Ručně'}</span>
        </div>)}</div>
        {message && <p role="status" className="text-sm text-amber-800">{message}</p>}
    </fieldset></div>;
}
