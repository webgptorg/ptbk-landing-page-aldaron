'use client';

import { WorkshopWrapUp } from '@/businesses/online-workshop/participant/WorkshopWrapUp';
import { WorkshopStageComment } from '@/businesses/online-workshop/participant/WorkshopStageComment';
import { WorkshopRepositoryCommitNotification } from '@/businesses/online-workshop/participant/WorkshopRepositoryCommitNotification';
import { WorkshopPresentationStage } from '@/businesses/online-workshop/participant/WorkshopPresentationStage';
import { WorkshopHostedRecordingPlayer } from '@/businesses/online-workshop/participant/WorkshopHostedRecordingPlayer';
import { useWorkshopRepositoryCommitNotification } from '@/businesses/online-workshop/participant/useWorkshopRepositoryCommitNotification';
import type { SubscribeToWorkshopReactions } from '@/businesses/online-workshop/participant/useWorkshopReactionAnimations';
import type { WorkshopFeedbackValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { useWorkshopReactionStream } from '@/components/workshops/useWorkshopReactionStream';
import { WorkshopReactionStream } from '@/components/workshops/WorkshopReactionStream';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import { createYoutubeEmbedUrl } from '@/lib/youtube/youtubeEmbed';
import { keepYoutubeVideoSubtitlesHidden, unmuteYoutubeVideo } from '@/lib/youtube/youtubePlayerCommands';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import {
    getWorkshopPrimaryStageContentLabel,
    normalizeWorkshopPrimaryStageContent,
    type WorkshopPrimaryStageContent,
} from '@/lib/workshops/workshopPrimaryStageContent';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { SubscribeToWorkshopRepositoryCommits } from '@/lib/workshops/workshopRepositoryProgress';
import type {
    WorkshopCommentReference,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopFeedback,
    WorkshopPaidMembersVideo,
} from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownLeft, ArrowLeft, Maximize, Play, Radio, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const CLOCK_TICK_MILLISECONDS = 1000;

type WorkshopStageProps = {
    readonly workshop: WorkshopDetails;
    readonly serverTime: string;

    /**
     * Where the reactions of the room come from
     *
     * Note: The stage keeps the flying reactions itself, so a busy room re-renders nothing but the stage they fly over.
     */
    readonly subscribeToReactions: SubscribeToWorkshopReactions;

    /** The project connected to this workshop, if there is one */
    readonly repository?: WorkshopRepository | null;
    /** The existing project panel, shared between the main stage and supplementary material placement. */
    readonly repositoryPanel?: ReactNode | null;

    /** Offers the stage commits found by the repository monitor or its polling fallback */
    readonly subscribeToRepositoryCommits?: SubscribeToWorkshopRepositoryCommits;

    /**
     * All of these values are supplied by the participant room in production. Defaults keep this low-level stage usable
     * in isolation while it is still responsible for choosing the correct temporal phase.
     */
    readonly feedback?: WorkshopFeedback | null;
    readonly followUpContentBlock?: WorkshopContentBlock | null;
    readonly stageComment?: WorkshopCommentReference | null;

    /**
     * The recording which this member has not unlocked, or `null` while nothing of the video is withheld from them
     *
     * Note: The server decides this together with the video it hands over, so the stage plays whatever video it was
     *       given and offers the membership exactly when it was given none.
     */
    readonly paidMembersOnlyVideo?: WorkshopPaidMembersVideo | null;
    readonly onSaveFeedback?: (values: WorkshopFeedbackValues) => Promise<boolean>;
    /** Follow-up destinations, mounted only when the stage shows the ended workshop's wrap-up. */
    readonly wrapUpNavigation?: ReactNode;
};

function getRemainingSegments(remainingMilliseconds: number) {
    const remainingSeconds = Math.max(0, Math.floor(remainingMilliseconds / 1000));
    return [
        { label: 'dní', value: Math.floor(remainingSeconds / 86400) },
        { label: 'hodin', value: Math.floor((remainingSeconds % 86400) / 3600) },
        { label: 'minut', value: Math.floor((remainingSeconds % 3600) / 60) },
        { label: 'sekund', value: remainingSeconds % 60 },
    ];
}

function requestVideoFullscreen(videoFrame: HTMLIFrameElement | null): void {
    const requestFullscreen = videoFrame?.requestFullscreen;
    if (requestFullscreen === undefined || videoFrame === null) {
        return;
    }

    void requestFullscreen.call(videoFrame).catch(() => undefined);
}

function WorkshopPrimarySourceUnavailable({
    primaryStageContent,
    isConfigured = false,
    fallbackUrl,
}: {
    readonly primaryStageContent: WorkshopPrimaryStageContent;
    readonly isConfigured?: boolean;
    readonly fallbackUrl?: string;
}) {
    const message = primaryStageContent === 'video'
        ? isConfigured
            ? { title: 'Video se nepodařilo načíst', description: 'Zkuste video otevřít přímo na YouTube.' }
            : { title: 'Video zatím není nastavené', description: 'Na hlavní stage se zatím žádné video nepřehrává.' }
        : primaryStageContent === 'presentation'
          ? isConfigured
              ? { title: 'Prezentaci se nepodařilo načíst', description: 'Zkuste ji otevřít přímo z jejího zdroje.' }
              : { title: 'Prezentace není nastavená', description: 'Na hlavní stage zatím není připojená prezentace.' }
          : isConfigured
            ? { title: 'Projekt se nepodařilo načíst', description: 'Odkazy k projektu jsou dostupné v jeho panelu.' }
            : { title: 'Repozitář není připojený', description: 'Na hlavní stage zatím není připojený projekt workshopu.' };

    return (
        <div role="status" className="grid min-h-[320px] place-items-center bg-[radial-gradient(circle_at_center,rgba(48,168,189,.12),transparent_55%)] px-6 py-10 text-center sm:min-h-[400px]">
            <div className="max-w-lg">
                <Radio className="mx-auto h-10 w-10 text-room-accent" aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-bold text-room-heading">{message.title}</h2>
                <p className="mt-2 text-sm leading-6 text-room-muted">{message.description}</p>
                {fallbackUrl !== undefined && (
                    <a
                        href={fallbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex rounded-full border border-room-accent/30 bg-room-accent/10 px-4 py-2 text-sm font-semibold text-room-accent hover:bg-room-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                    >
                        Otevřít video na YouTube
                    </a>
                )}
                <p className="mt-4 rounded-xl border border-room-warning/30 bg-room-warning/10 px-4 py-3 text-sm leading-6 text-room-warning">
                    {isConfigured
                        ? 'Upozornění pro administrátora: zkontrolujte dostupnost připojeného zdroje.'
                        : 'Upozornění pro administrátora: zkontrolujte nastavení hlavního obsahu workshopu.'}
                </p>
            </div>
        </div>
    );
}

const refuseStandaloneFeedbackSave = async (): Promise<boolean> => false;

export function WorkshopStage({
    workshop,
    serverTime,
    subscribeToReactions,
    repository = null,
    repositoryPanel = null,
    subscribeToRepositoryCommits,
    feedback = null,
    followUpContentBlock = null,
    stageComment = null,
    paidMembersOnlyVideo = null,
    onSaveFeedback = refuseStandaloneFeedbackSave,
    wrapUpNavigation,
}: WorkshopStageProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;
    const serverClockOffset = useMemo(() => Date.parse(serverTime) - Date.now(), [serverTime]);
    const [currentTime, setCurrentTime] = useState(() => Date.now() + serverClockOffset);
    const [isVideoUnmuted, setIsVideoUnmuted] = useState(false);
    const [isVideoEmbedUnavailable, setIsVideoEmbedUnavailable] = useState(false);
    const [isPrimarySourceOpen, setIsPrimarySourceOpen] = useState(false);
    const videoFrameReference = useRef<HTMLIFrameElement>(null);
    const { flyingReactions, launchReaction } = useWorkshopReactionStream();

    const phase = getWorkshopPhase(workshop, currentTime);
    const isWorkshopOngoing = phase === 'ongoing';
    const isWorkshopPast = isWorkshopPhasePast(phase);
    const primaryStageContent = normalizeWorkshopPrimaryStageContent(workshop.primaryStageContent);
    const isVideoPrimary = primaryStageContent === 'video';
    const isHostedVideo = workshop.videoSource === 'hosted';
    const hostedRevisionId = isHostedVideo ? workshop.hostedRecordingRevisionId ?? null : null;
    const isVideoConfigured = isHostedVideo ? hostedRevisionId !== null : workshop.youtubeVideoId !== null;
    const isVideoStageActive = isWorkshopOngoing && isVideoPrimary;
    const isPrimarySourceAvailable = primaryStageContent === 'video'
        ? isVideoConfigured || paidMembersOnlyVideo !== null
        : primaryStageContent === 'presentation'
          ? workshop.presentationUrl !== null
          : repositoryPanel !== null;
    const remainingMilliseconds = Date.parse(workshop.startsAt) - currentTime;
    const newRepositoryCommit = useWorkshopRepositoryCommitNotification({
        workshopSlug: workshop.slug,
        isWorkshopOngoing,
        isEnabled: repository !== null,
        subscribeToRepositoryCommits,
    });

    // Note: Once the workshop is over, the room only holds its video for the members whose membership pays for it, and
    //       the server is what decides that. The wrap-up therefore keeps its feedback for everybody and gains either
    //       the button which plays the video again or the offer of the membership which unlocks it.
    const isVideoRewatchOffered = isWorkshopPast && isVideoConfigured;
    const [isVideoRewatchShown, setIsVideoRewatchShown] = useState(false);
    useEffect(() => {
        if (!isVideoRewatchOffered) {
            setIsVideoRewatchShown(false);
        }
    }, [isVideoRewatchOffered]);

    useEffect(() => {
        setIsPrimarySourceOpen(false);
        setIsVideoRewatchShown(false);
    }, [primaryStageContent]);

    useEffect(() => subscribeToReactions(launchReaction), [launchReaction, subscribeToReactions]);

    useEffect(() => {
        setCurrentTime(Date.now() + serverClockOffset);
        const intervalId = window.setInterval(
            () => setCurrentTime(Date.now() + serverClockOffset),
            CLOCK_TICK_MILLISECONDS,
        );
        return () => window.clearInterval(intervalId);
    }, [serverClockOffset]);

    useEffect(() => {
        setIsVideoUnmuted(false);
        setIsVideoEmbedUnavailable(false);
    }, [workshop.youtubeVideoId, primaryStageContent]);

    useEffect(() => {
        if (workshop.youtubeVideoId === null || !isVideoStageActive) {
            return;
        }

        return keepYoutubeVideoSubtitlesHidden(videoFrameReference.current);
    }, [workshop.youtubeVideoId, isVideoStageActive]);

    const countdownSegments = getRemainingSegments(remainingMilliseconds);
    const isVideoRewatchVisible = isVideoRewatchShown && isVideoPrimary && isVideoConfigured;
    const isPrimarySourceVisible = isPrimarySourceOpen && !isVideoPrimary;
    const ongoingPrimaryStageContent = primaryStageContent === 'video' ? (
        <div className="relative min-w-0 w-full max-w-full min-h-[220px] aspect-video sm:min-h-[260px]">
            {hostedRevisionId ? (
                <WorkshopHostedRecordingPlayer workshopSlug={workshop.slug} revisionId={hostedRevisionId}
                    isLive serverTime={serverTime} />
            ) : !isHostedVideo && workshop.youtubeVideoId !== null && !isVideoEmbedUnavailable ? (
                <iframe
                    ref={videoFrameReference}
                    className="absolute inset-0 h-full w-full"
                    src={createYoutubeEmbedUrl(workshop.youtubeVideoId, {
                        isAutoplayed: true,
                        isMuted: true,
                        isInlinePlayback: true,
                        isRelatedVideoEnabled: false,
                        isControlsVisible: false,
                        isCaptionsEnabled: false,
                        isJavaScriptApiEnabled: true,
                    })}
                    title={workshop.title}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    onError={() => setIsVideoEmbedUnavailable(true)}
                />
            ) : (
                <WorkshopPrimarySourceUnavailable
                    primaryStageContent="video"
                    isConfigured={isVideoConfigured}
                    fallbackUrl={isHostedVideo || workshop.youtubeVideoId === null ? undefined : `https://www.youtube.com/watch?v=${encodeURIComponent(workshop.youtubeVideoId)}`}
                />
            )}
        </div>
    ) : primaryStageContent === 'presentation' ? (
        workshop.presentationUrl === null ? (
            <WorkshopPrimarySourceUnavailable primaryStageContent="presentation" />
        ) : (
            <WorkshopPresentationStage presentationUrl={workshop.presentationUrl} />
        )
    ) : repositoryPanel ?? <WorkshopPrimarySourceUnavailable primaryStageContent="repository" />;
    const wrapUpPrimarySourceContent = primaryStageContent === 'presentation'
        ? workshop.presentationUrl === null ? null : <WorkshopPresentationStage presentationUrl={workshop.presentationUrl} />
        : primaryStageContent === 'repository' ? repositoryPanel : null;
    const onOpenPrimarySource = isVideoPrimary
        ? isVideoRewatchOffered ? () => setIsVideoRewatchShown(true) : undefined
        : isPrimarySourceAvailable ? () => setIsPrimarySourceOpen(true) : undefined;
    const handleVideoUnmute = () => {
        unmuteYoutubeVideo(videoFrameReference.current);
        setIsVideoUnmuted(true);
        trackGoogleAnalyticsEvent('workshop_video_unmuted', { workshop_slug: workshop.slug });
    };
    const handleVideoFullscreen = () => requestVideoFullscreen(videoFrameReference.current);

    return (
        <section className="relative overflow-hidden rounded-2xl border border-room-border/10 bg-room-surface shadow-2xl">
            {isWorkshopPast ? (
                <>
                    <div hidden={isVideoRewatchVisible || isPrimarySourceVisible}>
                        <WorkshopWrapUp
                            workshopSlug={workshop.slug}
                            feedback={feedback}
                            followUpContentBlock={followUpContentBlock}
                            paidMembersOnlyVideo={paidMembersOnlyVideo}
                            primaryStageContent={primaryStageContent}
                            isPrimarySourceAvailable={isPrimarySourceAvailable}
                            onSaveFeedback={onSaveFeedback}
                            onOpenPrimarySource={onOpenPrimarySource}
                            navigation={wrapUpNavigation}
                        />
                    </div>
                    {isVideoRewatchVisible && (
                        <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-room-border/10 px-5 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-room-heading">
                            <Play className="h-4 w-4 text-room-warning" aria-hidden="true" /> Video z workshopu
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsVideoRewatchShown(false)}
                            className="inline-flex items-center gap-2 rounded-full border border-room-border/20 bg-room-inset/60 px-3 py-1.5 text-xs font-semibold text-room-text transition hover:border-room-accent/70 hover:bg-room-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Zpět na závěrečné shrnutí
                        </button>
                    </div>
                    <div className="relative aspect-video">
                        {hostedRevisionId ? (
                            <WorkshopHostedRecordingPlayer workshopSlug={workshop.slug} revisionId={hostedRevisionId}
                                isLive={false} serverTime={serverTime} />
                        ) : isVideoEmbedUnavailable ? (
                            <WorkshopPrimarySourceUnavailable
                                primaryStageContent="video"
                                isConfigured
                                fallbackUrl={workshop.youtubeVideoId === null ? undefined : `https://www.youtube.com/watch?v=${encodeURIComponent(workshop.youtubeVideoId)}&t=${workshop.recordingStartOffsetSeconds}s`}
                            />
                        ) : workshop.youtubeVideoId !== null ? (
                            <iframe
                                className="absolute inset-0 h-full w-full"
                                src={createYoutubeEmbedUrl(workshop.youtubeVideoId, {
                                    isAutoplayed: true,
                                    isInlinePlayback: true,
                                    isRelatedVideoEnabled: false,
                                    isControlsVisible: true,
                                    isJavaScriptApiEnabled: false,
                                    startAtSeconds: workshop.recordingStartOffsetSeconds,
                                })}
                                title={workshop.title}
                                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                onError={() => setIsVideoEmbedUnavailable(true)}
                            />
                        ) : null}
                    </div>
                </div>
                    )}
                    {isPrimarySourceVisible && (
                        <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-room-border/10 px-4 py-3 sm:px-6">
                        <span className="text-sm font-bold text-room-heading">
                            {getWorkshopPrimaryStageContentLabel(primaryStageContent)} workshopu
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsPrimarySourceOpen(false)}
                            className="inline-flex items-center gap-2 rounded-full border border-room-border/20 bg-room-inset/60 px-3 py-1.5 text-xs font-semibold text-room-text transition hover:border-room-accent/70 hover:bg-room-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Zpět na závěrečné shrnutí
                        </button>
                    </div>
                    {wrapUpPrimarySourceContent}
                </div>
                    )}
                </>
            ) : isWorkshopOngoing ? (
                ongoingPrimaryStageContent
            ) : (
                <div className="relative min-w-0 w-full max-w-full min-h-[280px] aspect-video sm:min-h-[260px]">
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(122,235,255,.16),transparent_42%)] px-4 py-5 text-center sm:px-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-room-accent/20 bg-room-accent/10 px-3 py-1 text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-room-accent sm:text-xs sm:tracking-[0.18em]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-room-action" /> Začínáme za
                        </span>
                        <div className="mt-5 grid w-full max-w-[19rem] grid-cols-2 gap-2 sm:mt-7 sm:w-auto sm:max-w-none sm:grid-cols-4 sm:gap-4">
                            {countdownSegments.map((segment) => (
                                <div
                                    key={segment.label}
                                    className="min-w-0 rounded-xl border border-room-border/10 bg-room-overlay/5 px-2 py-2.5 text-center sm:min-w-[82px] sm:px-4 sm:py-4"
                                >
                                    <div className="font-mono text-3xl font-bold tabular-nums text-room-heading sm:text-4xl">
                                        {String(segment.value).padStart(2, '0')}
                                    </div>
                                    <div className="mt-1 text-[10px] uppercase tracking-wider text-room-subtle sm:text-xs">
                                        {segment.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 w-full max-w-[25rem] px-2 text-sm leading-6 text-room-muted sm:mt-6">
                            {isVideoPrimary
                                ? 'Stránku nemusíte obnovovat. Stream se spustí automaticky.'
                                : 'Stránku nemusíte obnovovat. Zvolený obsah stage se zobrazí automaticky po začátku workshopu.'}
                        </p>
                    </div>
                </div>
            )}

            <WorkshopReactionStream reactions={flyingReactions} />
            {isWorkshopOngoing && newRepositoryCommit !== null && repository !== null && (
                <WorkshopRepositoryCommitNotification
                    key={newRepositoryCommit.sha}
                    repository={repository}
                    commit={newRepositoryCommit}
                />
            )}
            {isWorkshopOngoing && <WorkshopStageComment stageComment={stageComment} />}

            {isVideoStageActive && !isHostedVideo && workshop.youtubeVideoId && (
                <button
                    type="button"
                    onClick={handleVideoFullscreen}
                    aria-label="Přehrát video na celé obrazovce"
                    className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-room-border/20 bg-room-inset/90 px-3 py-2 text-xs font-semibold text-room-heading shadow-lg transition hover:border-room-accent/70 hover:bg-room-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent sm:right-5 sm:top-5"
                >
                    <Maximize className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Celá obrazovka</span>
                </button>
            )}

            {isVideoStageActive && !isHostedVideo && workshop.youtubeVideoId && !isVideoUnmuted && (
                <motion.div
                    initial={isReducedMotionPreferred ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-room-accent/40 bg-room-inset/95 p-3 shadow-2xl backdrop-blur sm:bottom-5 sm:left-6 sm:right-auto sm:max-w-xs sm:p-4"
                >
                    <div className="flex items-start gap-3">
                        <ArrowDownLeft className="mt-1 h-8 w-8 shrink-0 animate-bounce text-room-accent" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-bold text-room-heading">Zapněte si zvuk</p>
                            <p className="mt-1 text-xs leading-5 text-room-text">
                                Klikněte na tlačítko níže – stream se kvůli automatickému spuštění otevírá ztlumený.
                            </p>
                            <button
                                type="button"
                                onClick={handleVideoUnmute}
                                className="mt-3 inline-flex items-center gap-2 rounded-full bg-room-action px-4 py-2 text-sm font-bold text-room-action-foreground transition hover:bg-room-action-hover"
                            >
                                <Volume2 className="h-4 w-4" /> Zapnout zvuk
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </section>
    );
}
