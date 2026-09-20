/**
 * @vitest-environment jsdom
 */

import { WorkshopParticipantTimeline } from '@/businesses/workshop-admin/WorkshopParticipantTimeline';
import type { WorkshopAdminParticipantTimeline } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const PARTICIPANT_TIMELINE: WorkshopAdminParticipantTimeline = {
    participant: {
        pendingSubmissionCount: 0,
        id: 'participant-id',
        fullname: 'Jana Nováková',
        email: 'jana@example.com',
        connectedAt: '2026-08-20T17:15:00.000Z',
        lastSeenAt: '2026-08-20T17:30:00.000Z',
        activeDurationSeconds: 900,
        isInteractionBanned: false,
        isTrusted: false,
        isModerator: false,
        commentCount: 1,
        reactionCount: 0,
        upvoteCount: 0,
    },
    events: [
        { kind: 'joined', id: 'joined', occurredAt: '2026-08-20T17:15:00.000Z' },
        {
            kind: 'comment',
            id: 'comment-id',
            occurredAt: '2026-08-20T17:20:00.000Z',
            body: 'Můžete ukázat nasazení?',
            status: 'approved',
        },
        { kind: 'last-seen', id: 'last-seen', occurredAt: '2026-08-20T17:30:00.000Z' },
    ],
};

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('workshop participant timeline', () => {
    it('keeps a live workshop attendance interval visible and shows the recorded actions', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-20T18:00:00.000Z'));

        render(
            <WorkshopParticipantTimeline
                isOpen
                onOpenChange={vi.fn()}
                timeline={PARTICIPANT_TIMELINE}
                isLoading={false}
                errorMessage={null}
                workshopStartsAt="2026-08-20T17:00:00.000Z"
                workshopEndsAt={null}
            />,
        );

        const attendanceInterval = screen.getByLabelText('Pozorovaný interval účasti');
        const attendanceBar = attendanceInterval.firstElementChild as HTMLDivElement;

        expect(attendanceBar.style.left).toBe('25%');
        expect(attendanceBar.style.right).toBe('50%');
        expect(screen.getByText('Komentář (approved)')).not.toBeNull();
        expect(screen.getByText('Můžete ukázat nasazení?')).not.toBeNull();
    });

    it('draws no interval in a room which has no start and no end, and still records what happened in it', () => {
        render(
            <WorkshopParticipantTimeline
                isOpen
                onOpenChange={vi.fn()}
                timeline={PARTICIPANT_TIMELINE}
                isLoading={false}
                errorMessage={null}
                workshopStartsAt={null}
                workshopEndsAt={null}
            />,
        );

        expect(screen.queryByLabelText('Pozorovaný interval účasti')).toBeNull();
        expect(screen.getByText('Komentář (approved)')).not.toBeNull();
        expect(screen.getByText('Můžete ukázat nasazení?')).not.toBeNull();
    });
});
