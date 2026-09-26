'use client';

import { AdminSaveQueue } from './AdminSaveQueue';

type AdminSaveRegistration = {
    consumerCount: number;
    readonly unsubscribe: () => void;
    readonly scope: AdminDraftProtectionScope | null;
    readonly isExplicitOperation: boolean;
};

type AdminDraftRegistration = {
    isDirty: boolean;
    readonly scope: AdminDraftProtectionScope | null;
};

export type AdminDraftProtectionScope = {
    readonly parent: AdminDraftProtectionScope | null;
};

const SAVE_QUEUES = new Map<AdminSaveQueue, AdminSaveRegistration>();
const DRAFT_PROTECTIONS = new Map<object, AdminDraftRegistration>();
const LISTENERS = new Set<() => void>();
let revision = 0;
let isBrowserProtectionInstalled = false;

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
export function getPendingAdminSaves(scope?: AdminDraftProtectionScope | null) {
    return Array.from(SAVE_QUEUES.entries())
        .filter(([queue, registration]) =>
            (queue.getSnapshot().isDirty || queue.getSnapshot().isSaving) &&
            (scope === undefined || registration.isExplicitOperation ||
                (scope === null ? registration.scope === null : isDraftWithinScope(registration.scope, scope))),
        )
        .map(([queue]) => queue);
}

function isDraftWithinScope(draftScope: AdminDraftProtectionScope | null, requestedScope: AdminDraftProtectionScope): boolean {
    let currentScope = draftScope;
    while (currentScope !== null) {
        if (currentScope === requestedScope) return true;
        currentScope = currentScope.parent;
    }
    return false;
}

export function getPendingAdminDrafts(scope?: AdminDraftProtectionScope | null) {
    return Array.from(DRAFT_PROTECTIONS.values()).filter((draft) =>
        draft.isDirty && (scope === undefined || (scope === null ? draft.scope === null : isDraftWithinScope(draft.scope, scope))),
    );
}

export function hasPendingAdminWork(): boolean {
    return getPendingAdminSaves().length > 0 || getPendingAdminDrafts().length > 0;
}

function installBrowserProtection(): void {
    if (isBrowserProtectionInstalled || typeof window === 'undefined') return;
    window.addEventListener('beforeunload', protectPendingSaves);
    window.addEventListener('online', retryOnConnection);
    isBrowserProtectionInstalled = true;
}

function removeBrowserProtectionWhenSettled(): void {
    if (!isBrowserProtectionInstalled || SAVE_QUEUES.size > 0 || DRAFT_PROTECTIONS.size > 0) return;
    window.removeEventListener('beforeunload', protectPendingSaves);
    window.removeEventListener('online', retryOnConnection);
    isBrowserProtectionInstalled = false;
}

function protectPendingSaves(event: BeforeUnloadEvent): void {
    if (!hasPendingAdminWork()) return;
    event.preventDefault();
    event.returnValue = '';
}

export async function flushAdminSaves(scope?: AdminDraftProtectionScope | null): Promise<boolean> {
    while (getPendingAdminSaves(scope).length > 0) {
        const results = await Promise.all(getPendingAdminSaves(scope).map((queue) => queue.flush()));
        if (results.some((isSaved) => !isSaved)) return false;
    }
    return true;
}

/** A new-record draft is discarded only after an explicit confirmation. */
export function confirmDiscardPendingAdminDrafts(scope?: AdminDraftProtectionScope | null): boolean {
    if (getPendingAdminDrafts(scope).length === 0) return true;
    return window.confirm('Tento nový záznam má neuložené změny. Zahodit rozepsaný koncept a pokračovat?');
}

/** Failed validation or a failed request keeps the editor open; local drafts require explicit discard. */
export async function runAfterAdminSaves(action: () => void): Promise<boolean> {
    if (getPendingAdminSaves().length > 0 && !(await flushAdminSaves())) return false;
    if (!confirmDiscardPendingAdminDrafts()) return false;
    action();
    return true;
}

function retryOnConnection(): void {
    void flushAdminSaves();
}

/** The registry outlives a component while its final write is still pending. */
export function registerAdminSaveQueue(
    queue: AdminSaveQueue,
    scope: AdminDraftProtectionScope | null = null,
    isExplicitOperation = false,
): () => void {
    const removeIfSettled = () => {
        const registration = SAVE_QUEUES.get(queue);
        if (!registration || registration.consumerCount > 0 || queue.getSnapshot().isDirty || queue.getSnapshot().isSaving) return;
        registration.unsubscribe();
        SAVE_QUEUES.delete(queue);
        removeBrowserProtectionWhenSettled();
    };
    let registration = SAVE_QUEUES.get(queue);
    if (registration === undefined) {
        registration = {
            consumerCount: 0,
            scope,
            isExplicitOperation,
            unsubscribe: queue.subscribe(() => {
                removeIfSettled();
                notify();
            }),
        };
        SAVE_QUEUES.set(queue, registration);
        installBrowserProtection();
    }
    registration.consumerCount += 1;
    notify();
    let isDetached = false;
    return () => {
        if (isDetached) return;
        isDetached = true;
        registration.consumerCount -= 1;
        if (registration.consumerCount === 0 && (queue.getSnapshot().isDirty || queue.getSnapshot().isSaving)) void queue.flush();
        removeIfSettled();
        notify();
    };
}

/** Protects a local new-record draft without ever scheduling a database write. */
export function registerAdminDraftProtection(token: object, scope: AdminDraftProtectionScope | null = null): () => void {
    DRAFT_PROTECTIONS.set(token, { isDirty: false, scope });
    installBrowserProtection();
    notify();
    let isRegistered = true;
    return () => {
        if (!isRegistered) return;
        isRegistered = false;
        DRAFT_PROTECTIONS.delete(token);
        removeBrowserProtectionWhenSettled();
        notify();
    };
}

export function updateAdminDraftProtection(token: object, isDirty: boolean): void {
    const registration = DRAFT_PROTECTIONS.get(token);
    if (!registration || registration.isDirty === isDirty) return;
    registration.isDirty = isDirty;
    notify();
}
