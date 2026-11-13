import type { CommerceSnapshot, CommercePayment, CommerceTotal } from './commerceModel';
import { commerceTotals, commerceTotalsText, stripeAmountMicros } from './commerceModel';
import { createTwentyContactApi, getTwentyContactRecordId, type TwentyContactApiSettings } from './twentyContactApi';
import type { TwentyContactSource } from './twentyContactSource';

type RecordData = { id: string; [key: string]: unknown };
const currency = (totals: CommerceTotal[], key: 'paidMinor' | 'refundedMinor') => totals.length === 1
    ? {amountMicros:stripeAmountMicros(totals[0][key],totals[0].currency),currencyCode:totals[0].currency} : null;
function totalFields(payments: readonly CommercePayment[], prefix = '') {
    const totals = commerceTotals(payments);
    const field = (name: string) => prefix ? prefix + name[0].toUpperCase() + name.slice(1) : name;
    return { [field('paid')]:currency(totals,'paidMinor'), [field('refunded')]:currency(totals,'refundedMinor'),
        [field('totalsByCurrency')]:commerceTotalsText(totals), [field('paymentCount')]:totals.reduce((sum,total) => sum+total.paymentCount,0),
        [field('lastPaidAt')]:totals.map((total) => total.lastPaidAt).sort().at(-1) ?? null };
}
const same = (left: unknown, right: unknown): boolean => {
    if ((left === '' || left === undefined) && right === null) return true;
    // Twenty serializes a cleared Currency field as its two null subfields.
    if (right === null && left && typeof left === 'object' && 'amountMicros' in left && 'currencyCode' in left) {
        const value = left as Record<string,unknown>;
        return [value.amountMicros,value.currencyCode].every((part) => part === null || part === undefined || part === '');
    }
    if (left && right && typeof left === 'object' && typeof right === 'object') {
        return Object.entries(right).every(([key,value]) => same((left as Record<string,unknown>)[key],value));
    }
    return left === right || (typeof left === 'number' && typeof right === 'string' && String(left) === right);
};

