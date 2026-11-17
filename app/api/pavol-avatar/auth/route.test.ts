import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { POST } from './route';
const mocks=vi.hoisted(()=>({send:vi.fn(),verify:vi.fn(),session:vi.fn(),rate:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('@/lib/pavol-avatar/auth',()=>({
    allowAvatarAuthAttempt:mocks.rate, sendAvatarEmail:mocks.send, verifyAvatarEmail:mocks.verify,
    createAvatarSession:mocks.session, clearAvatarSession:vi.fn(),
}));
function request(body:unknown){return new Request('https://pavolhejny.cz/api/pavol-avatar/auth',{method:'POST',headers:{origin:'https://pavolhejny.cz','Content-Type':'application/json'},body:JSON.stringify(body)});}
beforeEach(()=>{vi.stubEnv('PAVOL_AVATAR_ENABLED','true');vi.clearAllMocks();mocks.rate.mockResolvedValue(undefined);});
afterEach(()=>vi.unstubAllEnvs());
describe('avatar passwordless ownership verification',()=>{
    it('does not claim delivery or create a session when the mail provider fails',async()=>{
        mocks.send.mockRejectedValue(new Error('provider unavailable'));
        const result=await POST(request({email:'person@example.test'}));
        expect(result.status).toBe(503);
        expect(await result.json()).not.toHaveProperty('isCodeSent');
        expect(mocks.session).not.toHaveBeenCalled();
    });
    it('requires valid verification before creating application identity/session',async()=>{
        mocks.verify.mockRejectedValue(new Error('invalid OTP'));
        const result=await POST(request({email:'person@example.test',code:'123456'}));
        expect(result.status).toBe(503);
        expect(mocks.session).not.toHaveBeenCalled();
    });
    it('does not downgrade a malformed code into another email send',async()=>{
        const result=await POST(request({email:'person@example.test',code:'invalid'}));
        expect(result.status).toBe(400);expect(mocks.send).not.toHaveBeenCalled();
    });
    it('can verify a one-time link without changing shared OTP templates',async()=>{
        mocks.verify.mockResolvedValue('person@example.test');mocks.session.mockResolvedValue({id:'person',email:'person@example.test'});
        const result=await POST(request({tokenHash:'a'.repeat(64),email:'person@example.test'}));
        expect(result.status).toBe(200);expect(mocks.verify).toHaveBeenCalledWith({tokenHash:'a'.repeat(64),email:'person@example.test'});
        expect(mocks.session).toHaveBeenCalled();
    });
});
