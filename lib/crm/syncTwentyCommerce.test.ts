import {afterEach,describe,expect,it,vi} from 'vitest';
import {syncTwentyCommerce} from './syncTwentyCommerce';
import type {CommerceSnapshot,CommercePurchase,CommercePayment} from './commerceModel';
const buyer={key:'registration:CZ:12345678',name:'Jan Novák',registrationNumber:'12345678',country:'CZ'};
const purchase:CommercePurchase={key:'sub1',name:'Promptbook Business',product:'Business',status:'active',billingInterval:'month',email:'jan@acme.invalid',contactName:'Jan Novák',company:buyer,identityReview:null};
const receipt:CommercePayment={key:'payment1',purchaseKey:'sub1',name:'Business – listopad',paidAt:'2026-11-01T10:00:00Z',currency:'czk',amountPaidMinor:100000,refundedAmountMinor:0,state:'paid',source:'Stripe'};
function memoryApi(){
    const records:Record<string,Record<string,unknown>[]>={people:[{id:'jan',emails:{primaryEmail:'jan@acme.invalid'},name:{firstName:'Jan',lastName:'Novák'},companyId:null},
        {id:'eva',emails:{additionalEmails:['eva@acme.invalid']},name:{firstName:'Eva',lastName:'Nováková'},companyId:null}],companies:[],ptbkPurchases:[],ptbkPayments:[]};
    const singular:Record<string,string>={people:'person',companies:'company',ptbkPurchases:'ptbkPurchase',ptbkPayments:'ptbkPayment'};
    vi.stubGlobal('fetch',async(url:URL,options:RequestInit)=>{
        const [, , plural,id]=url.pathname.split('/');
        const rows=records[plural];
        if(!rows) throw new Error('unexpected route '+url.pathname);
        if(options.method==='GET'){
            if(id)return Response.json({data:{[singular[plural]]:rows.find(row=>row.id===id)}});
            const selected=url.searchParams.get('fields')?.split(',');
            // Native Twenty REST expands an empty Currency into null subfields.
            const restRows=rows.map(row=>plural==='people' ? {...row,ptbkPersonalPaid:row.ptbkPersonalPaid ?? {amountMicros:null,currencyCode:null}} : row);
            const projected=selected ? restRows.map(row=>Object.fromEntries(Object.entries(row).filter(([key])=>key==='id'||selected.includes(key)))) : restRows;
            return Response.json({data:{[plural]:projected},pageInfo:{hasNextPage:false,endCursor:null}});
        }
        const body=JSON.parse(options.body as string) as Record<string,unknown>;
        const capital=singular[plural][0].toUpperCase()+singular[plural].slice(1);
        if(options.method==='POST'){rows.push(body);return Response.json({data:{['create'+capital]:body}});}
        if(options.method==='PATCH'){const row=rows.find(row=>row.id===id)!;Object.assign(row,body);return Response.json({data:{['update'+capital]:row}});}
        throw new Error('unexpected method');
    });
    return records;
}
afterEach(()=>vi.unstubAllGlobals());
describe('CRM purchase and payment attribution',()=>{
    it('shows a sole trader as a company and contact, combines multiple company contacts and replays without extra records',async()=>{
        const records=memoryApi();
        const snapshot:CommerceSnapshot={purchases:[purchase,{...purchase,key:'sub2',email:'eva@acme.invalid',contactName:'Eva Nováková'},
            {...purchase,key:'personal',company:null}],payments:[receipt,{...receipt,key:'payment2',paidAt:'2026-12-01T10:00:00Z'},
            {...receipt,key:'payment3',purchaseKey:'sub2',amountPaidMinor:50000},{...receipt,key:'payment4',purchaseKey:'personal',amountPaidMinor:20000}]};
        const settings={url:new URL('https://crm.invalid'),key:'test'};
        const first=await syncTwentyCommerce(settings,snapshot,true);
        expect(first).toMatchObject({purchases:3,payments:4,companies:1,contacts:2,needsReview:0,verified:4});
        expect(records.companies[0]).toMatchObject({ptbkPaid:{amountMicros:'2500000000',currencyCode:'CZK'},ptbkPaymentCount:3});
        expect(records.people[0]).toMatchObject({ptbkPaid:{amountMicros:'2200000000'},ptbkPersonalPaid:{amountMicros:'200000000'},companyId:records.companies[0].id});
        expect(records.people[1]).toMatchObject({ptbkPaid:{amountMicros:'500000000'},companyId:records.companies[0].id});
        const replay=await syncTwentyCommerce(settings,snapshot,true);
        expect(replay.writes).toBe(0);
        expect(records.ptbkPayments).toHaveLength(4);
        expect(records.ptbkPurchases).toHaveLength(3);
        expect(records.companies).toHaveLength(1);
    });
    it('updates partial refunds without decreasing gross lifetime spend',async()=>{
        const records=memoryApi();
        const settings={url:new URL('https://crm.invalid'),key:'test'};
        await syncTwentyCommerce(settings,{purchases:[purchase],payments:[receipt]},true);
        await syncTwentyCommerce(settings,{purchases:[purchase],payments:[{...receipt,refundedAmountMinor:30000,state:'partially_refunded'}]},true);
        expect(records.companies[0]).toMatchObject({ptbkPaid:{amountMicros:'1000000000'},ptbkRefunded:{amountMicros:'300000000'}});
        expect(records.ptbkPayments).toHaveLength(1);
    });
    it('keeps currencies separate and never invents an exchange rate',async()=>{
        const records=memoryApi();
        await syncTwentyCommerce({url:new URL('https://crm.invalid'),key:'test'},{purchases:[purchase],payments:[receipt,{...receipt,key:'usd',currency:'usd',amountPaidMinor:1900}]},true);
        expect(records.companies[0].ptbkPaid).toBeNull();
        expect(records.companies[0].ptbkTotalsByCurrency).toContain('USD');
        expect(records.ptbkPayments).toHaveLength(2);
    });
    it('does not rewrite an empty personal Currency returned by Twenty for a business contact',async()=>{
        const records=memoryApi();
        const settings={url:new URL('https://crm.invalid'),key:'test'};
        const snapshot={purchases:[purchase],payments:[receipt]};
        await syncTwentyCommerce(settings,snapshot,true);
        expect(records.people[0].ptbkPersonalPaid).toBeNull();
        expect((await syncTwentyCommerce(settings,snapshot,true)).writes).toBe(0);
        await syncTwentyCommerce(settings,{purchases:[{...purchase,company:null}],payments:[receipt]},true);
        expect(records.people[0].ptbkPersonalPaid).toMatchObject({amountMicros:'1000000000',currencyCode:'CZK'});
    });
    it('preserves existing employment when a contact buys for one different company',async()=>{
        const records=memoryApi(); records.people[0].companyId='existing-employer';
        const settings={url:new URL('https://crm.invalid'),key:'test'};
        const snapshot={purchases:[purchase],payments:[receipt]};
        await syncTwentyCommerce(settings,snapshot,true);
        expect(records.people[0].companyId).toBe('existing-employer');
        expect((await syncTwentyCommerce(settings,snapshot,true)).writes).toBe(0);
    });
    it('preserves existing company affiliation when one contact buys for two companies',async()=>{
        const records=memoryApi(); records.people[0].companyId='existing-company';
        await syncTwentyCommerce({url:new URL('https://crm.invalid'),key:'test'},{purchases:[purchase,{...purchase,key:'other',company:{...buyer,key:'registration:CZ:87654321',name:'Other Ltd',registrationNumber:'87654321'}}],
            payments:[receipt,{...receipt,key:'other-payment',purchaseKey:'other'}]},true);
        expect(records.people[0].companyId).toBe('existing-company');
        expect(records.companies).toHaveLength(2);
        expect(new Set(records.ptbkPurchases.map(row=>row.companyId)).size).toBe(2);
    });
});
