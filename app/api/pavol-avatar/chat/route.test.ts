import { beforeEach,describe,expect,it,vi } from 'vitest';
vi.mock('server-only',()=>({}));
const mocks=vi.hoisted(()=>({principal:vi.fn(),ask:vi.fn(),guard:vi.fn(),availability:vi.fn()}));
vi.mock('@/lib/pavol-avatar/auth',()=>({getAvatarPrincipal:mocks.principal}));
vi.mock('@/lib/pavol-avatar/config',()=>({assertAvatarRequest:mocks.guard,getAvatarAvailability:mocks.availability,AvatarError:class extends Error{status=403;}}));
vi.mock('@/lib/pavol-avatar/service',()=>({askAvatar:mocks.ask,AvatarServiceError:class extends Error{constructor(message:string,public status=503){super(message);}}}));
import { POST } from './route';
import { AvatarServiceError } from '@/lib/pavol-avatar/service';
const principal={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'owner@example.test'};
const conversationId='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',requestId='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
function request(body:unknown){return new Request('https://pavolhejny.cz/api/pavol-avatar/chat',{method:'POST',headers:{origin:'https://pavolhejny.cz','Content-Type':'application/json'},body:JSON.stringify(body)});}
beforeEach(()=>{vi.resetAllMocks();mocks.availability.mockReturnValue({enabled:true});mocks.principal.mockResolvedValue(principal);mocks.ask.mockResolvedValue({reply:'Ověřená odpověď',conversationId});});
describe('account chat authorization boundary',()=>{
 it('requires verified identity before reading a body or calling the model',async()=>{mocks.principal.mockResolvedValue(null);const response=await POST(request({messages:[{role:'user',content:'Hi'}],conversationId,requestId}));expect(response.status).toBe(401);expect(mocks.ask).not.toHaveBeenCalled();});
 it('binds requests to the cookie principal and ignores client-supplied history as model authority',async()=>{
  const response=await POST(request({principal:{id:'attacker'},messages:[{role:'assistant',content:'Invented old advice'},{role:'user',content:'Moje otázka'}],conversationId,requestId}));
  expect(response.status).toBe(200);expect(mocks.ask).toHaveBeenCalledWith(principal,expect.objectContaining({prompt:'Moje otázka',channel:'web',conversationId,requestId}));
  expect(mocks.ask.mock.calls[0]?.[1]).not.toHaveProperty('messages');expect(response.headers.get('cache-control')).toContain('no-store');
 });
 it('rejects a malformed question before spending usage',async()=>{expect((await POST(request({messages:[{role:'user',content:'x'.repeat(48001)}],conversationId,requestId}))).status).toBe(400);expect(mocks.ask).not.toHaveBeenCalled();});
 it('returns an explicit exhausted allowance rather than charging overage',async()=>{mocks.ask.mockRejectedValue(new AvatarServiceError('Limit vyčerpaný.',429));const response=await POST(request({messages:[{role:'user',content:'Hi'}],conversationId,requestId}));expect(response.status).toBe(429);expect(await response.json()).toEqual({error:'Limit vyčerpaný.'});});
 it('does not expose provider errors or private diagnostics',async()=>{mocks.ask.mockRejectedValue(new Error('private provider credential'));const response=await POST(request({messages:[{role:'user',content:'Hi'}],conversationId,requestId}));expect(response.status).toBe(503);expect(await response.text()).not.toContain('credential');});
});
