import { z } from 'zod';

/**
 * The channel studio tabs talk to each other on
 *
 * Note: A `BroadcastChannel` reaches exactly the tabs which share the browser lock and the database of the studio:
 *       the same origin, the same browser profile and the same storage partition. It reaches no other device and no
 *       other application, and neither does anything else the takeover relies on.
 */
const RECORDING_STUDIO_OWNERSHIP_CHANNEL = 'promptbook-recording-studio-ownership';
const PROTOCOL_VERSION = 1;

const INSTANCE_ID = z.string().min(1).max(100);
const REQUEST_ID = z.string().min(1).max(100);
const DETAIL = z.string().max(2_000).nullable();

const OWNER_STATE_SCHEMA = z.object({
    phase: z.enum(['loading', 'idle', 'starting', 'recording', 'pausing', 'paused', 'resuming', 'stopping', 'unavailable']),
    recordedSeconds: z.number().finite().nonnegative(),
    /** An export, a generation of subtitles, an upload or a deletion is running. */
    isFileWorkRunning: z.boolean(),
    isEditUnsaved: z.boolean(),
});

const HANDOVER_STAGE_SCHEMA = z.enum(['accepted', 'stopping-recording', 'saving-edits', 'cancelling-work', 'releasing']);

const HANDOVER_REPORT_SCHEMA = z.object({
    /** The take which the handover stopped, as it was saved. */
    stoppedRecording: z.object({
        id: z.string().max(200), title: z.string().max(500), status: z.enum(['complete', 'interrupted']), errorMessage: DETAIL,
    }).nullable(),
    /** Why edits which were being made in the previous studio are not saved; `null` when all of them are. */
    unsavedEditDetail: DETAIL,
    /** Operations the previous studio could not end, such as one waiting behind a dialog of the browser. */
    unsettledOperationCount: z.number().int().nonnegative(),
});

const ADDRESSED = { protocolVersion: z.literal(PROTOCOL_VERSION), requestId: REQUEST_ID, fromInstanceId: INSTANCE_ID, toInstanceId: INSTANCE_ID };

const MESSAGE_SCHEMA = z.discriminatedUnion('type', [
    /** Asked of whichever tab is the studio; a tab which is not does not answer. */
    z.object({ type: z.literal('state-request'), protocolVersion: z.literal(PROTOCOL_VERSION), requestId: REQUEST_ID, fromInstanceId: INSTANCE_ID }),
    z.object({ type: z.literal('state'), ...ADDRESSED, state: OWNER_STATE_SCHEMA, generation: z.number().int().nonnegative() }),
    z.object({
        type: z.literal('handover-request'), ...ADDRESSED,
        /** The generation the requester saw; a studio of another generation is not the one it means. */
        generation: z.number().int().nonnegative(),
        /** When it was sent or last renewed; a request nobody renews any more has no requester waiting behind it. */
        sentAt: z.number().finite(),
        isUnsavedEditDiscardAllowed: z.boolean(),
    }),
    z.object({ type: z.literal('handover-accepted'), ...ADDRESSED, state: OWNER_STATE_SCHEMA }),
    /** The requester still stands behind the request after hearing the owner; queued cancelled requests cannot stop it. */
    z.object({ type: z.literal('handover-confirm'), ...ADDRESSED, generation: z.number().int().nonnegative() }),
    z.object({ type: z.literal('handover-progress'), ...ADDRESSED, stage: HANDOVER_STAGE_SCHEMA }),
    z.object({ type: z.literal('handover-rejected'), ...ADDRESSED, reason: z.enum(['busy', 'unsaved-edits', 'cleanup-failed', 'cancelled']), detail: DETAIL }),
    z.object({ type: z.literal('handover-released'), ...ADDRESSED, report: HANDOVER_REPORT_SCHEMA }),
    z.object({ type: z.literal('handover-cancel'), ...ADDRESSED }),
    /** A nudge after a forced takeover. The tab it is sent to believes the storage, never this message. */
    z.object({ type: z.literal('revoked'), protocolVersion: z.literal(PROTOCOL_VERSION), fromInstanceId: INSTANCE_ID, toInstanceId: INSTANCE_ID }),
]);

export type RecordingStudioOwnerState = z.infer<typeof OWNER_STATE_SCHEMA>;
export type RecordingStudioHandoverStage = z.infer<typeof HANDOVER_STAGE_SCHEMA>;
export type RecordingStudioHandoverReport = z.infer<typeof HANDOVER_REPORT_SCHEMA>;
export type RecordingStudioOwnershipMessage = z.infer<typeof MESSAGE_SCHEMA>;
export type RecordingStudioHandoverRejection = Extract<RecordingStudioOwnershipMessage, { type: 'handover-rejected' }>['reason'];

/** Every message without what the channel itself knows: which version of the protocol it speaks. */
type MessageWithoutVersion<Message> = Message extends unknown ? Omit<Message, 'protocolVersion'> : never;
export type RecordingStudioOwnershipMessageContent = MessageWithoutVersion<RecordingStudioOwnershipMessage>;

export type RecordingStudioOwnershipChannel = {
    readonly post: (message: RecordingStudioOwnershipMessageContent) => void;
    readonly subscribe: (listener: (message: RecordingStudioOwnershipMessage) => void) => () => void;
    readonly close: () => void;
};

/** Anything else on the channel — another version, another feature, a malformed message — is simply not for a studio. */
export function readRecordingStudioOwnershipMessage(data: unknown): RecordingStudioOwnershipMessage | null {
    const parsed = MESSAGE_SCHEMA.safeParse(data);
    return parsed.success ? parsed.data : null;
}

export function createRecordingStudioOwnershipMessage(content: RecordingStudioOwnershipMessageContent): RecordingStudioOwnershipMessage {
    return { ...content, protocolVersion: PROTOCOL_VERSION } as RecordingStudioOwnershipMessage;
}

/**
 * Opens the channel of this tab
 *
 * Note: A browser without `BroadcastChannel` gets a channel which stays silent. Such a tab never hears a studio and is
 *       never heard as one, so it sees an owner whose state is unknown and can only take over by force. That is the
 *       same answer a studio which does not respond gets, and it is safe for the same reason.
 */
export function openRecordingStudioOwnershipChannel(): RecordingStudioOwnershipChannel {
    if (typeof BroadcastChannel === 'undefined') return { post: () => undefined, subscribe: () => () => undefined, close: () => undefined };
    const channel = new BroadcastChannel(RECORDING_STUDIO_OWNERSHIP_CHANNEL);
    return {
        post: (content) => {
            // A channel closed by a studio which is being unmounted has nobody left to tell.
            try { channel.postMessage(createRecordingStudioOwnershipMessage(content)); } catch { /* Closed. */ }
        },
        subscribe: (listener) => {
            const receive = (event: MessageEvent) => {
                const message = readRecordingStudioOwnershipMessage(event.data);
                if (message) listener(message);
            };
            channel.addEventListener('message', receive);
            return () => channel.removeEventListener('message', receive);
        },
        close: () => channel.close(),
    };
}
