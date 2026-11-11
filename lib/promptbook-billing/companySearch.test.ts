import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchPromptbookBillingCompanies } from './billingIdentity';

vi.mock('server-only', () => ({}));

const company = {
    ico: '21012288',
    dic: 'CZ21012288',
    obchodniJmeno: 'AI Web s.r.o.',
    sidlo: {
        kodStatu: 'CZ',
        nazevObce: 'Praha',
        nazevUlice: 'Rohožnická',
        cisloDomovni: 2908,
        psc: 19016,
    },
};

afterEach(() => vi.unstubAllGlobals());

describe('Czech company name suggestions', () => {
    it('returns registered identifiers and a complete editable address from one bounded ARES search', async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ pocetCelkem: 9, ekonomickeSubjekty: [company] }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(searchPromptbookBillingCompanies({ country: 'CZ', query: '  AI   Web ' })).resolves.toEqual({
            companies: [{
                country: 'CZ', companyId: '21012288', vatId: 'CZ21012288', name: 'AI Web s.r.o.',
                address: { line1: 'Rohožnická 2908', city: 'Praha', postal_code: '19016', country: 'CZ' },
            }],
            hasMore: true,
        });
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledWith(
            'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ obchodniJmeno: 'AI Web', start: 0, pocet: 8 }),
                next: { revalidate: 300 },
                redirect: 'error',
            }),
        );
    });

    it('excludes inactive, foreign, duplicate and incomplete records without dropping valid suggestions', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
            pocetCelkem: 5,
            ekonomickeSubjekty: [
                company,
                company,
                { ...company, ico: '00000002', datumZaniku: '2020-01-01' },
                { ...company, ico: '00000003', sidlo: { ...company.sidlo, kodStatu: 'SK' } },
                { ico: '00000004', obchodniJmeno: 'Incomplete address' },
            ],
        })));
        const result = await searchPromptbookBillingCompanies({ country: 'CZ', query: 'AI Web' });
        expect(result.companies.map(({ companyId }) => companyId)).toEqual(['21012288']);
        expect(result.hasMore).toBe(false);
    });

    it('does not invent or accept an invalid tax identifier', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
            pocetCelkem: 1, ekonomickeSubjekty: [{ ...company, dic: 'unexpected' }],
        })));
        const result = await searchPromptbookBillingCompanies({ country: 'CZ', query: 'AI Web' });
        expect(result.companies[0]).not.toHaveProperty('vatId');
    });

    it('returns an empty result so a new company can be entered manually', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ pocetCelkem: 0, ekonomickeSubjekty: [] })));
        await expect(searchPromptbookBillingCompanies({ country: 'CZ', query: 'Nová společnost' })).resolves.toEqual({
            companies: [], hasMore: false,
        });
    });

    it.each(['AI', 'x'.repeat(121)])('does not query the registry for an invalid name length', async (query) => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        await expect(searchPromptbookBillingCompanies({ country: 'CZ', query })).rejects.toMatchObject({ status: 400 });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not query ARES for a Slovak company name', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        await expect(searchPromptbookBillingCompanies({ country: 'SK', query: 'Skúšobná' })).rejects.toMatchObject({ status: 422 });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('suggests a narrower query for ARES limits without exposing provider contents', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Provider private details', { status: 400 })));
        await expect(searchPromptbookBillingCompanies({ country: 'CZ', query: 'Holding' })).rejects.toMatchObject({
            status: 422, message: 'Upřesněte název firmy, nebo údaje vyplňte ručně.',
        });
    });

    it.each(['network', 'invalid'])('keeps manual entry available after a failed search (%s)', async (failure) => {
        const fetchMock = failure === 'network'
            ? vi.fn().mockRejectedValue(new Error('network'))
            : vi.fn().mockResolvedValue(Response.json({ unexpected: true }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(searchPromptbookBillingCompanies({ country: 'CZ', query: 'AI Web' })).rejects.toMatchObject({
            status: 503, message: 'ARES teď není dostupný. Údaje můžete vyplnit ručně.',
        });
    });
});
