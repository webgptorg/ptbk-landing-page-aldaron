import { getTwentyContactSyncSettings } from '../../lib/crm/runTwentyContactSync';

async function main() {
    const settings = getTwentyContactSyncSettings();
    if (!settings || process.env.VERCEL_ENV !== 'production') throw new Error('Production settings required');
    const headers = { Authorization: `Bearer ${settings.key}`, ...(settings.ingressKey ? { 'X-PTBK-Twenty-Sync': settings.ingressKey } : {}) };
    for (const path of ['/rest/metadata/objects', '/rest/metadata/fields']) {
        const response = await fetch(new URL(path, settings.url), { headers, redirect: 'error', signal: AbortSignal.timeout(20000) });
        const body = await response.json() as any;
        const nodes = body?.data?.objects ?? body?.data?.fields ?? body?.data?.objects?.edges ?? body?.data ?? body;
        const flatten = Array.isArray(nodes) ? nodes.map((node: any) => node.node ?? node) : nodes;
        console.log('CRM_SCHEMA_INSPECT', JSON.stringify({ path, status: response.status, keys: Object.keys(body),
            data: Array.isArray(flatten) ? flatten.filter((node: any) => ['person','company','contactSource'].includes(node.nameSingular) || ['people','companies','contactSources'].includes(node.namePlural)).map((node: any) => ({
                id: node.id, nameSingular: node.nameSingular, namePlural: node.namePlural, isCustom: node.isCustom,
                fields: node.fields?.edges?.map(({node: field}: any) => ({id:field.id,name:field.name,type:field.type,settings:field.settings})) ?? node.fields,
            })) : flatten,
        }));
    }
}
main().catch((error) => { console.error('CRM_SCHEMA_INSPECT_FAILED', error instanceof Error ? error.name : 'UnknownError'); process.exitCode = 1; });
