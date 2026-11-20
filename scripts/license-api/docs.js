/* Public Swagger configuration. No credentials, third-party services or persistence. */
window.ui = SwaggerUIBundle({
    url: '/api/openapi.json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    persistAuthorization: false,
    validatorUrl: null,
    supportedSubmitMethods: ['get', 'post'],
    tryItOutEnabled: false,
    queryConfigEnabled: false,
    displayRequestDuration: true,
    requestSnippetsEnabled: true,
    defaultModelsExpandDepth: -1,
    filter: true,
    docExpansion: 'list',
    syntaxHighlight: { activated: true, theme: 'nord' },
    requestInterceptor: function (request) {
        const target = new URL(request.url, window.location.href);
        const allowed = ['/api/openapi.json', '/api/v1/licenses', '/api/v1/identity/exchange',
            '/api/promptbook-billing/app/licenses', '/api/promptbook-billing/app/exchange'];
        if (target.origin !== window.location.origin || !allowed.includes(target.pathname)) {
            throw new Error('Konzole může volat pouze zdokumentované endpointy na tomto webu.');
        }
        request.credentials = 'omit';
        return request;
    },
});
