import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({request:vi.fn()}));
vi.mock('./twentyContactApi',()=>({createTwentyContactApi:()=>({request:mocks.request})}));
import {ensureTwentyCommerceSchema} from './twentyCommerceSchema';
import type {TwentyContactApiSettings} from './twentyContactApi';
const settings={} as TwentyContactApiSettings;
describe('commerce metadata API compatibility',()=>{
    beforeEach(()=>{vi.useFakeTimers();vi.clearAllMocks();});
    afterEach(()=>vi.useRealTimers());
    it.each([false,true])('sets up metadata and replays without writes (legacy=%s)',async(legacy)=>{
        const objects:any[]=[{id:'person',nameSingular:'person',fields:[]},{id:'company',nameSingular:'company',fields:[]}];
        let writes=0;
        mocks.request.mockImplementation(async(path:string,method:string,body:any)=>{
            if(method==='GET')return {data:legacy?{objects}:objects,pageInfo:{hasNextPage:false,endCursor:null}};
            writes++;
            if(path==='metadata/objects'){
                const object={id:'object-'+writes,...body,fields:[]};objects.push(object);
                return legacy?{data:{createOneObject:object}}:object;
            }
            const field={id:'field-'+writes,...body};
            return legacy?{data:{createOneField:field}}:field;
        });
        const first=ensureTwentyCommerceSchema(settings,true);
        await vi.runAllTimersAsync();await first;
        expect(writes).toBeGreaterThan(30);
        expect(objects).toHaveLength(4);
        const before=writes;
        await ensureTwentyCommerceSchema(settings,true);
        expect(writes).toBe(before);
        expect(objects.find(o=>o.nameSingular==='ptbkPurchase').fields).toEqual(expect.arrayContaining([
            expect.objectContaining({name:'person',type:'RELATION'}),
            expect.objectContaining({name:'company',type:'RELATION'}),
        ]));
    });
    it('rejects a repeated pagination cursor instead of looping or writing',async()=>{
        mocks.request.mockResolvedValue({data:[],pageInfo:{hasNextPage:true,endCursor:'same'}});
        await expect(ensureTwentyCommerceSchema(settings,true)).rejects.toThrow('commerce_invalid_metadata_cursor');
        expect(mocks.request).toHaveBeenCalledTimes(2);
        expect(mocks.request.mock.calls.every(call=>call[1]==='GET')).toBe(true);
        expect(mocks.request.mock.calls[1][0]).toContain('starting_after=same');
    });
});
