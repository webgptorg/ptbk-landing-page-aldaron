'use client';

import { WorkshopWrapUp } from '@/businesses/online-workshop/participant/WorkshopWrapUp';
import { WorkshopStageComment } from '@/businesses/online-workshop/participant/WorkshopStageComment';
import { WorkshopRepositoryCommitNotification } from '@/businesses/online-workshop/participant/WorkshopRepositoryCommitNotification';
import { useWorkshopRepositoryCommitNotification } from '@/businesses/online-workshop/participant/useWorkshopRepositoryCommitNotification';
import type { SubscribeToWorkshopReactions } from '@/businesses/online-workshop/participant/useWorkshopReactionAnimations';
import type { WorkshopFeedbackValues } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import { useWorkshopReactionStream } from '@/components/workshops/useWorkshopReactionStream';
import { WorkshopReactionStream } from '@/components/workshops/WorkshopReactionStream';
import { trackGoogleAnalyticsEvent } from '@/lib/tracking/track-google-analytics-event';
import { createYoutubeEmbedUrl } from '@/lib/youtube/youtubeEmbed';
import { keepYoutubeVideoSubtitlesHidden, unmuteYoutubeVideo } from '@/lib/youtube/youtubePlayerCommands';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
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
import { useEffect, useMemo, useRef, useState } from 'react';

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

const refuseStandaloneFeedbackSave = async (): Promise<boolean> => false;

