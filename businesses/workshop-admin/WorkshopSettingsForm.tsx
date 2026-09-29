'use client';

import {
    createWorkshopEventWriteValues,
    type WorkshopWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopEndControls, type WorkshopEndSaveAction } from '@/businesses/workshop-admin/WorkshopEndControls';
import { WorkshopEventFields } from '@/businesses/workshop-admin/WorkshopEventFields';
import { WorkshopPanelSettings } from '@/businesses/workshop-admin/WorkshopPanelSettings';
import { WorkshopRepositoryFields } from '@/businesses/workshop-admin/WorkshopRepositoryFields';
import { WorkshopHostedRecordingManager } from '@/businesses/workshop-admin/WorkshopHostedRecordingManager';
import {
    createWorkshopRepositoryDraft,
    createWorkshopRepositoryWriteValues,
} from '@/businesses/workshop-admin/workshopRepositoryDraft';
import { WorkshopReactionAnimationPreview } from '@/businesses/workshop-admin/WorkshopReactionAnimationPreview';
import { DurationPicker } from '@/components/admin/DurationPicker';
import { AdminAutosaveStatus } from '@/components/admin/AdminAutosaveStatus';
import { useAdminAutosave } from '@/hooks/useAdminAutosave';
import { AdminSaveValidationError } from '@/lib/admin/AdminSaveQueue';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import { MAXIMAL_WORKSHOP_RECORDING_START_OFFSET_SECONDS } from '@/lib/workshops/workshopConstants';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopPanelOfferedByKind } from '@/lib/workshops/workshopPanels';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
import {
    normalizeWorkshopPrimaryStageContent,
    WORKSHOP_PRIMARY_STAGE_CONTENT_OPTIONS,
    type WorkshopPrimaryStageContent,
} from '@/lib/workshops/workshopPrimaryStageContent';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { useEffect, useState } from 'react';

/**
 * An explicit end action retains its exact timestamp through the shared settings save.
 */
type WorkshopSelectedEnd = { readonly action: WorkshopEndSaveAction; readonly value: string | null };

/**
 * Names the hour, minute and second parts the recording offset is written in, and what all three of them are called
 * together
 */
const RECORDING_START_OFFSET_FIELD_ID = 'workshop-recording-start-offset';
const RECORDING_START_OFFSET_LABEL_ID = 'workshop-recording-start-offset-label';

type WorkshopSettingsFormProps = {
    readonly workshop: WorkshopDetails;
    readonly onSave: (values: WorkshopWriteValues) => Promise<boolean>;
    readonly subjectLabel?: string;
    readonly isArtificialOptionsShown: boolean;
};

/**
 * The reactions an admin wrote into one line
 *
 * Note: The preview and the save read the very same line the very same way, so what an admin previews is exactly what
 *       the room offers afterwards.
 */
function parseWorkshopReactions(reactionText: string): readonly string[] {
    return reactionText.trim().split(/\s+/).filter(Boolean);
}

function createWorkshopSettingsDraft(workshop: WorkshopDetails) {
    return {
        slug: workshop.slug, title: workshop.title, description: workshop.description,
        startsAt: toDateTimeLocalValue(workshop.startsAt), endsAt: toDateTimeLocalValue(workshop.endsAt),
        selectedEnd: null as WorkshopSelectedEnd | null,
        eventDetails: workshop.event ?? DEFAULT_EVENT_DETAILS,
        primaryStageContent: normalizeWorkshopPrimaryStageContent(workshop.primaryStageContent),
        youtubeVideoId: workshop.youtubeVideoId ?? '', videoSource: workshop.videoSource ?? 'youtube',
        recordingStartOffsetSeconds: workshop.recordingStartOffsetSeconds,
        previewYoutubeVideoId: workshop.previewYoutubeVideoId ?? '', presentationUrl: workshop.presentationUrl ?? '',
        repositoryDraft: createWorkshopRepositoryDraft(workshop.repository), reactionText: workshop.allowedReactions.join(' '),
        disabledPanels: workshop.disabledPanels, artificialWatchingParticipantCount: workshop.artificialWatchingParticipantCount ?? 0,
        isPublished: workshop.isPublished,
    };
}

