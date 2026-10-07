import { mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';

const DURATION_SECONDS = 6001;
const SOURCE_DIRECTORY = resolve('tests/e2e/fixtures/recording-studio');
const SOURCES = [
    { name: 'editor', filename: 'screen.webm' },
    { name: 'camera', filename: 'camera.webm' },
    { name: 'application', filename: 'camera-variable.webm' },
    { name: 'audio', filename: 'microphone.webm' },
];
const outputDirectory = process.argv[2];
if (!outputDirectory)
    throw new Error('Usage: node scripts/generateStudioIntegrationFixtures.mjs <temporary-directory>');
await mkdir(outputDirectory, { recursive: true });
for (const { name, filename } of SOURCES) {
    await new Promise((resolveProcess, reject) => {
        const childProcess = spawn(
            'ffmpeg',
            [
                '-hide_banner',
                '-loglevel',
                'error',
                '-y',
                '-stream_loop',
                '-1',
                '-i',
                join(SOURCE_DIRECTORY, filename),
                '-t',
                String(DURATION_SECONDS),
                '-map',
                '0',
                '-c',
                'copy',
                join(outputDirectory, `${name}-long.webm`),
            ],
            { stdio: 'inherit' },
        );
        childProcess.once('error', reject);
        childProcess.once('exit', (code) =>
            code === 0 ? resolveProcess() : reject(new Error(`FFmpeg ${name} fixture failed (${code}).`)),
        );
    });
}
console.info(`Created four long indexed source containers in ${outputDirectory}; encoded fixture content repeats.`);
