import {
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY,
} from '@/businesses/ai-ta-krajta/config';
import { createE2eTestEmail } from '@/lib/e2e/testData';
import { expect, test } from '@playwright/test';
import { submitAndExpectApiSuccess } from './support/submissions';

// Every submission here stands on its own: it opens its own page and submits its own unique test e-mail, and the
// single Playwright worker already runs them one after another. Nothing is therefore declared serial, so one slow
// form cannot hide whether the remaining public forms still accept a submission.

test('submits the shared footer newsletter form', async ({ page }) => {
    await page.goto('/en');

    const newsletterForm = page.locator('footer form');
    await newsletterForm.locator('input[type="email"]').fill(createE2eTestEmail('footer-newsletter'));
    await newsletterForm.getByRole('checkbox').click();

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        newsletterForm.getByRole('button', { name: 'Subscribe' }).click(),
    );

    await expect(newsletterForm.getByText('Successfully subscribed!')).toBeVisible();
});

test('submits the reusable get-started lead dialog', async ({ page }) => {
    await page.goto('/old?modal=get-started&plan=enterprise');

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Contact Sales' })).toBeVisible();
    await dialog.locator('input[type="email"]').fill(createE2eTestEmail('generic-get-started'));

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Request a callback' }).click(),
    );

    await expect(dialog.getByText('Thanks, we will be in touch!')).toBeVisible();
});

test('submits the business lead dialog', async ({ page }) => {
    await page.goto('/ai-supervize?modal=get-started');

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Domluvme první krok k AI Supervizi' })).toBeVisible();
    await dialog.locator('input[type="email"]').fill(createE2eTestEmail('business-lead'));

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Domluvit první krok' }).click(),
    );

    await expect(dialog.getByText('Poptávka odeslána!')).toBeVisible();
});

test('submits the homepage qualification lead flow', async ({ page }) => {
    await page.goto('/cs');
    await page.locator('#hero-cta').click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Výroba / Průmysl' }).click();
    await expect(dialog.getByText('Co vás nejvíc trápí?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Lidé tráví hodiny hledáním dokumentů' }).click();
    await expect(dialog.getByText('Kdy byste chtěli začít?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Příští kvartál' }).click();
    await expect(dialog.getByText('Kam se vám ozveme?')).toBeVisible();

    await dialog.getByPlaceholder('Jan Novák').fill('E2E Qualification');
    await dialog.getByPlaceholder('Název vaší firmy').fill('E2E Example s.r.o.');
    await dialog.getByPlaceholder('jan@firma.cz').fill(createE2eTestEmail('qualification'));
    await dialog.getByPlaceholder('+420 777 123 456').fill('+420 777 000 001');

    const thankYouNavigation = page.waitForURL(/\/dekujeme\?/);
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Rezervovat hovor zdarma' }).click(),
    );
    await thankYouNavigation;
    await expect(page).toHaveURL(/\/dekujeme\?/);
});

test('submits Pavol’s personal contact form', async ({ page }) => {
    await page.goto('/cs/pavol');

    const contactForm = page.locator('#contact form');
    await contactForm.locator('input').nth(0).fill('E2E Pavol');
    await contactForm.locator('input[type="email"]').fill(createE2eTestEmail('pavol-contact'));
    await contactForm.locator('input').nth(2).fill('E2E Example s.r.o.');
    await contactForm.locator('textarea').fill('E2E contact submission.');

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        contactForm.getByRole('button', { name: /Odeslat zprávu/ }).click(),
    );

    await expect(page.getByRole('heading', { name: 'Děkuji, zpráva je odeslaná' })).toBeVisible();
});

test('submits a published online-workshop registration', async ({ page }) => {
    await page.goto('/cs/online-workshop');

    const registrationForm = page.locator('#registrace form').first();
    if ((await registrationForm.count()) === 0) {
        test.skip(true, 'The configured database has no published future online workshop available for registration.');
    }

    await registrationForm.locator('input[name="fullname"]').fill('E2E Online Workshop');
    await registrationForm.locator('input[name="email"]').fill(createE2eTestEmail('online-workshop-registration'));
    await registrationForm.locator('input[name="phone"]').fill('+420 777 000 002');

    const thankYouNavigation = page.waitForURL(/\/cs\/online-workshop\/dekujeme/);
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        registrationForm.getByRole('button', { name: 'Rezervovat místo zdarma' }).click(),
    );
    await thankYouNavigation;
    await expect(page).toHaveURL(/\/cs\/online-workshop\/dekujeme/);
});

