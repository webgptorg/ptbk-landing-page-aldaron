import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { guardMock, roomMock, listMock, createMock, updateMock, deleteMock, youtubeMock, transcriptionMock } = vi.hoisted(() => ({
    guardMock: vi.fn(), roomMock: vi.fn(), listMock: vi.fn(), createMock: vi.fn(), updateMock: vi.fn(), deleteMock: vi.fn(), youtubeMock: vi.fn(), transcriptionMock: vi.fn(),
}));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: guardMock }));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({ getAdminWorkshopDataOrResponse: roomMock }));
vi.mock('./workshopSubtitleDatabase', () => ({ loadWorkshopSubtitles: listMock, createWorkshopSubtitle: createMock, updateWorkshopSubtitle: updateMock, deleteWorkshopSubtitle: deleteMock }));
vi.mock('@/lib/youtube/fetchYoutubeSubtitles', () => ({ fetchYoutubeSubtitles: youtubeMock }));
vi.mock('./transcribeWorkshopSubtitles', () => ({ isSubtitleAudioFileValid: () => true, transcribeWorkshopSubtitles: transcriptionMock }));

import { GET, POST } from '@/app/api/admin/workshops/[workshopId]/subtitles/route';
import { PATCH, DELETE } from '@/app/api/admin/workshops/[workshopId]/subtitles/[subtitleId]/route';
import { POST as importYoutube } from '@/app/api/admin/workshops/[workshopId]/subtitles/youtube/route';
import { POST as transcribe } from '@/app/api/admin/workshops/[workshopId]/subtitles/transcribe/route';

const CONTEXT = { params: Promise.resolve({ workshopId: '11111111-1111-4111-8111-111111111111', subtitleId: '22222222-2222-4222-8222-222222222222' }) };
const VIDEO_ID = 'dQw4w9WgXcQ';
const DATABASE = {};
const VALUES = { language: 'cs', cues: [{ startSeconds: 10, endSeconds: 12, text: 'Soukromé titulky' }], source: 'manual', sourceYoutubeVideoId: VIDEO_ID, sourceFilename: null };
const TRACK = { ...VALUES, id: 'track', createdAt: '', updatedAt: '' };
const createRequest = (body: unknown = VALUES) => new NextRequest('https://example.com/api/admin/workshops/room/subtitles', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('subtitle admin API boundary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('OPENAI_API_KEY', '');
        guardMock.mockReturnValue(null);
        roomMock.mockResolvedValue({ supabase: DATABASE, workshopRow: { room_kind: 'workshop', youtube_video_id: VIDEO_ID } });
        listMock.mockResolvedValue([TRACK]); createMock.mockResolvedValue(TRACK); updateMock.mockResolvedValue(TRACK); deleteMock.mockResolvedValue(true);
        youtubeMock.mockResolvedValue(VALUES.cues);
    });
    afterEach(() => vi.unstubAllEnvs());
    it.each([GET, POST, PATCH, DELETE, importYoutube, transcribe])('authenticates before accessing tracks or external providers', async (handler) => {
        guardMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        expect((await handler(createRequest(), CONTEXT)).status).toBe(401);
        expect(roomMock).not.toHaveBeenCalled(); expect(youtubeMock).not.toHaveBeenCalled(); expect(transcriptionMock).not.toHaveBeenCalled();
    });
    it.each([{ room_kind: 'community' }, { room_kind: 'project' }, { room_kind: 'workshop', external_url: 'https://organizer.example' }])('excludes rooms without workshop videos', async (workshopRow) => {
        roomMock.mockResolvedValue({ supabase: DATABASE, workshopRow });
        expect((await GET(createRequest(), CONTEXT)).status).toBe(400);
        expect(listMock).not.toHaveBeenCalled();
    });
    it('returns private uncached tracks and configuration without the API key', async () => {
        vi.stubEnv('OPENAI_API_KEY', 'private-secret');
        const response = await GET(createRequest(), CONTEXT);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        const body = await response.json();
        expect(body).toEqual({ tracks: [TRACK], isTranscriptionConfigured: true });
        expect(JSON.stringify(body)).not.toContain('private-secret');
    });
    it('scopes editing and deletion to both the workshop and track', async () => {
        expect((await POST(createRequest(), CONTEXT)).status).toBe(201);
        expect((await PATCH(createRequest(), CONTEXT)).status).toBe(200);
        expect(updateMock).toHaveBeenCalledWith(DATABASE, (await CONTEXT.params).workshopId, (await CONTEXT.params).subtitleId,
            { language: VALUES.language, cues: VALUES.cues });
        deleteMock.mockResolvedValue(false);
        expect((await DELETE(createRequest(), CONTEXT)).status).toBe(404);
        expect(deleteMock).toHaveBeenCalledWith(DATABASE, (await CONTEXT.params).workshopId, (await CONTEXT.params).subtitleId);
    });
    it('refuses invalid timing before saving and keeps other tracks intact', async () => {
        expect((await POST(createRequest({ ...VALUES, cues: [{ startSeconds: 5, endSeconds: 2, text: 'Invalid' }] }), CONTEXT)).status).toBe(400);
        expect(createMock).not.toHaveBeenCalled();
    });
    it('imports the stored workshop video into a draft without overwriting or creating a track', async () => {
        const response = await importYoutube(createRequest({ videoId: VIDEO_ID, language: 'en' }), CONTEXT);
        expect(response.status).toBe(200);
        expect(youtubeMock).toHaveBeenCalledWith(VIDEO_ID, 'en');
        expect(createMock).not.toHaveBeenCalled(); expect(updateMock).not.toHaveBeenCalled();
    });
    it('refuses a stale source video and reports provider failures without changing tracks', async () => {
        expect((await importYoutube(createRequest({ videoId: 'AAAAAAAAAAA', language: 'cs' }), CONTEXT)).status).toBe(409);
        expect(youtubeMock).not.toHaveBeenCalled();
        youtubeMock.mockRejectedValue(new Error('YouTube nedostupný'));
        expect((await importYoutube(createRequest({ videoId: VIDEO_ID, language: 'cs' }), CONTEXT)).status).toBe(502);
        expect(createMock).not.toHaveBeenCalled();
    });
    it('keeps file/manual and YouTube features available without a transcription key', async () => {
        expect((await transcribe(createRequest(), CONTEXT)).status).toBe(503);
        expect(transcriptionMock).not.toHaveBeenCalled();
        expect((await POST(createRequest(), CONTEXT)).status).toBe(201);
    });
});
