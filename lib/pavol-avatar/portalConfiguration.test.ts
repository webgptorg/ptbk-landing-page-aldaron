import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { getAvatarPortalConfiguration } from './billing';
vi.mock('server-only',()=>({}));
afterEach(()=>vi.unstubAllEnvs());
function setup(raceValue?:string){
    const stored=new Map<string,string>();
    const from=vi.fn((table:string)=>{
        expect(table).toBe('avatar_settings');
        let key='';
        const q={select:()=>q,eq:(_column:string,value:string)=>{key=value;return q;},
            maybeSingle:async()=>({data:stored.has(key)?{value:stored.get(key)}:null,error:null}),
            single:async()=>({data:stored.has(key)?{value:stored.get(key)}:null,error:null}),
            upsert:async(value:{key:string;value:string})=>{if(!stored.has(value.key))stored.set(value.key,raceValue??value.value);return{error:null};}};
        return q;
    });
    const create=vi.fn(async(_params:unknown,options:{idempotencyKey:string})=>{
        const test=options.idempotencyKey.endsWith('-test');
        return {id:test?'bpc_AvatarTest':'bpc_AvatarLive',livemode:!test};
    });
    const update=vi.fn();
    const stripe={billingPortal:{configurations:{create,update}}} as unknown as Stripe;
    return {db:{from} as unknown as SupabaseClient,stripe,stored,create,update,from};
}
describe('avatar-owned Stripe portal configuration',()=>{
    it('lazily creates a separate safe configuration and reuses its persisted ID without changing shared portals',async()=>{
        vi.stubEnv('PAVOL_AVATAR_PORTAL_CONFIGURATION_ID','');const s=setup();
        expect(await getAvatarPortalConfiguration(s.db,s.stripe,false)).toBe('bpc_AvatarLive');
        expect(await getAvatarPortalConfiguration(s.db,s.stripe,false)).toBe('bpc_AvatarLive');
        expect(s.create).toHaveBeenCalledTimes(1);
        expect(s.create).toHaveBeenCalledWith(expect.objectContaining({
            metadata:{product:'pavol-avatar',version:'2026-11-17-v1'},
            business_profile:expect.objectContaining({headline:'Pavolův AI avatar',privacy_policy_url:'https://pavolhejny.cz/avatar/legal/privacy/2026-11-17-v1'}),
            features:expect.objectContaining({subscription_cancel:{enabled:true,mode:'at_period_end'},subscription_update:{enabled:false},customer_update:{enabled:false}}),
        }),{idempotencyKey:'pavol-avatar-portal-v1-live'});
        expect(s.update).not.toHaveBeenCalled();expect(s.stored.get('stripe_portal_live')).toBe('bpc_AvatarLive');
    });
    it('keeps live and test configurations separate',async()=>{
        vi.stubEnv('PAVOL_AVATAR_PORTAL_CONFIGURATION_ID','');const s=setup();
        expect(await getAvatarPortalConfiguration(s.db,s.stripe,true)).toBe('bpc_AvatarTest');
        expect(await getAvatarPortalConfiguration(s.db,s.stripe,false)).toBe('bpc_AvatarLive');
        expect(s.stored.size).toBe(2);expect(s.create).toHaveBeenCalledTimes(2);
    });
    it('returns the winner of a concurrent first insert without overwriting it',async()=>{
        vi.stubEnv('PAVOL_AVATAR_PORTAL_CONFIGURATION_ID','');const s=setup('bpc_ConcurrentWinner');
        expect(await getAvatarPortalConfiguration(s.db,s.stripe,false)).toBe('bpc_ConcurrentWinner');
        expect(s.stored.get('stripe_portal_live')).toBe('bpc_ConcurrentWinner');expect(s.update).not.toHaveBeenCalled();
    });
    it('retains an explicit dedicated override without touching Stripe or the settings table',async()=>{
        vi.stubEnv('PAVOL_AVATAR_PORTAL_CONFIGURATION_ID','bpc_ExplicitAvatar');const s=setup();
        expect(await getAvatarPortalConfiguration(s.db,s.stripe,false)).toBe('bpc_ExplicitAvatar');
        expect(s.create).not.toHaveBeenCalled();expect(s.from).not.toHaveBeenCalled();
    });
});