/** Each receipt is stored once; company and contact cards are two views of those same receipts. */
export async function syncTwentyCommerce(settings: TwentyContactApiSettings, snapshot: CommerceSnapshot, verify = false) {
    const api = createTwentyContactApi(settings);
    // Keep scalar relation IDs in the snapshot: selecting the relation name alone can omit companyId.
    const people = await api.listRecords<RecordData>('people');
    const companies = await api.listRecords<RecordData>('companies',undefined,'id,name,ptbkBuyerKey,ptbkRegistrationNumber,ptbkBillingCountry,ptbkPaid,ptbkRefunded,ptbkTotalsByCurrency,ptbkPaymentCount,ptbkLastPaidAt');
    const purchases = await api.listRecords<RecordData>('ptbkPurchases');
    const payments = await api.listRecords<RecordData>('ptbkPayments');
    const summary = { purchases:snapshot.purchases.length, payments:snapshot.payments.length, companies:0, contacts:0,
        needsReview:0, writes:0, verified:0, totals:commerceTotals(snapshot.payments) };
    async function update(plural: string, singular: string, record: RecordData, fields: Record<string,unknown>) {
        if (!Object.entries(fields).some(([key,value]) => !same(record[key],value))) return;
        const response = await api.request<{data:Record<string,RecordData>}>(`${plural}/${record.id}`,'PATCH',fields);
        if (response.data[`update${singular[0].toUpperCase()+singular.slice(1)}`]?.id !== record.id) throw new Error('commerce_invalid_update');
        Object.assign(record,fields);
        summary.writes++;
    }
    async function upsert(plural: string, singular: string, records: RecordData[], externalId: string, fields: Record<string,unknown>) {
        const matches = records.filter((record) => record.externalId === externalId);
        if (matches.length > 1) throw new Error('commerce_duplicate_external_key');
        if (matches[0]) { await update(plural,singular,matches[0],fields); return matches[0]; }
        const namespace = singular === 'ptbkPurchase' ? 'purchase' : 'payment';
        const record = await api.createRecord<RecordData>(plural,singular,`create${singular[0].toUpperCase()+singular.slice(1)}`,
            getTwentyContactRecordId(namespace,externalId),{externalId,...fields});
        if (record.externalId !== externalId) throw new Error('commerce_create_identity_changed');
        records.push(record); summary.writes++; return record;
    }
    const companyPayments = new Map<string,CommercePayment[]>();
    const personPayments = new Map<string,CommercePayment[]>();
    const personalPayments = new Map<string,CommercePayment[]>();
    const personCompanies = new Map<string,Set<string>>();
    const purchaseIds = new Map<string,string>();
    const seenCompanies = new Set<string>();
    const seenPeople = new Set<string>();
    const emailsOf = (person: RecordData) => {
        const emails = person.emails as {primaryEmail?:string;additionalEmails?:string[]};
        return [emails?.primaryEmail,...(emails?.additionalEmails ?? [])].filter(Boolean).map((value) => value!.trim().toLowerCase());
    };
    for (const purchase of snapshot.purchases) {
        const receipts = snapshot.payments.filter((payment) => payment.purchaseKey === purchase.key);
        let company: RecordData | undefined;
        let identityReview = purchase.identityReview;
        if (purchase.company) {
            const buyer = purchase.company;
            let matches = companies.filter((record) => record.ptbkBuyerKey === buyer.key);
            if (!matches.length && buyer.registrationNumber) matches = companies.filter((record) =>
                record.ptbkRegistrationNumber === buyer.registrationNumber && record.ptbkBillingCountry === buyer.country);
            // Names are not legal identifiers: two sole traders can share the same personal name.
            if (!matches.length && companies.some((record) => !record.ptbkBuyerKey &&
                String(record.name).trim().toLocaleLowerCase('cs') === buyer.name.trim().toLocaleLowerCase('cs'))) {
                throw new Error('commerce_company_requires_legal_match');
            }
            if (matches.length > 1) throw new Error('commerce_ambiguous_company');
            company = matches[0];
            const fields = {ptbkBuyerKey:buyer.key,ptbkRegistrationNumber:buyer.registrationNumber,ptbkBillingCountry:buyer.country};
            if (company) await update('companies','company',company,fields);
            else {
                company = await api.createRecord<RecordData>('companies','company','createCompany',getTwentyContactRecordId('company',buyer.key),
                    {name:buyer.name,...fields});
                companies.push(company); summary.writes++;
            }
            seenCompanies.add(company.id);
            companyPayments.set(company.id,[...(companyPayments.get(company.id) ?? []),...receipts]);
        }
        let person: RecordData | undefined;
        if (purchase.email) {
            const matches = people.filter((candidate) => emailsOf(candidate).includes(purchase.email!));
            if (matches.length > 1) identityReview = 'ambiguous_email';
            else person = matches[0];
            if (!person && matches.length === 0 && purchase.contactName.trim()) {
                const source: TwentyContactSource = { externalId:purchase.key,email:purchase.email,fullname:purchase.contactName,
                    phone:null,name:purchase.name,sourceType:'stripe-purchase',sourceName:'Stripe',sourceUrl:null,
                    occurredAt:receipts[0].paidAt,details:{} };
                const created = await api.findOrCreatePerson(source,purchase.email);
                if (created) { person = created as RecordData; people.push(person); summary.writes++; }
            }
        }
        if (!person) { identityReview ||= 'missing_contact_identity'; summary.needsReview++; }
        if (person) {
            seenPeople.add(person.id);
            personPayments.set(person.id,[...(personPayments.get(person.id) ?? []),...receipts]);
            if (!company) personalPayments.set(person.id,[...(personalPayments.get(person.id) ?? []),...receipts]);
            else { const related = personCompanies.get(person.id) ?? new Set<string>(); related.add(company.id); personCompanies.set(person.id,related); }
        }
        const saved = await upsert('ptbkPurchases','ptbkPurchase',purchases,purchase.key,{
            name:purchase.name,product:purchase.product,status:purchase.status,billingInterval:purchase.billingInterval,
            identityReview,personId:person?.id ?? null,companyId:company?.id ?? null,...totalFields(receipts),
        });
        purchaseIds.set(purchase.key,saved.id);
    }
    for (const payment of snapshot.payments) {
        const purchaseId = purchaseIds.get(payment.purchaseKey);
        if (!purchaseId) throw new Error('commerce_missing_purchase');
        await upsert('ptbkPayments','ptbkPayment',payments,payment.key,{name:payment.name,purchaseId,paidAt:payment.paidAt,
            paid:{amountMicros:stripeAmountMicros(payment.amountPaidMinor,payment.currency),currencyCode:payment.currency.toUpperCase()},
            refunded:{amountMicros:stripeAmountMicros(payment.refundedAmountMinor,payment.currency),currencyCode:payment.currency.toUpperCase()},
            state:payment.state,source:payment.source});
    }
    // Recompute from the complete snapshot, also clearing a previously attributed card after reassignment.
    for (const company of companies) {
        if (!seenCompanies.has(company.id) && !company.ptbkPaymentCount) continue;
        await update('companies','company',company,totalFields(companyPayments.get(company.id) ?? [],'ptbk'));
    }
    for (const person of people) {
        if (!seenPeople.has(person.id) && !person.ptbkPaymentCount) continue;
        const related = personCompanies.get(person.id);
        await update('people','person',person,{...totalFields(personPayments.get(person.id) ?? [],'ptbk'),
            ptbkPersonalPaid:currency(commerceTotals(personalPayments.get(person.id) ?? []),'paidMinor'),
            ...(!person.companyId && related?.size === 1 ? {companyId:Array.from(related)[0]} : {})});
    }
    if (verify) {
        const saved = await api.listRecords<RecordData>('ptbkPayments');
        for (const payment of snapshot.payments) {
            const matches = saved.filter((record) => record.externalId === payment.key);
            const record = matches[0];
            if (matches.length !== 1 || record.purchaseId !== purchaseIds.get(payment.purchaseKey) ||
                !same(record.paid,{amountMicros:stripeAmountMicros(payment.amountPaidMinor,payment.currency),currencyCode:payment.currency.toUpperCase()}) ||
                !same(record.refunded,{amountMicros:stripeAmountMicros(payment.refundedAmountMinor,payment.currency),currencyCode:payment.currency.toUpperCase()})) {
                throw new Error('commerce_receipt_verification_failed');
            }
            summary.verified++;
        }
        // Re-read the actual cards, not the local write cache.
        for (const [plural,records,totals] of [['companies',companies,companyPayments],['people',people,personPayments]] as const) {
            for (const record of records.filter((item) => totals.has(item.id))) {
                const savedRecord = await api.getRecord<RecordData>(plural,plural === 'people' ? 'person' : 'company',record.id);
                if (!savedRecord || !Object.entries(totalFields(totals.get(record.id)!,'ptbk')).every(([key,value]) => same(savedRecord[key],value))) {
                    throw new Error('commerce_total_verification_failed');
                }
            }
        }
    }
    summary.companies = seenCompanies.size; summary.contacts = seenPeople.size;
    return summary;
}
