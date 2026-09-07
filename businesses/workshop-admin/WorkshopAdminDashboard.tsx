'use client';

import { CreateWorkshopForm } from '@/businesses/workshop-admin/CreateWorkshopForm';
import {
    adjustAdminWorkshopCommentArtificialUpvotes,
    adjustAdminWorkshopPollOptionArtificialVotes,
    clearAdminWorkshopReactions,
    createAdminWorkshopArtificialComment,
    createAdminWorkshop,
    createAdminWorkshopContent,
    createAdminWorkshopPoll,
    deleteAdminWorkshopComment,
    deleteAdminWorkshopContent,
    deleteAdminWorkshopParticipant,
    deleteAdminWorkshopPoll,
    editAdminWorkshopCommentBody,
    fetchAdminWorkshopList,
    fetchAdminWorkshopSnapshot,
    moderateAdminWorkshopComment,
    pinAdminWorkshopComment,
    sendAdminWorkshopArtificialReaction,
    setAdminWorkshopStageComment,
    updateAdminWorkshopPoll,
    updateAdminWorkshop,
    updateAdminWorkshopContent,
    updateAdminWorkshopParticipantInteractionBan,
    updateAdminWorkshopParticipantModerator,
    updateAdminWorkshopParticipantTrusted,
    type WorkshopArtificialCommentValues,
    type WorkshopArtificialReactionValues,
    type WorkshopContentWriteValues,
    type WorkshopCreateValues,
    type WorkshopPollCreateValues,
    type WorkshopPollUpdateValues,
    type WorkshopWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopActivityGraph } from '@/businesses/workshop-admin/WorkshopActivityGraph';
