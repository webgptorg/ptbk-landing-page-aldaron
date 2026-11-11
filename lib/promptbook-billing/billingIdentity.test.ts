import { afterEach, describe, expect, it, vi } from 'vitest';
import { BillingIdentityError, resolvePromptbookBillingIdentity, resolvePromptbookCheckoutIdentity, suggestPromptbookBillingIdentity } from './billingIdentity';

vi.mock('server-only', () => ({}));

const CZ_COMPANY = {
    ico: '00000001',
    obchodniJmeno: 'Česká testovací firma',
    sidlo: {
        kodStatu: 'CZ',
        nazevObce: 'Praha',
        nazevUlice: 'Testovací',
        cisloDomovni: 42,
        cisloOrientacni: 1,
        cisloOrientacniPismeno: 'a',
        psc: 11000,
    },
};
const SK_COMPANY = {
    id: 12,
    ico: '00000002',
    dic: '1234567890',
    nazovUJ: 'Skúšobná firma, s. r. o.',
    ulica: 'Skúšobná 42/1',
    mesto: 'Medzev',
    psc: '044 25',
};
const SK_VIES = {
    countryCode: 'SK',
    vatNumber: '0987654321',
    valid: true,
    userError: 'VALID',
    name: 'Skúšobná firma s.r.o.',
    address: 'Skúšobná 42 / 1\n044 25 Medzev\nSlovensko',
};

afterEach(() => vi.unstubAllGlobals());

function stubSlovakRegistries(vies: Partial<typeof SK_VIES>) {
    const fetchMock = vi.fn(async (input: string | URL) => {
        const url = new URL(input);
        if (url.pathname.endsWith('/uctovne-jednotky')) {
            return Response.json({ id: [12, 13], existujeDalsieId: false });
        }
        if (url.pathname.endsWith('/uctovna-jednotka')) {
            const company = url.searchParams.get('id') === '13'
                ? { ...SK_COMPANY, id: 13, datumZrusenia: '2020-01-01' }
                : SK_COMPANY;
            return Response.json(company);
        }
        return Response.json({ ...SK_VIES, ...vies });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('Promptbook billing identity', () => {
    it.each(['CZ', 'SK'] as const)('accepts a %s consumer without querying business registries', async (country) => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        const address = { line1: 'Vlastní 12', city: 'Město', postal_code: '12345', country };
        await expect(resolvePromptbookCheckoutIdentity({
            country, companyId: null, vatId: null, billingName: 'Eva Nová', billingAddress: address,
        })).resolves.toMatchObject({
            companyId: null, customerType: 'consumer', taxTreatment: 'domestic',
            name: 'Eva Nová', address,
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('keeps manually corrected Czech business details even during an ARES outage', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('network'));
        vi.stubGlobal('fetch', fetchMock);
        const address = { line1: 'Doručovací 99', city: 'Brno', postal_code: '60200', country: 'CZ' as const };
        await expect(resolvePromptbookCheckoutIdentity({
            country: 'CZ', companyId: CZ_COMPANY.ico, vatId: null,
            billingName: 'Vlastní fakturační název', billingAddress: address,
        })).resolves.toMatchObject({
            customerType: 'business', taxTreatment: 'domestic', name: 'Vlastní fakturační název', address,
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('keeps edited Slovak billing address after verifying the business VAT identity', async () => {
        stubSlovakRegistries({});
        const address = { line1: 'Poštová 99', city: 'Bratislava', postal_code: '81101', country: 'SK' as const };
        await expect(resolvePromptbookCheckoutIdentity({
            country: 'SK', companyId: SK_COMPANY.ico, vatId: 'SK0987654321',
            billingName: 'Skúšobná fakturační pobočka', billingAddress: address,
        })).resolves.toMatchObject({ name: 'Skúšobná fakturační pobočka', address, taxTreatment: 'reverse_charge' });
    });

    it('suggests Slovak business details before a VAT number is entered without granting reverse charge', async () => {
        const fetchMock = stubSlovakRegistries({});
        await expect(suggestPromptbookBillingIdentity({ country: 'SK', companyId: SK_COMPANY.ico })).resolves.toMatchObject({
            companyId: SK_COMPANY.ico, name: SK_COMPANY.nazovUJ,
        });
        expect(fetchMock.mock.calls.some(([url]) => new URL(url).hostname === 'ec.europa.eu')).toBe(false);
    });

    it('uses the Czech company and address from ARES without inventing a tax ID', async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json(CZ_COMPANY));
        vi.stubGlobal('fetch', fetchMock);
        await expect(resolvePromptbookBillingIdentity({ country: 'CZ', companyId: '0000 0001' })).resolves.toEqual({
            country: 'CZ',
            companyId: '00000001',
            name: CZ_COMPANY.obchodniJmeno,
            address: { line1: 'Testovací 42/1a', city: 'Praha', postal_code: '11000', country: 'CZ' },
        });
        expect(fetchMock).toHaveBeenCalledWith(
            'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/00000001',
            expect.objectContaining({ cache: 'no-store' }),
        );
    });

    it('requires a positive VIES result for the matching Slovak name and address', async () => {
        const fetchMock = stubSlovakRegistries({});
        await expect(resolvePromptbookBillingIdentity({
            country: 'SK', companyId: SK_COMPANY.ico, vatId: 'sk 0987654321',
        })).resolves.toEqual({
            country: 'SK',
            companyId: SK_COMPANY.ico,
            vatId: 'SK0987654321',
            name: SK_COMPANY.nazovUJ,
            address: { line1: SK_COMPANY.ulica, city: 'Medzev', postal_code: '04425', country: 'SK' },
        });
        expect(fetchMock).toHaveBeenCalledWith(
            'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ countryCode: 'SK', vatNumber: SK_VIES.vatNumber }),
            }),
        );
    });

    it.each([
        { name: 'Jiná firma s.r.o.' },
        { address: 'Skúšobná 42/2, 04425 Medzev' },
        { name: '---', address: '---' },
        { valid: false, userError: 'INVALID' },
    ])('rejects an invalid or mismatched Slovak VAT record (%o)', async (vat) => {
        stubSlovakRegistries(vat);
        await expect(resolvePromptbookBillingIdentity({
            country: 'SK', companyId: SK_COMPANY.ico, vatId: 'SK0987654321',
        })).rejects.toMatchObject({ name: 'BillingIdentityError', status: 422 });
    });

    it('does not continue when a registry request fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failure')));
        const result = resolvePromptbookBillingIdentity({ country: 'CZ', companyId: CZ_COMPANY.ico });
        await expect(result).rejects.toBeInstanceOf(BillingIdentityError);
        await expect(result).rejects.toMatchObject({ status: 503 });
    });
});
