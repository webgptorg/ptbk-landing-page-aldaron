'use client';

import { Button } from '@/components/ui/button';
import { hasPredictableRecordingHeadroom, isRecordingEstimateFresh } from '@/lib/recording-studio/recordingStudioCapacity';
import { formatRecordingBytes, getConfiguredRecordingBytesPerSecond, getRecordingByteLength } from '@/lib/recording-studio/recordingStudioTiming';
import type { RecordingPersistence } from '@/lib/recording-studio/recordingStudioTypes';
import { useState } from 'react';
import type { useRecordingStudio } from './useRecordingStudio';

const PERSISTENCE_LABELS: Record<RecordingPersistence, string> = {
    granted: 'Trvalé úložiště povoleno.', 'not-granted': 'Trvalé úložiště zatím nepovoleno.',
    denied: 'Prohlížeč žádost o trvalé úložiště zamítl.', unsupported: 'Trvalé úložiště tento prohlížeč nepodporuje.',
    failed: 'Stav trvalého úložiště se nepodařilo zjistit.',
};

export function RecordingStoragePanel({ studio }: { readonly studio: ReturnType<typeof useRecordingStudio> }) {
    const [isPersistencePending, setIsPersistencePending] = useState(false);
    const isFresh = isRecordingEstimateFresh(studio.storage);
    const recordedBytes = studio.activeRecording ? getRecordingByteLength(studio.activeRecording) :
        studio.recordings.reduce((total, recording) => total + getRecordingByteLength(recording), 0);
    const configuredBytesPerSecond = getConfiguredRecordingBytesPerSecond(studio.sources);
    return <section aria-label="Úložiště záznamu" className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid gap-5 sm:grid-cols-3">
            <div><h3 className="text-sm font-medium text-slate-600">{studio.activeRecording ? 'Uloženo v tomto záznamu' : 'Uložené záznamy celkem'}</h3>
                <p className="mt-1 text-2xl font-semibold tabular-nums" data-testid="recording-committed-bytes">{formatRecordingBytes(recordedBytes)}</p>
                <p className="mt-1 text-xs text-slate-500">Čeká na zápis: <span data-testid="recording-pending-bytes">{formatRecordingBytes(studio.pendingBytes)}</span>. Počítáme potvrzené části všech stop.</p>
            </div>
            <div><h3 className="text-sm font-medium text-slate-600">Odhad prostoru pro web</h3>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{isFresh && studio.storage.headroomBytes !== null ? `≈ ${formatRecordingBytes(studio.storage.headroomBytes)}` : 'Neznámý'}</p>
                <p className="mt-1 text-xs text-slate-500">{isFresh ? `Kvóta minus využití webu; aktualizováno ${new Date(studio.storage.measuredAt!).toLocaleTimeString('cs-CZ')}.` : 'Prohlížeč neposkytl aktuální odhad.'}</p>
            </div>
            <div><h3 className="text-sm font-medium text-slate-600">Datový tok všech stop</h3>
                <p className="mt-1 text-2xl font-semibold tabular-nums" data-testid="recording-bitrate">{studio.measuredBytesPerSecond === null ? 'Zatím nezměřený' : `≈ ${formatRecordingBytes(studio.measuredBytesPerSecond)}/s`}</p>
                <p className="mt-1 text-xs text-slate-500">{configuredBytesPerSecond > 0 ? `Nastavený tok: ≈ ${formatRecordingBytes(configuredBytesPerSecond)}/s. ` : ''}Měřený tok se mění s obsahem; při čekání na data není dostupný.</p>
            </div>
        </div>
        <p className="text-sm text-slate-600">Skutečné volné místo nelze v tomto prohlížeči zjistit. Zbývající čas: neznámý. Odhad webu není záruka zápisu ani volné místo na disku.</p>
        {isFresh && hasPredictableRecordingHeadroom(studio.storage) && <p className="text-sm text-amber-800">Prohlížeč hlásí přibližně 10 GiB. Může jít o umělý, stále stejný odhad, i když se záznam ukládá. Sama tato hodnota neprokazuje limit velikosti záznamu.</p>}
        <div className="flex">
            <Button type="button" variant="outline" disabled={isPersistencePending || studio.persistence === 'granted' || studio.persistence === 'unsupported'} onClick={async () => {
                setIsPersistencePending(true);
                try { await studio.requestPersistence(); } finally { setIsPersistencePending(false); }
            }}>Požádat o trvalé úložiště</Button>
        </div>
        <p role="status" className="text-xs text-slate-600">{PERSISTENCE_LABELS[studio.persistence]} Chrání před automatickým vyklizením dat webu; nezvětšuje disk ani nežádá konkrétní kvótu.</p>
        <details className="text-xs leading-5 text-slate-500"><summary className="cursor-pointer">Kapacita, obnova a export</summary>
            <p>Web hlásí využití {studio.storage.usageBytes === null ? 'neznámé' : formatRecordingBytes(studio.storage.usageBytes)} a kvótu {studio.storage.quotaBytes === null ? 'neznámou' : formatRecordingBytes(studio.storage.quotaBytes)}. Zahrnuje i jiná data tohoto webu; nemusí odpovídat velikosti našich záznamů. 1 GiB = 1 073 741 824 B.</p>
            <p>Dokončení záznamu nepřipravuje druhou kopii. ZIP potřebuje na cílovém disku přibližně velikost originálů, s ořezem navíc oříznuté kopie. Ořez potřebuje také pracovní prostor pro jednu stopu v úložišti webu (OPFS); to sdílí jeho kvótu. Velké ZIPy vyžadují přímé ukládání, jinak stáhněte jednotlivé originály.</p>
            <p>Při chybě zápisu se zastaví všechny zdroje. Potvrzené části lze obnovit; neuložený konec může chybět. Žádná existující nahrávka se kvůli nedostatku místa nemaže automaticky.</p>
        </details>
    </section>;
}
