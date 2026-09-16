import { createWorkshopCommentMaterialValues } from '@/lib/workshops/workshopCommentMaterial';
import { describe, expect, it } from 'vitest';

describe('workshop comment material', () => {
    it('credits the chat author and keeps every character of the original comment in the new material', () => {
        const body = 'Nasazení ověřuji přes logy.\n\n- health check\n- metriky';

        expect(
            createWorkshopCommentMaterialValues(
                { authorName: 'Jana Nováková', body },
                '2026-09-16T10:00:00.000Z',
            ),
        ).toEqual({
            title: 'Komentář od Jana Nováková',
            bodyMarkdown: body,
            unlockAt: '2026-09-16T10:00:00.000Z',
            sortOrder: 0,
            isPublished: true,
            isFollowUp: false,
            isPaidMembersOnly: false,
        });
    });
});
