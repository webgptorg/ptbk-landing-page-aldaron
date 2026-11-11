import { createTwentyContactApi, type TwentyContactApiSettings } from './twentyContactApi';

type MetadataField = { id: string; name: string; type: string };
type MetadataObject = { id: string; nameSingular: string; namePlural: string; fields: MetadataField[] | { edges: { node: MetadataField }[] } };
export const COMMERCE_SCHEMA_VERSION = '2026-11-11-v1';
export async function ensureTwentyCommerceSchema(settings: TwentyContactApiSettings, apply: boolean) {
    const api = createTwentyContactApi(settings);
    const response = await api.request<{ data: { objects: MetadataObject[] } }>('metadata/objects', 'GET');
    const objects = response.data.objects;
    if (!Array.isArray(objects)) throw new Error('commerce_invalid_metadata');
    async function object(nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, icon: string) {
        let metadata = objects.find((item) => item.nameSingular === nameSingular);
        if (!metadata && apply) {
            console.log('CRM_COMMERCE_SCHEMA_OBJECT', nameSingular);
            const created = await api.request<{ data: { createOneObject: MetadataObject } }>('metadata/objects','POST',{
                nameSingular, namePlural, labelSingular, labelPlural, icon, isLabelSyncedWithName: false,
            });
            metadata = created.data.createOneObject;
            if (!metadata?.id) throw new Error('commerce_invalid_object_create');
            objects.push(metadata);
        }
        if (!metadata) throw new Error(`commerce_missing_object_${nameSingular}`);
        return metadata;
    }
    async function field(metadata: MetadataObject, name: string, type: string, label: string, extra: object = {}) {
        const fields = Array.isArray(metadata.fields) ? metadata.fields : metadata.fields?.edges?.map((edge) => edge.node) ?? [];
        const existing = fields.find((item) => item.name === name);
        if (existing) {
            if (existing.type !== type) throw new Error(`commerce_wrong_field_type_${name}`);
            return;
        }
        if (!apply) throw new Error(`commerce_missing_field_${metadata.nameSingular}_${name}`);
        await new Promise((resolve) => setTimeout(resolve,700));
        console.log('CRM_COMMERCE_SCHEMA_FIELD', `${metadata.nameSingular}.${name}`);
        const result = await api.request<{ data: { createOneField: MetadataField } }>('metadata/fields','POST',{
            objectMetadataId: metadata.id, name, type, label, icon: type === 'CURRENCY' ? 'IconCurrencyDollar' : 'IconList',
            isLabelSyncedWithName: false, ...extra,
        });
        if (!result.data.createOneField?.id) throw new Error('commerce_invalid_field_create');
        fields.push(result.data.createOneField);
        metadata.fields = fields;
    }
    const person = await object('person','people','Osoba','Lidé','IconUser');
    const company = await object('company','companies','Firma','Firmy','IconBuilding');
    const purchase = await object('ptbkPurchase','ptbkPurchases','Nákup','Nákupy','IconShoppingCart');
    const payment = await object('ptbkPayment','ptbkPayments','Platba','Platby','IconCreditCard');
    const relation = async (from: MetadataObject, to: MetadataObject, name: string, label: string, targetFieldLabel: string) => {
        await field(from, name, 'RELATION', label, { relationCreationPayload: { type: 'MANY_TO_ONE', targetObjectMetadataId: to.id,
            targetFieldLabel, targetFieldIcon: 'IconShoppingCart' } });
    };
    for (const metadata of [purchase,payment]) await field(metadata,'externalId','TEXT','Klíč synchronizace',{isUnique:true});
    for (const [name,type,label] of [
        ['product','TEXT','Produkt'],['status','TEXT','Stav předplatného'],['billingInterval','TEXT','Fakturační období'],
        ['identityReview','TEXT','Ke kontrole'],['paid','CURRENCY','Celkem zaplaceno'],['refunded','CURRENCY','Celkem vráceno'],
        ['totalsByCurrency','TEXT','Součty podle měny'],['lastPaidAt','DATE_TIME','Poslední platba'],['paymentCount','NUMBER','Počet plateb'],
    ]) await field(purchase,name,type,label);
    await relation(purchase,person,'person','Kontaktní osoba','Nákupy přes kontakt');
    await relation(purchase,company,'company','Plátce – firma','Nákupy firmy');
    for (const [name,type,label] of [
        ['paid','CURRENCY','Zaplaceno zákazníkem'],['refunded','CURRENCY','Vráceno zákazníkovi'],['paidAt','DATE_TIME','Datum platby'],
        ['state','TEXT','Stav platby'],['source','TEXT','Zdroj platby'],
    ]) await field(payment,name,type,label);
    await relation(payment,purchase,'purchase','Nákup','Platby nákupu');
    // These are snapshots derived from canonical receipts, never incremented counters.
    for (const metadata of [person,company]) {
        await field(metadata,'ptbkPaid','CURRENCY',metadata === person ? 'Nákupy přes kontakt – celkem' : 'Celkem zaplaceno', {
            description: metadata === person ? 'Vlastní i firemní nákupy spojené s kontaktem. Stejné platby se zobrazují také u plátce; součty osob a firem se nesčítají.' : 'Hrubá částka zaplacená zákazníkem před poplatky. Vratky jsou uvedené zvlášť.',
        });
        await field(metadata,'ptbkRefunded','CURRENCY','Celkem vráceno');
        await field(metadata,'ptbkTotalsByCurrency','TEXT','Zaplaceno podle měny');
        await field(metadata,'ptbkPaymentCount','NUMBER','Počet plateb');
        await field(metadata,'ptbkLastPaidAt','DATE_TIME','Poslední platba');
    }
    await field(person,'ptbkPersonalPaid','CURRENCY','Z toho vlastní nákupy');
    await field(company,'ptbkBuyerKey','TEXT','Klíč plátce',{isUnique:true});
    await field(company,'ptbkRegistrationNumber','TEXT','IČO plátce');
    await field(company,'ptbkBillingCountry','TEXT','Země plátce');
    return {version:COMMERCE_SCHEMA_VERSION};
}
