import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const visit = async (page: Page, path: string) => {
    const response = await page.goto(path, {waitUntil:'load'});
    await page.evaluate(() => document.fonts.ready);
    return response;
};

test.beforeEach(async ({page,baseURL}) => {
    page.setDefaultNavigationTimeout(30_000);
    // Verify the site without depending on third-party tracking services.
    await page.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL!).origin
        ? route.continue() : route.abort());
    // Fail closed for any test which accidentally reaches a real contact endpoint.
    await page.route('**/api/waitlist', route => route.abort());
    await page.addInitScript(() => {
        localStorage.setItem('cookiesAccepted','true');
        localStorage.setItem('cookiePreferences',JSON.stringify({necessary:true,analytics:false,marketing:false}));
    });
});

// Contact/PDF writes are intercepted: this suite never submits test leads to production.
test('localized pages retain public metadata and legacy calculation queries', async ({page,request}) => {
    const legacy = await request.get('/new/kalkulacka?volume=47&mode=partner', {maxRedirects:0});
    expect(legacy.status()).toBe(308);
    const destination = new URL(legacy.headers().location, legacy.url());
    expect(destination.pathname).toBe('/kalkulacka');
    expect(destination.search).toBe('?volume=47&mode=partner');
    for (const [path,language] of [['/cs','cs'],['/en','en']]) {
        const response = await visit(page, path);
        expect(response?.status()).toBe(200);
        await expect(page).toHaveURL(new URL(path, page.url()).toString());
        await expect(page.locator('html')).toHaveAttribute('lang',language);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://ptbk.io/${language}`);
        expect(await page.locator('meta[name="robots"]').getAttribute('content')).not.toContain('noindex');
        await expect(page.getByRole('navigation',{name:'Language / Jazyk'}).getByRole('link',{name:'CZ',exact:true})).toHaveAttribute('href','/cs');
        await expect(page.getByRole('navigation',{name:'Language / Jazyk'}).getByRole('link',{name:/EN$/})).toHaveAttribute('href','/en');
    }
});

test('home and partnership have three navigable stories and one primary hero enquiry',async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    for (const [path,cta] of [['/cs','Chci Promptbook'],['/cs/partnership','Chci nasazovat klientům']]) {
        await visit(page,path);
        const hero = page.getByTestId('brand-hero');
        await expect(hero.getByRole('button')).toHaveCount(1);
        await expect(hero.getByRole('button',{name:cta,exact:true})).toBeVisible();
        await expect(hero.getByRole('link',{name:'nebo si nainstalujte engine u sebe'})).toHaveAttribute('href','/cs/open-source');
        await expect(page.getByRole('tablist',{name:'Vyberte ukázku agendy'})).toHaveCount(0);
        await expect(page.locator('article[data-story]')).toHaveCount(3);
        for (const story of ['podcast','relationships','development']) {
            const article = page.locator(`article[data-story="${story}"]`);
            const steps = article.getByRole('tab');
            await expect(steps).toHaveCount(4);
            await expect(article).toHaveAttribute('data-scroll','false');
            await expect(article).toHaveAttribute('data-step','3');
            await steps.last().focus();
            await page.keyboard.press('Home');
            await expect(steps.first()).toBeFocused();
            await expect(steps.first()).toHaveAttribute('aria-selected','true');
            await page.keyboard.press('ArrowRight');
            await expect(article).toHaveAttribute('data-step','1');
            await page.keyboard.press('End');
            await expect(steps.last()).toBeFocused();
            await expect(article).toHaveAttribute('data-step','3');
            await expect(article.getByRole('tabpanel')).toBeVisible();
        }
        await expect(page.getByRole('heading',{name:'Důvěra vzniká při práci.',exact:true})).toBeVisible();
        await expect(page.getByRole('heading',{name:'Zkušenosti se spoluprací s Pavolem',exact:true})).toBeVisible();
        await expect(page.getByText('Promptbook nás od sebe neodstřihl. Naopak. Konečně máme čas řešit opravdovou práci, za kterou jsme placeni.',{exact:true})).toBeVisible();
        for (const name of ['Tomáš Studeník','Jan Šedo','Max Kozlov','Bob Kartous','Tereza Texlová']) await expect(page.locator('figcaption').getByText(name,{exact:true})).toBeVisible();
        await expect(page.getByRole('img',{name:'CzechInvest — Technologická inkubace',exact:true})).toBeVisible();
        expect(await page.locator('main').innerText()).not.toMatch(/Praha\s*13/);
    }
    for(const [name,role] of [['Jiří Jahn','obchod'],['Pavol Hejný','technologie']]){
        await expect(page.getByText(`Spoluzakladatel · ${role}`,{exact:true})).toBeVisible();
        await expect(page.getByRole('img',{name,exact:true})).toBeVisible();
    }
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByText('Datová schránka: hzuu4yn',{exact:true})).toBeVisible();
    const text=await page.locator('main').innerText();
    for(const forbidden of ['Napíšete knihu','MangoWeb','Současný web','AI zaměstnanci pro vás','Instance je samostatné'])expect(text).not.toContain(forbidden);
});

