import { expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { licenseOpenApiDocument } from './openapi';
import { GET as download } from '@/app/api/promptbook-billing/app/openapi.json/route';
import { GET as swagger } from '@/app/api/promptbook-billing/app/docs/route';
import { licenseLookupResponseSchema } from './lookupContract';
import { licenseAdminMutationSchema } from './adminContract';
import { capabilitiesForPlan } from './contract';

it('publishes actual strict runtime contracts, success/error fixtures and backend-only authentication without billing data',async () => {
    const doc=licenseOpenApiDocument();
    expect(doc.openapi).toBe('3.0.3');
    const post=doc.paths['/api/promptbook-billing/app/licenses'].post;
    expect(post.responses['503']).toBeDefined(); expect(post.responses['429']).toBeDefined();
    for(const example of Object.values(post.responses['200'].content['application/json'].examples)) expect(licenseLookupResponseSchema.safeParse(example.value).success).toBe(true);
    const schemas=JSON.stringify(doc.components.schemas);
    expect(schemas).not.toMatch(/stripe_subscription_id|amount_paid|communitySeats|order_id|invoice_url/);
    expect(schemas).toContain('additionalProperties');expect(schemas).toContain('nullable');
    const response=download(new NextRequest('https://www.ptbk.io/api/promptbook-billing/app/openapi.json?download=1'));
    expect(response.headers.get('Content-Disposition')).toContain('promptbook-licensing-openapi.json');
    expect(await response.json()).toEqual(doc);
    const page=await swagger().text();
    expect(page).toContain('/vendor/swagger-ui/swagger-ui-bundle.js'); expect(page).not.toContain('unpkg');
});
it('rejects invalid manual rights and untrusted presentation markup',() => {
    const input={action:'grant',email:' Customer@Example.test ',kind:'custom',label:'Pilot',capabilities:capabilitiesForPlan('business'),communitySeats:10,validFrom:'2026-11-18T00:00:00Z',validUntil:null,reason:'Partner pilot agreement'};
    const parsed=licenseAdminMutationSchema.parse(input);expect('email' in parsed && parsed.email).toBe('customer@example.test');
    expect(licenseAdminMutationSchema.safeParse({...input,label:'<b>Business</b>'}).success).toBe(false);
    expect(licenseAdminMutationSchema.safeParse({...input,validUntil:'2026-11-17T00:00:00Z'}).success).toBe(false);
    expect(licenseAdminMutationSchema.safeParse({...input,capabilities:{...input.capabilities,specialists:-1}}).success).toBe(false);
    expect(licenseAdminMutationSchema.safeParse({...input,stripe_subscription_id:'sub_forged'}).success).toBe(false);
});
