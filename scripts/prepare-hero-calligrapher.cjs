// Prepare only reviewed Calligrapher SVG exports; no model runs during build.
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const source = JSON.parse(readFileSync(join(__dirname, 'hero-calligrapher-raw.json'), 'utf8'));
const output = join(__dirname, '../businesses/new/heroCalligrapher.json');
const round = n => Math.round(n * 100) / 100;
function transformPath(d, sx, sy, tx, ty) {
    let i = 0;
    return d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, n => String(round(Number(n) * (i++ % 2 ? sy : sx) + (i % 2 ? tx : ty))));
}
function spineOf(d) {
    const numbers = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number);
    const points = [[numbers[0], numbers[1]]];
    for (let i = 2; i < numbers.length; i += 6) points.push([numbers[i + 4], numbers[i + 5]]);
    points.pop(); // The last C closes the original pressure-shaped ribbon.
    const middle = [];
    for (let i = 0; i < points.length / 2; i++) {
        const other = points[points.length - 1 - i];
        middle.push([round((points[i][0] + other[0]) / 2), round((points[i][1] + other[1]) / 2)]);
    }
    let length = 0;
    let width = 0;
    for (let i = 0; i < middle.length; i++) {
        if (i) length += Math.hypot(middle[i][0] - middle[i - 1][0], middle[i][1] - middle[i - 1][1]);
        width = Math.max(width, Math.hypot(points[i][0] - middle[i][0], points[i][1] - middle[i][1]) * 2);
    }
    return { spine: middle.map((p, i) => `${i ? 'L' : 'M'}${p.join(' ')}`).join(' '), length, maskWidth: round(width + 1.5) };
}
function prepare(raw) {
    const factor = 8 / (Math.min(105 / raw.word.length, 11) * raw.canvas.width / 1240);
    const left = Math.min(...raw.paths.map(p => p.box.x));
    const baseline = raw.canvas.height / 2 + 20 + 3 * 8 / factor;
    const tx = 3 - left * factor;
    const ty = 82 - baseline * factor;
    return {
        width: round((Math.max(...raw.paths.map(p => p.box.right)) - left) * factor + 6),
        paths: raw.paths.map(p => ({
            outline: transformPath(p.d, factor, factor, tx, ty),
            box: { x: p.box.x * factor + tx, y: p.box.y * factor + ty, width: p.box.width * factor, height: p.box.height * factor },
        })),
    };
}
const drawings = Object.fromEntries(source.drawings.map(raw => [raw.word, prepare(raw)]));
const accentSources = { acute: drawings["'"].paths[0], caron: drawings.v.paths[0] };
function accent(kind, x, bottom) {
    const { outline, box } = accentSources[kind];
    const width = kind === 'acute' ? 9 : 14;
    const height = kind === 'acute' ? 12 : 9;
    return { edgeWidth: kind === 'caron' ? .8 : 0, outline: transformPath(outline, width / box.width, height / box.height,
        x - width / 2 - box.x * width / box.width, bottom - height - box.y * height / box.height) };
}
// The English-trained generator has no Czech alphabet. Keep its complete word
// drawings; replace only i dots with its apostrophe and add its reduced v above
// č/ř/š. The original paths remain in the reviewed export beside this script.
const corrections = {
    vyviji: { word: 'vyvíjí', dots: [4, 8] },
    uctuje: { word: 'účtuje', marks: [['acute', 0], ['caron', 1]] },
    planuje: { word: 'plánuje', marks: [['acute', 2]] },
    pise: { word: 'píše', dots: [3], marks: [['caron', 4]] },
    prepisuje: { word: 'přepisuje', dots: [7], marks: [['caron', 2]] },
};
const words = {};
for (const [base, drawing] of Object.entries(drawings)) {
    if (base === "'" || base === 'v') continue;
    const correction = corrections[base] || {};
    const paths = drawing.paths.filter((_, index) => !(correction.dots || []).includes(index));
    for (const index of correction.dots || []) {
        const box = drawing.paths[index].box;
        paths.push(accent('acute', box.x + box.width / 2, box.y + box.height));
    }
    for (const [kind, index] of correction.marks || []) {
        const box = drawing.paths[index].box;
        paths.push(accent(kind, box.x + box.width * .5, box.y - 5));
    }
    const prepared = paths.map(p => ({ outline: p.outline, edgeWidth: p.edgeWidth || 0, ...spineOf(p.outline) }));
    const total = prepared.reduce((sum, p) => sum + p.length, 0);
    let cursor = 0;
    words[correction.word || base] = { width: drawing.width, strokes: prepared.map(({ length, ...p }) => {
        const start = cursor / total;
        cursor += length;
        return { ...p, start: round(start * 10000) / 10000, duration: round(length / total * 10000) / 10000 };
    }) };
}
writeFileSync(output, JSON.stringify(words));
console.log(`Prepared ${Object.keys(words).length} genuine Calligrapher style-9 word drawings.`);
