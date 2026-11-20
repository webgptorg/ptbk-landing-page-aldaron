const fs = require('node:fs');
const path = require('node:path');
const destination = path.resolve(__dirname, '../public/vendor/swagger-ui');
fs.mkdirSync(destination, { recursive: true });
const source = path.dirname(require.resolve('swagger-ui-dist/package.json'));
for (const name of ['swagger-ui-bundle.js', 'swagger-ui.css', 'LICENSE', 'NOTICE']) {
    fs.copyFileSync(path.join(source, name), path.join(destination, name));
}
fs.copyFileSync(path.join(__dirname, 'license-api/docs.js'), path.join(destination, 'license-docs.js'));
fs.copyFileSync(path.join(__dirname, 'license-api/docs.css'), path.join(destination, 'ecosystem-docs.css'));
