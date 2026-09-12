import {
    WORKSHOP_ADMIN_EXPORT_KINDS,
    buildWorkshopAdminExportFileName,
    createWorkshopAdminExportFile,
    serializeWorkshopAdminParticipantsAsCsv,
    serializeWorkshopAdminParticipantsAsVcard,
} from '@/lib/workshops/workshopAdminExports';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopAdminParticipant, WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const WORKSHOP: WorkshopDetails = {
    id: 'workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-code-with-agents',
    title: 'Produkční kód s AI agenty',
    description: 'Praktický online workshop.',
    startsAt: '2026-08-20T17:00:00.000Z',
    endsAt: '2026-08-20T18:30:00.000Z',
    youtubeVideoId: null,
    previewYoutubeVideoId: null,
    repository: null,
    isPublished: true,
    allowedReactions: ['👍', '🚀'],
    disabledPanels: [],
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
};

const PARTICIPANT: WorkshopAdminParticipant = {
    id: 'participant-id',
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
    connectedAt: '2026-08-20T16:55:00.000Z',
    lastSeenAt: '2026-08-20T18:25:00.000Z',
    isInteractionBanned: false,
    isTrusted: true,
    isModerator: true,
    activeDurationSeconds: 4_800,
    commentCount: 2,
    reactionCount: 5,
    upvoteCount: 3,
};

const PARTICIPANT_WITH_JOINED_CONTACT: WorkshopAdminParticipant = {
    ...PARTICIPANT,
    contactGroup: {
        normalizedEmail: 'jana@example.com',
        contacts: [
            {
                id: 12,
                createdAt: '2026-08-10T10:00:00.000Z',
                fullname: 'Jana Nováková',
                email: 'Jana+lead@EXAMPLE.COM',
                phone: '+420 777 000 111',
                userNote: 'Chci materiály.',
                isContacted: false,
                isWaitlisted: false,
                ourNote: 'Ozvat se po workshopu.',
                userAgent: null,
                ipAddress: null,
                referrer: null,
                appName: 'Landing page',
                placeName: 'Online workshop',
                url: null,
            },
        ],
        workshopParticipations: [
            {
                participantId: PARTICIPANT.id,
                workshopId: WORKSHOP.id,
                workshopKind: WORKSHOP.kind,
                workshopTitle: WORKSHOP.title,
                workshopStartsAt: WORKSHOP.startsAt,
                workshopEndsAt: WORKSHOP.endsAt,
                fullname: PARTICIPANT.fullname,
                email: PARTICIPANT.email,
                connectedAt: PARTICIPANT.connectedAt,
                lastSeenAt: PARTICIPANT.lastSeenAt,
                activeDurationSeconds: PARTICIPANT.activeDurationSeconds,
                commentCount: PARTICIPANT.commentCount,
                reactionCount: PARTICIPANT.reactionCount,
                upvoteCount: PARTICIPANT.upvoteCount,
                isInteractionBanned: PARTICIPANT.isInteractionBanned,
                isTrusted: PARTICIPANT.isTrusted,
            },
        ],
        workshopFeedbacks: [],
    },
};

