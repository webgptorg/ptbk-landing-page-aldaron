import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_WORKSHOP_AGENT_VALUES } from './workshopAgentTypes';

const { guardMock, roomMock, saveMock, stateMock } = vi.hoisted(() => ({ guardMock: vi.fn(), roomMock: vi.fn(), saveMock: vi.fn(), stateMock: vi.fn() }));
vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: guardMock }));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({ getAdminWorkshopDataOrResponse: roomMock }));
vi.mock('./workshopAgentDatabase', () => ({ saveWorkshopAgent: saveMock, loadWorkshopAgentAdminState: stateMock }));
vi.mock('./scheduleWorkshopAgentWork', () => ({ scheduleWorkshopAgentWork: vi.fn() }));

import { GET, POST } from '@/app/api/admin/workshops/[workshopId]/agents/route';
import { PATCH } from '@/app/api/admin/workshops/[workshopId]/agents/[agentId]/route';
import { POST as startAudio, DELETE as stopAudio } from '@/app/api/admin/workshops/[workshopId]/agents/audio-session/route';
import { POST as uploadAudio } from '@/app/api/admin/workshops/[workshopId]/agents/audio/route';

const CONTEXT = { params: Promise.resolve({ workshopId: '11111111-1111-4111-8111-111111111111', agentId: '22222222-2222-4222-8222-222222222222' }) };
const SUPABASE = {};

function createRequest(body: unknown = DEFAULT_WORKSHOP_AGENT_VALUES): NextRequest {
    return new NextRequest('https://example.com/api/admin/workshops/room/agents', {
        method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' },
    });
}

describe('agent administration access and validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        guardMock.mockReturnValue(null);
        roomMock.mockResolvedValue({ supabase: SUPABASE, workshopRow: { room_kind: 'workshop', external_url: null } });
        saveMock.mockResolvedValue('new-agent');
    });
    afterEach(() => vi.unstubAllEnvs());

    it.each([GET, POST, PATCH, startAudio, stopAudio, uploadAudio])('requires an admin session before reading Books or accepting audio', async (handler) => {
        guardMock.mockReturnValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        expect((await handler(createRequest(), CONTEXT)).status).toBe(401);
        expect(roomMock).not.toHaveBeenCalled();
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('uses the same save path for reusable personalities and per-room participation', async () => {
        expect((await POST(createRequest(), CONTEXT)).status).toBe(201);
        expect(saveMock).toHaveBeenCalledWith(SUPABASE, (await CONTEXT.params).workshopId, null, DEFAULT_WORKSHOP_AGENT_VALUES);
        expect((await PATCH(createRequest(), CONTEXT)).status).toBe(200);
    });

    it.each([
        { ...DEFAULT_WORKSHOP_AGENT_VALUES, bookSource: '' },
        { ...DEFAULT_WORKSHOP_AGENT_VALUES, replyCooldownSeconds: 0 },
        { ...DEFAULT_WORKSHOP_AGENT_VALUES, questionIntervalSeconds: 1 },
        { ...DEFAULT_WORKSHOP_AGENT_VALUES, origin: 'user' },
    ])('rejects invalid or extra inputs', async (values) => {
        expect((await POST(createRequest(values), CONTEXT)).status).toBe(400);
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('allows community replies but disallows community audio', async () => {
        roomMock.mockResolvedValue({ supabase: SUPABASE, workshopRow: { room_kind: 'community' } });
        expect((await POST(createRequest(), CONTEXT)).status).toBe(201);
        expect((await POST(createRequest({ ...DEFAULT_WORKSHOP_AGENT_VALUES, isListening: true }), CONTEXT)).status).toBe(400);
    });

    it.each([{ room_kind: 'project' }, { room_kind: 'workshop', external_url: 'https://other.example/event' }])('excludes unsupported rooms', async (workshopRow) => {
        roomMock.mockResolvedValue({ supabase: SUPABASE, workshopRow });
        expect((await GET(createRequest(), CONTEXT)).status).toBe(400);
        expect(stateMock).not.toHaveBeenCalled();
    });
});
