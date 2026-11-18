import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest,NextResponse } from 'next/server';
import { capabilitiesForPlan } from '@/lib/promptbook-licensing/contract';
const fakes=vi.hoisted(() => ({guard:vi.fn(),identity:vi.fn(),rpc:vi.fn(),database:vi.fn()}));
vi.mock('@/lib/admin/adminApiGuard',() => ({getUnauthorizedResponseOrNull:fakes.guard}));
vi.mock('@/lib/admin/adminIdentity',() => ({getAdminIdentityForSession:fakes.identity}));
vi.mock('@/lib/promptbook-licensing/accounts',() => ({licenseDatabase:fakes.database}));
import { GET,POST } from './route';
import { GET as subscriptions } from '@/app/api/admin/promptbook-subscriptions/route';
const url='https://www.ptbk.io/api/admin/promptbook-licensing';
const input={action:'grant',requestId:'4408b4d6-6005-4b77-97eb-fdd67847ee91',email:' Customer@Example.test ',kind:'custom',label:'Pilot',capabilities:capabilitiesForPlan('business'),communitySeats:10,validFrom:'2026-11-18T00:00:00Z',validUntil:null,reason:'Partner pilot agreement',isTest:false};
const request=(body:unknown) => new NextRequest(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
beforeEach(() => {vi.resetAllMocks();fakes.guard.mockResolvedValue(null);fakes.identity.mockResolvedValue({isSuperAdmin:true,username:'owner-admin'});fakes.database.mockReturnValue({rpc:fakes.rpc});fakes.rpc.mockResolvedValue({data:input.requestId,error:null});});
afterEach(() => vi.unstubAllEnvs());
it('guards licence reads/writes and the unified subscription projection before touching private data',async () => {
    fakes.guard.mockResolvedValue(NextResponse.json({error:'Forbidden'},{status:403}));
    expect((await GET(new NextRequest(url))).status).toBe(403);
    expect((await POST(request(input))).status).toBe(403);
    expect((await subscriptions(new NextRequest('https://www.ptbk.io/api/admin/promptbook-subscriptions'))).status).toBe(403);
    expect(fakes.database).not.toHaveBeenCalled();
});
it('creates only one audited grant RPC with a stable retry ID and server-owned actor',async () => {
    const response=await POST(request(input));expect(response.status).toBe(200);
    expect(fakes.rpc).toHaveBeenCalledExactlyOnceWith('admin_mutate_promptbook_grant',expect.objectContaining({p_action:'grant',p_grant:input.requestId,p_email:'customer@example.test',p_actor:'owner-admin',p_is_test:false}));
    expect(response.headers.get('Cache-Control')).toContain('no-store');
});
it('refuses impossible dates, client payment fields and oversized bodies without writing',async () => {
    expect((await POST(request({...input,validUntil:'2026-11-17T00:00:00Z'}))).status).toBe(400);
    expect((await POST(request({...input,stripe_subscription_id:'sub_forged'}))).status).toBe(400);
    expect((await POST(request({...input,reason:'x'.repeat(17000)}))).status).toBe(400);
    expect(fakes.rpc).not.toHaveBeenCalled();
});
it('returns an explicit conflict for a stale edit and never reports a database failure as success',async () => {
    fakes.rpc.mockResolvedValue({error:{code:'40001'}});
    expect((await POST(request(input))).status).toBe(409);
    fakes.rpc.mockResolvedValue({error:{code:'XX000'}});
    expect((await POST(request(input))).status).toBe(503);
});
