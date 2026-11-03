const requests = new Map<string, { count: number; until: number }>();
/** The existing per-instance public-chat bound also applies before accepting file bytes. */
export function allowPublicChatRequest(key: string): boolean {
    const now = Date.now();
    for (const [entry, value] of Array.from(requests)) if (value.until < now) requests.delete(entry);
    const previous = requests.get(key);
    if ((previous && previous.count >= 15) || (!previous && requests.size >= 5000)) return false;
    requests.set(key, { count: (previous?.count ?? 0) + 1, until: previous?.until ?? now + 300000 });
    return true;
}
