import { serializeRowsAsCsv } from '@/lib/exports/serializeRowsAsCsv';
import { serializeVcards } from '@/lib/exports/serializeVcards';
import { formatGithubBranchSelection, formatGithubRepositoryName } from '@/lib/github/githubRepository';
import type {
    WorkshopAdminComment,
    WorkshopAdminParticipant,
    WorkshopAdminTimelinePoint,
    WorkshopContentBlock,
    WorkshopDetails,
} from '@/lib/workshops/workshopTypes';
import {
    formatAdminContactRecords,
    formatAdminWorkshopParticipations,
    getAdminContactPhoneNumbers,
} from '@/lib/admin/adminContactJoin';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopPanelOfferedByKind } from '@/lib/workshops/workshopPanels';

export const WORKSHOP_ADMIN_EXPORT_KINDS = [
    'settings',
    'participants',
    'participants-vcard',
    'comments',
    'reactions',
    'content',
    'timeline',
] as const;

export type WorkshopAdminExportKind = (typeof WORKSHOP_ADMIN_EXPORT_KINDS)[number];

export type WorkshopAdminReactionExportRow = {
    readonly id: string;
    readonly occurredAt: string;
    readonly emoji: string;
    readonly participantFullname: string | null;
    readonly participantEmail: string | null;
    readonly isArtificial: boolean;
};

export type WorkshopAdminExportFile = {
    readonly content: string;
    readonly fileExtension: 'csv' | 'vcf';
    readonly mimeType: string;
};

function formatBoolean(value: boolean): string {
    return value ? 'ano' : 'ne';
}

/**
 * Note: A setting which the kind of the room does not have is left out of its export as well, so a spreadsheet never
 *       states a start, an end, a stage, or an address which nothing in that room ever used or could change.
 */
function serializeWorkshopSettingsAsCsv(workshop: WorkshopDetails): string {
    const roomCapabilities = getWorkshopKindCapabilities(workshop.kind);

    return serializeRowsAsCsv(
        [workshop],
        [
            { header: 'Typ místnosti', getValue: (item) => item.kind },
            { header: 'Název', getValue: (item) => item.title },
            ...(roomCapabilities.isSlugFixed
                ? []
                : [{ header: 'Slug', getValue: (item: WorkshopDetails) => item.slug }]),
            { header: 'Popis', getValue: (item) => item.description },
            ...(roomCapabilities.isScheduled
                ? [
                      { header: 'Začíná', getValue: (item: WorkshopDetails) => item.startsAt },
                      { header: 'Končí', getValue: (item: WorkshopDetails) => item.endsAt },
                  ]
                : []),
            { header: 'Publikováno', getValue: (item) => formatBoolean(item.isPublished) },
            ...(roomCapabilities.isStageOffered
                ? [
                      { header: 'YouTube video ID', getValue: (item: WorkshopDetails) => item.youtubeVideoId },
                      {
                          header: 'YouTube video ID ukázky',
                          getValue: (item: WorkshopDetails) => item.previewYoutubeVideoId,
                      },
                  ]
                : []),
            ...(roomCapabilities.isRepositoryOffered
                ? [
                      {
                          header: 'GitHub repozitář',
                          getValue: (item: WorkshopDetails) =>
                              item.repository === null ? null : formatGithubRepositoryName(item.repository),
                      },
                      {
                          header: 'Větev repozitáře',
                          getValue: (item: WorkshopDetails) =>
                              item.repository === null ? null : formatGithubBranchSelection(item.repository.branch),
                      },
                      {
                          header: 'URL nasazení',
                          getValue: (item: WorkshopDetails) => item.repository?.deploymentUrl ?? null,
                      },
                  ]
                : []),
            ...(roomCapabilities.isRealtime
                ? [
                      {
                          header: 'Povolené reakce',
                          getValue: (item: WorkshopDetails) => item.allowedReactions.join(' '),
                      },
                  ]
                : []),
            ...(isWorkshopPanelOfferedByKind(workshop.kind, 'watching-count')
                ? [
                      {
                          header: 'Umělý počet sledujících',
                          getValue: (item: WorkshopDetails) => item.artificialWatchingParticipantCount ?? 0,
                      },
                  ]
                : []),
            { header: 'Vypnuté panely', getValue: (item) => item.disabledPanels.join(', ') },
            { header: 'Vytvořeno', getValue: (item) => item.createdAt },
            { header: 'Aktualizováno', getValue: (item) => item.updatedAt },
        ],
    );
}

