'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { estimateRecordingSeconds, formatRecordingBytes, formatRecordingDuration, getRecordingByteLength, getRecordingBytesPerSecond } from '@/lib/recording-studio/recordingStudioTiming';
import { Circle, HardDrive, Plus, Square } from 'lucide-react';
import { useState } from 'react';
import { RecordingLibrary } from './RecordingLibrary';
import { RecordingSourcePicker } from './RecordingSourcePicker';
import { RecordingSourcePreview } from './RecordingSourcePreview';
import { useRecordingStudio } from './useRecordingStudio';

export function RecordingStudio() {
    const studio = useRecordingStudio();
    const [isLibraryBusy, setIsLibraryBusy] = useState(false);
    const isRecording = ['starting', 'recording', 'stopping'].includes(studio.phase);
    const isReady = studio.phase === 'idle';
    const bytesPerSecond = getRecordingBytesPerSecond(studio.sources, studio.activeRecording);
    const remainingSeconds = estimateRecordingSeconds(studio.storage.availableBytes, bytesPerSecond);
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
            <div className="mx-auto max-w-6xl space-y-9">
                <div className="max-w-3xl space-y-2"><h2 className="text-2xl font-bold">Nahrávací studio</h2><p className="text-sm leading-6 text-slate-600">Připojte kamery, sdílené obrazovky a případně mikrofon. Jedním tlačítkem nahrajte všechny zdroje do samostatných souborů pro střihače.</p></div>
                {studio.errorMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{studio.errorMessage}</p>}
                {studio.phase === 'loading' && <p role="status" className="text-sm text-slate-500">Načítám místní záznamy…</p>}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Délka záznamu</p><p className="mt-2 text-3xl font-semibold tabular-nums" aria-label="Délka záznamu">{formatRecordingDuration(studio.elapsedSeconds)}</p><p className="mt-2 text-xs text-slate-500">{studio.activeRecording ? `${formatRecordingBytes(getRecordingByteLength(studio.activeRecording))} uloženo` : 'Všechny stopy mají společný čas.'}</p></div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500"><HardDrive className="h-4 w-4" />Volné místo v prohlížeči</p><p className="mt-2 text-3xl font-semibold">{studio.storage.availableBytes === null ? 'Neznámé' : formatRecordingBytes(studio.storage.availableBytes)}</p><p className="mt-2 text-xs text-slate-500">{studio.storage.isPersistent ? 'Trvalé úložiště povoleno.' : 'Prohlížeč může místní data automaticky uvolnit.'}</p></div>
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-5"><p className="text-xs font-medium uppercase tracking-wide text-cyan-700">Odhad zbývajícího nahrávání</p><p className="mt-2 text-3xl font-semibold tabular-nums">{remainingSeconds === null ? '—' : `≈ ${formatRecordingDuration(remainingSeconds)}`}</p><p className="mt-2 text-xs leading-5 text-cyan-800">{remainingSeconds === null ? 'Přidejte zdroj. Pokud prohlížeč nesdělí kapacitu, odhad není dostupný.' : 'Podle kvóty a datového toku všech stop, s rezervou. Skutečné místo na disku se může lišit.'}</p></div>
                </div>
                <section className="space-y-5" aria-labelledby="recording-sources-title">
                    <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="recording-sources-title" className="text-xl font-bold">Zdroje <span className="ml-1 text-slate-400">{studio.sources.length}</span></h2>
                        <div className="flex flex-wrap gap-2">
                            <AdminEditorButton label="Přidat zdroj" title="Přidat zdroj záznamu" buttonProps={{ disabled: !isReady || isLibraryBusy }}>
                                {(closeEditor) => <RecordingSourcePicker onAdd={studio.addSource} onClose={closeEditor} />}
                            </AdminEditorButton>
                            {isRecording ? <Button type="button" variant="destructive" disabled={studio.phase !== 'recording'} onClick={studio.stopRecording}><Square className="mr-2 h-4 w-4" />{studio.phase === 'stopping' ? 'Ukládám všechny stopy…' : studio.phase === 'starting' ? 'Připravuji záznam…' : 'Zastavit všechny stopy'}</Button> :
                                <Button type="button" disabled={!isReady || isLibraryBusy || studio.sources.length === 0} onClick={studio.startRecording}><Circle className="mr-2 h-4 w-4 fill-current text-red-400" />Nahrávat všechny zdroje</Button>}
                        </div>
                    </div>
                    {studio.sources.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 p-10 text-center"><Plus className="h-7 w-7 text-slate-400" /><p className="text-sm text-slate-500">Přidejte první kameru nebo sdílení obrazovky.</p></div> :
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{studio.sources.map((source) => <RecordingSourcePreview key={source.id} source={source} byteLength={studio.activeRecording?.tracks.find((track) => track.id === source.id)?.byteLength ?? 0} isRecording={isRecording} onRemove={() => studio.removeSource(source.id)} />)}</div>}
                    <p className="text-xs leading-5 text-slate-500">{isRecording ? 'Před odchodem nebo odhlášením zastavte nahrávání. Odpojení kteréhokoli zdroje zastaví celý záznam.' : 'Obraz ani zvuk se neodesílá na server. Záznamy se průběžně ukládají v tomto prohlížeči; po natáčení si stáhněte ZIP.'}</p>
                </section>
                <RecordingLibrary recordings={studio.recordings} isDisabled={!isReady} onChange={studio.updateRecording} onDelete={studio.removeRecording} onBusyChange={setIsLibraryBusy} onStorageChange={studio.refreshStorage} />
            </div>
        </main>
    );
}
