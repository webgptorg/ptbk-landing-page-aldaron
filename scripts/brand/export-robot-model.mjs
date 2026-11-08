// Run with the Robot Studio dist directory from the approved mascot revision.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const studioDist = process.argv[2];
if (!studioDist) throw new Error('Usage: node scripts/brand/export-robot-model.mjs <Robot Studio dist>');
const fromStudio = file => import(pathToFileURL(resolve(studioDist, file)).href);
const [{ AgentWorld }, { DIRECTIONS }, { Matrix3, ShapeUtils, Vector2, Vector3 }] = await Promise.all([
    fromStudio('world.js'), fromStudio('catalog.js'), fromStudio('three.module.js'),
]);

const mascot = DIRECTIONS.findIndex(direction => direction.id === 'promptbook-mascot');
if (mascot < 0) throw new Error('Robot Studio mascot is missing');
const parts = ['Torso', 'Rear foot', 'Front foot', 'Head', 'Free arm', 'Pen arm'];
const frames = { work: 0, think: 0, assemble: .9, celebrate: .92, rest: 0 };
const round = value => Number(value.toFixed(5));

function extractPose(action, time) {
    const world = new AgentWorld(mascot, 0, 27, action);
    world.update(time);
    if (world.body.children.length !== parts.length) throw new Error('Robot Studio geometry changed');

    const faces = [];
    world.body.children.forEach((part, index) => part.traverse(node => {
        for (const { p, n, paint } of node.userData.faces ?? []) {
            const project = point => new Vector3(...point).applyMatrix4(node.matrixWorld).toArray().map(round);
            const normal = new Vector3(...n).applyMatrix3(new Matrix3().getNormalMatrix(node.matrixWorld)).normalize().toArray().map(round);
            const face = { part: node !== part && index === 5 ? 'Pen' : parts[index], points: p.map(project), normal, fill: paint.fill };
            if (paint.decal) {
                const [lowerLeft,,upperRight,upperLeft] = p;
                let paths;
                let path;
                const decals = [];
                // Studio draws decals on a 2D canvas. Encode the points so its canvas calls preserve depth.
                const vertices = [];
                const encode = point => [vertices.push(point) - 1, 0];
                const context = {
                    beginPath() { paths = []; },
                    moveTo(index) { path = [vertices[index]]; paths.push(path); },
                    lineTo(index) { path.push(vertices[index]); },
                    closePath() {},
                    fill() { paths.forEach(points => decals.push({ points, fill: this.fillStyle })); },
                };
                paint.decal(context, face.points.map(encode), (u,v) =>
                    encode(project(upperLeft.map((x,i) => x + (upperRight[i] - x) * u + (lowerLeft[i] - x) * v))));
                face.decals = decals;
            }
            faces.push(face);
        }
    }));
    return faces;
}

const poses = Object.fromEntries(Object.entries(frames).map(([action,time]) => [action, extractPose(action,time)]));
const geometry = Object.entries(poses).map(([id, faces]) =>
    `  "${id}": [\n${faces.map(face => '    ' + JSON.stringify(face)).join(',\n')}\n  ]`);
writeFileSync(new URL('../../businesses/branding/robot-poses.json', import.meta.url), '{\n' + geometry.join(',\n') + '\n}\n');

function exportGlb(faces) {
    const chunks = [];
    const meshes = [];
    const materials = [];
    const nodes = [];
    const bufferViews = [];
    const accessors = [];
    let offset = 0;

    function positions(points) {
        const data = Buffer.alloc(points.length * 12);
        points.flat().forEach((value, index) => data.writeFloatLE(value, index * 4));
        const axes = [0, 1, 2].map(axis => points.map(point => Math.fround(point[axis])));
        const bufferView = bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: data.length, target: 34962 }) - 1;
        chunks.push(data);
        offset += data.length;
        return accessors.push({
            bufferView, componentType: 5126, count: points.length, type: 'VEC3',
            min: axes.map(axis => Math.min(...axis)), max: axes.map(axis => Math.max(...axis)),
        }) - 1;
    }

    const colors = [...new Set(faces.flatMap(face => [face.fill, ...(face.decals ?? []).map(decal => decal.fill)]))];
    for (const color of colors) {
        const linear = [1, 3, 5].map(start => {
            const channel = parseInt(color.slice(start, start + 2), 16) / 255;
            return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        materials.push({
            name: color, pbrMetallicRoughness: { baseColorFactor: [...linear, 1], metallicFactor: 0, roughnessFactor: 1 },
            extensions: { KHR_materials_unlit: {} },
        });
    }

    function triangulate(points, normal, offset = 0) {
        const n = new Vector3(...normal).normalize();
        const origin = new Vector3(...points[0]);
        const u = new Vector3(...points[1]).sub(origin).normalize();
        const v = n.clone().cross(u).normalize();
        const plane = points.map(point => {
            const delta = new Vector3(...point).sub(origin);
            return new Vector2(delta.dot(u), delta.dot(v));
        });
        return ShapeUtils.triangulateShape(plane, []).flatMap(indices => {
            const [a, b, c] = indices.map(index => new Vector3(...points[index]));
            const facing = b.clone().sub(a).cross(c.clone().sub(a)).dot(n);
            return (facing >= 0 ? [a,b,c] : [a,c,b]).map(point => point.addScaledVector(n, offset).toArray());
        });
    }

    for (const part of [...parts, 'Pen']) {
        const groups = new Map();
        for (const face of faces.filter(face => face.part === part)) {
            for (const [layer, surface] of [face, ...(face.decals ?? [])].entries()) {
                const points = triangulate(surface.points, face.normal, Math.min(layer, 2) * .001);
                const group = groups.get(surface.fill) ?? [];
                group.push(...points);
                groups.set(surface.fill, group);
            }
        }
        const allPoints = [...groups.values()].flat();
        if (!allPoints.length) throw new Error(`Missing mesh for ${part}`);
        const translation = [0,1,2].map(axis => {
            const values = allPoints.map(point => point[axis]);
            return (Math.min(...values) + Math.max(...values)) / 2;
        });
        const primitives = [...groups].map(([color, points]) => ({
            attributes: { POSITION: positions(points.map(point => point.map((value,i) => value - translation[i]))) },
            material: colors.indexOf(color),
        }));
        nodes.push({ name: part, mesh: meshes.push({ name: part, primitives }) - 1, translation });
    }

    const json = {
        asset: { version: '2.0', generator: 'Promptbook brand kit' },
        extensionsUsed: ['KHR_materials_unlit'],
        scene: 0, scenes: [{ name: 'Working', nodes: nodes.map((_, i) => i) }], nodes, meshes, materials,
        accessors, bufferViews, buffers: [{ byteLength: offset }],
    };
    const raw = Buffer.from(JSON.stringify(json));
    const padded = Buffer.concat([raw, Buffer.alloc((4 - raw.length % 4) % 4, 32)]);
    const header = Buffer.alloc(12);
    header.write('glTF');
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(28 + padded.length + offset, 8);
    const chunk = (length, kind) => {
        const info = Buffer.alloc(8);
        info.writeUInt32LE(length);
        info.write(kind, 4);
        return info;
    };
    return Buffer.concat([header, chunk(padded.length, 'JSON'), padded, chunk(offset, 'BIN\0'), ...chunks]);
}

writeFileSync(new URL('../../public/brand/promptbook-robot.glb', import.meta.url), exportGlb(poses.work));