describe('workshop admin exports', () => {
    it('offers a deliberately finite export for each workshop administration section', () => {
        expect(WORKSHOP_ADMIN_EXPORT_KINDS).toEqual([
            'settings',
            'participants',
            'participants-vcard',
            'comments',
            'reactions',
            'content',
            'timeline',
        ]);
    });

    it('writes the full participant activity summary as a spreadsheet-friendly CSV', () => {
        const csv = serializeWorkshopAdminParticipantsAsCsv([PARTICIPANT]);

        expect(csv.charCodeAt(0)).toBe(0xfeff);
        expect(csv).toContain('"Jméno","E-mail","Registrace","Naposledy aktivní"');
        expect(csv).toContain('"Jana Nováková","jana@example.com"');
        expect(csv).toContain('"4800","2","5","3","ano","ano","ne"');
    });

    it('writes a useful contact card for each filtered participant', () => {
        const vcard = serializeWorkshopAdminParticipantsAsVcard(WORKSHOP, [PARTICIPANT]);

        expect(vcard).toContain('BEGIN:VCARD');
        expect(vcard).toContain('N:Nováková;Jana;;;');
        expect(vcard).toContain('EMAIL;TYPE=INTERNET:jana@example.com');
        expect(vcard).toContain('UID:workshop-participant-participant-id');
        expect(vcard).toContain('Účastník workshopu: Produkční kód s AI agenty');
    });

    it('joins Contact-table values and workshop history into participant CSV and vCard exports', () => {
        const csv = serializeWorkshopAdminParticipantsAsCsv([PARTICIPANT_WITH_JOINED_CONTACT]);
        const vcard = serializeWorkshopAdminParticipantsAsVcard(WORKSHOP, [PARTICIPANT_WITH_JOINED_CONTACT]);

        expect(csv).toContain('Telefon kontaktu');
        expect(csv).toContain('+420 777 000 111');
        expect(csv).toContain('Ozvat se po workshopu.');
        expect(csv).toContain('Účasti ve workshopech');
        expect(vcard).toContain('TEL;TYPE=CELL:+420 777 000 111');
        expect(vcard).toContain('Záznamy kontaktu');
    });

    it('exports of a permanent room leave out the settings its kind never had', () => {
        const workshopSettingsCsv = createWorkshopAdminExportFile('settings', { workshop: WORKSHOP }).content;
        const communitySettingsCsv = createWorkshopAdminExportFile('settings', {
            workshop: { ...WORKSHOP, kind: 'community', slug: 'komunita' },
        }).content;

        expect(workshopSettingsCsv).toContain('"Začíná","Končí"');
        expect(workshopSettingsCsv).toContain('YouTube video ID');
        expect(workshopSettingsCsv).toContain('Povolené reakce');
        expect(workshopSettingsCsv).toContain('"Slug"');
        expect(communitySettingsCsv).toContain('"Typ místnosti"');
        expect(communitySettingsCsv).toContain('Vypnuté panely');
        expect(communitySettingsCsv).not.toContain('Začíná');
        expect(communitySettingsCsv).not.toContain('Končí');
        expect(communitySettingsCsv).not.toContain('YouTube video ID');
        expect(communitySettingsCsv).not.toContain('Povolené reakce');
        expect(communitySettingsCsv).not.toContain('"Slug"');
        expect(communitySettingsCsv).not.toContain('komunita');
        expect(workshopSettingsCsv).toContain('GitHub repozitář');
        expect(communitySettingsCsv).not.toContain('GitHub repozitář');
    });

    it('exports the whole project a term is about, including several selected branches', () => {
        const settingsCsv = createWorkshopAdminExportFile('settings', {
            workshop: {
                ...WORKSHOP,
                repository: {
                    owner: 'hejny',
                    name: 'promptbook',
                    branch: ['main', 'feature/rooms'],
                    deploymentUrl: 'https://workshop.example/app',
                },
            },
        }).content;

        expect(settingsCsv).toContain('"GitHub repozitář","Větev repozitáře","URL nasazení"');
        expect(settingsCsv).toContain('"hejny/promptbook","main, feature/rooms","https://workshop.example/app"');
    });

    it('uses the matching MIME type and filename for participant vCards', () => {
        const exportFile = createWorkshopAdminExportFile('participants-vcard', {
            workshop: WORKSHOP,
            participants: [PARTICIPANT],
        });

        expect(exportFile.mimeType).toBe('text/vcard;charset=utf-8');
        expect(exportFile.fileExtension).toBe('vcf');
        expect(buildWorkshopAdminExportFileName(WORKSHOP, 'participants-vcard')).toBe(
            'production-code-with-agents-participants-vcard.vcf',
        );
    });
});
