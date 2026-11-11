import 'server-only';

import { z } from 'zod';

export type BillingCountry = 'CZ' | 'SK';
export type PromptbookBillingAddress = {
    line1: string;
    city: string;
    postal_code: string;
    country: BillingCountry;
};

export type PromptbookBillingIdentity = {
    country: BillingCountry;
    companyId: string;
    vatId?: string;
    name: string;
    address: PromptbookBillingAddress;
};

export class BillingIdentityError extends Error {
    constructor(message: string, readonly status = 422) {
        super(message);
        this.name = 'BillingIdentityError';
    }
}

const ARES_API = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty';
const SLOVAK_ACCOUNTING_REGISTER_API = 'https://www.registeruz.sk/cruz-public/api';
const VIES_API = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number';
const REGISTRY_TIMEOUT_MS = 5_000;
const MAX_CZECH_COMPANY_SEARCH_MATCHES = 8;
const MAX_SLOVAK_REGISTRY_MATCHES = 5;
const REGISTRY_UNAVAILABLE = 'Firemní registr teď není dostupný. Zkuste to prosím znovu za chvíli.';
const VIES_UNAVAILABLE = 'Ověření ve VIES teď není dostupné. Zkuste to prosím znovu za chvíli.';

const registryText = z.string().trim().min(1);
const aresCompanySchema = z.object({
    ico: z.string(),
    dic: z.string().nullish(),
    obchodniJmeno: registryText,
    datumZaniku: z.string().nullish(),
    sidlo: z.object({
        kodStatu: z.string(),
        nazevObce: registryText,
        nazevUlice: z.string().nullish(),
        nazevCastiObce: z.string().nullish(),
        cisloDomovni: z.number().int().positive(),
        typCisloDomovni: z.number().optional(),
        cisloOrientacni: z.number().int().positive().nullish(),
        cisloOrientacniPismeno: z.string().nullish(),
        psc: z.number().int().min(10000).max(99999),
    }),
});
const slovakCompanyIdsSchema = z.object({
    id: z.array(z.number().int().positive()).max(MAX_SLOVAK_REGISTRY_MATCHES),
    existujeDalsieId: z.boolean(),
});
const slovakCompanySchema = z.object({
    id: z.number().int().positive(),
    ico: z.string(),
    nazovUJ: registryText,
    mesto: registryText,
    ulica: registryText,
    psc: registryText,
    datumZrusenia: z.string().nullish(),
});
const viesVatSchema = z.object({
    countryCode: z.string(),
    vatNumber: z.string(),
    valid: z.boolean(),
    userError: z.string().nullish(),
    name: z.string().nullish(),
    address: z.string().nullish(),
});

async function readRegistry<T>(
    schema: z.ZodType<T>,
    url: string | URL,
    unavailableMessage: string,
    options?: RequestInit,
): Promise<T | null> {
    try {
        const response = await fetch(url, {
            ...options,
            cache: 'no-store',
            redirect: 'error',
            signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS),
        });
        if (response.status === 404 && options?.method !== 'POST') return null;
        if (response.ok) return schema.parse(await response.json());
    } catch {
        // Do not put the submitted tax identifiers or provider responses into logs.
    }
    throw new BillingIdentityError(unavailableMessage, 503);
}

function normalizeId(value: string): string {
    return value.replace(/\s/g, '').toUpperCase();
}

async function resolveCzechBusiness(companyId: string, vatId?: string): Promise<PromptbookBillingIdentity> {
    const company = await readRegistry(aresCompanySchema, `${ARES_API}/${companyId}`, REGISTRY_UNAVAILABLE);
    if (!company || company.ico !== companyId || company.datumZaniku) {
        throw new BillingIdentityError('V ARES se nepodařilo najít aktivní český podnikatelský subjekt s tímto IČO.');
    }
    if (company.sidlo.kodStatu !== 'CZ') {
        throw new BillingIdentityError('České IČO musí patřit subjektu s fakturační adresou v Česku.');
    }
    if (vatId && (!/^CZ\d{8,10}$/.test(vatId) || company.dic !== vatId)) {
        throw new BillingIdentityError('Zadané DIČ neodpovídá tomuto subjektu v ARES.');
    }
    return formatCzechBillingIdentity(company, vatId);
}