export function WorkshopSettingsForm({
    workshop,
    onSave,
    subjectLabel = 'workshopu',
    isArtificialOptionsShown,
}: WorkshopSettingsFormProps) {
    const roomCapabilities = getWorkshopKindCapabilities(workshop.kind);
    // Note: The only room of its kind was given its address once and for all, so its administration does not ask for
    //       one at all rather than showing a field which cannot be used for anything.
    const isSlugOffered = !roomCapabilities.isSlugFixed;
    const isReactionSettingOffered = isWorkshopPanelOfferedByKind(workshop.kind, 'reactions');
    const isWatchingCountSettingOffered = isWorkshopPanelOfferedByKind(workshop.kind, 'watching-count');
    const [draft, setDraft] = useState(() => createWorkshopSettingsDraft(workshop));
    const { slug, title, description, startsAt, endsAt, selectedEnd, eventDetails, primaryStageContent, youtubeVideoId, videoSource,
        recordingStartOffsetSeconds, previewYoutubeVideoId, presentationUrl, repositoryDraft, reactionText,
        disabledPanels, artificialWatchingParticipantCount, isPublished } = draft;
    const changeDraft = (changes: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...changes }));
    const startsAtIso = fromDateTimeLocalValue(startsAt);
    const endsAtIso = selectedEnd === null ? fromDateTimeLocalValue(endsAt) : selectedEnd.value;
    const isWorkshopEndOpen = endsAtIso === null;

    // Note: Ending a workshop right now is only valid after it has started. The other end choices remain useful for
    //       an upcoming workshop because they choose an end safely after its start.
    const isWorkshopEndableNow =
        roomCapabilities.isScheduled &&
        startsAtIso !== null &&
        isWorkshopEndOpen &&
        getWorkshopPhase({ startsAt: startsAtIso, endsAt: endsAtIso }) === 'ongoing';

    /**
     * Saves everything the form holds, with the end it is told to write
     *
     * Note: Ending a workshop is nothing but this very save with the current moment as its end, so both ways of
     *       writing an end reach the room through the same request.
     */
    const saveWorkshop = async () => {
        const startsAtIso = fromDateTimeLocalValue(startsAt);
        if (!title.trim()) throw new AdminSaveValidationError('Název místnosti nesmí být prázdný.');
        if (isSlugOffered && !slug.trim()) throw new AdminSaveValidationError('Adresa místnosti nesmí být prázdná.');
        if (roomCapabilities.isScheduled && !startsAtIso) throw new AdminSaveValidationError('Vyberte platný začátek workshopu.');

        return onSave({
            title,
            description,
            isPublished,
            disabledPanels,
            ...(isWatchingCountSettingOffered ? { artificialWatchingParticipantCount } : {}),
            ...(isSlugOffered ? { slug } : {}),
            ...(roomCapabilities.isScheduled && startsAtIso ? { startsAt: startsAtIso, endsAt: endsAtIso } : {}),
            ...(roomCapabilities.isEvent ? createWorkshopEventWriteValues(eventDetails) : {}),
            ...(roomCapabilities.isStageOffered
                ? {
                      primaryStageContent,
                      videoSource,
                      youtubeVideoId: youtubeVideoId.trim() || null,
                      recordingStartOffsetSeconds,
                      previewYoutubeVideoId: previewYoutubeVideoId.trim() || null,
                  }
                : {}),
            ...(roomCapabilities.isPresentationOffered ? { presentationUrl: presentationUrl.trim() || null } : {}),
            ...(roomCapabilities.isRepositoryOffered
                ? { repository: createWorkshopRepositoryWriteValues(repositoryDraft) }
                : {}),
            ...(isReactionSettingOffered ? { allowedReactions: parseWorkshopReactions(reactionText) } : {}),
        });
    };

    // The keyed editor owns its draft. Polling and responses to older saves cannot replace newer typing.
    const autosave = useAdminAutosave({
        value: draft,
        onSave: saveWorkshop,
    });
    const { acceptSavedValue } = autosave;
    useEffect(() => {
        const refreshedDraft = createWorkshopSettingsDraft(workshop);
        if (acceptSavedValue(refreshedDraft)) setDraft(refreshedDraft);
    }, [workshop, acceptSavedValue]);
    const isSaving = autosave.isSaving;
    const runningSave = isSaving ? selectedEnd?.action ?? 'settings' : null;

    return (
        <form ref={autosave.formRef} onSubmit={(event) => event.preventDefault()} aria-label={`Nastavení ${subjectLabel}`} className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="mt-1 text-xs text-slate-400">
                        {isSlugOffered
                            ? 'URL místnosti a odkazů můžete upravit níže.'
                            : 'Adresa místnosti je stálá, ostatní nastavení můžete upravit níže.'}
                    </p>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(event) => changeDraft({ isPublished: event.target.checked })}
                        className="h-4 w-4 rounded"
                    />{' '}
                    Publikovaný
                </label>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
                {isSlugOffered && (
                    <label className="text-sm font-medium text-slate-700 md:col-span-2">
                        URL slug
                        <Input
                            value={slug}
                            onChange={(event) => changeDraft({ slug: event.target.value })}
                            className="mt-2 font-mono"
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            required
                        />
                        <span className="mt-1 block text-xs font-normal text-slate-400">
                            Používá se jako <code>?workshop={slug || 'slug-workshopu'}</code> v odkazu do místnosti.
                        </span>
                    </label>
                )}
                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                    Název
                    <Input value={title} onChange={(event) => changeDraft({ title: event.target.value })} className="mt-2" required />
                </label>
                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                    Popis
                    <Textarea
                        value={description}
                        onChange={(event) => changeDraft({ description: event.target.value })}
                        className="mt-2"
                    />
                </label>
                {roomCapabilities.isScheduled && (
                    <>
                        <label className="text-sm font-medium text-slate-700">
                            Začátek
                            <Input
                                type="datetime-local"
                                value={startsAt}
                                onChange={(event) => changeDraft({ startsAt: event.target.value })}
                                className="mt-2"
                                required
                            />
                        </label>
                        <div className="text-sm font-medium text-slate-700">
                            <label>
                                Konec
                                <Input
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(event) => { changeDraft({ selectedEnd: null, endsAt: event.target.value }); }}
                                    className="mt-2"
                                />
                            </label>
                            <WorkshopEndControls
                                startsAt={startsAtIso}
                                isEndOpen={isWorkshopEndOpen}
                                isWorkshopEndableNow={isWorkshopEndableNow}
                                isSaving={isSaving}
                                runningSaveAction={runningSave === 'settings' ? null : runningSave}
                                onSaveEnd={(action, value) => {
                                    changeDraft({ endsAt: toDateTimeLocalValue(value), selectedEnd: { action, value } });
                                }}
                            />
                        </div>
                    </>
                )}
                {isArtificialOptionsShown && isWatchingCountSettingOffered && (
                    <label className="text-sm font-medium text-slate-700">
                        Umělý počet sledujících
                        <Input
                            type="number"
                            min={0}
                            max={1_000_000}
                            step={1}
                            value={artificialWatchingParticipantCount}
                            onChange={(event) =>
                                changeDraft({ artificialWatchingParticipantCount: Math.max(0, Number(event.target.value) || 0) })
                            }
                            className="mt-2"
                        />
                        <span className="mt-1 block text-xs font-normal text-slate-400">
                            Přičte se k živému počtu v místnosti. Nezapisuje žádné skutečné účastníky ani analytickou
                            návštěvnost.
                        </span>
                    </label>
                )}
                {roomCapabilities.isEvent && <WorkshopEventFields event={eventDetails} onChange={(eventDetails) => changeDraft({ eventDetails })} />}
                {roomCapabilities.isStageOffered && (
                    <>
                        <label className="text-sm font-medium text-slate-700">
                            Zdroj videa
                            <select aria-label="Zdroj videa" value={videoSource}
                                onChange={(event) => changeDraft({ videoSource: event.target.value as 'youtube' | 'hosted' })}
                                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                                <option value="youtube">YouTube</option>
                                <option value="hosted" disabled={!workshop.hostedRecordingRevisionId && videoSource !== 'hosted'}>
                                    Hostovaný synchronizovaný záznam
                                </option>
                            </select>
                            <span className="mt-1 block text-xs font-normal text-slate-500">Nastavení neaktivního zdroje zůstane uložené.</span>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Hlavní obsah stage
                            <select
                                aria-label="Hlavní obsah stage"
                                value={primaryStageContent}
                                onChange={(event) => changeDraft({ primaryStageContent: event.target.value as WorkshopPrimaryStageContent })}
                                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                            >
                                {WORKSHOP_PRIMARY_STAGE_CONTENT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <span className="mt-1 block text-xs font-normal text-slate-400">
                                Výběr nemění nastavené zdroje. Materiály a ostatní zdroje zůstávají doplňkové.
                            </span>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            YouTube URL nebo video ID
                            <Input
                                value={youtubeVideoId}
                                onChange={(event) => changeDraft({ youtubeVideoId: event.target.value })}
                                className="mt-2 font-mono"
                                placeholder="https://youtube.com/live/…"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            YouTube URL nebo video ID ukázky
                            <Input
                                value={previewYoutubeVideoId}
                                onChange={(event) => changeDraft({ previewYoutubeVideoId: event.target.value })}
                                className="mt-2 font-mono"
                                placeholder="https://youtube.com/watch?v=…"
                            />
                            <span className="mt-1 block text-xs font-normal text-slate-400">
                                Po skončení workshopu ji uvidí místo záznamu členové bez placeného členství. Když ji
                                nevyplníte, uvidí jen nabídku členství, které záznam odemyká.
                            </span>
                        </label>
                        <div className="text-sm font-medium text-slate-700">
                            <span id={RECORDING_START_OFFSET_LABEL_ID}>Začít záznam od</span>
                            <DurationPicker
                                id={RECORDING_START_OFFSET_FIELD_ID}
                                labelledById={RECORDING_START_OFFSET_LABEL_ID}
                                durationInSeconds={recordingStartOffsetSeconds}
                                onChange={(recordingStartOffsetSeconds) => changeDraft({ recordingStartOffsetSeconds })}
                                maximalDurationInSeconds={MAXIMAL_WORKSHOP_RECORDING_START_OFFSET_SECONDS}
                                className="mt-2"
                            />
                            <span className="mt-1 block text-xs font-normal text-slate-400">
                                Použije se jen pro YouTube po skončení workshopu, když placený člen otevře záznam. Živý stream ani
                                odpočet se tím nemění. Uloží se jako{' '}
                                {formatCzechCountedNoun(recordingStartOffsetSeconds, ['sekunda', 'sekundy', 'sekund'])}.
                            </span>
                        </div>
                        <WorkshopHostedRecordingManager workshop={workshop}
                            onPublished={() => changeDraft({ videoSource: 'hosted' })}
                            onRemoved={() => changeDraft({ videoSource: 'youtube' })} />
                    </>
                )}
                {roomCapabilities.isPresentationOffered && (
                    <label
                        htmlFor="workshop-presentation-url"
                        className="text-sm font-medium text-slate-700 md:col-span-2"
                    >
                        URL prezentace
                        <Input
                            id="workshop-presentation-url"
                            type="url"
                            value={presentationUrl}
                            onChange={(event) => changeDraft({ presentationUrl: event.target.value })}
                            className="mt-2"
                            placeholder="https://…/prezentace.pdf"
                        />
                        <span className="mt-1 block text-xs font-normal text-slate-400">
                            Nepovinné. Může vést na PDF, PowerPoint nebo veřejný Markdown na GitHubu. Všichni účastníci
                            ji najdou mezi materiály bez čekání a bez placeného členství.
                        </span>
                    </label>
                )}
                {roomCapabilities.isRepositoryOffered && (
                    <WorkshopRepositoryFields key={workshop.id} repository={repositoryDraft} onChange={(change) => setDraft((current) => ({ ...current,
                        repositoryDraft: typeof change === 'function' ? change(current.repositoryDraft) : change }))}
                        startsAt={startsAtIso} endsAt={endsAtIso} />
                )}
                {isReactionSettingOffered && (
                    <>
                        <label className="text-sm font-medium text-slate-700">
                            Reakce oddělené mezerou
                            <Input
                                value={reactionText}
                                onChange={(event) => changeDraft({ reactionText: event.target.value })}
                                className="mt-2"
                            />
                        </label>
                        <div className="md:col-span-2">
                            <WorkshopReactionAnimationPreview reactions={parseWorkshopReactions(reactionText)} />
                        </div>
                    </>
                )}
                <div className="md:col-span-2">
                    <WorkshopPanelSettings
                        workshopKind={workshop.kind}
                        disabledPanels={disabledPanels}
                        onChange={(disabledPanels) => changeDraft({ disabledPanels })}
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <AdminAutosaveStatus {...autosave} />
            </div>
        </form>
    );
}
