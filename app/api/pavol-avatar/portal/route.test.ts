import { beforeEach,afterEach,describe,expect,it,vi } from 'vitest';
import { POST } from './route';
vi.mock('server-only',()=>({}));
const mocks=vi.hoisted(()=>({principal:vi.fn(),from:vi.fn(),eq:vi.fn(),configuration:vi.fn(),create:vi.fn()}));
vi.mock('@/lib/pavol-avatar/auth',()=>({getAvatarPrincipal:mocks.principal}));
vi.mock('@/lib/pavol-avatar/database',()=>({getAvatarDatabase:()=>({from:mocks.from})}));
vi.mock('@/lib/pavol-avatar/billing',()=>({getAvatarPortalConfiguration:mocks.configuration}));
vi.mock('@/lib/payments/stripeGateway',()=>({getStripeGatewayOrNull:()=>({stripe:{billingPortal:{sessions:{create:mocks.create}}}})}));
const ownId='6342bb55-9a81-4131-9aa6-e57d3b93a6ff';
function request(body:unknown={id:ownId}){return new Request('https://pavolhejny.cz/api/pavol-avatar/portal',{method:'POST',headers:{origin:'https://pavolhejny.cz','Content-Type':'application/json'},body:JSON.stringify(body)});}
function order(value:unknown){let requested='';const q={select:()=>q,eq:(key:string,value:string)=>{mocks.eq(key,value);if(key==='id')requested=value;return q;},not:()=>q,maybeSingle:async()=>({data:requested===ownId?value:null,error:null})};mocks.from.mockReturnValue(q);}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('PAVOL_AVATAR_ENABLED','true');mocks.configuration.mockResolvedValue('bpc_Avatar');mocks.create.mockResolvedValue({url:'https://billing.stripe.com/own-avatar'});});
afterEach(()=>vi.unstubAllEnvs());
describe('avatar portal ownership boundary',()=>{
    it('does not create configurations for an anonymous caller',async()=>{
        mocks.principal.mockResolvedValue(null);expect((await POST(request())).status).toBe(401);
        expect(mocks.configuration).not.toHaveBeenCalled();expect(mocks.create).not.toHaveBeenCalled();
    });
    it('does not provision a portal without an owned avatar customer',async()=>{
        mocks.principal.mockResolvedValue({id:'person',email:'person@example.test'});order(null);
        expect((await POST(request())).status).toBe(404);expect(mocks.configuration).not.toHaveBeenCalled();
    });
    it('requires an explicit order and rejects an unrelated order',async()=>{
        mocks.principal.mockResolvedValue({id:'person',email:'person@example.test'});order({stripe_customer_id:'cus_Avatar'});
        expect((await POST(request({}))).status).toBe(400);
        expect((await POST(request({id:'6342bb55-9a81-4131-9aa6-e57d3b93a6fe'}))).status).toBe(404);
        expect(mocks.configuration).not.toHaveBeenCalled();
    });
    it('opens only the exact owned avatar customer with the dedicated configuration',async()=>{
        mocks.principal.mockResolvedValue({id:'person',email:'person@example.test'});order({stripe_customer_id:'cus_Avatar',stripe_subscription_id:'sub_Avatar'});
        expect((await POST(request())).status).toBe(200);
        expect(mocks.eq).toHaveBeenCalledWith('id',ownId);expect(mocks.eq).toHaveBeenCalledWith('principal_id','person');
        expect(mocks.create).toHaveBeenCalledWith({customer:'cus_Avatar',configuration:'bpc_Avatar',return_url:'https://pavolhejny.cz/avatar'});
        expect(mocks.from).toHaveBeenCalledWith('avatar_orders');
    });
});
