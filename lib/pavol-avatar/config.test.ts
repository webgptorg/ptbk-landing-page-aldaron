import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertAvatarRequest, getAvatarAvailability, readAvatarJson } from './config';
vi.mock('server-only',()=>({}));
afterEach(()=>vi.unstubAllEnvs());
describe('avatar configuration and browser boundary',()=>{
    it('keeps existing products and avatar sales off until explicitly enabled and configured',()=>{
        vi.stubEnv('PAVOL_AVATAR_ENABLED','');
        expect(getAvatarAvailability().enabled).toBe(false);
        expect(getAvatarAvailability().billingEnabled).toBe(false);
        vi.stubEnv('PAVOL_AVATAR_ENABLED','true');
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://project.supabase.co');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','service');
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','anon');
        expect(getAvatarAvailability().authEnabled).toBe(true);
        expect(getAvatarAvailability().billingEnabled).toBe(false);
        expect(getAvatarAvailability().limits).toEqual({free:5,light:50,full:500});
    });
    it('rejects cross-site mutations and other ecosystem hosts',()=>{
        vi.stubEnv('PAVOL_AVATAR_ENABLED','true');
        expect(()=>assertAvatarRequest(new Request('https://pavolhejny.cz/api/pavol-avatar/auth',{headers:{origin:'https://evil.example'}}))).toThrow();
        expect(()=>assertAvatarRequest(new Request('https://www.ptbk.io/api/pavol-avatar/auth',{headers:{origin:'https://www.ptbk.io'}}))).toThrow();
        expect(()=>assertAvatarRequest(new Request('https://pavolhejny.cz/api/pavol-avatar/auth',{headers:{origin:'https://pavolhejny.cz'}}))).not.toThrow();
    });
    it('bounds streamed bodies before JSON parsing',async()=>{
        await expect(readAvatarJson(new Request('https://pavolhejny.cz/api',{method:'POST',body:JSON.stringify({value:'x'.repeat(4000)})}),100)).rejects.toMatchObject({status:413});
    });
});
