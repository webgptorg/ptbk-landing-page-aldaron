import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isRecordingStudioAuthorityLost, RECORDING_STUDIO_AUTHORITY, RecordingStudioAuthorityKeeper } from './recordingStudioAuthority';
import { AUTHORITY_STORE, CHUNK_STORE, openRecordingDatabase, readRequest, RECORDING_STORE } from './recordingStudioDatabase';
import {
    appendRecordingChunk, deleteStudioRecording, editStudioRecording, listStudioRecordings, readRecordingTrack, recoverStudioRecordings, saveStudioRecording,
} from './recordingStudioStorage';
import { claimTestRecordingStudioAuthority, createTestStudioRecording } from './recordingStudioTestUtilities';

/** Reads the stores directly, because the storage functions under test are exactly what must not be trusted here. */
async function readStoredRecords() {
    const database = await openRecordingDatabase();
    const transaction = database.transaction([RECORDING_STORE, CHUNK_STORE]);
    return {
        recordings: await readRequest(transaction.objectStore(RECORDING_STORE).getAll()),
        chunkCount: await readRequest(transaction.objectStore(CHUNK_STORE).count()),
    };
}

describe('the right of one studio tab to write, kept in the storage it writes to', () => {
    /** Stands in for the tab which takes the studio over; the document's own keeper is the tab it is taken from. */
    let otherTab: RecordingStudioAuthorityKeeper;

    beforeEach(async () => {
        otherTab = new RecordingStudioAuthorityKeeper();
        await claimTestRecordingStudioAuthority();
        for (const recording of await listStudioRecordings()) await deleteStudioRecording(recording.id);
    });

    it('hands the generation on only to a tab which saw the current one', async () => {
        const { generation } = await RECORDING_STUDIO_AUTHORITY.read();
        expect(await RECORDING_STUDIO_AUTHORITY.read()).toMatchObject({ generation, ownerInstanceId: 'test-studio' });

        const taken = await otherTab.claim('other-tab', generation);
        expect(taken).toEqual({ generation: generation + 1, instanceId: 'other-tab' });
        expect(await otherTab.read()).toMatchObject({ generation: generation + 1, ownerInstanceId: 'other-tab' });

        // A third tab which looked before that claim must not undo it, however late it gets to run.
        const lateTab = new RecordingStudioAuthorityKeeper();
        expect(await lateTab.claim('late-tab', generation)).toBeNull();
        expect(lateTab.heldAuthority).toBeNull();
        expect(await otherTab.read()).toMatchObject({ generation: generation + 1, ownerInstanceId: 'other-tab' });
    });

    it('lets exactly one of two tabs which claim the same generation at once become the studio', async () => {
        const { generation } = await RECORDING_STUDIO_AUTHORITY.read();
        const secondTab = new RecordingStudioAuthorityKeeper();
        const claims = await Promise.all([otherTab.claim('other-tab', generation), secondTab.claim('second-tab', generation)]);
        expect(claims.filter((claim) => claim !== null)).toHaveLength(1);
        const winner = claims[0] ? 'other-tab' : 'second-tab';
        expect(await RECORDING_STUDIO_AUTHORITY.read()).toMatchObject({ generation: generation + 1, ownerInstanceId: winner });
    });

    it('refuses every kind of write of the previous studio once another tab has taken over', async () => {
        const recording = createTestStudioRecording();
        const stored = { ...recording, status: 'recording' as const, tracks: [{ ...recording.tracks[0], byteLength: 4, chunkCount: 1 }] };
        await appendRecordingChunk(stored, stored.tracks[0].id, 0, new Blob(['take']));
        const onLoss = vi.fn();
        const stopListening = RECORDING_STUDIO_AUTHORITY.subscribeToLoss(onLoss);
        const before = await readStoredRecords();

        await claimTestRecordingStudioAuthority(otherTab, 'other-tab');

        // A media write, the finalization of the take, an editor save, recovery, deletion and a new take alike.
        const next = { ...stored, tracks: [{ ...stored.tracks[0], byteLength: 8, chunkCount: 2 }] };
        const staleWrites: (() => Promise<unknown>)[] = [
            () => appendRecordingChunk(next, next.tracks[0].id, 1, new Blob(['tail'])),
            () => saveStudioRecording({ ...stored, status: 'complete' }),
            () => editStudioRecording(stored, 'Renamed by the old tab', { startSeconds: 1, endSeconds: 3 }),
            () => recoverStudioRecordings(),
            () => deleteStudioRecording(stored.id),
            () => saveStudioRecording({ ...recording, id: 'another-take' }),
        ];
        for (const write of staleWrites) {
            const failure = await write().then(() => null, (error: unknown) => error);
            expect(isRecordingStudioAuthorityLost(failure)).toBe(true);
        }
        expect(await readStoredRecords()).toEqual(before);
        // The first refusal is the moment the old tab learns it has to stop; it is told once.
        expect(onLoss).toHaveBeenCalledTimes(1);
        expect(RECORDING_STUDIO_AUTHORITY.heldAuthority).toBeNull();
        stopListening();
    });

    it('commits a write which began before the takeover and refuses the one which began after it', async () => {
        const recording = createTestStudioRecording();
        const first = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 3, chunkCount: 1 }] };
        const second = { ...first, tracks: [{ ...first.tracks[0], byteLength: 6, chunkCount: 2 }] };
        const { generation } = await RECORDING_STUDIO_AUTHORITY.read();

        // The takeover and the second write are queued while the first write is open and has not committed yet, so
        // the storage, not the order in which the tabs happen to run afterwards, is what decides about each of them.
        const queued: { takeover: Promise<unknown>; secondWrite: Promise<unknown> }[] = [];
        const firstWrite = RECORDING_STUDIO_AUTHORITY.runTransaction([RECORDING_STORE, CHUNK_STORE], (transaction) => {
            transaction.objectStore(CHUNK_STORE).add({ recordingId: first.id, trackId: first.tracks[0].id, sequence: 0, data: new Blob(['abc']) });
            transaction.objectStore(RECORDING_STORE).put(first);
            queued.push({
                takeover: otherTab.claim('other-tab', generation),
                secondWrite: appendRecordingChunk(second, first.tracks[0].id, 1, new Blob(['def'])).then(() => null, (error: unknown) => error),
            });
        });

        await expect(firstWrite).resolves.toBeUndefined();
        expect(await queued[0].takeover).not.toBeNull();
        expect(isRecordingStudioAuthorityLost(await queued[0].secondWrite)).toBe(true);
        expect(await (await readRecordingTrack(first.id, first.tracks[0])).text()).toBe('abc');
        expect((await readStoredRecords()).recordings).toEqual([first]);
    });

    it('lets the tab which took over write, and the previous one write again only after taking the studio back', async () => {
        const recording = createTestStudioRecording();
        await saveStudioRecording(recording);
        await claimTestRecordingStudioAuthority(otherTab, 'other-tab');
        await expect(saveStudioRecording({ ...recording, title: 'Stale' })).rejects.toThrow('Studio řídí jiná karta');

        // Nothing but an explicit claim of the current generation gives the right back; time alone never does.
        expect(RECORDING_STUDIO_AUTHORITY.heldAuthority).toBeNull();
        await expect(saveStudioRecording({ ...recording, title: 'Still stale' })).rejects.toThrow('Studio řídí jiná karta');
        await claimTestRecordingStudioAuthority();
        await saveStudioRecording({ ...recording, title: 'Owner again' });
        expect((await listStudioRecordings())[0].title).toBe('Owner again');
        await expect(otherTab.assertCurrent()).rejects.toThrow('Studio řídí jiná karta');
    });

    it('refuses a tab which never became the studio without touching the storage', async () => {
        const neverOwner = new RecordingStudioAuthorityKeeper();
        await expect(neverOwner.runTransaction([RECORDING_STORE], () => { throw new Error('must not run'); })).rejects.toThrow('Studio řídí jiná karta');
        await expect(neverOwner.commit(async () => { throw new Error('must not run'); })).rejects.toThrow('Studio řídí jiná karta');
        expect(() => neverOwner.assertHeld()).toThrow('Studio řídí jiná karta');
    });

    it('leaves no trace of its own check behind and rolls back a write which fails for another reason', async () => {
        const database = await openRecordingDatabase();
        const readAuthorityKeys = () => readRequest(database.transaction(AUTHORITY_STORE).objectStore(AUTHORITY_STORE).getAllKeys());
        const keysBefore = await readAuthorityKeys();
        const recording = createTestStudioRecording();
        await saveStudioRecording(recording);
        expect(await readAuthorityKeys()).toEqual(keysBefore);

        const stored = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 3, chunkCount: 1 }] };
        await appendRecordingChunk(stored, stored.tracks[0].id, 0, new Blob(['abc']));
        // A duplicate sequence is an ordinary storage failure: it must neither be mistaken for a takeover nor stop the tab.
        const failure = await appendRecordingChunk({ ...stored, title: 'Must not be saved' }, stored.tracks[0].id, 0, new Blob(['bad'])).then(() => null, (error: unknown) => error);
        expect(failure).toBeInstanceOf(Error);
        expect(isRecordingStudioAuthorityLost(failure)).toBe(false);
        expect(RECORDING_STUDIO_AUTHORITY.heldAuthority).not.toBeNull();
        expect((await listStudioRecordings())[0].title).toBe(recording.title);
        expect(await readAuthorityKeys()).toEqual(keysBefore);
    });

    it('refuses revocation during an external effect while keeping owner discovery and media writes responsive', async () => {
        const { generation } = await RECORDING_STUDIO_AUTHORITY.read();
        let finishCommit!: () => void;
        let reportCommitStarted!: () => void;
        const commitStarted = new Promise<void>((resolve) => { reportCommitStarted = resolve; });
        const commit = RECORDING_STUDIO_AUTHORITY.commit(() => new Promise<void>((resolve) => { finishCommit = resolve; reportCommitStarted(); }));
        await commitStarted;
        await expect(otherTab.read()).resolves.toMatchObject({ generation, ownerInstanceId: 'test-studio' });
        await expect(otherTab.claim('other-tab', generation)).rejects.toThrow('nedokončila zápis');
        expect(otherTab.heldAuthority).toBeNull();
        const recording = createTestStudioRecording();
        await saveStudioRecording(recording);
        expect((await listStudioRecordings())[0].id).toBe(recording.id);
        finishCommit();
        await commit;
        expect(await RECORDING_STUDIO_AUTHORITY.read()).toMatchObject({ generation, ownerInstanceId: 'test-studio' });
        await expect(RECORDING_STUDIO_AUTHORITY.assertCurrent()).resolves.toBeUndefined();
        expect(await otherTab.claim('other-tab', generation)).not.toBeNull();
    });

    it('refuses a write into a database which was deleted and created anew behind the studio', async () => {
        const recording = createTestStudioRecording();
        await saveStudioRecording(recording);
        // A deleted database keeps no marker of any earlier generation, so only the owner record can refuse here.
        await new Promise<void>((resolve, reject) => {
            const request = indexedDB.deleteDatabase('promptbook-recording-studio');
            request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
        });
        await expect(saveStudioRecording(recording)).rejects.toThrow('vymazáno nebo nahrazeno');
        expect((await readStoredRecords()).recordings).toEqual([]);
        // The same, when another tab has already become the studio of the new database, whose generations begin anew.
        await claimTestRecordingStudioAuthority(otherTab, 'other-tab');
        await expect(saveStudioRecording(recording)).rejects.toThrow();
        expect((await readStoredRecords()).recordings).toEqual([]);
        await expect(otherTab.assertCurrent()).resolves.toBeUndefined();
    });
});