test('app location and engine location are independent and the engine continues with the app closed',async({page})=>{
    await visit(page,'/cs');
    const architecture = page.getByLabel('Interaktivní schéma architektury aplikace',{exact:true});
    const appLocations = architecture.getByRole('group',{name:'Odkud ovládáte aplikaci',exact:true});
    const engineLocations = architecture.getByRole('group',{name:'Kde provozujete engine',exact:true});
    for (const app of ['U kávy','Venku','Ve vlaku']) {
        await appLocations.getByRole('button',{name:app,exact:true}).click();
        for (const engine of ['V kuchyni','Na poličce','Na VPS']) {
            await engineLocations.getByRole('button',{name:engine,exact:true}).click();
            await expect(appLocations.getByRole('button',{name:app,exact:true})).toHaveAttribute('aria-pressed','true');
            await expect(engineLocations.getByRole('button',{name:engine,exact:true})).toHaveAttribute('aria-pressed','true');
            await expect(appLocations.locator('[aria-pressed="true"]')).toHaveCount(1);
            await expect(engineLocations.locator('[aria-pressed="true"]')).toHaveCount(1);
        }
    }
    await architecture.getByRole('button',{name:'Zavřít aplikaci',exact:true}).click();
    await expect(architecture.getByRole('button',{name:'Otevřít aplikaci',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(architecture.getByText('Engine pracuje dál',{exact:true})).toBeVisible();
    await architecture.getByRole('button',{name:'Otevřít aplikaci',exact:true}).click();
    await expect(architecture.getByRole('button',{name:'Zavřít aplikaci',exact:true})).toHaveAttribute('aria-pressed','false');
    const models = page.getByRole('group',{name:'Váš výběr AI',exact:true});
    await models.getByRole('button',{name:'Lokální model',exact:true}).click();
    await expect(models.getByRole('button',{name:'Lokální model',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('desktop stories follow native scrolling and let readers pause on a chosen step',async({page})=>{
    await page.setViewportSize({width:1440,height:900});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await visit(page,'/cs');
    const story=page.locator('article[data-story="podcast"]');
    await expect(story).toHaveAttribute('data-scroll','true');
    const scrollToProgress=async(progress:number)=>story.evaluate((element,progress)=>{
        const rect=element.getBoundingClientRect();
        const travel=rect.height-Math.min(window.innerHeight-96,720);
        window.scrollTo({top:window.scrollY+rect.top-104+travel*progress,behavior:'instant'});
    },progress);
    await scrollToProgress(0.4);
    await expect(story).toHaveAttribute('data-step','1');
    await scrollToProgress(0.9);
    await expect(story).toHaveAttribute('data-step','3');
    await story.getByRole('tab',{name:'Nový díl',exact:true}).click();
    await scrollToProgress(0.4);
    await expect(story).toHaveAttribute('data-step','0');
    await story.getByRole('button',{name:'Pokračovat scrollováním',exact:true}).click();
    await expect(story).toHaveAttribute('data-step','1');
});

test('product interest preserves failed drafts and saves one nonbinding CRM enquiry',async({page})=>{
    let writes=0;const bodies:Record<string,string>[]=[];
    let completeSecondRequest:()=>void = () => {};
    const completion = new Promise<void>(resolve=>{completeSecondRequest=resolve;});
    await page.route('**/api/waitlist',async route=>{
        writes++;bodies.push(route.request().postDataJSON());
        if(writes===2) await completion;
        await route.fulfill({status:writes===1?503:200,contentType:'application/json',body:writes===1?'{"error":"Unavailable"}':'{"success":true}'});
    });
    await visit(page,'/cs');
    const trigger = page.getByTestId('brand-hero').getByRole('button',{name:'Chci Promptbook',exact:true});
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading',{name:'Pojďme najít vaši první agendu.',exact:true})).toBeVisible();
    await dialog.getByLabel('Váš e-mail',{exact:true}).fill('interest-test@example.com');
    await dialog.getByLabel('Jméno').fill('Test User');
    await dialog.getByLabel('S čím chcete pomoci?').fill('Potřebuji pomoci s navazováním na klienty.');
    await dialog.getByRole('button',{name:'Zapsat nezávazný zájem',exact:true}).click();
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(dialog.getByLabel('Váš e-mail',{exact:true})).toHaveValue('interest-test@example.com');
    await expect(dialog.getByLabel('Jméno')).toHaveValue('Test User');
    await expect(dialog.getByLabel('S čím chcete pomoci?')).toHaveValue('Potřebuji pomoci s navazováním na klienty.');
    await dialog.getByRole('button',{name:'Zapsat nezávazný zájem',exact:true}).click();
    await expect(dialog.getByRole('button',{name:'Zpracovávám…',exact:true})).toBeDisabled();
    await expect(dialog.getByLabel('Váš e-mail',{exact:true})).toBeDisabled();
    completeSecondRequest();
    await expect(dialog.getByRole('heading',{name:'Děkujeme. Ozveme se vám.',exact:true})).toBeVisible();
    await expect(dialog).toContainText('Váš zájem jsme zaznamenali. Ozveme se, probereme vaše potřeby a dáme vám vědět, až bude aplikace dostupná.');
    expect(writes).toBe(2);expect(bodies[1].placeName).toBe('new-website-contact');
    expect(bodies[1].userNote).toContain('Nezávazný zájem o Promptbook');
    expect(bodies[1].userNote).toContain('Potřebuji pomoci s navazováním na klienty.');
    await dialog.getByRole('button',{name:'Hotovo',exact:true}).click();
    await expect(trigger).toBeFocused();
});

test('Czech marketing pages and language switching retain the page, calculation and anchor', async ({page}) => {
    for (const path of ['/cs/cenik','/cs/partnership','/cs/agendy/email','/cs/srovnani/chatgpt']) {
        const response = await visit(page,path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('main h1')).toHaveCount(1);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://ptbk.io${path}`);
    }
    await visit(page,'/cs/kalkulacka?volume=47');
    await expect(page).toHaveURL(/\/cs\/kalkulacka\?v=2&.*volume=47/);
    await page.evaluate(() => { window.location.hash = 'vysledek'; });
    await page.getByRole('navigation',{name:'Language / Jazyk'}).getByRole('link',{name:/EN$/}).click();
    await expect(page).toHaveURL(/\/en\/kalkulacka\?.*volume=47.*#vysledek$/);
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('navigation',{name:'Language / Jazyk'})).toBeVisible();
    await page.getByRole('navigation',{name:'Language / Jazyk'}).getByRole('link',{name:'CZ',exact:true}).click();
    await expect(page).toHaveURL(/\/cs\/kalkulacka\?.*volume=47.*#vysledek$/);
    await expect(page.getByLabel('Dokladů za měsíc',{exact:true})).toHaveValue('47');
});

test('quick calculator transfers all assumptions and URL restores edits',async({page})=>{
    await visit(page, '/cs');await page.getByLabel('Dokladů za měsíc',{exact:true}).fill('47');
    await expect(page.getByLabel('Interní náklad partnera (Kč/h)')).toHaveCount(0);
    await page.getByRole('link',{name:'Pokročilá kalkulačka',exact:true}).click();
    await expect(page).toHaveURL(/\/kalkulacka\?.*volume=47/);
    await expect(page.getByLabel('Dokladů za měsíc',{exact:true})).toHaveValue('47');
    await page.getByText('AI a externí služby',{exact:true}).click();
    await page.getByLabel('Vstup (Kč / milion tokenů)',{exact:true}).fill('159.5');
    await expect(page).toHaveURL(/inputPriceUsd=7.25/);await page.reload();
    await page.getByText('AI a externí služby',{exact:true}).click();
    await expect(page.getByLabel('Vstup (Kč / milion tokenů)',{exact:true})).toHaveValue('159.5');
    await page.getByRole('tab',{name:'Nasazuji klientům',exact:true}).click();
    await expect(page).toHaveURL(/mode=partner/);
    await page.getByLabel('Počet aktivních klientů',{exact:true}).fill('0');
    await expect(page.getByTestId('partner-revenue')).toHaveText('0 Kč');
    await page.getByRole('button',{name:'Obnovit příklad'}).click();
    await expect(page.getByLabel('Počet aktivních klientů',{exact:true})).toHaveValue('10');
});

test('Start preserves inactive Business inputs without monthly revenue or share overrides',async({page})=>{
    await visit(page, '/cs/kalkulacka?mode=partner&plan=start&horizonMonths=24&instancesPerClient=3&clients=1&commissionPercent=99');
    await expect(page.getByText('Za 30 dní pilotu',{exact:true})).toBeVisible();
    await expect(page.getByText('Start nevytváří opakované měsíční tržby (MRR = 0).',{exact:true})).toBeVisible();
    await expect(page.locator('input[name="commissionPercent"],input[name="partnerSharePercent"]')).toHaveCount(0);
    await expect(page.getByText('20 %',{exact:true})).toBeVisible();
    await expect(page).not.toHaveURL(/commissionPercent/);
    await page.getByRole('combobox',{name:'Licenční plán',exact:true}).selectOption('business');
    await page.getByText('Nasazení, servis a licence',{exact:true}).click();
    await expect(page.getByLabel('Horizont výpočtu (měsíce)',{exact:true})).toHaveValue('24');
    await expect(page.getByLabel('Prostředí na jednoho klienta',{exact:true})).toHaveValue('3');
    await page.getByRole('button',{name:'Sdílet kalkulaci',exact:true}).click();
    const url=await page.getByLabel('Odkaz se všemi parametry',{exact:true}).inputValue();
    expect(url).not.toContain('commissionPercent');expect(url).toContain('horizonMonths=24');
    await visit(page, '/cs/kalkulacka?volume=5');await visit(page, '/cs/kalkulacka?volume=90');await page.goBack();
    await expect(page.getByLabel('Dokladů za měsíc',{exact:true})).toHaveValue('5');
});

test('PDF requires accepted contact and retains failed form entries',async({page})=>{
    let writes=0;const bodies:Record<string,string>[]=[];let downloads=0;
    page.on('download',()=>downloads++);
    await page.route('**/api/waitlist',async route=>{writes++;bodies.push(route.request().postDataJSON());await route.fulfill({status:writes===1?503:200,contentType:'application/json',body:writes===1?'{"error":"Unavailable"}':'{"success":true}'});});
    await visit(page, '/cs');await page.getByRole('button',{name:'Stáhnout PDF výpočet',exact:true}).click();
    await expect(page.getByRole('dialog')).toBeVisible();expect(downloads).toBe(0);
    await page.getByLabel('Váš e-mail',{exact:true}).fill('calculator-test@example.com');
    await page.getByRole('button',{name:'Uložit e-mail a stáhnout PDF',exact:true}).click();
    await expect(page.getByRole('alert')).toBeVisible();expect(downloads).toBe(0);
    await expect(page.getByLabel('Váš e-mail',{exact:true})).toHaveValue('calculator-test@example.com');
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Uložit e-mail a stáhnout PDF',exact:true}).click();
    await (await pending).saveAs('/tmp/ptbk-calculation-company.pdf');
    const data=await readFile('/tmp/ptbk-calculation-company.pdf');expect(data.subarray(0,5).toString()).toBe('%PDF-');expect(data.length).toBeGreaterThan(10000);
    expect(writes).toBe(2);expect(bodies[1].placeName).toBe('new-calculator-pdf');expect(bodies[1].userNote).toContain('/kalkulacka?');
    expect(bodies[1].userNote).not.toContain('calculator-test@example.com');expect(page.url()).not.toContain('calculator-test');
});

test('failed PDF render retries without saving the accepted contact twice',async({page})=>{
    let writes=0;let failFonts=true;
    await page.route('**/api/waitlist',async route=>{writes++;await route.fulfill({status:200,contentType:'application/json',body:'{"success":true}'});});
    await page.route('**/fonts/workshop/*',async route=>{if(failFonts)await route.fulfill({status:503,body:'Unavailable'});else await route.continue();});
    await visit(page, '/cs/kalkulacka?mode=partner&clients=3&horizonMonths=24');
    await page.getByRole('button',{name:'Stáhnout PDF výpočet',exact:true}).click();
    await page.getByLabel('Váš e-mail',{exact:true}).fill('partner-test@example.com');
    await page.getByRole('button',{name:'Uložit e-mail a stáhnout PDF',exact:true}).click();
    await expect(page.getByRole('alert')).toContainText('Kontakt je uložený');expect(writes).toBe(1);failFonts=false;
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Znovu připravit PDF',exact:true}).click();
    await (await pending).saveAs('/tmp/ptbk-calculation-partner.pdf');expect(writes).toBe(1);
});

test('founder CTA uses the contact system and restores focus after success',async({page})=>{
    let body:Record<string,string>={};
    await page.route('**/api/waitlist',async route=>{body=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:'{"success":true}'});});
    await visit(page, '/cs/o-nas');await page.getByRole('button',{name:'Probrat technologii',exact:true}).click();
    await page.getByLabel('Váš e-mail',{exact:true}).fill('founder-test@example.com');
    await page.getByRole('button',{name:'Odeslat zprávu',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Děkujeme. Ozveme se vám.',exact:true})).toBeVisible();
    expect(body.placeName).toBe('new-website-contact');expect(body.userNote).toContain('Pavol Hejný');
    await page.getByRole('button',{name:'Hotovo',exact:true}).click();
    await expect(page.getByRole('button',{name:'Probrat technologii',exact:true})).toBeFocused();
});

test('all information and comparison routes stay within the new website',async({page})=>{
    const paths=['partnership','cenik','agendy','agendy/email','bezpecnost','faq','o-nas','soukromi','podminky','srovnani',...['claude-code','codex','n8n','make','openclaw','paperclip'].map(slug=>`srovnani/${slug}`)];
    for(const path of paths){const response=await visit(page, `/cs/${path}`);expect(response?.status(),path).toBe(200);await expect(page.locator('main h1')).toHaveCount(1);
        const links=await page.getByRole('navigation',{name:'Hlavní navigace'}).locator('a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));expect(links.every(href=>href?.startsWith('/'))).toBe(true);}
    await visit(page, '/cs/cenik');await expect(page.getByText('První věcná reakce do 16 pracovních hodin',{exact:true})).toBeVisible();
    expect((await visit(page, '/cs/srovnani/not-a-vendor'))?.status()).toBe(404);
});

test('mobile pages, keyboard tabs and reduced motion remain usable',async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:375,height:812});
    for(const path of ['/cs','/cs/partnership','/cs/open-source','/en','/en/partnership','/en/open-source','/cs/kalkulacka','/cs/o-nas']){await visit(page, path);await expect(page.locator('main h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),path).toBe(true);}
    await visit(page,'/en/open-source');
    await page.getByRole('tab',{name:'npm',exact:true}).focus();await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab',{name:'Shell',exact:true})).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab',{name:'Windows EXE',exact:true})).toHaveAttribute('aria-selected','true');
    await expect(page.getByRole('link',{name:'Choose a Windows EXE',exact:true})).toHaveAttribute('href','https://github.com/webgptorg/promptbook/releases');
    await visit(page, '/cs');
    await expect(page.locator('article[data-story][data-step="3"][data-scroll="false"]')).toHaveCount(3);
    await page.getByRole('tab',{name:'Nasazuji klientům',exact:true}).focus();await page.keyboard.press('Home');
    await expect(page.getByRole('tab',{name:'Pro mou firmu',exact:true})).toHaveAttribute('aria-selected','true');
});
