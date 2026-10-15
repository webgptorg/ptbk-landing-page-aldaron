#!/usr/bin/env node
/**
 * The current cross-platform lockfile can omit Sharp's optional Linux binaries.
 * Run before builds: repair only an actually broken Linux/glibc x64 installation,
 * using the exact native package versions declared by each installed Sharp copy.
 * No dependency versions, lockfile, application code or other platforms are changed.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

function loadSharp(directory) {
    return spawnSync(process.execPath, ['-e', 'require(process.argv[1])', directory], {
        encoding: 'utf8', timeout: 30000,
    });
}

function main() {
    if (process.platform !== 'linux' || process.arch !== 'x64'
        || !process.report.getReport().header.glibcVersionRuntime) return;

    const candidates = [
        path.resolve('node_modules/sharp'),
        path.resolve('node_modules/next/node_modules/sharp'),
    ];
    for (const directory of candidates) {
        if (!fs.existsSync(path.join(directory, 'package.json'))) continue;
        if (loadSharp(directory).status === 0) continue;
        const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
        const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'promptbook-sharp-'));
        try {
            console.log(`Preparing missing Linux runtime for Sharp ${manifest.version}.`);
            for (const name of ['@img/sharp-linux-x64', '@img/sharp-libvips-linux-x64']) {
                const version = manifest.optionalDependencies?.[name];
                if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) {
                    throw new Error(`Expected an exact optional dependency version for ${name}.`);
                }
                const packed = JSON.parse(execFileSync('npm', [
                    'pack', `${name}@${version}`, '--ignore-scripts', '--json',
                    '--pack-destination', temporary,
                ], { encoding: 'utf8', timeout: 120000 }));
                const filename = packed[0]?.filename;
                if (!filename || path.basename(filename) !== filename) {
                    throw new Error(`Unexpected npm archive filename for ${name}.`);
                }
                const destination = path.join(path.dirname(directory), name);
                fs.mkdirSync(destination, { recursive: true });
                execFileSync('tar', ['-xzf', path.join(temporary, filename),
                    '-C', destination, '--strip-components=1'], { stdio: 'inherit', timeout: 30000 });
            }
            const verified = loadSharp(directory);
            if (verified.status !== 0) {
                throw new Error(`Sharp ${manifest.version} still cannot load: ${verified.stderr || verified.error || 'unknown error'}`);
            }
        } finally {
            fs.rmSync(temporary, { recursive: true, force: true });
        }
    }
}
try { main(); } catch (error) {
    console.error('Native image runtime preparation failed:', error.message);
    process.exitCode = 1;
}
