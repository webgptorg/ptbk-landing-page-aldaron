import { expect,it,vi } from 'vitest';
const fakes=vi.hoisted(() => ({database:vi.fn()}));
vi.mock('./accounts',() => ({licenseDatabase:fakes.database}));
import { loadLicenseDetail, loadSubscriptionDetail } from './adminData';

it('retains an exact paired order even beyond the account purchase preview',async () => {
    const license={id:'older',order_id:'older',email:'customer@example.test',is_test:false,account_id:null};
    const paired={id:'older',product:'promptbook',email:license.email,is_test:false};
    const recent=Array.from({length:101},(_,index) => ({id:`recent-${index}`,product:'promptbook',email:license.email,is_test:false}));
    fakes.database.mockReturnValue({from:(table:string) => {
        const filters:Record<string,unknown>={};
        const resolve=() => table === 'promptbook_admin_licenses' ? {data:license,error:null} : table === 'promptbook_admin_subscriptions' ? {data:filters.id ? paired : recent,error:null} : {data:table === 'promptbook_license_accounts' ? null : [],error:null};
        const builder={select:() => builder,eq:(key:string,value:unknown) => {filters[key]=value;return builder;},order:() => builder,limit:() => builder,maybeSingle:async () => resolve(),then:(success:(result:unknown) => unknown) => Promise.resolve(resolve()).then(success)};
        return builder;
    }});
    const detail=await loadLicenseDetail('older','subscription',false);
    expect(detail?.subscriptions[0]).toEqual(paired);
    expect(detail?.subscriptionsHasMore).toBe(true);
});

it('does not query or expose purchase records to an administrator with licences only', async () => {
    const from = vi.fn((table: string) => {
        const data = table === 'promptbook_admin_licenses' ? { id: 'licence', email: 'customer@example.test', order_id: 'paid-order' }
            : table === 'promptbook_license_accounts' ? null : [];
        const builder = { select: () => builder, eq: () => builder, order: () => builder, limit: () => builder,
            maybeSingle: async () => ({ data, error: null }), then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve) };
        return builder;
    });
    fakes.database.mockReturnValue({ from });
    const detail = await loadLicenseDetail('licence', 'subscription', false, false);
    expect(detail?.subscriptions).toEqual([]);
    expect(detail?.subscriptionsHasMore).toBe(false);
    expect(from).not.toHaveBeenCalledWith('promptbook_admin_subscriptions');
});

it('does not query licence records for a subscription-only administrator', async () => {
    const from = vi.fn((table: string) => {
        const data = table === 'promptbook_admin_subscriptions' ? { id: 'order', product: 'promptbook' } : [];
        const builder = { select: () => builder, eq: () => builder, order: () => builder, range: () => builder,
            maybeSingle: async () => ({ data, error: null }), then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve) };
        return builder;
    });
    fakes.database.mockReturnValue({ from });
    expect((await loadSubscriptionDetail('order', 'promptbook', false, 0, false))?.licenses).toEqual([]);
    expect(from).not.toHaveBeenCalledWith('promptbook_admin_licenses');
});
