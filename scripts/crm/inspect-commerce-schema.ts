import { getTwentyContactSyncSettings } from '../../lib/crm/runTwentyContactSync';
async function main() {
    const settings = getTwentyContactSyncSettings();
    if (!settings || process.env.VERCEL_ENV !== 'production') throw new Error('Production settings required');
    const headers = { Authorization: `Bearer ${settings.key}`, 'Content-Type': 'application/json', ...(settings.ingressKey ? { 'X-PTBK-Twenty-Sync': settings.ingressKey } : {}) };
    for (const path of ['/rest/people?limit=1&fields=id', '/rest/companies?limit=1&fields=id', '/rest/metadata/objects', '/metadata']) {
        const response = await fetch(new URL(path, settings.url), { headers, method: path === '/metadata' ? 'POST' : 'GET',
            body: path === '/metadata' ? JSON.stringify({query:'{ __schema { queryType { fields { name } } mutationType { fields { name } } } }'}) : undefined,
            redirect: 'error', signal: AbortSignal.timeout(20000) });
        const raw = await response.text();
        let body: any;
        try { body = JSON.parse(raw); } catch { body = { notJson: true, heading: raw.match(/<title>(.*?)<\/title>/)?.[1] }; }
        if (path === '/rest/metadata/objects' && response.ok) {
            const nodes = body?.data?.objects ?? body?.data ?? body;
            const values = Array.isArray(nodes) ? nodes : nodes.edges?.map((edge: any) => edge.node);
            body = { keys: Object.keys(body), data: values?.filter((node: any) => ['person','company','contactSource'].includes(node.nameSingular)) };
        }
        console.log('CRM_ACCESS_INSPECT', JSON.stringify({ path, status: response.status, body }));
    }
}
main().catch((error) => { console.error('CRM_SCHEMA_INSPECT_FAILED', error instanceof Error ? error.name : 'UnknownError'); process.exitCode = 1; });
