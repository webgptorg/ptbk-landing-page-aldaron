import { describe, expect, it } from 'vitest';
import { DEFAULT_STUDIO_TRANSITION, getStudioCompositionLayers, STUDIO_CAMERA_RECTANGLE } from './studioComposition';
import { removeStudioSelection } from './studioSimpleEdits';
import { createStudioSmartLayout } from './studioSmartLayout';
import { getStudioClipAt, getStudioProjectDuration, getStudioSceneAt, validateStudioProject } from './studioProjectTimeline';
import type { StudioProject, StudioScene } from './studioProjectTypes';

function fixture(): StudioProject {
    const scene: StudioScene = { id: 'intro', groupId: 'take', offsetSeconds: 0, backgroundTrackId: 'camera', overlayTrackId: null, audioTrackId: 'mic', fit: 'cover', overlayFit: 'cover', mask: 'circle', rectangle: STUDIO_CAMERA_RECTANGLE };
    return { id: 'project', schemaVersion: 1, title: 'Synchronized recording', createdAt: '', updatedAt: '', originRecordingId: 'raw', recordingSnapshots: [],
        tracks: [{ id: 'camera', label: 'Camera', role: 'webcam' }, { id: 'screen', label: 'Screen', role: 'editor' }, { id: 'mic', label: 'Microphone', role: 'audio' }],
        groups: [{ id: 'take', label: 'Take', projectStartSeconds: 0, durationSeconds: 20, sourceInSeconds: 0, sourceOutSeconds: 20, recordingId: 'raw', recordingRevision: 'rev', recordingSessionStartSeconds: 0, isInterrupted: false }],
        clips: ['camera', 'screen', 'mic'].map((id) => ({ id: `${id}-clip`, groupId: 'take', assetId: `${id}-asset`, trackId: id, originSourceId: id, groupOffsetSeconds: id === 'screen' ? 5 : 0, sourceInSeconds: 0, sourceOutSeconds: id === 'screen' ? 15 : 20 })),
        scenes: [scene, { ...scene, id: 'presentation', offsetSeconds: 5, backgroundTrackId: 'screen', overlayTrackId: 'camera', fit: 'contain' }], selection: { startSeconds: 0, endSeconds: 20 } };
}

describe('one local preview/editor composition', () => {
    it('morphs the same camera continuously from fullscreen into a circular lower-right overlay', () => {
        const project = fixture();
        const before = getStudioCompositionLayers(project, 5).find((layer) => layer.trackId === 'camera')!;
        const middle = getStudioCompositionLayers(project, 5 + DEFAULT_STUDIO_TRANSITION.durationSeconds / 2).find((layer) => layer.trackId === 'camera')!;
        const after = getStudioCompositionLayers(project, 6).find((layer) => layer.trackId === 'camera')!;
        expect(before.rectangle.width).toBe(1); expect(before.roundness).toBe(0);
        expect(middle.rectangle.width).toBeCloseTo(0.6); expect(middle.roundness).toBeCloseTo(0.5);
        expect(after.rectangle).toEqual(STUDIO_CAMERA_RECTANGLE); expect(after.roundness).toBe(1);
        expect(after.rectangle.width * 16 / 9).toBeCloseTo(after.rectangle.height);
        expect(getStudioCompositionLayers(project, 5.35).find((layer) => layer.trackId === 'screen')!.opacity).toBe(1);
        const reverse = { ...project, scenes: [...project.scenes, { ...project.scenes[0], id: 'outro', offsetSeconds: 10 }] };
        const reverseLayers = getStudioCompositionLayers(reverse, 10.35);
        expect(reverseLayers.map((layer) => layer.trackId)).toEqual(['screen', 'camera']);
        expect(reverseLayers[1].rectangle.width).toBeCloseTo(0.6);
    });
    it('uses one saved transition choice and does not replay transitions removed by trimming', () => {
        const project = fixture();
        const cut = getStudioCompositionLayers({ ...project, transition: { type: 'cut', durationSeconds: 0.7 } }, 5.01);
        expect(cut.find((layer) => layer.trackId === 'camera')!.rectangle).toEqual(STUDIO_CAMERA_RECTANGLE);
        const fade = getStudioCompositionLayers({ ...project, transition: { type: 'fade', durationSeconds: 1 } }, 5.5);
        expect(fade.every((layer) => Math.abs(layer.opacity - 0.5) < 0.00001)).toBe(true);
        const trimmed = { ...project, groups: project.groups.map((group) => ({ ...group, sourceInSeconds: 6 })), selection: { startSeconds: 0, endSeconds: 14 } };
        expect(getStudioCompositionLayers(trimmed, 0.01).find((layer) => layer.trackId === 'camera')!.rectangle).toEqual(STUDIO_CAMERA_RECTANGLE);
        expect(() => validateStudioProject({ ...project, transition: { type: 'smooth', durationSeconds: NaN } })).toThrow('přechod');
    });
    it('cuts every synchronized source, closes the gap, retains original coordinates and survives further cuts', () => {
        const original = fixture();
        const cut = removeStudioSelection({ ...original, selection: { startSeconds: 7, endSeconds: 9 } });
        validateStudioProject(cut);
        expect(getStudioProjectDuration(cut)).toBe(18);
        expect(getStudioClipAt(cut, 'camera', 7)!.sourceStartSeconds).toBe(9);
        expect(getStudioClipAt(cut, 'screen', 7)!.sourceStartSeconds).toBe(4);
        expect(getStudioClipAt(cut, 'mic', 7)!.sourceStartSeconds).toBe(9);
        expect(original.groups[0].sourceOutSeconds).toBe(20);
        const again = removeStudioSelection({ ...cut, selection: { startSeconds: 0, endSeconds: 2 } });
        validateStudioProject(again); expect(getStudioProjectDuration(again)).toBe(16);
        expect(getStudioClipAt(again, 'camera', 0)!.sourceStartSeconds).toBe(2);
        expect(() => removeStudioSelection(original)).toThrow('celý záznam');
    });
    it('proposes camera intro, screen plus circle while available, camera in gaps, retaining the selected audio', () => {
        const project = fixture();
        const source = { ...project, clips: project.clips.map((clip) => clip.trackId === 'screen' ? { ...clip, sourceOutSeconds: 7 } : clip) };
        const proposed = createStudioSmartLayout(source);
        validateStudioProject(proposed);
        expect(getStudioSceneAt(proposed, 0)?.backgroundTrackId).toBe('camera');
        expect(getStudioSceneAt(proposed, 6)?.overlayTrackId).toBe('camera');
        expect(getStudioSceneAt(proposed, 13)?.backgroundTrackId).toBe('camera');
        expect(proposed.scenes.every((scene) => scene.audioTrackId === 'mic')).toBe(true);
        expect(proposed.clips).toBe(source.clips);
        const delayed = createStudioSmartLayout(project, new Map([['take', 8]]));
        expect(getStudioSceneAt(delayed, 7)?.backgroundTrackId).toBe('camera');
        expect(getStudioSceneAt(delayed, 8)?.backgroundTrackId).toBe('screen');
    });
});