export function WorkshopStage({
    workshop,
    serverTime,
    subscribeToReactions,
    repository = null,
    subscribeToRepositoryCommits,
    feedback = null,
    followUpContentBlock = null,
    stageComment = null,
    paidMembersOnlyVideo = null,
    onSaveFeedback = refuseStandaloneFeedbackSave,
}: WorkshopStageProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;
    const serverClockOffset = useMemo(() => Date.parse(serverTime) - Date.now(), [serverTime]);
    const [currentTime, setCurrentTime] = useState(() => Date.now() + serverClockOffset);
    const [isVideoUnmuted, setIsVideoUnmuted] = useState(false);
    const videoFrameReference = useRef<HTMLIFrameElement>(null);
    const { flyingReactions, launchReaction } = useWorkshopReactionStream();

    const phase = getWorkshopPhase(workshop, currentTime);
    const isWorkshopOngoing = phase === 'ongoing';
    const isWorkshopPast = phase === 'past';
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
    const isVideoRewatchOffered = isWorkshopPast && workshop.youtubeVideoId !== null;
    const [isVideoRewatchShown, setIsVideoRewatchShown] = useState(false);
    useEffect(() => {
        if (!isVideoRewatchOffered) {
            setIsVideoRewatchShown(false);
        }
    }, [isVideoRewatchOffered]);

    useEffect(() => subscribeToReactions(launchReaction), [launchReaction, subscribeToReactions]);

    useEffect(() => {
        setCurrentTime(Date.now() + serverClockOffset);
        const intervalId = window.setInterval(
            () => setCurrentTime(Date.now() + serverClockOffset),
            CLOCK_TICK_MILLISECONDS,
        );
        return () => window.clearInterval(intervalId);
    }, [serverClockOffset]);

    useEffect(() => setIsVideoUnmuted(false), [workshop.youtubeVideoId]);

    useEffect(() => {
        if (workshop.youtubeVideoId === null || !isWorkshopOngoing) {
            return;
        }

        return keepYoutubeVideoSubtitlesHidden(videoFrameReference.current);
    }, [workshop.youtubeVideoId, isWorkshopOngoing]);

    const countdownSegments = getRemainingSegments(remainingMilliseconds);
    const handleVideoUnmute = () => {
        unmuteYoutubeVideo(videoFrameReference.current);
        setIsVideoUnmuted(true);
        trackGoogleAnalyticsEvent('workshop_video_unmuted', { workshop_slug: workshop.slug });
    };
    const handleVideoFullscreen = () => requestVideoFullscreen(videoFrameReference.current);

    return (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-2xl">
            {isWorkshopPast && isVideoRewatchShown && workshop.youtubeVideoId !== null ? (
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                            <Play className="h-4 w-4 text-amber-300" aria-hidden="true" /> Video z workshopu
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsVideoRewatchShown(false)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-200/70 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Zpět na závěrečné shrnutí
                        </button>
                    </div>
                    <div className="relative aspect-video">
                        <iframe
                            className="absolute inset-0 h-full w-full"
                            src={createYoutubeEmbedUrl(workshop.youtubeVideoId, {
                                isAutoplayed: true,
                                isInlinePlayback: true,
                                isRelatedVideoEnabled: false,
                                isControlsVisible: true,
                                isJavaScriptApiEnabled: false,
                            })}
                            title={workshop.title}
                            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>
            ) : isWorkshopPast ? (
                <WorkshopWrapUp
                    feedback={feedback}
                    followUpContentBlock={followUpContentBlock}
                    paidMembersOnlyVideo={paidMembersOnlyVideo}
                    onSaveFeedback={onSaveFeedback}
                    onRewatchVideo={isVideoRewatchOffered ? () => setIsVideoRewatchShown(true) : undefined}
                />
            ) : (
                <div
                    className={`relative min-w-0 w-full max-w-full aspect-video ${isWorkshopOngoing ? 'min-h-[220px] sm:min-h-[260px]' : 'min-h-[280px] sm:min-h-[260px]'}`}
                >
                    {isWorkshopOngoing && workshop.youtubeVideoId ? (
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
                        />
                    ) : isWorkshopOngoing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(48,168,189,.24),transparent_52%)] px-8 text-center">
                            <Radio className="h-11 w-11 animate-pulse text-cyan-300" />
                            <h2 className="mt-5 text-2xl font-bold text-white">Stream právě připravujeme</h2>
                            <p className="mt-2 max-w-md text-sm text-slate-400">
                                Video se zde objeví automaticky, jakmile administrátor vloží YouTube stream.
                            </p>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(122,235,255,.16),transparent_42%)] px-4 py-5 text-center sm:px-5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-cyan-200 sm:text-xs sm:tracking-[0.18em]">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> Začínáme za
                            </span>
                            <div className="mt-5 grid w-full max-w-[19rem] grid-cols-2 gap-2 sm:mt-7 sm:w-auto sm:max-w-none sm:grid-cols-4 sm:gap-4">
                                {countdownSegments.map((segment) => (
                                    <div
                                        key={segment.label}
                                        className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-center sm:min-w-[82px] sm:px-4 sm:py-4"
                                    >
                                        <div className="font-mono text-3xl font-bold tabular-nums text-white sm:text-4xl">
                                            {String(segment.value).padStart(2, '0')}
                                        </div>
                                        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">
                                            {segment.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 w-full max-w-[25rem] px-2 text-sm leading-6 text-slate-400 sm:mt-6">
                                Stránku nemusíte obnovovat. Stream se spustí automaticky.
                            </p>
                        </div>
                    )}
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

            {isWorkshopOngoing && workshop.youtubeVideoId && (
                <button
                    type="button"
                    onClick={handleVideoFullscreen}
                    aria-label="Přehrát video na celé obrazovce"
                    className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:border-cyan-200/70 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:right-5 sm:top-5"
                >
                    <Maximize className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Celá obrazovka</span>
                </button>
            )}

            {isWorkshopOngoing && workshop.youtubeVideoId && !isVideoUnmuted && (
                <motion.div
                    initial={isReducedMotionPreferred ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-cyan-200/40 bg-slate-950/95 p-3 shadow-2xl backdrop-blur sm:bottom-5 sm:left-6 sm:right-auto sm:max-w-xs sm:p-4"
                >
                    <div className="flex items-start gap-3">
                        <ArrowDownLeft className="mt-1 h-8 w-8 shrink-0 animate-bounce text-cyan-300" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-bold text-white">Zapněte si zvuk</p>
                            <p className="mt-1 text-xs leading-5 text-slate-300">
                                Klikněte na tlačítko níže – stream se kvůli automatickému spuštění otevírá ztlumený.
                            </p>
                            <button
                                type="button"
                                onClick={handleVideoUnmute}
                                className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
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
