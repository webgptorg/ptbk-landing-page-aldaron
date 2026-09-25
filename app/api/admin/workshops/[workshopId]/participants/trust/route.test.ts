import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    getUnauthorizedResponseOrNullMock,
    getAdminWorkshopDataOrResponseMock,
    loadSummaryMock,
    saveAutomaticTrustMock,
    trustAllMock,
    broadcastMock,
    scheduleAgentWorkMock,
} = vi.hoisted(() => ({
    getUnauthorizedResponseOrNullMock: vi.fn(),
    getAdminWorkshopDataOrResponseMock: vi.fn(),
    loadSummaryMock: vi.fn(),
    saveAutomaticTrustMock: vi.fn(),
    trustAllMock: vi.fn(),
    broadcastMock: vi.fn(),
    scheduleAgentWorkMock: vi.fn(),
}));

vi.mock('@/lib/admin/adminApiGuard', () => ({ getUnauthorizedResponseOrNull: getUnauthorizedResponseOrNullMock }));
vi.mock('@/lib/workshops/workshopAdminRequest', () => ({
    getAdminWorkshopDataOrResponse: getAdminWorkshopDataOrResponseMock,
}));
vi.mock('@/lib/workshops/workshopParticipantTrustPolicy', () => ({
    loadWorkshopParticipantTrustSummary: loadSummaryMock,
    saveWorkshopAutomaticParticipantTrust: saveAutomaticTrustMock,
    trustAllWorkshopParticipants: trustAllMock,
}));
vi.mock('@/lib/workshops/workshopRealtime', () => ({ broadcastWorkshopEvent: broadcastMock }));
vi.mock('@/lib/workshops/agents/scheduleWorkshopAgentWork', () => ({
    scheduleWorkshopAgentWork: scheduleAgentWorkMock,
}));

import { GET, PATCH, POST } from './route';

const ROOM_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ROOM_ID = '22222222-2222-4222-8222-222222222222';
const ELIGIBILITY_TOKEN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const SUMMARY = {
    trustedCount: 1,
    untrustedCount: 2,
    moderatorCount: 1,
    eligibleCount: 2,
    eligibilityToken: ELIGIBILITY_TOKEN,
    isAutomaticTrustEnabled: false,
};

function createRequest(method: 'GET' | 'PATCH' | 'POST', body?: unknown): NextRequest {
    return new NextRequest(`https://ptbk.io/api/admin/workshops/${ROOM_ID}/participants/trust`, {
        method,
        ...(body === undefined
            ? {}
            : {
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
              }),
    });
}

function createContext(workshopId = ROOM_ID) {
    return { params: Promise.resolve({ workshopId }) };
}

beforeEach(() => {
    getUnauthorizedResponseOrNullMock.mockReset().mockReturnValue(null);
    getAdminWorkshopDataOrResponseMock.mockReset().mockResolvedValue({
        supabase: {},
        workshopRow: { id: ROOM_ID },
    });
    loadSummaryMock.mockReset().mockResolvedValue(SUMMARY);
    saveAutomaticTrustMock.mockReset().mockResolvedValue({ ...SUMMARY, isAutomaticTrustEnabled: true });
    trustAllMock.mockReset().mockResolvedValue({ isStale: false, changedCount: 2 });
    broadcastMock.mockReset().mockResolvedValue(undefined);
    scheduleAgentWorkMock.mockReset();
});

describe('admin room participant trust API', () => {
    it.each([GET, PATCH, POST])('rejects unauthorized access before reading or changing the room', async (handler) => {
        getUnauthorizedResponseOrNullMock.mockReturnValue(
            NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        );
        const method = handler === GET ? 'GET' : handler === PATCH ? 'PATCH' : 'POST';
        const response = await handler(
            createRequest(method, method === 'GET' ? undefined : { isAutomaticTrustEnabled: true }),
            createContext(),
        );
        expect(response.status).toBe(401);
        expect(getAdminWorkshopDataOrResponseMock).not.toHaveBeenCalled();
        expect(trustAllMock).not.toHaveBeenCalled();
        expect(saveAutomaticTrustMock).not.toHaveBeenCalled();
    });

    it('refuses a missing or foreign room before applying a bulk change', async () => {
        getAdminWorkshopDataOrResponseMock.mockResolvedValue({
            response: NextResponse.json({ error: 'Workshop not found' }, { status: 404 }),
        });
        const response = await POST(
            createRequest('POST', { eligibilityToken: ELIGIBILITY_TOKEN }),
            createContext(OTHER_ROOM_ID),
        );
        expect(response.status).toBe(404);
        expect(trustAllMock).not.toHaveBeenCalled();
    });

    it('requires a reviewed token and leaves stale confirmations without mutation notifications', async () => {
        const invalid = await POST(createRequest('POST', { eligibilityToken: 'wrong' }), createContext());
        expect(invalid.status).toBe(400);
        expect(trustAllMock).not.toHaveBeenCalled();

        trustAllMock.mockResolvedValue({ isStale: true, changedCount: 0 });
        const stale = await POST(createRequest('POST', { eligibilityToken: ELIGIBILITY_TOKEN }), createContext());
        expect(await stale.json()).toEqual({ kind: 'stale', summary: SUMMARY });
        expect(trustAllMock).toHaveBeenCalledWith(expect.anything(), ROOM_ID, ELIGIBILITY_TOKEN);
        expect(scheduleAgentWorkMock).not.toHaveBeenCalled();
        expect(broadcastMock).not.toHaveBeenCalled();
    });

    it('reports the actual change and schedules and broadcasts once for a completed batch', async () => {
        const response = await POST(createRequest('POST', { eligibilityToken: ELIGIBILITY_TOKEN }), createContext());
        expect(await response.json()).toEqual({ kind: 'completed', changedCount: 2, summary: SUMMARY });
        expect(scheduleAgentWorkMock).toHaveBeenCalledOnce();
        expect(broadcastMock).toHaveBeenCalledOnce();
    });

    it('still reports a committed batch when the follow-up count read fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        loadSummaryMock.mockRejectedValue(new Error('Count read failed'));
        try {
            const response = await POST(
                createRequest('POST', { eligibilityToken: ELIGIBILITY_TOKEN }),
                createContext(),
            );
            expect(await response.json()).toEqual({ kind: 'completed', changedCount: 2, summary: null });
            expect(scheduleAgentWorkMock).toHaveBeenCalledOnce();
            expect(broadcastMock).toHaveBeenCalledOnce();
        } finally {
            consoleError.mockRestore();
        }
    });

    it('reads and saves only the selected room setting', async () => {
        const readResponse = await GET(createRequest('GET'), createContext());
        expect(await readResponse.json()).toEqual(SUMMARY);
        const saveResponse = await PATCH(createRequest('PATCH', { isAutomaticTrustEnabled: true }), createContext());
        expect(((await saveResponse.json()) as { isAutomaticTrustEnabled: boolean }).isAutomaticTrustEnabled).toBe(
            true,
        );
        expect(saveAutomaticTrustMock).toHaveBeenCalledWith(expect.anything(), ROOM_ID, true);
    });
});
