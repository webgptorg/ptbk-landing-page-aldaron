import type Stripe from 'stripe';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { ensureAvatarStripeWebhook,AVATAR_REQUIRED_STRIPE_EVENTS } from './webhookPreflight';
import { createAvatarCheckout } from './billing';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({gateway:vi.fn(),database:vi.fn()}));
vi.mock('@/lib/payments/stripeGateway',()=>({getStripeGatewayOrNull:state.gateway}));
vi.mock('./database',()=>({getAvatarDatabase:state.database}));
vi.mock('@/lib/legal/productLegalAvatar',()=>({avatarLegalContractSnapshot:()=>({})}));
vi.mock('@/lib/promptbook-billing/billingIdentity',()=>({resolvePromptbookCheckoutIdentity:async(input:unknown)=>({...input as object,companyId:null,vatId:null,taxTreatment:'domestic'})}));
beforeEach(()=>{
    vi.clearAllMocks();vi.stubEnv('PAVOL_AVATAR_STRIPE_WEBHOOK_URL','');
    vi.stubEnv('PAVOL_AVATAR_ENABLED','true');vi.stubEnv('PAVOL_AVATAR_BILLING_ENABLED','true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://project.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','service');vi.stubEnv('STRIPE_SECRET_KEY','sk_test_fake');
    vi.stubEnv('STRIPE_WEBHOOK_SIGNING_SECRET','whsec_fake');
});
afterEach(()=>vi.unstubAllEnvs());
const endpoint=(events:readonly string[],overrides:Record<string,unknown>={})=>({id:'we_Shared',url:'https://www.ptbk.io/api/stripe/webhook',livemode:true,status:'enabled',enabled_events:[...events],...overrides});
function stripeFor(endpoints:ReturnType<typeof endpoint>[]){
    const list=vi.fn().mockResolvedValue({data:endpoints,has_more:false});
    const retrieve=vi.fn().mockResolvedValue(endpoints[0]);
    const update=vi.fn(async(_id:string,params:{enabled_events:string[]})=>({...endpoints[0],enabled_events:params.enabled_events}));
    const customer=vi.fn();const session=vi.fn();
    const stripe={webhookEndpoints:{list,retrieve,update},customers:{create:customer},checkout:{sessions:{create:session}}};
    return {stripe:stripe as unknown as Stripe,list,retrieve,update,customer,session};
}
describe('additive shared Stripe webhook preflight',()=>{
    it('leaves an already complete endpoint and all its settings untouched',async()=>{
        const s=stripeFor([endpoint(AVATAR_REQUIRED_STRIPE_EVENTS)]);
        await ensureAvatarStripeWebhook(s.stripe,false);
        expect(s.update).not.toHaveBeenCalled();expect(s.retrieve).not.toHaveBeenCalled();
    });
    it('also leaves a wildcard endpoint untouched',async()=>{
        const s=stripeFor([endpoint(['*'])]);await ensureAvatarStripeWebhook(s.stripe,false);expect(s.update).not.toHaveBeenCalled();
    });
    it('appends missing events while preserving legacy events and a recently added event',async()=>{
        const s=stripeFor([endpoint(['checkout.session.completed','payment_intent.succeeded'])]);
        s.retrieve.mockResolvedValue(endpoint(['checkout.session.completed','payment_intent.succeeded','customer.created']));
        await ensureAvatarStripeWebhook(s.stripe,false);
        expect(s.update).toHaveBeenCalledWith('we_Shared',{enabled_events:expect.arrayContaining([...AVATAR_REQUIRED_STRIPE_EVENTS,'payment_intent.succeeded','customer.created'])});
        expect(Object.keys(s.update.mock.calls[0][1])).toEqual(['enabled_events']);
    });
    it('refuses ambiguous or untrusted endpoints without changing any configuration',async()=>{
        const s=stripeFor([endpoint([]),endpoint([],{id:'we_Another',url:'https://pavolhejny.cz/api/stripe/webhook'})]);
        await expect(ensureAvatarStripeWebhook(s.stripe,false)).rejects.toMatchObject({status:503});
        expect(s.update).not.toHaveBeenCalled();
        s.list.mockResolvedValue({data:[endpoint([],{url:'https://evil.example/api/stripe/webhook'})],has_more:false});
        await expect(ensureAvatarStripeWebhook(s.stripe,false)).rejects.toMatchObject({status:503});
        expect(s.update).not.toHaveBeenCalled();
    });
    it.each(['untrusted','permissions'])('fails closed before any order/customer/checkout creation when %s cannot be verified',async(kind)=>{
        const s=stripeFor([]);
        if(kind==='permissions')s.list.mockRejectedValue(new Error('forbidden'));
        state.gateway.mockReturnValue({stripe:s.stripe});
        const input={requestId:'91ec27cd-498f-4e29-bf6e-4e5aa2f0a2d0',fullname:'Person',country:'CZ' as const,customerType:'individual' as const,billingName:'Person',billingAddress:{line1:'Street 1',city:'Praha',postal_code:'11000',country:'CZ' as const},termsAccepted:true as const,immediateStartAccepted:true as const,termsVersion:'2026-11-17-v1' as const};
        await expect(createAvatarCheckout(new Request('https://pavolhejny.cz/api'),{id:'person',email:'person@example.test'},input)).rejects.toMatchObject({status:503});
        expect(state.database).not.toHaveBeenCalled();expect(s.customer).not.toHaveBeenCalled();expect(s.session).not.toHaveBeenCalled();
    });
});
