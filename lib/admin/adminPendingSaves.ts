'use client';

import { AdminSaveQueue } from './AdminSaveQueue';

type AdminSaveRegistration = {
    consumerCount: number;
    readonly unsubscribe: () => void;
};

const SAVE_QUEUES = new Map<AdminSaveQueue, AdminSaveRegistration>();
const LISTENERS = new Set<() => void>();
let revision = 0;

function notify(): void {
    revision += 1;
    LISTENERS.forEach((listener) => listener());
}

export function subscribeToAdminSaves(listener: () => void): () => void {
    LISTENERS.add(listener);
    return () => LISTENERS.delete(listener);
}

export const getAdminSaveRevision = () => revision;
export const getAdminServerSaveRevision = () => 0;
export const getPendingAdminSaves = () => Array.from(SAVE_QUEUES.keys()).filter((queue) => queue.getSnapshot().isDirty || queue.getSnapshot().isSaving);

function protectPendingSaves(event: BeforeUnloadEvent): void {
    if (getPendingAdminSaves().length === 0) return;
    event.preventDefault();
    event.returnValue = '';
}

export async function flushAdminSaves(): Promise<boolean> {
    while (getPendingAdminSaves().length > 0) {
        const results = await Promise.all(getPendingAdminSaves().map((queue) => queue.flush()));
        if (results.some((isSaved) => !isSaved)) return false;
    }
    return true;
}

/** Failed validation or a failed request keeps the editor open. */
export async function runAfterAdminSaves(action: () => void): Promise<void> {
    if (getPendingAdminSaves().length === 0 || await flushAdminSaves()) action();
}

function retryOnConnection(): void {
    void flushAdminSaves();
}

/** The registry outlives a component while its final write is still pending. */
export function registerAdminSaveQueue(queue: AdminSaveQueue): () => void {
    const removeIfSettled = () => {
        const registration = SAVE_QUEUES.get(queue);
        if (!registration || registration.consumerCount > 0 || queue.getSnapshot().isDirty || queue.getSnapshot().isSaving) return;
        registration.unsubscribe();
        SAVE_QUEUES.delete(queue);
        if (SAVE_QUEUES.size === 0) {
            window.removeEventListener('beforeunload', protectPendingSaves);
            window.removeEventListener('online', retryOnConnection);
        }
    };
    let registration = SAVE_QUEUES.get(queue);
    if (registration === undefined) {
        registration = {
            consumerCount: 0,
            unsubscribe: queue.subscribe(() => {
                removeIfSettled();
                notify();
            }),
        };
        SAVE_QUEUES.set(queue, registration);
        window.addEventListener('beforeunload', protectPendingSaves);
        window.addEventListener('online', retryOnConnection);
    }
    registration.consumerCount += 1;
    let isDetached = false;
    notify();
    return () => {
        if (isDetached) return;
        isDetached = true;
        registration.consumerCount -= 1;
        if (registration.consumerCount === 0 && (queue.getSnapshot().isDirty || queue.getSnapshot().isSaving)) void queue.flush();
        removeIfSettled();
        notify();
    };
}
