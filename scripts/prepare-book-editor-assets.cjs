const { copyFileSync, cpSync, mkdirSync } = require('node:fs');
const { dirname, join } = require('node:path');

const packagePath = require.resolve('monaco-editor/package.json');
const { version } = require(packagePath);
const destination = join(__dirname, '..', 'public', 'vendor', 'monaco', version);
mkdirSync(destination, { recursive: true });
cpSync(join(dirname(packagePath), 'min', 'vs'), join(destination, 'vs'), { recursive: true });
for (const name of ['LICENSE', 'ThirdPartyNotices.txt']) {
    copyFileSync(join(dirname(packagePath), name), join(destination, name));
}
