import { beforeEach,afterEach,describe,expect,it,vi } from 'vitest';
import { verifyAvatarEmail,sendAvatarEmail,getAvatarPrincipal } from './auth';
vi.mock('server-only',()=>({}));
const mock=vi.hoisted(()=>({verifyOtp:vi.fn(),signInWithOtp:vi.fn(),from:vi.fn(),client:vi.fn()}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth:{verifyOtp:mock.verifyOtp,signInWithOtp:mock.signInWithOtp}})}));
vi.mock('./database',()=>({getAvatarDatabase:()=>({from:mock.from})}));
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('PAVOL_AVATAR_ENABLED','true');vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://project.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','anon');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','service');vi.stubEnv('PAVOL_AVATAR_EMAIL_API_KEY','');vi.stubEnv('PAVOL_AVATAR_EMAIL_FROM','');});
afterEach(()=>vi.unstubAllEnvs());
describe('verified avatar identity',()=>{
    it('rejects a provider user whose mailbox does not match the claimed address',async()=>{
        mock.verifyOtp.mockResolvedValue({data:{user:{email:'other@example.test',email_confirmed_at:'2026-11-17'}},error:null});
        await expect(verifyAvatarEmail({email:'person@example.test',code:'123456'})).rejects.toMatchObject({status:403});
        expect(mock.from).not.toHaveBeenCalled();
    });
    it('rejects unconfirmed provider accounts without creating a local account',async()=>{
        mock.verifyOtp.mockResolvedValue({data:{user:{email:'person@example.test',email_confirmed_at:null}},error:null});
        await expect(verifyAvatarEmail({email:'person@example.test',code:'123456'})).rejects.toMatchObject({status:403});
        expect(mock.from).not.toHaveBeenCalled();
    });
    it('preserves a delivery rate-limit failure instead of reporting a sent code',async()=>{
        mock.signInWithOtp.mockResolvedValue({error:{status:429}});
        await expect(sendAvatarEmail(new Request('https://pavolhejny.cz/api'), 'person@example.test')).rejects.toMatchObject({status:429});
    });
    it('never treats a typed identity or forged cookie as authenticated',async()=>{
        expect(await getAvatarPrincipal(new Request('https://pavolhejny.cz/api',{headers:{cookie:'email=person@example.test; pavol_avatar_session=forged'}}))).toBeNull();
        expect(mock.from).not.toHaveBeenCalled();
    });
});
