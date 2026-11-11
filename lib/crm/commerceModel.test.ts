import { describe,expect,it } from 'vitest';
import {commerceKey,commerceTotals,stripeAmountMicros,type CommercePayment} from './commerceModel';
const receipt:CommercePayment={key:'receipt1',purchaseKey:'purchase',name:'Start',paidAt:'2026-11-11T12:00:00Z',currency:'czk',amountPaidMinor:39900,refundedAmountMinor:0,state:'paid',source:'Stripe'};
describe('customer spending',()=>{
    it('counts the customer payment before fees and keeps a stable total on replay',()=>{
        expect(commerceTotals([receipt,receipt])).toMatchObject([{paidMinor:39900,paymentCount:1}]);
        expect(commerceTotals([receipt])).toEqual(commerceTotals([receipt]));
    });
    it('keeps willingness to pay independent of full or partial refunds',()=>{
        expect(commerceTotals([{...receipt,refundedAmountMinor:10000}])).toMatchObject([{paidMinor:39900,refundedMinor:10000}]);
        expect(commerceTotals([{...receipt,refundedAmountMinor:39900}])).toMatchObject([{paidMinor:39900,refundedMinor:39900}]);
    });
    it('sums monthly receipts once per currency and retains the most recent payment',()=>{
        const totals=commerceTotals([receipt,{...receipt,key:'receipt2',paidAt:'2026-12-11T12:00:00Z',amountPaidMinor:199900},
            {...receipt,key:'usd',currency:'usd',amountPaidMinor:1900}]);
        expect(totals).toMatchObject([{currency:'CZK',paidMinor:239800,paymentCount:2,lastPaymentMinor:199900},{currency:'USD',paidMinor:1900,paymentCount:1}]);
    });
    it('rejects conflicting copies, invalid values and exaggerated refunds before writing',()=>{
        expect(()=>commerceTotals([receipt,{...receipt,amountPaidMinor:50000}])).toThrow('commerce_conflicting_receipt');
        expect(()=>commerceTotals([{...receipt,refundedAmountMinor:40000}])).toThrow('commerce_invalid_receipt');
        expect(()=>commerceTotals([{...receipt,amountPaidMinor:NaN}])).toThrow('commerce_invalid_receipt');
    });
    it('converts Stripe minor units into exact Twenty micros, including zero and three-decimal currencies',()=>{
        expect(stripeAmountMicros(39900,'CZK')).toBe('399000000');
        expect(stripeAmountMicros(399,'jpy')).toBe('399000000');
        expect(stripeAmountMicros(1000,'kwd')).toBe('1000000');
    });
    it('uses deterministic opaque provider keys',()=>{
        expect(commerceKey('receipt','ch_private')).toBe(commerceKey('receipt','ch_private'));
        expect(commerceKey('receipt','ch_private')).not.toContain('ch_private');
        expect(commerceKey('receipt','same')).not.toBe(commerceKey('subscription','same'));
    });
});
