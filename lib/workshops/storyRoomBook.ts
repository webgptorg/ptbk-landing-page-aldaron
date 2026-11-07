import { SITE_URL } from '@/lib/metadata/site-config';
import { createStoryRoomApiPath } from './storyRoomPaths';
import { STORY_ID } from './storyRoomTypes';

export const STORY_CHARACTER_COLORS = [
    '#31527E', '#555D71', '#8E6233', '#456A60', '#8E4A51', '#526B85',
    '#596747', '#90624F', '#344D68', '#526E73', '#6D5579', '#17386C',
] as const;

export const STORY_BOOK_META = /^META[ \t]+(COLOR|IMAGE)(?:[ \t]+(.*))?$/i;

export function getStoryCharacterColor(id: string) {
    return STORY_CHARACTER_COLORS[Number.parseInt(id.slice(0, 8), 16) % STORY_CHARACTER_COLORS.length]!;
}

export function getStoryBookColor(value: string) {
    const colors = value.split(',').map((color) => color.trim());
    return colors.every((color) => /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color)) ? colors[0] : undefined;
}

/** Images are limited to published workshop art so opening a room cannot contact a participant's server. */
export function getStoryBookImage(value: string) {
    if (!value.startsWith('/') && !/^https:\/\//i.test(value)) return undefined;
    try {
        const url = new URL(value, SITE_URL);
        if (url.protocol !== 'https:' || !['ptbk.io', 'www.ptbk.io'].includes(url.host)
            || url.username || url.password || url.hash) return undefined;
        if (/^\/story-portraits\/[a-z0-9-]+\.webp$/.test(url.pathname) && !url.search) return url.pathname;
        const portraitId = url.searchParams.get('portrait');
        if (/^\/api\/workshops\/[a-z0-9-]+\/story$/.test(url.pathname) && url.searchParams.size === 1
            && STORY_ID.safeParse(portraitId).success) return `${url.pathname}?portrait=${portraitId}`;
    } catch {
        return undefined;
    }
}

export function getStoryBookAppearance(book: string) {
    let color: string | undefined;
    let image: string | undefined;
    for (const line of book.split(/\r?\n/).slice(1)) {
        const match = STORY_BOOK_META.exec(line.trim());
        const value = match?.[2]?.trim();
        if (!match || !value) continue;
        if (match[1]!.toUpperCase() === 'COLOR') color = getStoryBookColor(value);
        else image = getStoryBookImage(value);
    }
    return { color, image };
}

export function getStoryBookText(book: string) {
    return book.split(/\r?\n/).filter((line, index) => index === 0 || !STORY_BOOK_META.test(line.trim())).join('\n');
}

export function withStoryBookAppearance(book: string, color: string, portrait?: string) {
    const appearance = getStoryBookAppearance(book);
    return [book, !appearance.color && `META COLOR ${color}`, portrait && !appearance.image && `META IMAGE ${portrait}`]
        .filter(Boolean).join('\n');
}

export function createStoryPortraitUrl(workshopSlug: string, characterId: string) {
    return new URL(`${createStoryRoomApiPath(workshopSlug)}?portrait=${characterId}`, SITE_URL).href;
}

export function getPreparedStoryPortraitUrl(name: string) {
    return new URL(`/story-portraits/${name}.webp`, SITE_URL).href;
}
