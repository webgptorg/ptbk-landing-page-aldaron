import { API_KEYS_ADMIN_PATH, API_OPENAPI_PATH } from '@/lib/ecosystem-api/contract';

/** Public interactive documentation with local pinned assets and no persistent credentials. */
export function GET() {
    return new Response(`<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Promptbook API · Dokumentace a konzole</title>
<link rel="stylesheet" href="/vendor/swagger-ui/swagger-ui.css"><link rel="stylesheet" href="/vendor/swagger-ui/ecosystem-docs.css"></head>
<body><header class="api-header"><div class="api-header-inner"><a class="brand" href="/cs"><img src="/brand/promptbook-lockup-light.svg" alt="Promptbook" width="196" height="40"><span class="brand-label">API</span></a>
<nav aria-label="API navigace"><a href="/admin/promptbook-licensing">Licence</a><a href="${API_KEYS_ADMIN_PATH}">Správa API klíčů</a><a class="download" href="${API_OPENAPI_PATH}?download=1" download>OpenAPI JSON</a></nav></div></header>
<main><section class="api-intro"><div><p class="eyebrow">DOKUMENTACE A KONZOLE</p><h1>Jedno API.<br>Celý ekosystém.</h1><p class="intro-copy">Propojte své aplikace s našimi weby. Začněte licencemi Promptbooku a vyzkoušejte požadavky přímo tady.</p></div>
<aside aria-label="Jak vyzkoušet API"><h2>První požadavek</h2><ol><li><a href="${API_KEYS_ADMIN_PATH}">Vytvořte API klíč</a> s oprávněním Čtení licencí.</li><li>V <strong>Authorize</strong> vložte samotný klíč.</li><li>Rozbalte endpoint, zvolte <strong>Try it out</strong>, vyplňte vstup a klikněte na <strong>Execute</strong>.</li></ol><p>Uvidíte cURL příkaz, stav odpovědi, hlavičky, JSON a dobu požadavku. Klíč zůstává jen v paměti této karty.</p></aside></section>
<div class="api-notice"><strong>Živé požadavky</strong><span>Konzole volá tento web. Čtení licencí nic nemění; výměna identity spotřebuje jednorázový lístek. V integraci uložte klíč na backendu.</span></div>
<section class="api-console" aria-label="Interaktivní dokumentace API"><div id="swagger-ui"></div></section></main>
<footer>Promptbook API · OpenAPI 3.0 · Swagger UI</footer>
<script src="/vendor/swagger-ui/swagger-ui-bundle.js"></script><script src="/vendor/swagger-ui/license-docs.js"></script></body></html>`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" },
    });
}
