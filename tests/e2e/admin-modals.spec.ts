import { expect, test, type Page } from '@playwright/test';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import type { Contact } from '@/lib/contacts/Contact';
import type { DiscountCode } from '@/lib/discounts/discountCode';

const CONTACT: Contact = {
    id: 1, createdAt: '2026-09-01T12:00:00Z', fullname: 'Ada Example', email: 'ada@example.com', phone: '',
    userNote: '', ourNote: 'Original note', isContacted: false, isWaitlisted: false, userAgent: '', ipAddress: '',
    referrer: '', appName: 'test', placeName: 'test', url: '',
};

test.use({ serviceWorkers: 'block' });

async function signIn(page: Page, baseURL: string | undefined) {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    await page.context().addCookies([{
        name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!,
        httpOnly: true, sameSite: 'Lax',
    }]);
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 720 }]) {
    test(`edits and creates contacts in keyboard-accessible dialogs at ${viewport.width}px`, async ({ page, baseURL }, testInfo) => {
        await page.setViewportSize(viewport);
        await signIn(page, baseURL);
        const contacts = [{ ...CONTACT }];
        await page.route('**/api/contacts**', async (route) => {
            const request = route.request();
            if (request.method() === 'PATCH') {
                Object.assign(contacts[0], request.postDataJSON());
                return route.fulfill({ json: contacts[0] });
            }
            if (request.method() === 'POST') {
                const contact = { ...CONTACT, ...request.postDataJSON(), id: contacts.length + 1 };
                contacts.push(contact);
                return route.fulfill({ json: contact });
            }
            return route.fulfill({ json: { contacts: contacts.map((contact) => ({
                ...contact, contactGroup: { normalizedEmail: contact.email, contacts: [contact], workshopParticipations: [], workshopFeedbacks: [] },
            })) } });
        });
        await page.goto('/admin/contacts?contacted=ANY', { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
        await expect(page.locator('tbody textarea, tbody input, tbody [role="switch"]')).toHaveCount(0);
        const opener = page.getByRole('button', { name: 'Edit Our Note for Ada Example' });
        await opener.click();
        const dialog = page.getByRole('dialog', { name: 'Edit Contact' });
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Shift+Tab');
        expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        const bounds = await dialog.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.width).toBeLessThanOrEqual(viewport.width);
        expect(bounds!.height).toBeLessThanOrEqual(viewport.height);
        await dialog.getByLabel('Our Note', { exact: true }).fill('Note edited in a modal');
        await dialog.getByLabel('Contacted', { exact: true }).check();
        await expect.poll(() => contacts[0].isContacted).toBe(true);
        await expect.poll(() => contacts[0].ourNote).toBe('Note edited in a modal');
        await page.screenshot({ path: testInfo.outputPath('contact-editor.png') });
        await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
        await expect(dialog).toHaveCount(0);
        await expect(opener).toBeFocused();

        await page.getByRole('button', { name: 'Add Contact', exact: true }).click();
        const creation = page.getByRole('dialog', { name: 'Add New Contact' });
        await creation.getByLabel('Full Name', { exact: true }).fill('New Contact');
        await creation.getByLabel('Email', { exact: true }).fill('new@example.com');
        expect(contacts).toHaveLength(1);
        await creation.getByRole('button', { name: 'Save Contact', exact: true }).click();
        await expect(creation).toHaveCount(0);
        expect(contacts).toHaveLength(2);
    });
}

test('keeps failed discount creation visible in its dialog and autosaves later edits there', async ({ page, baseURL }) => {
    await signIn(page, baseURL);
    let isCreationAllowed = false;
    const discountCodes: DiscountCode[] = [];
    await page.route('**/api/admin/discount-codes**', async (route) => {
        const request = route.request();
        if (request.method() === 'POST') {
            if (!isCreationAllowed) return route.fulfill({ status: 503, json: { error: 'Please retry creation' } });
            discountCodes.push({ ...request.postDataJSON(), id: 'discount-test', useCount: 0,
                createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z' });
            return route.fulfill({ json: { discountCode: discountCodes[0] } });
        }
        if (request.method() === 'PATCH') {
            Object.assign(discountCodes[0], request.postDataJSON());
            return route.fulfill({ json: { discountCode: discountCodes[0] } });
        }
        return route.fulfill({ json: { discountCodes } });
    });
    await page.goto('/admin/discount-codes', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Zatím nemáte žádný slevový kód.')).toBeVisible();
    await expect(page.getByLabel('Slevový kód', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Nový slevový kód', exact: true }).click();
    const creation = page.getByRole('dialog', { name: 'Nový slevový kód', exact: true });
    await creation.getByLabel('Slevový kód', { exact: true }).fill('MODAL_TEST');
    await creation.getByRole('button', { name: 'Vytvořit slevový kód', exact: true }).click();
    await expect(creation.getByRole('alert')).toContainText('Please retry creation');
    await expect(creation.getByLabel('Slevový kód', { exact: true })).toHaveValue('MODAL_TEST');
    isCreationAllowed = true;
    await creation.getByRole('button', { name: 'Vytvořit slevový kód', exact: true }).click();
    await expect(creation).toHaveCount(0);
    const opener = page.getByRole('button', { name: 'Upravit', exact: true });
    await opener.click();
    const editor = page.getByRole('dialog', { name: 'Upravit slevový kód: MODAL_TEST' });
    await editor.getByLabel('Slevový kód', { exact: true }).fill('MODAL_EDITED');
    await page.keyboard.press('Escape');
    await expect(editor).toHaveCount(0);
    expect(discountCodes[0].code).toBe('MODAL_EDITED');
    await expect(opener).toBeFocused();
});