function formatCzechBillingIdentity(
    company: z.infer<typeof aresCompanySchema>,
    vatId?: string,
): PromptbookBillingIdentity {
    const seat = company.sidlo;
    const street = seat.nazevUlice || seat.nazevCastiObce || seat.nazevObce;
    const houseNumber = seat.typCisloDomovni === 2 ? `č. ev. ${seat.cisloDomovni}` : String(seat.cisloDomovni);
    const orientation = seat.cisloOrientacni
        ? `/${seat.cisloOrientacni}${seat.cisloOrientacniPismeno ?? ''}`
        : '';
    return {
        country: 'CZ',
        companyId: company.ico,
        ...(vatId ? { vatId } : {}),
        name: company.obchodniJmeno,
        address: {
            line1: `${street} ${houseNumber}${orientation}`,
            city: seat.nazevObce,
            postal_code: String(seat.psc),
            country: 'CZ',
        },
    };
}

/** Optional ARES suggestions: choosing one never locks or verifies the customer's submitted billing details. */
export async function searchPromptbookBillingCompanies(input: { country: BillingCountry; query: string }): Promise<{
    companies: PromptbookBillingIdentity[];
    hasMore: boolean;
}> {
    if (input.country !== 'CZ') {
        throw new BillingIdentityError('Vyhledávání podle názvu je dostupné pro české firmy. Slovenské údaje vyplňte ručně.');
    }
    const query = input.query.trim().replace(/\s+/g, ' ');
    if (query.length < 3 || query.length > 120) {
        throw new BillingIdentityError('Pro vyhledání firmy zadejte alespoň tři znaky názvu.', 400);
    }
    const matchesSchema = z.object({
        pocetCelkem: z.number().int().nonnegative(),
        ekonomickeSubjekty: z.array(z.unknown()).max(MAX_CZECH_COMPANY_SEARCH_MATCHES),
    });
    let result: z.infer<typeof matchesSchema>;
    try {
        const response = await fetch(`${ARES_API}/vyhledat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ obchodniJmeno: query, start: 0, pocet: MAX_CZECH_COMPANY_SEARCH_MATCHES }),
            next: { revalidate: 300 },
            redirect: 'error',
            signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS),
        });
        if (response.status === 400) {
            throw new BillingIdentityError('Upřesněte název firmy, nebo údaje vyplňte ručně.');
        }
        if (!response.ok) throw new Error('Company search failed');
        result = matchesSchema.parse(await response.json());
    } catch (error) {
        if (error instanceof BillingIdentityError) throw error;
        throw new BillingIdentityError('ARES teď není dostupný. Údaje můžete vyplnit ručně.', 503);
    }
    const seen = new Set<string>();
    const companies = result.ekonomickeSubjekty.flatMap((value) => {
        const parsed = aresCompanySchema.safeParse(value);
        if (!parsed.success) return [];
        const company = parsed.data;
        if (!/^\d{8}$/.test(company.ico) || company.datumZaniku || company.sidlo.kodStatu !== 'CZ' || seen.has(company.ico)) {
            return [];
        }
        seen.add(company.ico);
        const vatId = company.dic && /^CZ\d{8,10}$/.test(company.dic) ? company.dic : undefined;
        return [formatCzechBillingIdentity(company, vatId)];
    });
    return { companies, hasMore: result.pocetCelkem > result.ekonomickeSubjekty.length };
}

function normalizeRegistryText(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeSlovakAddress(value: string): string {
    // Keep a street number such as 42/1 distinct from 42.
    return value
        .replace(/(\d)\s*\/\s*(?=\d)/g, '$1/')
        .split('/')
        .map(normalizeRegistryText)
        .join('/');
}

function matchesSlovakAddress(viesAddress: string, street: string, city: string, postalCode: string): boolean {
    const address = normalizeSlovakAddress(viesAddress).replace(/ (?:slovensko|slovakia|slovenska republika|sk)$/, '');
    const streetLine = normalizeSlovakAddress(street);
    const cityLine = normalizeRegistryText(city);
    const printedPostalCode = `${postalCode.slice(0, 3)} ${postalCode.slice(3)}`;
    return [postalCode, printedPostalCode].some((code) =>
        address === `${streetLine} ${code} ${cityLine}` || address === `${streetLine} ${cityLine} ${code}`,
    );
}

function getMatchingSlovakPostalCode(
    company: z.infer<typeof slovakCompanySchema>,
    companyId: string,
    vat: z.infer<typeof viesVatSchema>,
): string | null {
    const postalCode = normalizeId(company.psc);
    const name = normalizeRegistryText(company.nazovUJ);
    if (company.ico !== companyId || company.datumZrusenia || !/^\d{5}$/.test(postalCode) || !name ||
        !vat.name || !vat.address || normalizeRegistryText(vat.name) !== name ||
        !matchesSlovakAddress(vat.address, company.ulica, company.mesto, postalCode)) {
        return null;
    }
    return postalCode;
}

async function loadSlovakCompanies(companyId: string) {
    const companiesUrl = new URL(`${SLOVAK_ACCOUNTING_REGISTER_API}/uctovne-jednotky`);
    companiesUrl.search = new URLSearchParams({
        ico: companyId,
        'zmenene-od': '2000-01-01',
        'max-zaznamov': String(MAX_SLOVAK_REGISTRY_MATCHES),
    }).toString();
    const records = await readRegistry(slovakCompanyIdsSchema, companiesUrl, REGISTRY_UNAVAILABLE);
    if (!records || records.id.length === 0 || records.existujeDalsieId) {
        throw new BillingIdentityError('Slovenské IČO se nepodařilo jednoznačně ověřit. Obraťte se na podporu.');
    }

    return Promise.all(records.id.map(async (id) => {
        const company = await readRegistry(
            slovakCompanySchema,
            `${SLOVAK_ACCOUNTING_REGISTER_API}/uctovna-jednotka?id=${id}`,
            REGISTRY_UNAVAILABLE,
        );
        if (!company || company.id !== id) throw new BillingIdentityError(REGISTRY_UNAVAILABLE, 503);
        return company;
    }));
}

async function resolveSlovakBusiness(companyId: string, vatId?: string): Promise<PromptbookBillingIdentity> {
    if (!vatId || !/^SK\d{10}$/.test(vatId)) {
        throw new BillingIdentityError('Pro nákup na slovenskou firmu zadejte IČ DPH ve formátu SK a deset číslic.');
    }

    const [companies, vat] = await Promise.all([
        loadSlovakCompanies(companyId),
        readRegistry(viesVatSchema, VIES_API, VIES_UNAVAILABLE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ countryCode: 'SK', vatNumber: vatId.slice(2) }),
        }),
    ]);
    if (!vat || vat.countryCode !== 'SK' || vat.vatNumber !== vatId.slice(2) ||
        (vat.userError && !['VALID', 'INVALID'].includes(vat.userError))) {
        throw new BillingIdentityError(VIES_UNAVAILABLE, 503);
    }
    if (!vat.valid) {
        throw new BillingIdentityError('VIES nepotvrdil platnost zadaného slovenského IČ DPH.');
    }

    // VAT and company identifiers can legitimately differ. Compare the registered identity
    // from both sources before using reverse charge, and send unresolved records to support.
    const matches = companies.flatMap((company) => {
        const postalCode = getMatchingSlovakPostalCode(company, companyId, vat);
        return postalCode ? [{ company, postalCode }] : [];
    });
    if (matches.length !== 1) {
        throw new BillingIdentityError('Slovenské IČO a IČ DPH se nepodařilo přiřadit ke stejné firmě. Obraťte se na podporu.');
    }
    const { company, postalCode } = matches[0]!;

    return {
        country: 'SK',
        companyId,
        vatId,
        name: company.nazovUJ,
        address: { line1: company.ulica, city: company.mesto, postal_code: postalCode, country: 'SK' },
    };
}

/** Registry suggestions for the editable billing form; reverse charge additionally verifies VIES. */
export async function resolvePromptbookBillingIdentity(
    input: { country: BillingCountry; companyId: string; vatId?: string },
): Promise<PromptbookBillingIdentity> {
    if (input.country !== 'CZ' && input.country !== 'SK') {
        throw new BillingIdentityError('Objednávka je dostupná pro zákazníky z Česka a Slovenska.');
    }
    const companyId = normalizeId(input.companyId);
    const vatId = normalizeId(input.vatId ?? '') || undefined;
    if (!/^\d{8}$/.test(companyId)) throw new BillingIdentityError('Zadejte osmimístné IČO.');
    return input.country === 'CZ' ? resolveCzechBusiness(companyId, vatId) : resolveSlovakBusiness(companyId, vatId);
}

/** A Slovak lookup can suggest its registered address before the optional VAT field is filled. */
export async function suggestPromptbookBillingIdentity(
    input: { country: BillingCountry; companyId: string; vatId?: string },
): Promise<PromptbookBillingIdentity> {
    const companyId = normalizeId(input.companyId);
    if (!/^\d{8}$/.test(companyId)) throw new BillingIdentityError('Zadejte osmimístné IČO.');
    if (input.country !== 'SK' || input.vatId?.trim()) return resolvePromptbookBillingIdentity(input);
    const companies = await loadSlovakCompanies(companyId);
    const matches = companies.filter((company) => company.ico === companyId && !company.datumZrusenia &&
        /^\d{5}$/.test(normalizeId(company.psc)));
    if (matches.length !== 1) throw new BillingIdentityError('Slovenské IČO se nepodařilo jednoznačně ověřit.');
    const company = matches[0]!;
    return {
        country: 'SK', companyId, name: company.nazovUJ,
        address: { line1: company.ulica, city: company.mesto, postal_code: normalizeId(company.psc), country: 'SK' },
    };
}

/** Keep the customer's edits, using registries only to establish a claimed reverse-charge tax identity. */
export async function resolvePromptbookCheckoutIdentity(input: {
    country: BillingCountry;
    companyId: string | null;
    vatId: string | null;
    billingName: string;
    billingAddress: PromptbookBillingAddress;
}) {
    const companyId = normalizeId(input.companyId ?? '') || null;
    const vatId = normalizeId(input.vatId ?? '') || null;
    if (input.billingAddress.country !== input.country) {
        throw new BillingIdentityError('Země fakturační adresy musí odpovídat vybrané zemi.');
    }
    if (companyId && !/^\d{8}$/.test(companyId)) throw new BillingIdentityError('Zadejte osmimístné IČO.');
    if (!companyId && vatId) throw new BillingIdentityError('DIČ vyplňte spolu s IČO.');
    if (companyId && input.country === 'CZ' && vatId && !/^CZ\d{8,10}$/.test(vatId)) {
        throw new BillingIdentityError('Zadejte DIČ ve formátu CZ a osm až deset číslic.');
    }
    if (companyId && input.country === 'SK') {
        await resolvePromptbookBillingIdentity({ country: 'SK', companyId, vatId: vatId ?? undefined });
    }
    return {
        country: input.country,
        companyId,
        vatId,
        name: input.billingName,
        address: input.billingAddress,
        customerType: companyId ? 'business' as const : 'consumer' as const,
        taxTreatment: companyId && input.country === 'SK' ? 'reverse_charge' as const : 'domestic' as const,
    };
}
