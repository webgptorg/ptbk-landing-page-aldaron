/** Export the actual homepage robot, with animation classes omitted. No redrawing. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '../..');
// Follow the component's local TSX imports, including the separately tracked head.
// CSS classes are deliberately omitted from this static artwork export.
const components = new Map();
function loadComponent(filename) {
    if (components.has(filename)) return components.get(filename).exports;
    const source = fs.readFileSync(filename, 'utf8')
        .replace(/import s from '[^']+\.css';/g, 'const s: Record<string, string> = {};');
    const code = ts.transpileModule(source, {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const component = { exports: {} };
    components.set(filename, component);
    const componentRequire = specifier => specifier.startsWith('.')
        ? loadComponent(path.resolve(path.dirname(filename), `${specifier}.tsx`))
        : require(specifier);
    new Function('require', 'module', 'exports', code)(componentRequire, component, component.exports);
    return component.exports;
}
const compiled = { exports: loadComponent(path.join(root, 'businesses/new/PromptbookRobot.tsx')) };
const svg = renderToStaticMarkup(React.createElement(compiled.exports.PromptbookRobot))
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" ')
    .replace(' aria-hidden="true"', ' role="img" aria-label="Promptbook robot"');
fs.writeFileSync(path.join(root, 'public/brand/promptbook-robot.svg'), svg+'\n');
