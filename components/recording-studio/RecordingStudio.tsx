'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { formatRecordingBytes, formatRecordingDuration, getRecordingByteLength } from '@/lib/recording-studio/recordingStudioTiming';
import { Circle, Plus, Square } from 'lucide-react';
import { useState } from 'react';
import { RecordingLibrary } from './RecordingLibrary';
import { RecordingSourcePicker } from './RecordingSourcePicker';
import { RecordingSourcePreview } from './RecordingSourcePreview';
import { RecordingStoragePanel } from './RecordingStoragePanel';
import { useRecordingStudio } from './useRecordingStudio';

export function RecordingStudio() {
    const studio = useRecordingStudio();
    const [isLibraryBusy, setIsLibraryBusy] = useState(false);
    const isRecording = ['starting', 'recording', 'stopping'].includes(studio.phase);
    const isReady = studio.phase === 'idle' && !studio.isChoosingDirectory;
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6">
            <div className="mx-auto max-w-6xl space-y-9">
                <div className="max-w-3xl space-y-2"><h2 className="text-2xl font-bold">Nahrávací studio</h2><p className="text-sm leading-6 text-slate-600">Nová kamera standardně nahrává i vybraný mikrofon přímo do stejného video souboru. Mikrofon můžete vypnout nebo přidat jako samostatný zdroj. Obraz náhledu je vždy ztlumený.</p></div>
                {studio.errorMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{studio.errorMessage}</p>}
                {studio.phase === 'loading' && <p role="status" className="text-sm text-slate-500">Načítám místní záznamy…</p>}
                <div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Délka záznamu</p><p className="mt-2 text-3xl font-semibold tabular-nums" aria-label="Délka záznamu">{formatRecordingDuration(studio.elapsedSeconds)}</p><p className="mt-2 text-xs text-slate-500">{studio.activeRecording ? `${formatRecordingBytes(getRecordingByteLength(studio.activeRecording))} uloženo` : 'Všechny stopy mají společný čas.'}</p></div>
                </div>
                <RecordingStoragePanel studio={studio} isDisabled={!isReady || isLibraryBusy} />
                <section className="space-y-5" aria-labelledby="recording-sources-title">
                    <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="recording-sources-title" className="text-xl font-bold">Zdroje <span className="ml-1 text-slate-400">{studio.sourceConfigurations.length}</span></h2>
                        <div className="flex flex-wrap gap-2">
                            <AdminEditorButton label="Přidat zdroj" title="Přidat zdroj záznamu" buttonProps={{ disabled: !isReady || isLibraryBusy }}>
                                {(closeEditor) => <RecordingSourcePicker onAdd={studio.addSource} onClose={closeEditor} />}
                            </AdminEditorButton>
                            {isRecording ? <Button type="button" variant="destructive" disabled={studio.phase !== 'recording'} onClick={studio.stopRecording}><Square className="mr-2 h-4 w-4" />{studio.phase === 'stopping' ? 'Ukládám všechny stopy…' : studio.phase === 'starting' ? 'Připravuji záznam…' : 'Zastavit všechny stopy'}</Button> :
                                <Button type="button" disabled={!isReady || isLibraryBusy || studio.sourceConfigurations.length === 0 || studio.sources.length !== studio.sourceConfigurations.length} onClick={studio.startRecording}><Circle className="mr-2 h-4 w-4 fill-current text-red-400" />Nahrávat všechny zdroje</Button>}
                        </div>
                    </div>
                    {studio.sourceConfigurations.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 p-10 text-center"><Plus className="h-7 w-7 text-slate-400" /><p className="text-sm text-slate-500">Přidejte kameru se zvukem, samostatný mikrofon nebo sdílení obrazovky.</p></div> :
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{studio.sourceConfigurations.map((configuration) => {
                            const source = studio.sources.find((candidate) => candidate.id === configuration.id) ?? null;
                            return <RecordingSourcePreview key={configuration.id} configuration={configuration} source={source} errorMessage={studio.sourceErrors[configuration.id] ?? null} byteLength={studio.activeRecording?.tracks.find((track) => track.id === configuration.id)?.byteLength ?? 0} isRecording={isRecording} onConnect={() => studio.connectSource(configuration.id)} onRemove={() => studio.removeSource(configuration.id)}>
                                <AdminEditorButton label="Nastavení" title="Nastavení zdroje" buttonProps={{ disabled: isRecording || !isReady || isLibraryBusy }}>
                                    {(closeEditor) => <RecordingSourcePicker initialConfiguration={configuration} onAdd={studio.addSource} onClose={closeEditor} />}
                                </AdminEditorButton>
                            </RecordingSourcePreview>;
                        })}</div>}
                    {studio.sourceConfigurations.length > 0 && studio.sources.length !== studio.sourceConfigurations.length && !isRecording && <p role="status" className="text-sm text-amber-800">Připojte každý uložený zdroj před zahájením. Obnovení nastavení po otevření studia samo nevyžaduje oprávnění ani nezapíná kameru.</p>}
                    <p className="text-xs leading-5 text-slate-500">{isRecording ? 'Před odchodem nebo odhlášením zastavte nahrávání. Selhání nebo odpojení kterékoli požadované stopy zastaví celý záznam a zachová uložené části i společný čas.' : 'Obraz ani zvuk se neodesílá na server. Zdroje a jejich volby se ukládají v tomto prohlížeči; po obnovení je znovu připojte. Záznamy se ukládají do zvoleného místního úložiště.'}</p>
                </section>
                <RecordingLibrary recordings={studio.recordings} isDisabled={!isReady} onChange={studio.updateRecording} onDelete={studio.removeRecording} onBusyChange={setIsLibraryBusy} onStorageChange={studio.refreshStorage} />
            </div>
        </main>
    );
}
