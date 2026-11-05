/** Export the actual homepage robot, with animation classes omitted. No redrawing. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'businesses/new/PromptbookRobot.tsx'), 'utf8')
    .replace(/import s from '[^']+\.css';/, 'const s: Record<string, string> = {};');
const code = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const compiled = { exports: {} };
new Function('require', 'module', 'exports', code)(require, compiled, compiled.exports);
const svg = renderToStaticMarkup(React.createElement(compiled.exports.PromptbookRobot))
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" ')
    .replace(' aria-hidden="true"', ' role="img" aria-label="Promptbook robot"');
fs.writeFileSync(path.join(root, 'public/brand/promptbook-robot.svg'), svg+'\n');