export function serializeWorkshopAdminParticipantsAsCsv(participants: readonly WorkshopAdminParticipant[]): string {
    return serializeRowsAsCsv(
        participants,
        [
            { header: 'Jméno', getValue: (participant) => participant.fullname },
            { header: 'E-mail', getValue: (participant) => participant.email },
            { header: 'Registrace', getValue: (participant) => participant.connectedAt },
            { header: 'Naposledy aktivní', getValue: (participant) => participant.lastSeenAt },
            { header: 'Čas v místnosti (s)', getValue: (participant) => participant.activeDurationSeconds },
            { header: 'Komentáře', getValue: (participant) => participant.commentCount },
            { header: 'Reakce', getValue: (participant) => participant.reactionCount },
            { header: 'Hlasy', getValue: (participant) => participant.upvoteCount },
            { header: 'Důvěryhodný', getValue: (participant) => formatBoolean(participant.isTrusted) },
            { header: 'Moderátor', getValue: (participant) => formatBoolean(participant.isModerator) },
            { header: 'Interakce zakázány', getValue: (participant) => formatBoolean(participant.isInteractionBanned) },
            {
                header: 'Telefon kontaktu',
                getValue: (participant) => getAdminContactPhoneNumbers(participant.contactGroup).join(', '),
            },
            {
                header: 'Záznamy kontaktu',
                getValue: (participant) => formatAdminContactRecords(participant.contactGroup),
            },
            {
                header: 'Účasti ve workshopech',
                getValue: (participant) => formatAdminWorkshopParticipations(participant.contactGroup),
            },
        ],
    );
}

export function serializeWorkshopAdminParticipantsAsVcard(
    workshop: WorkshopDetails,
    participants: readonly WorkshopAdminParticipant[],
): string {
    return serializeVcards(
        participants.map((participant) => {
            const phoneNumbers = getAdminContactPhoneNumbers(participant.contactGroup);
            const contactRecords = formatAdminContactRecords(participant.contactGroup);
            const workshopParticipations = formatAdminWorkshopParticipations(participant.contactGroup);

            return {
                uid: `workshop-participant-${participant.id}`,
                fullname: participant.fullname,
                email: participant.email,
                phone: phoneNumbers[0] ?? null,
                note: [
                    `${workshop.kind === 'community' ? 'Člen komunity' : 'Účastník workshopu'}: ${workshop.title}`,
                    `Registrace: ${participant.connectedAt}`,
                    `Čas v místnosti: ${participant.activeDurationSeconds} s`,
                    contactRecords === '' ? '' : `Záznamy kontaktu:\n${contactRecords}`,
                    workshopParticipations === '' ? '' : `Účasti ve workshopech:\n${workshopParticipations}`,
                ]
                    .filter(Boolean)
                    .join('\n'),
                revision: participant.lastSeenAt,
            };
        }),
    );
}

export function serializeWorkshopAdminCommentsAsCsv(comments: readonly WorkshopAdminComment[]): string {
    return serializeRowsAsCsv(
        comments,
        [
            { header: 'Čas', getValue: (comment) => comment.createdAt },
            { header: 'Autor', getValue: (comment) => comment.authorName },
            { header: 'ID účastníka', getValue: (comment) => comment.participantId },
            { header: 'Stav', getValue: (comment) => comment.status },
            { header: 'Komentář', getValue: (comment) => comment.body },
            { header: 'Hlasy', getValue: (comment) => comment.upvoteCount },
            { header: 'Skutečné hlasy', getValue: (comment) => comment.realUpvoteCount },
            { header: 'Umělá změna hlasů', getValue: (comment) => comment.artificialUpvoteCount },
            { header: 'Připnuto', getValue: (comment) => formatBoolean(comment.isPinned) },
            { header: 'Umělý komentář', getValue: (comment) => formatBoolean(comment.isArtificial) },
            { header: 'Odpověď na ID', getValue: (comment) => comment.parentCommentId },
            { header: 'Odpověď na autora', getValue: (comment) => comment.parentComment?.authorName ?? null },
            { header: 'Odpověď na text', getValue: (comment) => comment.parentComment?.body ?? null },
        ],
    );
}

export function serializeWorkshopAdminReactionsAsCsv(reactions: readonly WorkshopAdminReactionExportRow[]): string {
    return serializeRowsAsCsv(
        reactions,
        [
            { header: 'Čas', getValue: (reaction) => reaction.occurredAt },
            { header: 'Reakce', getValue: (reaction) => reaction.emoji },
            { header: 'Jméno účastníka', getValue: (reaction) => reaction.participantFullname },
            { header: 'E-mail účastníka', getValue: (reaction) => reaction.participantEmail },
            { header: 'Umělá reakce', getValue: (reaction) => formatBoolean(reaction.isArtificial) },
        ],
    );
}

