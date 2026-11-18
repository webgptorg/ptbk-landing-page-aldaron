import { expect,it,vi } from 'vitest';
const fakes=vi.hoisted(() => ({database:vi.fn()}));
vi.mock('./accounts',() => ({licenseDatabase:fakes.database}));
import { loadLicenseDetail } from './adminData';

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
