import { beforeEach,afterEach,describe,expect,it,vi } from 'vitest';
import { GET } from './route';
vi.mock('server-only',()=>({}));
const mock=vi.hoisted(()=>({principal:vi.fn(),from:vi.fn(),eq:vi.fn()}));
vi.mock('@/lib/pavol-avatar/auth',()=>({getAvatarPrincipal:mock.principal}));
vi.mock('@/lib/pavol-avatar/database',()=>({getAvatarDatabase:()=>({from:mock.from})}));
const orderId='3d8ba688-7501-45e8-89e4-0fa05dd025df';
function request(){return new Request('https://pavolhejny.cz/api/pavol-avatar/confirmation?id='+orderId);}
function query(data:unknown){const q:{[key:string]:unknown}={select:()=>q,eq:mock.eq,order:()=>q,maybeSingle:async()=>({data,error:null}),then:(resolve:(v:unknown)=>unknown)=>Promise.resolve({data,error:null}).then(resolve)};mock.eq.mockReturnValue(q);return q;}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('PAVOL_AVATAR_ENABLED','true');});
afterEach(()=>vi.unstubAllEnvs());
describe('avatar accepted contract export',()=>{
    it('rejects an unauthenticated download',async()=>{
        mock.principal.mockResolvedValue(null);
        expect((await GET(request())).status).toBe(401);expect(mock.from).not.toHaveBeenCalled();
    });
    it('queries the verified owner and returns recorded accepted text instead of current public terms',async()=>{
        mock.principal.mockResolvedValue({id:'owner',email:'person@example.test'});
        const saved={id:orderId,legal_snapshot:{terms:{markdown:'Original accepted text'}}};
        mock.from.mockImplementation((table:string)=>query(table==='avatar_orders'?saved:[]));
        const response=await GET(request());
        expect(response.status).toBe(200);
        expect(mock.eq).toHaveBeenCalledWith('principal_id','owner');
        expect(((await response.json()) as {order:{legal_snapshot:{terms:{markdown:string}}}}).order.legal_snapshot.terms.markdown).toBe('Original accepted text');
        expect(response.headers.get('content-disposition')).toContain('attachment;');
    });
});
