import { afterEach,describe,expect,it,vi } from 'vitest';
import { avatarCalendarPeriod,getAvatarAccess } from './access';
vi.mock('server-only',()=>({}));
const mocks=vi.hoisted(()=>({from:vi.fn()}));
vi.mock('./database',()=>({getAvatarDatabase:()=>({from:mocks.from})}));
afterEach(()=>{vi.unstubAllEnvs();vi.useRealTimers();});
function query(data:unknown,error:null|object=null){const q:{[key:string]:unknown}={};for(const method of ['select','eq','gt','in','order','limit'])q[method]=vi.fn(()=>q);q.maybeSingle=vi.fn(async()=>({data:Array.isArray(data)?data[0]??null:data,error}));q.then=(resolve:(value:unknown)=>unknown)=>Promise.resolve({data,error}).then(resolve);return q;}
function fixture(refunded:number,member:boolean){
    const future='2026-12-17T00:00:00.000Z';
    const q={avatar_orders:query([{id:'order',status:'active',cancel_at_period_end:true,paid_through:future,stripe_subscription_id:'sub',usage_limits:{full:500}}]),
    avatar_invoices:query([{order_id:'order',amount_paid:100000,refunded_amount:refunded,paid_through:future}]),
    community_memberships:query(member?[{status:'active',current_period_ends_at:future}]:[]),avatar_usage:query([{used:7}])};
    mocks.from.mockImplementation((table:keyof typeof q)=>q[table]);return q;
}
describe('avatar product rights',()=>{
    it('keeps a canceled renewal usable through its paid period and shares one monthly usage counter',async()=>{
        vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-17T12:00:00Z'));
        vi.stubEnv('PAVOL_AVATAR_FULL_MONTHLY_LIMIT','1');
        fixture(0,false);
        expect(await getAvatarAccess({id:'person',email:'person@example.test'})).toMatchObject({plan:'full',limit:500,used:7,subscription:{cancelAtPeriodEnd:true}});
    });
    it('falls back to the paid Developers benefit after a full refund, never to another product subscription',async()=>{
        vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-17T12:00:00Z'));
        const q=fixture(100000,true);
        expect((await getAvatarAccess({id:'person',email:'person@example.test'})).plan).toBe('light');
        expect(q.community_memberships.eq).toHaveBeenCalledWith('community_id','vyvojari');
        expect(q.community_memberships.eq).toHaveBeenCalledWith('email','person@example.test');
    });
    it('returns Free after refund without an eligible membership',async()=>{
        vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-17T12:00:00Z'));fixture(100000,false);
        expect((await getAvatarAccess({id:'person',email:'person@example.test'})).plan).toBe('free');
        expect(avatarCalendarPeriod()).toEqual({periodStart:'2026-11-01T00:00:00.000Z',periodEnd:'2026-12-01T00:00:00.000Z'});
    });
});
