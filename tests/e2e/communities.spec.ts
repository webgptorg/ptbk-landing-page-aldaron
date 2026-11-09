import { COMMUNITIES, COMMUNITIES_PATH, LEGACY_COMMUNITY_PATH } from '@/businesses/community/config';
import { expect, test } from '@playwright/test';

test('links both communities from the hub and keeps the old room and calendar addresses working', async ({ page, request }) => {
    await page.goto(COMMUNITIES_PATH);
    await expect(page.getByRole('heading', { name: 'Komunity', level: 1 })).toBeVisible();
    for (const community of Object.values(COMMUNITIES)) {
        await expect(page.getByRole('link', { name: `Vstoupit do komunity ${community.name}` })).toHaveAttribute(
            'href',
            community.path,
        );
    }

    const legacyRoom = await request.get(`${LEGACY_COMMUNITY_PATH}?from=invite`, { maxRedirects: 0 });
    expect(legacyRoom.status()).toBe(308);
    expect(new URL(legacyRoom.headers().location, legacyRoom.url()).pathname).toBe(COMMUNITIES.vyvojari.path);
    expect(new URL(legacyRoom.headers().location, legacyRoom.url()).search).toBe('?from=invite');

    const developerCalendar = await request.get(COMMUNITIES.vyvojari.calendarPath);
    const legacyCalendar = await request.get(`${LEGACY_COMMUNITY_PATH}/calendar.ics`, { maxRedirects: 0 });
    const promptbookCalendar = await request.get(COMMUNITIES.promptbook.calendarPath);
    expect(legacyCalendar.ok()).toBe(true);
    expect(await legacyCalendar.text()).toBe(await developerCalendar.text());
    expect(await promptbookCalendar.text()).toContain('X-WR-CALNAME:Komunita Promptbook');
});
