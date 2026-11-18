import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { licenseSnapshotSchema } from './contract';
import { licenseLookupRequestSchema, licenseLookupResponseSchema } from './lookupContract';
import { licenseExchangeRequestSchema, licenseExchangeResponseSchema } from './exchangeContract';
import fixtures from '@/docs/fixtures/app-license-email-lookup.json';

export const LICENSE_OPENAPI_PATH = '/api/promptbook-billing/app/openapi.json';
export const LICENSE_SWAGGER_PATH = '/api/promptbook-billing/app/docs';
const endpoint = '/api/promptbook-billing/app/licenses';
const errorSchema = z.object({ error:z.string(),code:z.literal('license_account_backfill_required').optional() }).strict();
/** Generate directly from the runtime validators, without a second manually maintained response shape. */
function schema(value: z.ZodTypeAny) { return zodToJsonSchema(value, { target:'openApi3', $refStrategy:'none' }); }
const json = (name:string) => ({ 'application/json': { schema:{ $ref:`#/components/schemas/${name}` } } });
const failure = (description:string) => ({ description,content:json('Error') });
export function licenseOpenApiDocument() {
    return {
        openapi:'3.0.3',
        info:{ title:'Promptbook App licensing API', version:'1.0.0', description:'Server-to-server advisory licences. Website owns all commercial processes. Responses contain no orders, payments, subscriptions, community records or prices. The shared credential belongs only on the App backend. display.label is Czech presentation text, never a plan identifier. Numeric null means unlimited. Missing/expired rights do not stop the engine.' },
        servers:[{url:'https://www.ptbk.io',description:'Production website'}],
        security:[{serverBearer:[]}],
        tags:[{name:'Licences'},{name:'Identity exchange'}],
        paths:{
            [endpoint]:{
                post:{ tags:['Licences'],operationId:'lookupLicenseByVerifiedEmail',summary:'Read licence overview by verified account email',
                    description:'Use only the signed-in identity verified by the App backend. Trim/lowercase only; preserve plus aliases and dots. Read-only, production data only. Unknown email returns 200 none with snapshot:null. An unavailable or ambiguous ledger returns 503, never none. Status precedence: active, trial, scheduled, expired, none. Each grant has its own validity. Snapshot metadata must match the overview. Auth runs before input validation. Maximum body: 2048 bytes. Rate limiting returns 429.',
                    requestBody:{required:true,content:json('LicenseLookupRequest')},
                    responses:{
                        '200':{description:'Verified licence overview (or confirmed absence)',headers:{'Cache-Control':{schema:{type:'string'},description:'private, no-store'}},
                            content:{'application/json':{schema:{$ref:'#/components/schemas/LicenseLookupResponse'},examples:Object.fromEntries(fixtures.filter((item) => item.httpStatus === 200).map((item) => [item.name,{value:item.response}]))}}},
                        '400':failure('Invalid JSON, email, unknown fields or oversized body'),'401':failure('Missing/incorrect server credential, including missing server configuration'),
                        '429':failure('Rate limit exceeded'),'503':failure('Licence evidence unavailable; retain explicitly stale cache or show unverified status'),
                    } },
                get:{tags:['Licences'],operationId:'getLicenseSnapshot',summary:'Read numeric v1 snapshot by linked account UUID',
                    description:'Compatibility endpoint. The UUID must come from a trusted identity link. Unknown UUID returns 404. Only current software grants enter this strict numeric snapshot.',
                    parameters:[{name:'subject',in:'query',required:true,schema:{type:'string',format:'uuid'}}],
                    responses:{'200':{description:'Current advisory software grants',content:json('LicenseSnapshot')},'400':failure('Invalid subject UUID'),'401':failure('Invalid server credential'),'404':failure('Unknown production account'),'503':failure('Licence evidence unavailable')} },
            },
            '/api/promptbook-billing/app/exchange':{post:{tags:['Identity exchange'],operationId:'exchangeWebsiteIdentityTicket',summary:'Consume an existing single-use website identity ticket',
                description:'Optional larger identity integration. The website issues a browser-bound ticket only after mailbox verification. The App backend exchanges the 43-character ticket and its own challenge within 60 seconds; reuse, mismatch and expiry fail. This does not buy or activate a licence.',
                requestBody:{required:true,content:json('LicenseExchangeRequest')},responses:{'200':{description:'Verified website identity',content:json('LicenseExchangeResponse')},'400':failure('Invalid ticket format'),'401':failure('Invalid server credential'),'403':failure('Expired, mismatched or already consumed ticket'),'503':failure('Identity evidence unavailable')} }},
        },
        components:{securitySchemes:{serverBearer:{type:'http',scheme:'bearer',description:'PROMPTBOOK_APP_LICENSE_SECRET: dedicated shared server credential, at least 32 characters. Never put it into browser/mobile bundles, URLs, this document or public examples.'}},
            schemas:{LicenseLookupRequest:schema(licenseLookupRequestSchema),LicenseLookupResponse:schema(licenseLookupResponseSchema),LicenseSnapshot:schema(licenseSnapshotSchema),
                LicenseExchangeRequest:schema(licenseExchangeRequestSchema),LicenseExchangeResponse:schema(licenseExchangeResponseSchema),Error:schema(errorSchema)}},
    };
}
