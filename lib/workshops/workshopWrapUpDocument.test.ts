import {
    createWorkshopWrapUpDocument,
    createWorkshopWrapUpPdfFileName,
    extractWorkshopWrapUpPlainText,
} from '@/lib/workshops/workshopWrapUpDocument';
import type { WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const WORKSHOP: Pick<
    WorkshopDetails,
    'slug' | 'title' | 'description' | 'startsAt' | 'endsAt' | 'presentationUrl'
> = {
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Praktický online workshop o psaní produkčního kódu s AI agenty.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    presentationUrl: 'https://files.example.com/prezentace.pdf',
};

const CONTENT_BLOCK: WorkshopContentBlock = {
    id: 'material-1',
    title: 'Postup pro nasazení',
    bodyMarkdown: `## Nejdůležitější kroky
- Napište ověřitelný plán.
- Nechte agenta spustit testy.

[Podklady](https://ptbk.io/material-123)`,
    unlockAt: '2026-08-21T19:00:00+02:00',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: true,
    isPaidMembersOnly: false,
    createdAt: '2026-08-21T18:00:00+02:00',
    updatedAt: '2026-08-21T18:00:00+02:00',
    linkClickCount: 0,
};

describe('workshop wrap-up document', () => {
    it('uses the selected workshop and the same readable materials as the participant room', () => {
        const document = createWorkshopWrapUpDocument({ workshop: WORKSHOP, contentBlocks: [CONTENT_BLOCK] });

        expect(document.title).toBe(WORKSHOP.title);
        expect(document.dateAndTimeLabel).toContain('21.');
        expect(document.dateAndTimeLabel).toContain('19:00–20:30');
        expect(document.summary).toBe(WORKSHOP.description);
        expect(document.keyTakeaways).toEqual([
            'Postup pro nasazení',
            'Nejdůležitější kroky',
            'Napište ověřitelný plán.',
            'Nechte agenta spustit testy.',
        ]);
        expect(document.materials).toEqual([
            {
                title: 'Postup pro nasazení',
                body: 'Nejdůležitější kroky\nNapište ověřitelný plán.\nNechte agenta spustit testy.\nPodklady',
                urls: ['https://ptbk.io/material-123'],
                isFollowUp: true,
            },
            {
                title: 'Prezentace',
                body: '',
                urls: [WORKSHOP.presentationUrl],
                isFollowUp: false,
            },
        ]);
    });

    it('does not invent a hidden material when only the readable content blocks reach the document factory', () => {
        const visibleContentBlock = { ...CONTENT_BLOCK, title: 'Viditelné podklady' };
        const hiddenContentBlock = { ...CONTENT_BLOCK, id: 'hidden-material', title: 'Pouze pro členy' };
        const document = createWorkshopWrapUpDocument({
            workshop: { ...WORKSHOP, presentationUrl: null },
            contentBlocks: [visibleContentBlock],
        });

        expect(document.materials.map((material) => material.title)).toEqual(['Viditelné podklady']);
        expect(document.materials.map((material) => material.title)).not.toContain(hiddenContentBlock.title);
    });

    it('turns authored Markdown into readable document text while keeping link addresses separately', () => {
        expect(extractWorkshopWrapUpPlainText('**Důležité** [čtení](https://example.com) &amp; <em>praxe</em>')).toBe(
            'Důležité čtení & praxe',
        );
    });

    it('uses the stable workshop slug in the PDF file name', () => {
        expect(createWorkshopWrapUpPdfFileName(WORKSHOP.slug)).toBe('produkcni-kod-2026-08-21-shrnuti-workshopu.pdf');
    });
});