export function serializeWorkshopAdminContentAsCsv(contentBlocks: readonly WorkshopContentBlock[]): string {
    return serializeRowsAsCsv(
        contentBlocks,
        [
            { header: 'Název', getValue: (contentBlock) => contentBlock.title },
            { header: 'Text Markdown', getValue: (contentBlock) => contentBlock.bodyMarkdown },
            { header: 'Odemknout', getValue: (contentBlock) => contentBlock.unlockAt },
            { header: 'Pořadí', getValue: (contentBlock) => contentBlock.sortOrder },
            { header: 'Publikováno', getValue: (contentBlock) => formatBoolean(contentBlock.isPublished) },
            { header: 'Navazující materiál', getValue: (contentBlock) => formatBoolean(contentBlock.isFollowUp) },
            { header: 'Jen pro placené členy', getValue: (contentBlock) => formatBoolean(contentBlock.isPaidMembersOnly) },
            { header: 'Kliknutí na odkazy', getValue: (contentBlock) => contentBlock.linkClickCount },
            { header: 'Vytvořeno', getValue: (contentBlock) => contentBlock.createdAt },
            { header: 'Aktualizováno', getValue: (contentBlock) => contentBlock.updatedAt },
        ],
    );
}

export function serializeWorkshopAdminTimelineAsCsv(timeline: readonly WorkshopAdminTimelinePoint[]): string {
    return serializeRowsAsCsv(
        timeline,
        [
            { header: 'Začátek úseku', getValue: (point) => point.startsAt },
            { header: 'Diváci', getValue: (point) => point.watchingParticipantCount },
            { header: 'Nově připojení', getValue: (point) => point.participantCount },
            { header: 'Komentáře', getValue: (point) => point.commentCount },
            { header: 'Reakce', getValue: (point) => point.reactionCount },
            { header: 'Hlasy', getValue: (point) => point.upvoteCount },
            { header: 'Kliknutí na materiály', getValue: (point) => point.linkClickCount },
            {
                header: 'Celkem akcí',
                getValue: (point) =>
                    point.participantCount +
                    point.commentCount +
                    point.reactionCount +
                    point.upvoteCount +
                    point.linkClickCount,
            },
        ],
    );
}

/**
 * Returns whether an API path names one of the deliberately supported workshop exports.
 */
export function isWorkshopAdminExportKind(value: string): value is WorkshopAdminExportKind {
    return WORKSHOP_ADMIN_EXPORT_KINDS.includes(value as WorkshopAdminExportKind);
}

export function buildWorkshopAdminExportFileName(workshop: WorkshopDetails, exportKind: WorkshopAdminExportKind): string {
    const fileExtension = exportKind === 'participants-vcard' ? 'vcf' : 'csv';
    return `${workshop.slug}-${exportKind}.${fileExtension}`;
}

export function createWorkshopAdminExportFile(
    exportKind: WorkshopAdminExportKind,
    options: {
        readonly workshop: WorkshopDetails;
        readonly participants?: readonly WorkshopAdminParticipant[];
        readonly comments?: readonly WorkshopAdminComment[];
        readonly reactions?: readonly WorkshopAdminReactionExportRow[];
        readonly contentBlocks?: readonly WorkshopContentBlock[];
        readonly timeline?: readonly WorkshopAdminTimelinePoint[];
    },
): WorkshopAdminExportFile {
    switch (exportKind) {
        case 'settings':
            return {
                content: serializeWorkshopSettingsAsCsv(options.workshop),
                fileExtension: 'csv',
                mimeType: 'text/csv;charset=utf-8',
            };
        case 'participants':
            return {
                content: serializeWorkshopAdminParticipantsAsCsv(options.participants ?? []),
                fileExtension: 'csv',
                mimeType: 'text/csv;charset=utf-8',
            };
        case 'participants-vcard':
            return {
                content: serializeWorkshopAdminParticipantsAsVcard(options.workshop, options.participants ?? []),
                fileExtension: 'vcf',
                mimeType: 'text/vcard;charset=utf-8',
            };
        case 'comments':
            return {
                content: serializeWorkshopAdminCommentsAsCsv(options.comments ?? []),
                fileExtension: 'csv',
                mimeType: 'text/csv;charset=utf-8',
            };
        case 'reactions':
            return {
                content: serializeWorkshopAdminReactionsAsCsv(options.reactions ?? []),
                fileExtension: 'csv',
                mimeType: 'text/csv;charset=utf-8',
            };
        case 'content':
            return {
                content: serializeWorkshopAdminContentAsCsv(options.contentBlocks ?? []),
                fileExtension: 'csv',
                mimeType: 'text/csv;charset=utf-8',
            };
        case 'timeline':
            return {
                content: serializeWorkshopAdminTimelineAsCsv(options.timeline ?? []),
                fileExtension: 'csv',
                mimeType: 'text/csv;charset=utf-8',
            };
    }
}