import { WorkshopAttachedPollList } from '@/businesses/workshop-admin/WorkshopAttachedPollList';
import { WorkshopAdminRefreshButton } from '@/businesses/workshop-admin/WorkshopAdminRefreshButton';
import { WorkshopArtificialComment } from '@/businesses/workshop-admin/WorkshopArtificialComment';
import { WorkshopArtificialReaction } from '@/businesses/workshop-admin/WorkshopArtificialReaction';
import { WorkshopCommentModeration } from '@/businesses/workshop-admin/WorkshopCommentModeration';
import { WorkshopContentAdmin } from '@/businesses/workshop-admin/WorkshopContentAdmin';
import { WorkshopExportButton } from '@/businesses/workshop-admin/WorkshopExportButton';
import { WorkshopFeedbackAdmin } from '@/businesses/workshop-admin/WorkshopFeedbackAdmin';
import { WorkshopParticipantList } from '@/businesses/workshop-admin/WorkshopParticipantList';
import { WorkshopPollAdmin } from '@/businesses/workshop-admin/WorkshopPollAdmin';
import { WorkshopReactionSummary } from '@/businesses/workshop-admin/WorkshopReactionSummary';
import { WorkshopRegistrationContacts } from '@/businesses/workshop-admin/WorkshopRegistrationContacts';
import { WorkshopSelectorCardList } from '@/businesses/workshop-admin/WorkshopSelectorCardList';
import { WorkshopSettingsForm } from '@/businesses/workshop-admin/WorkshopSettingsForm';
import { mergeWorkshopAdminSnapshot } from '@/businesses/workshop-admin/workshopAdminSnapshot';
import {
    PARTICIPANT_COUNT_LABEL,
    PARTICIPANT_COUNT_TITLE,
    REGISTERED_PARTICIPANT_COUNT_LABEL,
    REGISTERED_PARTICIPANT_COUNT_TITLE,
} from '@/businesses/workshop-admin/workshopAudienceLabels';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopAdminSection, type WorkshopAdminSection } from '@/lib/workshops/workshopAdminSections';
import {
    parseWorkshopAdminViewState,
    serializeWorkshopAdminViewState,
    type WorkshopAdminViewState,
} from '@/lib/workshops/workshopAdminViewState';
import type { WorkshopOverviewGraphState } from '@/lib/workshops/workshopOverviewGraphState';
import type {
    WorkshopAdminSnapshot,
    WorkshopAdminSummary,
    WorkshopCommentStatus,
    WorkshopKind,
} from '@/lib/workshops/workshopTypes';
import {
    BarChart3,
    BookOpenText,
    MessageCircle,
    Radio,
    RefreshCw,
    Settings2,
    Star,
    UserPlus,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const ADMIN_SNAPSHOT_REFRESH_INTERVAL_MILLISECONDS = 5_000;

type WorkshopAdminSectionDefinition = {
    readonly value: WorkshopAdminSection;
    readonly label: string;
    readonly icon: typeof BarChart3;
};

export type WorkshopAdminAdditionalSection = WorkshopAdminSectionDefinition & {
    readonly content: ReactNode;
};

const WORKSHOP_ADMIN_SECTION_DEFINITIONS: readonly WorkshopAdminSectionDefinition[] = [
    { value: 'overview', label: 'Přehled', icon: BarChart3 },
    { value: 'participants', label: 'Účastníci', icon: Users },
    { value: 'comments', label: 'Komentáře', icon: MessageCircle },
    { value: 'reactions', label: 'Reakce', icon: Radio },
    { value: 'content', label: 'Obsah', icon: BookOpenText },
    { value: 'polls', label: 'Ankety', icon: BarChart3 },
    { value: 'feedback', label: 'Zpětná vazba', icon: Star },
    { value: 'settings', label: 'Nastavení', icon: Settings2 },
];

type WorkshopOverviewStatistic = {
    readonly label: string;
    readonly value: number;
    readonly icon: typeof BarChart3;
    readonly description: string;
};

/**
 * What the overview of one room counts, beginning with its two audiences.
 *
 * Note: A room which is no term of an event has no landing page registering anybody for it, so it says nothing about
 *       registrations at all rather than claiming that nobody registered for it.
 */
function createWorkshopOverviewStatistics(
    snapshot: WorkshopAdminSnapshot,
    registeredParticipantCount: number | null,
): readonly WorkshopOverviewStatistic[] {
    return [
        ...(registeredParticipantCount === null
            ? []
            : [
                  {
                      label: REGISTERED_PARTICIPANT_COUNT_LABEL,
                      value: registeredParticipantCount,
                      icon: UserPlus,
                      description: REGISTERED_PARTICIPANT_COUNT_TITLE,
                  },
              ]),
        {
            label: PARTICIPANT_COUNT_LABEL,
            value: snapshot.participantCount,
            icon: Users,
            description: PARTICIPANT_COUNT_TITLE,
        },
        {
            label: 'Komentáře',
            value: snapshot.commentCount,
            icon: MessageCircle,
            description: 'Zprávy, které účastníci napsali do chatu místnosti',
        },
        {
            label: 'Reakce',
            value: snapshot.reactionCount,
            icon: Radio,
            description: 'Reakce, které účastníci poslali do místnosti',
        },
    ];
}

type WorkshopAdminDashboardProps = {
    readonly initialWorkshopSlug: string | null;
    readonly workshopKind?: WorkshopKind;
    readonly selectorLabel?: string;
    readonly subjectLabel?: string;
    readonly emptyStateMessage?: string;

    /**
     * Where the polls asked about this room are administered, which is the room owning them.
     */
    readonly attachedPollAdministrationPath?: string;

    /**
     * A singleton room can add a concern of its own without making the reusable workshop dashboard import or know that
     * business. The community uses this for durable memberships, which are not a capability of an event occurrence.
     */
    readonly additionalSections?: readonly WorkshopAdminAdditionalSection[];
};

export function WorkshopAdminDashboard({
    initialWorkshopSlug,
    workshopKind = 'workshop',
    selectorLabel = 'Workshop',
    subjectLabel = 'workshopu',
    emptyStateMessage = 'Vytvořte první workshop.',
    attachedPollAdministrationPath,
    additionalSections = [],
}: WorkshopAdminDashboardProps) {
    // Note: There is only ever one room of a singleton kind, so nothing offers a choice between rooms of that kind or
    //       the creation of a second one.
    const {
        isSingleton,
        isScheduled: isRoomScheduled,
        isStageOffered,
        isPollsOffered,
    } = getWorkshopKindCapabilities(workshopKind);
    const isRoomSelectionOffered = !isSingleton;
    const [viewState, changeViewState] = useUrlSynchronizedViewState<WorkshopAdminViewState>({
        parseViewState: parseWorkshopAdminViewState,
        serializeViewState: serializeWorkshopAdminViewState,
    });
    const [workshops, setWorkshops] = useState<readonly WorkshopAdminSummary[]>([]);

    // Note: A poll is about workshop occurrences rather than about the room administering it, so the occurrences are
    //       listed separately from the rooms this dashboard administers.
    const [attachableWorkshops, setAttachableWorkshops] = useState<readonly WorkshopAdminSummary[]>([]);
    const [snapshot, setSnapshot] = useState<WorkshopAdminSnapshot | null>(null);
    const [commentStatus, setCommentStatus] = useState<WorkshopCommentStatus>('pending');
    const [snapshotRefreshVersion, setSnapshotRefreshVersion] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const snapshotLoadSequenceReference = useRef(0);
    // Note: A room either administers polls of its own, or is the subject of polls the community administers. Both of
    //       them are read in the very same section, so an administrator looks for a poll in one place.
    const isAttachedPollSectionOffered = !isPollsOffered && (snapshot?.attachedPolls.length ?? 0) > 0;
    const isPollSectionOffered = isPollsOffered || isAttachedPollSectionOffered;
    const sectionDefinitions = [
        ...WORKSHOP_ADMIN_SECTION_DEFINITIONS.filter(
            ({ value }) =>
                (value !== 'feedback' || workshopKind === 'workshop') &&
                (value !== 'polls' || isPollSectionOffered) &&
                value !== 'memberships',
        ),
        ...additionalSections.map(({ content: _content, ...sectionDefinition }) => sectionDefinition),
    ];
    const selectedSection = sectionDefinitions.some(({ value }) => value === viewState.section)
        ? viewState.section
        : 'overview';

    // Note: Which room is open is decided by the link alone, so opening a shared address and picking a room from the
    //       list are one and the same thing. A link which names no room, or a room which is not there any more, opens
    //       the room the administration would have opened anyway.
    const selectedWorkshop = useMemo(
        () =>
            workshops.find(({ slug }) => slug === viewState.workshopSlug) ??
            workshops.find(({ slug }) => slug === initialWorkshopSlug) ??
            workshops[0] ??
            null,
        [initialWorkshopSlug, viewState.workshopSlug, workshops],
    );
    const selectedWorkshopId = selectedWorkshop?.id ?? null;

    const loadWorkshopList = useCallback(async () => {
        try {
            setWorkshops(await fetchAdminWorkshopList(workshopKind));
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [workshopKind]);

    const loadAttachablePollWorkshops = useCallback(async () => {
        if (!isPollsOffered) {
            return;
        }

        try {
            setAttachableWorkshops(await fetchAdminWorkshopList('workshop'));
        } catch (error) {
            setErrorMessage((error as Error).message);
        }
    }, [isPollsOffered]);

    const selectWorkshopBySlug = useCallback(
        (workshopSlug: string) => changeViewState((previousViewState) => ({ ...previousViewState, workshopSlug })),
        [changeViewState],
    );

    const loadSnapshot = useCallback(async () => {
        const snapshotLoadSequence = ++snapshotLoadSequenceReference.current;
        if (!selectedWorkshopId) {
            setSnapshot(null);
            setIsSnapshotLoading(false);
            return;
        }

        setSnapshot((currentSnapshot) =>
            currentSnapshot?.workshop.id === selectedWorkshopId ? currentSnapshot : null,
        );
        setIsSnapshotLoading(true);
        try {
            const loadedSnapshot = await fetchAdminWorkshopSnapshot(
                selectedWorkshopId,
                commentStatus,
                selectedSection === 'comments',
            );
            if (snapshotLoadSequence !== snapshotLoadSequenceReference.current) {
                return;
            }

            setSnapshot((currentSnapshot) => mergeWorkshopAdminSnapshot(currentSnapshot, loadedSnapshot));
            setSnapshotRefreshVersion((currentVersion) => currentVersion + 1);
            setErrorMessage(null);
        } catch (error) {
            if (snapshotLoadSequence === snapshotLoadSequenceReference.current) {
                setErrorMessage((error as Error).message);
            }
        } finally {
            if (snapshotLoadSequence === snapshotLoadSequenceReference.current) {
                setIsSnapshotLoading(false);
            }
        }
    }, [commentStatus, selectedSection, selectedWorkshopId]);

    useEffect(() => void loadWorkshopList(), [loadWorkshopList]);
    useEffect(() => void loadAttachablePollWorkshops(), [loadAttachablePollWorkshops]);
    useEffect(() => void loadSnapshot(), [loadSnapshot]);
    useEffect(() => {
        if (!selectedWorkshopId) {
            return;
        }

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                void loadSnapshot();
            }
        }, ADMIN_SNAPSHOT_REFRESH_INTERVAL_MILLISECONDS);
        return () => window.clearInterval(intervalId);
    }, [loadSnapshot, selectedWorkshopId]);

    const handleCreateWorkshop = async (values: WorkshopCreateValues): Promise<boolean> => {
        try {
            const workshop = await createAdminWorkshop(values);
            await loadWorkshopList();
            selectWorkshopBySlug(workshop.slug);
            return true;
        } catch (error) {
            setErrorMessage((error as Error).message);
            return false;
        }
    };

    const runAndReload = async (mutation: () => Promise<unknown>): Promise<boolean> => {
        try {
            await mutation();
            await Promise.all([loadSnapshot(), loadWorkshopList()]);
            setErrorMessage(null);
            return true;
        } catch (error) {
            setErrorMessage((error as Error).message);
            return false;
        }
    };

    const handleSaveWorkshop = (values: WorkshopWriteValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => updateAdminWorkshop(snapshot.workshop.id, values));
    const handleCreateContent = (values: WorkshopContentWriteValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => createAdminWorkshopContent(snapshot.workshop.id, values));
    const handleUpdateContent = (contentId: string, values: WorkshopContentWriteValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => updateAdminWorkshopContent(snapshot.workshop.id, contentId, values));
    const handleDeleteContent = async (contentId: string) => {
        if (snapshot !== null) {
            await runAndReload(() => deleteAdminWorkshopContent(snapshot.workshop.id, contentId));
        }
    };
    const handleUnlockContentNow = (contentId: string) => {
        if (snapshot === null) {
            return Promise.resolve(false);
        }

        const contentBlock = snapshot.contentBlocks.find((currentContentBlock) => currentContentBlock.id === contentId);
        if (contentBlock === undefined) {
            return Promise.resolve(false);
        }

        return runAndReload(() =>
            updateAdminWorkshopContent(snapshot.workshop.id, contentId, {
                title: contentBlock.title,
                bodyMarkdown: contentBlock.bodyMarkdown,
                unlockAt: new Date().toISOString(),
                sortOrder: contentBlock.sortOrder,
                isPublished: true,
                isFollowUp: contentBlock.isFollowUp,
                isPaidMembersOnly: contentBlock.isPaidMembersOnly,
            }),
        );
    };
    const handleCreatePoll = (values: WorkshopPollCreateValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => createAdminWorkshopPoll(snapshot.workshop.id, values));
    const handleUpdatePoll = (pollId: string, values: WorkshopPollUpdateValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => updateAdminWorkshopPoll(snapshot.workshop.id, pollId, values));
    const handleDeletePoll = async (pollId: string) => {
        if (snapshot !== null) {
            await runAndReload(() => deleteAdminWorkshopPoll(snapshot.workshop.id, pollId));
        }
    };
    const handleAdjustArtificialPollVotes = (pollId: string, optionId: string, artificialVoteAdjustment: number) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() =>
                  adjustAdminWorkshopPollOptionArtificialVotes(
                      snapshot.workshop.id,
                      pollId,
                      optionId,
                      artificialVoteAdjustment,
                  ),
              );
    const handleModerateComment = async (commentId: string, status: Exclude<WorkshopCommentStatus, 'pending'>) => {
        if (snapshot !== null) {
            await runAndReload(() => moderateAdminWorkshopComment(snapshot.workshop.id, commentId, status));
        }
    };
    const handleEditCommentBody = (commentId: string, body: string) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => editAdminWorkshopCommentBody(snapshot.workshop.id, commentId, body));
    const handleChangeCommentPin = (commentId: string, isPinned: boolean) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => pinAdminWorkshopComment(snapshot.workshop.id, commentId, isPinned));
    const handleDeleteComment = async (commentId: string) => {
        if (snapshot !== null) {
            await runAndReload(() => deleteAdminWorkshopComment(snapshot.workshop.id, commentId));
        }
    };
    const handleAdjustArtificialUpvotes = (commentId: string, artificialUpvoteAdjustment: number) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() =>
                  adjustAdminWorkshopCommentArtificialUpvotes(
                      snapshot.workshop.id,
                      commentId,
                      artificialUpvoteAdjustment,
                  ),
              );
    const handleCreateArtificialComment = (values: WorkshopArtificialCommentValues, isSentToStage: boolean) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(async () => {
                  const commentId = await createAdminWorkshopArtificialComment(snapshot.workshop.id, values);
                  if (isSentToStage) {
                      await setAdminWorkshopStageComment(snapshot.workshop.id, commentId);
                  }
              });
    const handleSetStageComment = (commentId: string | null) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => setAdminWorkshopStageComment(snapshot.workshop.id, commentId));
    const handleSendArtificialReaction = (values: WorkshopArtificialReactionValues) =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => sendAdminWorkshopArtificialReaction(snapshot.workshop.id, values));
    const handleChangeParticipantInteractionBan = async (participantId: string, isInteractionBanned: boolean) => {
        if (snapshot !== null) {
            await runAndReload(() =>
                updateAdminWorkshopParticipantInteractionBan(snapshot.workshop.id, participantId, isInteractionBanned),
            );
        }
    };
    const handleChangeParticipantTrusted = async (participantId: string, isTrusted: boolean) => {
        if (snapshot !== null) {
            await runAndReload(() =>
                updateAdminWorkshopParticipantTrusted(snapshot.workshop.id, participantId, isTrusted),
            );
        }
    };
    const handleChangeParticipantModerator = async (participantId: string, isModerator: boolean) => {
        if (snapshot !== null) {
            await runAndReload(() =>
                updateAdminWorkshopParticipantModerator(snapshot.workshop.id, participantId, isModerator),
            );
        }
    };
    const handleDeleteParticipant = async (participantId: string) => {
        if (snapshot !== null) {
            await runAndReload(() => deleteAdminWorkshopParticipant(snapshot.workshop.id, participantId));
        }
    };
    const handleClearReactions = () =>
        snapshot === null
            ? Promise.resolve(false)
            : runAndReload(() => clearAdminWorkshopReactions(snapshot.workshop.id));

    const handleSectionChange = (value: string) => {
        if (isWorkshopAdminSection(value)) {
            changeViewState((previousViewState) => ({ ...previousViewState, section: value }));
        }
    };

    const handleGraphStateChange = useCallback(
        (changeGraphState: (previousGraphState: WorkshopOverviewGraphState) => WorkshopOverviewGraphState) =>
            changeViewState((previousViewState) => ({
                ...previousViewState,
                graph: changeGraphState(previousViewState.graph),
            })),
        [changeViewState],
    );

    const handleRefresh = () => void Promise.all([loadSnapshot(), loadWorkshopList(), loadAttachablePollWorkshops()]);

    // Note: A room without a schedule unlocks new material as soon as it is written, rather than at a date it never
    //       had. The moment is taken once per room, so a reload of the administration never rewrites a form being
    //       filled in.
    const currentUnlockAt = useMemo(() => new Date().toISOString(), [selectedWorkshopId]);
    const scheduleStartsAt = isRoomScheduled && snapshot !== null ? snapshot.workshop.startsAt : null;

    // Note: How many people registered belongs to the term rather than to its live room, so it is read from the very
    //       list which already counts it for every card instead of being counted a second time for the opened one.
    const overviewStatistics =
        snapshot === null
            ? []
            : createWorkshopOverviewStatistics(snapshot, selectedWorkshop?.registeredParticipantCount ?? null);

    return (
        <div
            className={`mx-auto grid max-w-7xl gap-6 px-6 py-8 ${isRoomSelectionOffered ? 'lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[28rem_minmax(0,1fr)]' : ''}`}
        >
            {isRoomSelectionOffered && (
                <aside className="space-y-4">
                    <div className="space-y-4 lg:sticky lg:top-6">
                        <WorkshopSelectorCardList
                            label={selectorLabel}
                            workshops={workshops}
                            selectedWorkshopId={selectedWorkshopId}
                            isLoading={isLoading}
                            emptyMessage={emptyStateMessage}
                            onSelect={(workshopId) => {
                                const workshop = workshops.find(({ id }) => id === workshopId);
                                if (workshop !== undefined) {
                                    selectWorkshopBySlug(workshop.slug);
                                }
                            }}
                        />
                        <WorkshopAdminRefreshButton className="w-full" onRefresh={handleRefresh} />
                    </div>
                    <CreateWorkshopForm
                        onCreate={handleCreateWorkshop}
                        workshopToDuplicate={snapshot?.workshop ?? null}
                        existingWorkshopSlugs={workshops.map((workshop) => workshop.slug)}
                    />
                </aside>
            )}

            <div className="min-w-0 space-y-6">
                {!isRoomSelectionOffered && (
                    <div className="flex justify-end">
                        <WorkshopAdminRefreshButton onRefresh={handleRefresh} />
                    </div>
                )}
                {errorMessage !== null && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}
                {isLoading || (isSnapshotLoading && snapshot === null) ? (
                    <div className="flex justify-center py-20">
                        <RefreshCw className="h-6 w-6 animate-spin text-cyan-600" />
                    </div>
                ) : snapshot === null ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
                        {emptyStateMessage}
                    </div>
                ) : (
                    <Tabs value={selectedSection} onValueChange={handleSectionChange}>
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1 sm:grid-cols-3 xl:grid-cols-8">
                            {sectionDefinitions.map((sectionDefinition) => {
                                const SectionIcon = sectionDefinition.icon;
                                return (
                                    <TabsTrigger
                                        key={sectionDefinition.value}
                                        value={sectionDefinition.value}
                                        className="gap-1.5 px-2.5 py-2"
                                    >
                                        <SectionIcon className="h-4 w-4" /> {sectionDefinition.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div
                                className={`grid gap-4 ${overviewStatistics.length === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'}`}
                            >
                                {overviewStatistics.map((statistic) => (
                                    <div
                                        key={statistic.label}
                                        title={statistic.description}
                                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                    >
                                        <statistic.icon className="h-5 w-5 text-cyan-600" />
                                        <p className="mt-3 text-2xl font-bold text-slate-950">{statistic.value}</p>
                                        <p className="text-xs text-slate-500">{statistic.label}</p>
                                    </div>
                                ))}
                            </div>
                            <WorkshopActivityGraph
                                workshopId={snapshot.workshop.id}
                                workshopSlug={snapshot.workshop.slug}
                                isRoomScheduled={isRoomScheduled}
                                subjectLabel={subjectLabel}
                                refreshVersion={snapshotRefreshVersion}
                                graphState={viewState.graph}
                                onChangeGraphState={handleGraphStateChange}
                            />
                        </TabsContent>

                        <TabsContent value="participants" className="space-y-6">
                            {selectedWorkshop !== null && <WorkshopRegistrationContacts workshop={selectedWorkshop} />}
                            <WorkshopParticipantList
                                workshopId={snapshot.workshop.id}
                                workshopStartsAt={scheduleStartsAt}
                                workshopEndsAt={snapshot.workshop.endsAt}
                                refreshVersion={snapshotRefreshVersion}
                                isCommunityMembershipStatusShown={workshopKind === 'community'}
                                onChangeInteractionBan={handleChangeParticipantInteractionBan}
                                onChangeTrusted={handleChangeParticipantTrusted}
                                onChangeModerator={handleChangeParticipantModerator}
                                onDelete={handleDeleteParticipant}
                            />
                        </TabsContent>

                        <TabsContent value="comments" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    workshopId={snapshot.workshop.id}
                                    exportKind="comments"
                                    label="Exportovat komentáře CSV"
                                />
                            </div>
                            <WorkshopCommentModeration
                                comments={snapshot.comments}
                                commentStatus={commentStatus}
                                pinnedComment={snapshot.pinnedComment}
                                stageComment={isStageOffered ? snapshot.stageComment : null}
                                onChangeCommentStatus={setCommentStatus}
                                onModerate={handleModerateComment}
                                onEditBody={handleEditCommentBody}
                                onChangePin={handleChangeCommentPin}
                                onSetStageComment={isStageOffered ? handleSetStageComment : null}
                                onAdjustArtificialUpvotes={handleAdjustArtificialUpvotes}
                                onDelete={handleDeleteComment}
                            />
                            <WorkshopArtificialComment
                                onCreate={handleCreateArtificialComment}
                                isStageOffered={isStageOffered}
                            />
                        </TabsContent>

                        <TabsContent value="reactions" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    workshopId={snapshot.workshop.id}
                                    exportKind="reactions"
                                    label="Exportovat reakce CSV"
                                />
                            </div>
                            <WorkshopReactionSummary
                                workshopId={snapshot.workshop.id}
                                refreshVersion={snapshotRefreshVersion}
                            />
                            <WorkshopArtificialReaction
                                reactionCount={snapshot.reactionCount}
                                artificialReactionCount={snapshot.artificialReactionCount}
                                onSend={handleSendArtificialReaction}
                                onClear={handleClearReactions}
                            />
                        </TabsContent>

                        <TabsContent value="content" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    workshopId={snapshot.workshop.id}
                                    exportKind="content"
                                    label="Exportovat obsah CSV"
                                />
                            </div>
                            <WorkshopContentAdmin
                                defaultUnlockAt={scheduleStartsAt ?? currentUnlockAt}
                                contentBlocks={snapshot.contentBlocks}
                                onCreate={handleCreateContent}
                                onUpdate={handleUpdateContent}
                                onDelete={handleDeleteContent}
                                onUnlockNow={handleUnlockContentNow}
                            />
                        </TabsContent>

                        {isPollSectionOffered && (
                            <TabsContent value="polls">
                                {isPollsOffered ? (
                                    <WorkshopPollAdmin
                                        polls={snapshot.polls}
                                        attachableWorkshops={attachableWorkshops}
                                        onCreate={handleCreatePoll}
                                        onUpdate={handleUpdatePoll}
                                        onDelete={handleDeletePoll}
                                        onAdjustArtificialVotes={handleAdjustArtificialPollVotes}
                                    />
                                ) : (
                                    <WorkshopAttachedPollList
                                        polls={snapshot.attachedPolls}
                                        pollAdministrationPath={attachedPollAdministrationPath}
                                    />
                                )}
                            </TabsContent>
                        )}

                        {workshopKind === 'workshop' && (
                            <TabsContent value="feedback">
                                <WorkshopFeedbackAdmin
                                    workshopId={snapshot.workshop.id}
                                    refreshVersion={snapshotRefreshVersion}
                                />
                            </TabsContent>
                        )}

                        <TabsContent value="settings" className="space-y-4">
                            <div className="flex justify-end">
                                <WorkshopExportButton
                                    workshopId={snapshot.workshop.id}
                                    exportKind="settings"
                                    label="Exportovat nastavení CSV"
                                />
                            </div>
                            <WorkshopSettingsForm
                                workshop={snapshot.workshop}
                                onSave={handleSaveWorkshop}
                                subjectLabel={subjectLabel}
                            />
                        </TabsContent>

                        {additionalSections.map((section) => (
                            <TabsContent key={section.value} value={section.value} className="space-y-4">
                                {section.content}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    );
}
