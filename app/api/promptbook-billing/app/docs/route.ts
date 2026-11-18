import { LICENSE_OPENAPI_PATH } from '@/lib/promptbook-licensing/openapi';

/** Shareable Swagger reader. Local pinned assets; no validator service, live calls or stored credentials. */
export function GET() {
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Promptbook licensing API · Swagger</title><link rel="stylesheet" href="/vendor/swagger-ui/swagger-ui.css"><style>body{margin:0;background:#fff;font-family:system-ui,sans-serif}header{max-width:1400px;margin:auto;padding:24px;color:#17386c}header p{line-height:1.6}a{color:#17386c}</style></head><body><header><h1>Promptbook licensing API</h1><p><a href="${LICENSE_OPENAPI_PATH}?download=1" download>Download OpenAPI JSON</a> · <a href="/admin/promptbook-licensing">Licence administration</a></p><p>Server-to-server API. Use your backend for authenticated requests. This reader does not execute requests or store credentials.</p></header><div id="swagger-ui"></div><script src="/vendor/swagger-ui/swagger-ui-bundle.js"></script><script src="/vendor/swagger-ui/license-docs.js"></script></body></html>`, {
        headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
            'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"},
    });
}
