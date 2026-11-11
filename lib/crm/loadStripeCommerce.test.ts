import {describe,expect,it} from 'vitest';
import type Stripe from 'stripe';
import {loadStripeCommerce} from './loadStripeCommerce';
import {commerceTotals} from './commerceModel';
const charge={id:'ch_1',livemode:true,paid:true,captured:true,status:'succeeded',amount_captured:39900,amount_refunded:0,currency:'czk',created:1794300000,customer:'cus_1',payment_intent:'pi_1',billing_details:{email:'jan@acme.invalid',name:'Jan Novák',address:{country:'CZ'}},receipt_email:null,description:'Start',disputed:false,refunded:false};
const invoice={id:'in_1',livemode:true,amount_paid:39900,parent:{subscription_details:{subscription:'sub_1'}},customer_email:'jan@acme.invalid',customer_name:'Jan Novák',lines:{data:[{description:'Promptbook Start (listopad)'}]}};
const subscription={id:'sub_1',livemode:true,status:'active',customer:{id:'cus_1',email:'jan@acme.invalid',name:'Jan Novák'},metadata:{},items:{data:[{price:{product:{name:'Promptbook Start',metadata:{product:'promptbook'}},recurring:{interval:'month'}}}]}};
function provider(invoices:object[],charges:object[],invoicePayments:object[]) {
    const iterable=(data:object[])=>({async *[Symbol.asyncIterator](){yield* data;}});
    return {invoices:{list:()=>iterable(invoices)},charges:{list:()=>iterable(charges)},subscriptions:{retrieve:async()=>subscription},invoicePayments:{list:()=>iterable(invoicePayments)}} as unknown as Stripe;
}
const db=(orders:object[]=[])=>({query:async()=>({rows:orders})}) as Parameters<typeof loadStripeCommerce>[0];
describe('live Stripe commerce snapshot',()=>{
    it('counts invoice receipts once when also returned by the charges endpoint',async()=>{
        const snapshot=await loadStripeCommerce(db(),provider([invoice],[charge],[{payment:{charge:'ch_1'}}]));
        expect(snapshot.purchases).toHaveLength(1);expect(snapshot.payments).toHaveLength(1);
        expect(commerceTotals(snapshot.payments)).toMatchObject([{paidMinor:39900,paymentCount:1}]);
        expect(snapshot.payments[0].name).toContain('listopad');
        expect(snapshot.purchases[0].company).toBeNull();
    });
    it('uses the legal billing company and independently records its contact',async()=>{
        const snapshot=await loadStripeCommerce(db([{id:'order',stripe_subscription_id:'sub_1',customer_type:'business',company_id:'12345678',company_name:'ACME s.r.o.',country:'CZ',email:'jan@acme.invalid',contact_name:'Jan Novák'}]),
            provider([invoice],[charge],[{payment:{charge:'ch_1'}}]));
        expect(snapshot.purchases[0]).toMatchObject({contactName:'Jan Novák',company:{key:'registration:CZ:12345678',name:'ACME s.r.o.'}});
    });
    it('includes successful one-time charges, excluding tests and failed charges',async()=>{
        const snapshot=await loadStripeCommerce(db(),provider([],[charge,{...charge,id:'test',livemode:false},{...charge,id:'failed',paid:false}],[]));
        expect(snapshot.payments).toHaveLength(1);expect(snapshot.purchases[0]).toMatchObject({status:'paid',billingInterval:null,company:null});
    });
    it('never fabricates a card receipt from an invoice marked paid outside Stripe',async()=>{
        await expect(loadStripeCommerce(db(),provider([invoice],[],[]))).rejects.toThrow('commerce_paid_invoice_without_receipt');
    });
});