test('personalizes and submits the 199 Kč Promptbook paid community membership', async ({ page }) => {
    const fullname = 'E2E Community Member';
    const email = createE2eTestEmail('community-membership');
    await page.goto(
        `/cs/komunita/clenstvi?fullname=${encodeURIComponent(fullname)}&email=${encodeURIComponent(email)}`,
    );

    await expect(page.getByRole('heading', { level: 1 })).toContainText(fullname);
    const registrationSection = page.locator('#registrace');
    const registrationForm = registrationSection.locator('form');
    await expect(registrationForm.getByLabel('Jméno a příjmení')).toHaveValue(fullname);
    await expect(registrationForm.getByLabel('E-mail')).toHaveValue(email);
    await expect(registrationForm.getByText('199 Kč za měsíc')).toBeVisible();
    await expect(registrationForm.getByText('Živé webináře jsou zdarma.')).toBeVisible();
    await expect(registrationForm.getByText('Když budete chtít skončit, napište nám e-mail.')).toBeVisible();
    await registrationForm.getByRole('checkbox', { name: 'Souhlasím s obchodními podmínkami' }).click();

    await submitAndExpectApiSuccess(page, '/api/community/membership/registration', () =>
        registrationForm.getByRole('button', { name: 'Poslat žádost za 199 Kč / měsíc' }).click(),
    );

    await expect(
        registrationSection.getByRole('heading', { name: `${fullname}, ozveme se e-mailem.` }),
    ).toBeVisible();
    await expect(registrationSection.getByText('Platíte po měsících, ne celý rok dopředu.')).toBeVisible();
});

test('submits an available AI Supervize Mini workshop registration', async ({ page }) => {
    await page.goto('/ai-supervize-mini');

    const registrationForm = page
        .getByRole('heading', { name: 'Vyberte termín a formát' })
        .locator('xpath=ancestor::form');
    const availableDate = registrationForm
        .locator('button[type="button"]')
        .filter({ hasText: /[1-9][\d\s]* (?:volné místo|volná místa|volných míst) z/ })
        .first();

    if ((await availableDate.count()) === 0) {
        test.skip(true, 'The configured database has no AI Supervize Mini seats available for a live registration.');
    }

    await availableDate.click();
    await registrationForm.getByLabel('Jméno a příjmení').fill('E2E Workshop');
    await registrationForm.getByLabel('E-mail').fill(createE2eTestEmail('ai-supervize-mini-registration'));
    await registrationForm.getByLabel('Firma / organizace').fill('E2E Example s.r.o.');
    await registrationForm.getByLabel('Fakturační údaje').fill('E2E Example s.r.o., IČO 00000000');

    await submitAndExpectApiSuccess(page, '/api/ai-supervize-mini/registration', () =>
        registrationForm.getByRole('button', { name: 'Rezervovat workshop' }).click(),
    );

    await expect(page.getByRole('heading', { name: 'Přihláška je odeslaná' })).toBeVisible();
});

test('submits the AI Supervize Mini future-term interest form', async ({ page }) => {
    await page.goto('/ai-supervize-mini');
    const interestButton = page.getByRole('button', {
        name: 'Nemůžu se zúčastnit, ale mám zájem o další termíny nebo jiný formát',
    });

    if ((await interestButton.count()) === 0) {
        test.skip(true, 'The configured database has no published AI Supervize Mini term to decline.');
    }

    await interestButton.click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox').first().click();
    await dialog.locator('#interest-fullname').fill('E2E Interest');
    await dialog.locator('#interest-email').fill(createE2eTestEmail('ai-supervize-mini-interest'));
    await dialog.locator('#interest-company').fill('E2E Example s.r.o.');

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        dialog.getByRole('button', { name: 'Odeslat odpověď' }).click(),
    );

    await expect(dialog.getByRole('heading', { name: 'Děkujeme za zájem' })).toBeVisible();
});

