'use client';

import {
    fetchAdminWorkshopParticipantPage,
    fetchAdminWorkshopParticipantTimeline,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { CommunityMembershipStatusBadge } from '@/businesses/community/membership/CommunityMembershipStatusBadge';
import {
    formatWorkshopPresenceDuration,
    formatWorkshopAdminDateTime,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import { WorkshopExportButton } from '@/businesses/workshop-admin/WorkshopExportButton';
import { WorkshopParticipantFilters } from '@/businesses/workshop-admin/WorkshopParticipantFilters';
import { WorkshopParticipantPagination } from '@/businesses/workshop-admin/WorkshopParticipantPagination';
import { WorkshopParticipantTimeline } from '@/businesses/workshop-admin/WorkshopParticipantTimeline';
import { AdminContactDetails } from '@/components/admin/AdminContactDetails';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    createCommunityMembershipAdminPath,
    readCommunityMembershipAdminMemberEmail,
} from '@/lib/community-membership/communityMembershipAdminLinks';
import {
    DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY,
    type WorkshopAdminParticipantQuery,
} from '@/lib/workshops/workshopAdminParticipantQuery';
import type {
    WorkshopAdminParticipant,
    WorkshopAdminParticipantPage,
    WorkshopAdminParticipantTimeline,
} from '@/lib/workshops/workshopTypes';
import {
    Ban,
    Check,
    Clock3,
    Crown,
    Eye,
    Mail,
    MessageCircle,
    Radio,
    RefreshCw,
    ShieldCheck,
    ShieldPlus,
    ThumbsUp,
    Trash2,
    Users,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

type WorkshopParticipantListProps = {
    readonly workshopId: string;

    /**
     * Start of the schedule an attendance is measured against, or `null` in a room which has no schedule
     */
    readonly workshopStartsAt: string | null;
    readonly workshopEndsAt: string | null;
    readonly refreshVersion: number;

    /**
     * The permanent community is the only room whose participants can be joined to a paid membership. Workshop
     * occurrences keep their established, payment-free participant table.
     */
    readonly isCommunityMembershipStatusShown?: boolean;
    readonly onChangeInteractionBan: (participantId: string, isInteractionBanned: boolean) => Promise<void>;
    readonly onChangeTrusted: (participantId: string, isTrusted: boolean) => Promise<void>;

    /**
     * Appoints a moderator of the room or dismisses them, which only the administration ever does
     */
    readonly onChangeModerator: (participantId: string, isModerator: boolean) => Promise<void>;
    readonly onDelete: (participantId: string) => Promise<void>;
};

function getParticipantPageCount(totalCount: number, pageSize: number): number {
    return Math.max(1, Math.ceil(totalCount / pageSize));
}

/**
 * Lists a server-paged audience and opens expensive per-person histories only when requested.
 */
export function WorkshopParticipantList({
    workshopId,
    workshopStartsAt,
    workshopEndsAt,
    refreshVersion,
    isCommunityMembershipStatusShown = false,
    onChangeInteractionBan,
    onChangeTrusted,
    onChangeModerator,
    onDelete,
}: WorkshopParticipantListProps) {
    const searchParams = useSearchParams();
    const selectedCommunityMemberEmail = useMemo(
        () => readCommunityMembershipAdminMemberEmail(new URLSearchParams(searchParams.toString())),
        [searchParams],
    );
    const [participantQuery, setParticipantQuery] = useState<WorkshopAdminParticipantQuery>(
        () => ({
            ...DEFAULT_WORKSHOP_ADMIN_PARTICIPANT_QUERY,
            searchQuery:
                isCommunityMembershipStatusShown && selectedCommunityMemberEmail !== null
                    ? selectedCommunityMemberEmail
                    : '',
        }),
    );
    const [participantPage, setParticipantPage] = useState<WorkshopAdminParticipantPage | null>(null);
    const [isParticipantsLoading, setIsParticipantsLoading] = useState(true);
    const [participantErrorMessage, setParticipantErrorMessage] = useState<string | null>(null);
    const [processingParticipantIds, setProcessingParticipantIds] = useState<ReadonlySet<string>>(new Set());
    const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
    const [participantTimeline, setParticipantTimeline] = useState<WorkshopAdminParticipantTimeline | null>(null);
    const [isParticipantTimelineLoading, setIsParticipantTimelineLoading] = useState(false);
    const [participantTimelineErrorMessage, setParticipantTimelineErrorMessage] = useState<string | null>(null);
    const participantPageLoadSequenceReference = useRef(0);
    const participantTimelineLoadSequenceReference = useRef(0);
    const handledCommunityMemberEmailReference = useRef<string | null>(selectedCommunityMemberEmail);
    const deferredSearchQuery = useDeferredValue(participantQuery.searchQuery);

    const requestedParticipantQuery = useMemo<WorkshopAdminParticipantQuery>(
        () => ({
            searchQuery: deferredSearchQuery,
            isTrusted: participantQuery.isTrusted,
            isModerator: participantQuery.isModerator,
            isInteractionBanned: participantQuery.isInteractionBanned,
            registeredFrom: participantQuery.registeredFrom,
            registeredTo: participantQuery.registeredTo,
            sortBy: participantQuery.sortBy,
            sortDirection: participantQuery.sortDirection,
            page: participantQuery.page,
            pageSize: participantQuery.pageSize,
        }),
        [
            deferredSearchQuery,
            participantQuery.isInteractionBanned,
            participantQuery.isModerator,
            participantQuery.isTrusted,
            participantQuery.page,
            participantQuery.pageSize,
            participantQuery.registeredFrom,
            participantQuery.registeredTo,
            participantQuery.sortBy,
            participantQuery.sortDirection,
        ],
    );

    const loadParticipantPage = useCallback(async () => {
        const loadSequence = ++participantPageLoadSequenceReference.current;
        setIsParticipantsLoading(true);
        try {
            const loadedParticipantPage = await fetchAdminWorkshopParticipantPage(
                workshopId,
                requestedParticipantQuery,
            );
            if (loadSequence !== participantPageLoadSequenceReference.current) {
                return;
            }

            setParticipantPage(loadedParticipantPage);
            setParticipantErrorMessage(null);
            const totalPageCount = getParticipantPageCount(
                loadedParticipantPage.totalCount,
                requestedParticipantQuery.pageSize,
            );
            if (requestedParticipantQuery.page > totalPageCount) {
                setParticipantQuery((currentQuery) =>
                    currentQuery.page === requestedParticipantQuery.page
                        ? { ...currentQuery, page: totalPageCount }
                        : currentQuery,
                );
            }
        } catch (error) {
            if (loadSequence === participantPageLoadSequenceReference.current) {
                setParticipantErrorMessage((error as Error).message);
            }
        } finally {
            if (loadSequence === participantPageLoadSequenceReference.current) {
                setIsParticipantsLoading(false);
            }
        }
    }, [requestedParticipantQuery, workshopId]);

    useEffect(() => {
        void loadParticipantPage();
    }, [loadParticipantPage, refreshVersion]);

    useEffect(() => {
        if (
            !isCommunityMembershipStatusShown ||
            selectedCommunityMemberEmail === null ||
            selectedCommunityMemberEmail === handledCommunityMemberEmailReference.current
        ) {
            return;
        }

        handledCommunityMemberEmailReference.current = selectedCommunityMemberEmail;
        setParticipantQuery((currentQuery) => ({
            ...currentQuery,
            searchQuery: selectedCommunityMemberEmail,
            page: 1,
        }));
    }, [isCommunityMembershipStatusShown, selectedCommunityMemberEmail]);

    const changeParticipantQuery = (changes: Partial<WorkshopAdminParticipantQuery>) => {
        setParticipantQuery((currentQuery) => ({
            ...currentQuery,
            ...changes,
            page: changes.page ?? 1,
        }));
    };

    const runParticipantAction = async (participantId: string, action: () => Promise<void>) => {
        setProcessingParticipantIds((currentIds) => new Set(currentIds).add(participantId));
        try {
            await action();
            await loadParticipantPage();
        } finally {
            setProcessingParticipantIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(participantId);
                return nextIds;
            });
        }
    };

    const handleDelete = (participant: WorkshopAdminParticipant) => {
        const isDeletionConfirmed = window.confirm(
            `Opravdu trvale smazat účastníka ${participant.fullname}? Smažou se také jeho komentáře, hlasy, reakce a kliknutí na materiály.`,
        );
        if (isDeletionConfirmed) {
            void runParticipantAction(participant.id, () => onDelete(participant.id));
        }
    };

    const handleOpenParticipantTimeline = (participantId: string) => {
        const loadSequence = ++participantTimelineLoadSequenceReference.current;
        setSelectedParticipantId(participantId);
        setParticipantTimeline(null);
        setParticipantTimelineErrorMessage(null);
        setIsParticipantTimelineLoading(true);

        void fetchAdminWorkshopParticipantTimeline(workshopId, participantId)
            .then((loadedParticipantTimeline) => {
                if (loadSequence !== participantTimelineLoadSequenceReference.current) {
                    return;
                }

                setParticipantTimeline(loadedParticipantTimeline);
            })
            .catch((error: Error) => {
                if (loadSequence === participantTimelineLoadSequenceReference.current) {
                    setParticipantTimelineErrorMessage(error.message);
                }
            })
            .finally(() => {
                if (loadSequence === participantTimelineLoadSequenceReference.current) {
                    setIsParticipantTimelineLoading(false);
                }
            });
    };

    const handleParticipantTimelineOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            return;
        }

        participantTimelineLoadSequenceReference.current += 1;
        setSelectedParticipantId(null);
        setParticipantTimeline(null);
        setParticipantTimelineErrorMessage(null);
    };

    const participants = participantPage?.participants ?? [];
    const participantCount = participantPage?.totalCount ?? 0;
    const isParticipantTimelineOpen = selectedParticipantId !== null;

    return (
        <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                            <Users className="h-5 w-5 text-cyan-600" /> Účastníci v místnosti
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Lidé, kteří do místnosti opravdu vstoupili. Pro velké workshopy se načítá jen vybraná
                            stránka; detail otevře úplnou časovou osu člověka.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
                            {participantCount}
                        </span>
                        {isCommunityMembershipStatusShown && (
                            <Button asChild type="button" variant="outline" size="sm">
                                <Link href={createCommunityMembershipAdminPath('memberships')}>
                                    <Crown className="mr-1.5 h-4 w-4" /> Placená členství
                                </Link>
                            </Button>
                        )}
                        <WorkshopExportButton
                            workshopId={workshopId}
                            exportKind="participants"
                            participantQuery={participantQuery}
                            label="CSV"
                        />
                        <WorkshopExportButton
                            workshopId={workshopId}
                            exportKind="participants-vcard"
                            participantQuery={participantQuery}
                            label="vCard"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <WorkshopParticipantFilters query={participantQuery} onChange={changeParticipantQuery} />
                </div>

                {participantErrorMessage !== null ? (
                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {participantErrorMessage}
                    </div>
                ) : isParticipantsLoading && participants.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
                    </div>
                ) : participants.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                        Žádný účastník neodpovídá aktuálnímu filtru.
                    </div>
                ) : (
                    <div className="mt-4 rounded-xl border border-slate-200">
                        <Table
                            className={isCommunityMembershipStatusShown ? 'min-w-[1410px]' : 'min-w-[1260px]'}
                            horizontalScrollLabel="Posunout tabulku účastníků vodorovně"
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead isPinned>Účastník</TableHead>
                                    {isCommunityMembershipStatusShown && <TableHead>Členství</TableHead>}
                                    <TableHead>Kontaktní údaje</TableHead>
                                    <TableHead>Čas v místnosti</TableHead>
                                    <TableHead>V místnosti</TableHead>
                                    <TableHead>Komentáře</TableHead>
                                    <TableHead>Reakce</TableHead>
                                    <TableHead>Hlasy</TableHead>
                                    <TableHead>Moderace</TableHead>
                                    <TableHead>Akce</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {participants.map((participant) => {
                                    const isProcessing = processingParticipantIds.has(participant.id);
                                    return (
                                        <TableRow key={participant.id}>
                                            <TableCell isPinned className="min-w-60 align-top">
                                                <p className="font-semibold text-slate-900">{participant.fullname}</p>
                                                <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-slate-500">
                                                    <Mail className="h-3.5 w-3.5 shrink-0" /> {participant.email}
                                                </p>
                                            </TableCell>
                                            {isCommunityMembershipStatusShown && (
                                                <TableCell className="min-w-44 align-top">
                                                    <Link
                                                        href={createCommunityMembershipAdminPath(
                                                            'memberships',
                                                            participant.email,
                                                        )}
                                                        className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
                                                        aria-label={`Otevřít placené členství uživatele ${participant.fullname}`}
                                                    >
                                                        <CommunityMembershipStatusBadge
                                                            status={participant.communityMembershipStatus ?? 'none'}
                                                        />
                                                    </Link>
                                                </TableCell>
                                            )}
                                            <TableCell className="min-w-64 align-top">
                                                <AdminContactDetails
                                                    contactGroup={participant.contactGroup}
                                                    isContactRecordsIncluded
                                                    isWorkshopParticipationsIncluded={false}
                                                />
                                            </TableCell>
                                            <TableCell className="min-w-56 align-top text-xs text-slate-600">
                                                <p>Od {formatWorkshopAdminDateTime(participant.connectedAt)}</p>
                                                <p className="mt-1">
                                                    Do {formatWorkshopAdminDateTime(participant.lastSeenAt)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="align-top text-sm font-medium text-slate-800">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatWorkshopPresenceDuration(participant.activeDurationSeconds)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                                                    <MessageCircle className="h-3.5 w-3.5 text-violet-500" />
                                                    {participant.commentCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                                                    <Radio className="h-3.5 w-3.5 text-amber-500" />{' '}
                                                    {participant.reactionCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                                                    <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />{' '}
                                                    {participant.upvoteCount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="min-w-36 align-top">
                                                <div className="flex flex-col items-start gap-1">
                                                    {participant.isModerator && (
                                                        <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-800">
                                                            Moderátor
                                                        </span>
                                                    )}
                                                    {participant.isTrusted && (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                                                            Důvěryhodný
                                                        </span>
                                                    )}
                                                    {participant.isInteractionBanned && (
                                                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800">
                                                            Interakce zakázány
                                                        </span>
                                                    )}
                                                    {!participant.isTrusted &&
                                                        !participant.isModerator &&
                                                        !participant.isInteractionBanned && (
                                                            <span className="text-xs text-slate-400">Bez omezení</span>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-64 align-top">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenParticipantTimeline(participant.id)}
                                                    >
                                                        <Eye className="mr-1.5 h-4 w-4" /> Osa akcí
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={participant.isTrusted ? 'outline' : 'secondary'}
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            void runParticipantAction(participant.id, () =>
                                                                onChangeTrusted(participant.id, !participant.isTrusted),
                                                            )
                                                        }
                                                    >
                                                        <ShieldCheck className="mr-1.5 h-4 w-4" />
                                                        {participant.isTrusted ? 'Odebrat důvěru' : 'Důvěřovat'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={participant.isModerator ? 'outline' : 'secondary'}
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            void runParticipantAction(participant.id, () =>
                                                                onChangeModerator(
                                                                    participant.id,
                                                                    !participant.isModerator,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <ShieldPlus className="mr-1.5 h-4 w-4" />
                                                        {participant.isModerator
                                                            ? 'Odebrat moderování'
                                                            : 'Udělat moderátorem'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            participant.isInteractionBanned ? 'outline' : 'destructive'
                                                        }
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            void runParticipantAction(participant.id, () =>
                                                                onChangeInteractionBan(
                                                                    participant.id,
                                                                    !participant.isInteractionBanned,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        {participant.isInteractionBanned ? (
                                                            <>
                                                                <Check className="mr-1.5 h-4 w-4" /> Povolit
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Ban className="mr-1.5 h-4 w-4" /> Zakázat
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() => handleDelete(participant)}
                                                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                                    >
                                                        <Trash2 className="mr-1.5 h-4 w-4" /> Smazat
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="mt-4">
                    <WorkshopParticipantPagination
                        totalCount={participantCount}
                        page={participantQuery.page}
                        pageSize={participantQuery.pageSize}
                        onChangePage={(page) => changeParticipantQuery({ page })}
                        onChangePageSize={(pageSize) => changeParticipantQuery({ pageSize })}
                    />
                </div>
            </section>

            <WorkshopParticipantTimeline
                isOpen={isParticipantTimelineOpen}
                onOpenChange={handleParticipantTimelineOpenChange}
                timeline={participantTimeline}
                isLoading={isParticipantTimelineLoading}
                errorMessage={participantTimelineErrorMessage}
                workshopStartsAt={workshopStartsAt}
                workshopEndsAt={workshopEndsAt}
            />
        </>
    );
}
