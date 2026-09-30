import { describe, expect, it } from 'vitest';
import { mergeHostedRecordingManifests } from './hostedRecordingManifestImport';

const RECIPE = { schemaVersion: 1, timeUnit: 'seconds',
    selection: { startSeconds: 10, endSeconds: 30 }, preparedTimeZeroSessionSeconds: 10 };
const TRACKS = [
    { id: 'screen-one', kind: 'screen', label: 'VS Code', trimmedFile: null },
    { id: 'camera-one', kind: 'camera', label: 'Camera', trimmedFile: null },
];

function createManifestFile(preparedSourceId: string, recipe = RECIPE): File {
    const tracks = TRACKS.map((track) => track.id === preparedSourceId
        ? { ...track, trimmedFile: `trimmed/${track.id}.webm`,
            preparation: { status: 'prepared', preparedTimeZeroSessionSeconds: 10 } }
        : track);
    return new File([JSON.stringify({ schemaVersion: 5, timeUnit: 'seconds',
        id: 'recording-one', editRecipe: recipe, tracks })], `${preparedSourceId}.json`,
    { type: 'application/json' });
}

describe('independent studio manifest import', () => {
    it('combines independently prepared source files on one saved session clock', async () => {
        const result = await mergeHostedRecordingManifests([
            createManifestFile('screen-one'), createManifestFile('camera-one'),
        ]);
        expect(result.tracks.map((track) => track.trimmedFile)).toEqual([
            'trimmed/screen-one.webm', 'trimmed/camera-one.webm',
        ]);
        expect((JSON.parse(await result.file.text()) as { editRecipe: unknown }).editRecipe).toEqual(RECIPE);
    });

    it('rejects media exported from different selections', async () => {
        await expect(mergeHostedRecordingManifests([
            createManifestFile('screen-one'),
            createManifestFile('camera-one', { ...RECIPE,
                selection: { startSeconds: 12, endSeconds: 30 } }),
        ])).rejects.toThrow(/same recording, selection/);
    });
});
