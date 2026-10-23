import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const visit = (page: Page, path: string) => page.goto(path, {waitUntil:'domcontentloaded'});

test.beforeEach(async ({page,baseURL}) => {
    page.setDefaultNavigationTimeout(30_000);
    // Verify the site without depending on third-party tracking services.
    await page.route('**/*', route => new URL(route.request().url()).origin === new URL(baseURL!).origin
        ? route.continue() : route.abort());
    await page.addInitScript(() => {
        localStorage.setItem('cookiesAccepted','true');
        localStorage.setItem('cookiePreferences',JSON.stringify({necessary:true,analytics:false,marketing:false}));
    });
});

// Contact/PDF writes are intercepted: this suite never submits test leads to production.
test('root cutover serves both languages with public metadata and preserves old calculation links', async ({page,request}) => {
    const legacy = await request.get('/new/kalkulacka?volume=47&mode=partner', {maxRedirects:0});
    expect(legacy.status()).toBe(308);
    expect(new URL(legacy.headers().location).pathname).toBe('/kalkulacka');
    expect(new URL(legacy.headers().location).search).toBe('?volume=47&mode=partner');
    for (const [path,language] of [['/','cs'],['/en','en']]) {
        const response = await visit(page, path);
        expect(response?.status()).toBe(200);
        await expect(page).toHaveURL(new URL(path, page.url()).toString());
        await expect(page.locator('html')).toHaveAttribute('lang',language);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://ptbk.io${path === '/' ? '' : path}`);
        expect(await page.locator('meta[name="robots"]').getAttribute('content')).not.toContain('noindex');
        await expect(page.getByRole('navigation',{name:'Language / Jazyk'}).getByRole('link',{name:'CZ',exact:true})).toHaveAttribute('href','/');
        await expect(page.getByRole('navigation',{name:'Language / Jazyk'}).getByRole('link',{name:/EN$/})).toHaveAttribute('href','/en');
    }
});

test('homepage has five interactive examples, equal founders and no draft framing',async({page})=>{
    await visit(page, '/');
    await expect(page.getByRole('heading',{level:1})).toContainText('Teď pracuje pro vás.');
    await expect(page.getByRole('tablist',{name:'Vyberte ukázku agendy'}).getByRole('tab')).toHaveCount(5);
    for(const name of ['Účetní podklady','Sociální sítě','Video → obsah','Údržba webu','E-maily']){
        await page.getByRole('tab',{name,exact:true}).click();
        await expect(page.getByRole('tab',{name,exact:true})).toHaveAttribute('aria-selected','true');
    }
    await expect(page.getByRole('heading',{name:'Vaše data. Opravdu vaše.'})).toBeVisible();
    for(const [name,role] of [['Jiří Jahn','obchod'],['Pavol Hejný','technologie']]){
        await expect(page.getByText(`Spoluzakladatel · ${role}`,{exact:true})).toBeVisible();
        await expect(page.getByRole('img',{name,exact:true})).toBeVisible();
    }
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByText('Datová schránka: hzuu4yn',{exact:true})).toBeVisible();
    const text=await page.locator('main').innerText();
    for(const forbidden of ['Napíšete knihu','MangoWeb','připravujeme','Současný web','AI zaměstnanci pro vás','Instance je samostatné'])expect(text).not.toContain(forbidden);
});

test('quick calculator transfers all assumptions and URL restores edits',async({page})=>{
    await visit(page, '/');await page.getByLabel('Dokladů za měsíc',{exact:true}).fill('47');
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
    await visit(page, '/kalkulacka?mode=partner&plan=start&horizonMonths=24&instancesPerClient=3&clients=1&commissionPercent=99');
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
    await visit(page, '/kalkulacka?volume=5');await visit(page, '/kalkulacka?volume=90');await page.goBack();
    await expect(page.getByLabel('Dokladů za měsíc',{exact:true})).toHaveValue('5');
});

test('PDF requires accepted contact and retains failed form entries',async({page})=>{
    let writes=0;const bodies:Record<string,string>[]=[];let downloads=0;
    page.on('download',()=>downloads++);
    await page.route('**/api/waitlist',async route=>{writes++;bodies.push(route.request().postDataJSON());await route.fulfill({status:writes===1?503:200,contentType:'application/json',body:writes===1?'{"error":"Unavailable"}':'{"success":true}'});});
    await visit(page, '/');await page.getByRole('button',{name:'Stáhnout PDF výpočet',exact:true}).click();
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
    await visit(page, '/kalkulacka?mode=partner&clients=3&horizonMonths=24');
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
    await visit(page, '/o-nas');await page.getByRole('button',{name:'Probrat technologii',exact:true}).click();
    await page.getByLabel('Váš e-mail',{exact:true}).fill('founder-test@example.com');
    await page.getByRole('button',{name:'Odeslat zprávu',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Děkujeme. Ozveme se vám.',exact:true})).toBeVisible();
    expect(body.placeName).toBe('new-website-contact');expect(body.userNote).toContain('Pavol Hejný');
    await page.getByRole('button',{name:'Hotovo',exact:true}).click();
    await expect(page.getByRole('button',{name:'Probrat technologii',exact:true})).toBeFocused();
});

test('all information and comparison routes stay within the new website',async({page})=>{
    const paths=['partnership','cenik','agendy','agendy/email','bezpecnost','faq','o-nas','soukromi','podminky','srovnani',...['claude-code','codex','n8n','make','openclaw','paperclip'].map(slug=>`srovnani/${slug}`)];
    for(const path of paths){const response=await visit(page, `/${path}`);expect(response?.status(),path).toBe(200);await expect(page.locator('main h1')).toHaveCount(1);
        const links=await page.getByRole('navigation',{name:'Hlavní navigace'}).locator('a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));expect(links.every(href=>href?.startsWith('/'))).toBe(true);}
    await visit(page, '/cenik');await expect(page.getByText('První věcná reakce do 16 pracovních hodin',{exact:true})).toBeVisible();
    expect((await visit(page, '/srovnani/not-a-vendor'))?.status()).toBe(404);
});

test('mobile pages, keyboard tabs and reduced motion remain usable',async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:375,height:812});
    for(const path of ['/','/partnership','/kalkulacka','/o-nas']){await visit(page, path);await expect(page.locator('main h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),path).toBe(true);}
    await visit(page, '/');await page.getByRole('tab',{name:'E-maily',exact:true}).focus();await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab',{name:'Účetní podklady',exact:true})).toBeFocused();
    await page.getByRole('tab',{name:'Nasazuji klientům',exact:true}).focus();await page.keyboard.press('Home');
    await expect(page.getByRole('tab',{name:'Pro mou firmu',exact:true})).toHaveAttribute('aria-selected','true');
});