test('submits the AI ta Krajta collaboration form', async ({ page }) => {
    await page.goto(AI_TA_KRAJTA_MEDIA_KIT_PATH + '?collaboration=partnerstvi');

    await page.locator('#ai-ta-krajta-jmeno').fill('E2E Krajta');
    await page.locator('#ai-ta-krajta-email').fill(createE2eTestEmail('ai-ta-krajta-collaboration'));
    await page.locator('#ai-ta-krajta-firma').fill('E2E Example s.r.o.');
    await page.locator('#ai-ta-krajta-zprava').fill('E2E zpráva o partnerství.');

    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        page.getByRole('button', { name: 'Poslat zprávu' }).click(),
    );

    await expect(page.getByRole('heading', { name: 'Máme to.' })).toBeVisible();
});

test('plays the newest AI ta Krajta episode from the header', async ({ page }) => {
    await page.goto('/ai-ta-krajta');

    await page.getByRole('button', { name: 'Poslouchat' }).click();

    await expect(page.getByRole('button', { name: 'Zavřít přehrávač' })).toBeVisible();
    await expect(page).toHaveURL(/[?&]episode=/);
});

test('resumes a half-played AI ta Krajta episode where its listener left it', async ({ page }) => {
    await page.goto('/ai-ta-krajta');

    // Note: The feed decides which episode is the newest one, so the test reads it off the page instead of naming a
    //       díl which is the newest only until the next Thursday.
    const listenButtonLabel = await page.getByRole('button', { name: /^Pustit díl / }).textContent();
    const episodeSlug = (listenButtonLabel ?? '').replace('Pustit díl ', '').trim();
    expect(episodeSlug).not.toBe('');

    await page.evaluate(
        ([storageKey, slug]) =>
            window.localStorage.setItem(
                storageKey,
                JSON.stringify({
                    [slug]: {
                        positionInSeconds: 300,
                        durationInSeconds: 1800,
                        isPlayed: false,
                        updatedAt: Date.now(),
                    },
                }),
            ),
        [AI_TA_KRAJTA_PLAYBACK_PROGRESS_STORAGE_KEY, episodeSlug],
    );
    await page.reload();

    await expect(page.locator('section#dily').getByText('Zbývá 25:00')).toBeVisible();

    await page.getByRole('button', { name: `Pustit díl ${episodeSlug}` }).click();

    // Note: The five seconds are the rewind which leads a listener back into the sentence they were interrupted in.
    await expect(page.getByLabel('Pozice v dílu')).toHaveValue('295');
});

test('starts the AI ta Krajta minigame from its snake and keeps it local to the page', async ({ page }) => {
    await page.goto('/ai-ta-krajta');

    await expect(page.getByRole('button', { name: 'Probudit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Uspat' })).toHaveCount(0);

    const snakeStartButton = page.getByRole('button', { name: 'Spustit minihru s krajtou' });
    await snakeStartButton.click();

    await expect(page.getByRole('img', { name: 'Krajta, veďte ji myší nebo prstem' })).toBeVisible();
    await expect(page.getByText(/^Skóre: \d+$/)).toBeVisible();
    await expect(page).toHaveURL(/\/ai-ta-krajta$/);
});

test('filters the AI ta Krajta archive by a person and keeps its destination in the hash', async ({ page }) => {
    await page.goto('/ai-ta-krajta');

    await page.locator('section#lidi').getByRole('button', { name: /^Pavol Hejný/ }).click();

    await expect(page).toHaveURL(/[?&]person=pavol-hejny/);
    await expect(page).toHaveURL(/#dily$/);
    await expect(
        page.locator('section#dily').getByRole('button', { name: 'Pavol Hejný', exact: true }),
    ).toBeVisible();
});

test('connects a public online-workshop participant', async ({ page }) => {
    await page.goto('/cs/online-workshop/participant');

    const fullname = page.locator('#participant-fullname');
    if ((await fullname.count()) === 0) {
        test.skip(
            true,
            'The configured database has no published workshop room available for participant registration.',
        );
    }

    const connectionForm = fullname.locator('xpath=ancestor::form');
    await fullname.fill('E2E Participant');
    await page.locator('#participant-email').fill(createE2eTestEmail('workshop-participant'));

    await submitAndExpectApiSuccess(page, /\/api\/workshops\/[^/]+\/connect$/, () =>
        connectionForm.getByRole('button', { name: /Připojit/ }).click(),
    );
});