describe('a commit outside the database, held together with the right to write', () => {
    let otherTab: RecordingStudioAuthorityKeeper;

    beforeEach(async () => {
        otherTab = new RecordingStudioAuthorityKeeper();
        await claimTestRecordingStudioAuthority();
        for (const recording of await listStudioRecordings()) await deleteStudioRecording(recording.id);
    });

    it('passes the result and the failure of the commit through unchanged', async () => {
        await expect(RECORDING_STUDIO_AUTHORITY.commit(async () => 'published')).resolves.toBe('published');
        const outside = vi.fn(async () => 'must not run');
        await claimTestRecordingStudioAuthority(otherTab, 'other-tab');
        await expect(RECORDING_STUDIO_AUTHORITY.commit(outside)).rejects.toThrow('Studio řídí jiná karta');
        expect(outside).not.toHaveBeenCalled();
        await claimTestRecordingStudioAuthority();
        await expect(RECORDING_STUDIO_AUTHORITY.commit(async () => { throw new Error('Server refused'); })).rejects.toThrow('Server refused');
        // A rejected network promise cannot prove the server stopped writing. The old owner remains usable, but
        // another tab cannot safely revoke it while that uncertainty survives in storage.
        await expect(RECORDING_STUDIO_AUTHORITY.assertCurrent()).resolves.toBeUndefined();
        await expect(otherTab.claim('other-tab', (await otherTab.read()).generation)).rejects.toThrow('nedokončila zápis');
        // This test intentionally leaves an unknown external effect; retire its isolated fixture before the next case.
        await new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase('promptbook-recording-studio'); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
    });

    it('recovers only a server-proven immutable asset operation and leaves unknown commits fenced', async () => {
        const assetId = crypto.randomUUID();
        await expect(RECORDING_STUDIO_AUTHORITY.commit(async () => { throw new Error('Lost completion response'); }, undefined,
            { kind: 'studio-asset', assetId, action: 'complete' })).rejects.toThrow('Lost completion response');
        await RECORDING_STUDIO_AUTHORITY.reconcileAssetCommit(async () => false);
        await expect(otherTab.claim('other-tab', (await otherTab.read()).generation)).rejects.toThrow('nedokončila zápis');
        const check = vi.fn(async () => true); await RECORDING_STUDIO_AUTHORITY.reconcileAssetCommit(check);
        expect(check).toHaveBeenCalledWith({ kind: 'studio-asset', assetId, action: 'complete' });
        expect(await otherTab.claim('other-tab', (await otherTab.read()).generation)).not.toBeNull();
        await claimTestRecordingStudioAuthority();
        await expect(RECORDING_STUDIO_AUTHORITY.commit(async () => { throw new Error('Unknown disk write'); })).rejects.toThrow('Unknown disk write');
        check.mockClear(); await RECORDING_STUDIO_AUTHORITY.reconcileAssetCommit(check); expect(check).not.toHaveBeenCalled();
        await expect(otherTab.claim('other-tab', (await otherTab.read()).generation)).rejects.toThrow('nedokončila zápis');
    });
});
