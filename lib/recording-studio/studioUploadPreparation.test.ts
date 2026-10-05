import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudioAsset } from './studioProjectTypes';

const PREPARATION_MOCKS = vi.hoisted(() => ({ rebuild: vi.fn(), upload: vi.fn() }));
vi.mock('./recordingStudioReindex', () => ({ withRebuiltRecordingIndex: PREPARATION_MOCKS.rebuild }));
vi.mock('./studioProjectStorage', () => ({ readStudioAssetUpload: PREPARATION_MOCKS.upload }));
import { prepareStudioUpload, removeStudioUploadPreparation } from './studioUploadPreparation';

function createTemporaryDirectory() {
    const children = new Map<string, ReturnType<typeof createTemporaryDirectory>>();
    const files = new Map<string, Blob>();
    return {
        getDirectoryHandle: async (name: string, options?: { create?: boolean }) => {
            if (!children.has(name)) {
                if (!options?.create) throw new DOMException('', 'NotFoundError');
                children.set(name, createTemporaryDirectory());
            }
            return children.get(name)!;
        },
        getFileHandle: async (name: string, options?: { create?: boolean }) => {
            if (!files.has(name)) {
                if (!options?.create) throw new DOMException('', 'NotFoundError');
                files.set(name, new Blob());
            }
            return {
                getFile: async () => new File([files.get(name)!], name),
                createWritable: async () => ({
                    write: async (data: BlobPart) => {
                        files.set(name, new Blob([data]));
                    },
                    close: async () => undefined,
                    abort: async () => undefined,
                }),
            };
        },
        removeEntry: async (name: string) => {
            children.delete(name);
            files.delete(name);
        },
    };
}

describe('resumable packet-copy upload preparation', () => {
    const asset = {
        id: 'asset',
        original: { kind: 'recording', recordingId: 'recording', revision: 'pinned', part: { id: 'part' } },
        bounds: {},
    } as unknown as StudioAsset;
    beforeEach(() => {
        const root = createTemporaryDirectory();
        vi.stubGlobal('navigator', { storage: { getDirectory: async () => root } });
        PREPARATION_MOCKS.upload.mockReset().mockResolvedValue(undefined);
        PREPARATION_MOCKS.rebuild.mockReset().mockImplementation(async (options) => {
            await options.temporaryFile.writable.write(`indexed-random-container-${crypto.randomUUID()}`);
            await options.temporaryFile.writable.close();
            return options.consume(await options.temporaryFile.readFile());
        });
    });
    it('reuses the same prepared bytes after interruption instead of regenerating a random container identity', async () => {
        const controller = new AbortController();
        const source = { byteLength: 0, read: async () => new Blob() };
        const first = await prepareStudioUpload(asset, source, 'matroska', controller.signal, () => undefined);
        PREPARATION_MOCKS.upload.mockResolvedValue({ isIndexRebuilt: true });
        const resumed = await prepareStudioUpload(asset, source, 'matroska', controller.signal, () => undefined);
        expect(await resumed.text()).toBe(await first.text());
        expect(PREPARATION_MOCKS.rebuild).toHaveBeenCalledTimes(1);
        await removeStudioUploadPreparation(asset.id);
        await expect(
            prepareStudioUpload(asset, source, 'matroska', controller.signal, () => undefined),
        ).rejects.toThrow(/chybí nebo se změnila/);
        expect(PREPARATION_MOCKS.rebuild).toHaveBeenCalledTimes(1);
        vi.unstubAllGlobals();
    });
});
