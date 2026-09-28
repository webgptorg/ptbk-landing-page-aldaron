// Reproduce the small, deterministic timecode/clap fixtures with FFmpeg 7+.
// FFMPEG_PATH can name an installed binary; no download, device capture or network is used.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const DIRECTORY = fileURLToPath(new URL('.', import.meta.url));
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const WIDTH = 160;
const HEIGHT = 90;
const SESSION_SECONDS = 8;
const DIGITS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
const SOURCES = [
    { name: 'screen', offset: 0, frameRate: 25, isVideo: true, isAudio: false },
    { name: 'camera', offset: 0.37, frameRate: 30, isVideo: true, isAudio: true },
    { name: 'microphone', offset: 0.71, frameRate: 0, isVideo: false, isAudio: true },
];

for (const source of SOURCES) {
    const duration = SESSION_SECONDS - source.offset;
    const args = ['-hide_banner', '-loglevel', 'error', '-y'];
    let frames;
    if (source.isVideo) {
        const frameCount = Math.ceil(duration * source.frameRate);
        frames = Buffer.alloc(frameCount * WIDTH * HEIGHT * 3);
        for (let frame = 0; frame < frameCount; frame++) {
            const seconds = source.offset + frame / source.frameRate;
            const ticks = Math.round(seconds * 100);
            const setPixel = (x, y, value) => frames.fill(value, (frame * WIDTH * HEIGHT + y * WIDTH + x) * 3, (frame * WIDTH * HEIGHT + y * WIDTH + x) * 3 + 3);
            // Twelve binary bands encode session time in hundredths of a second.
            for (let bit = 0; bit < 12; bit++) {
                for (let y = 8; y < 40; y++) for (let x = 8 + bit * 12; x < 18 + bit * 12; x++) setPixel(x, y, ticks & (1 << bit) ? 240 : 16);
            }
            // Human-readable original-session SS.hh timecode.
            const text = String(ticks).padStart(4, '0');
            for (let digit = 0; digit < text.length; digit++) {
                const glyph = DIGITS[Number(text[digit])];
                for (let pixel = 0; pixel < 15; pixel++) if (glyph[pixel] === '1') {
                    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) setPixel(35 + digit * 20 + pixel % 3 * 4 + x, 52 + Math.floor(pixel / 3) * 4 + y, 240);
                }
            }
            // A 60 ms visual clap at every integer second matches the audible pulse.
            if (seconds % 1 < 0.06) for (let y = 80; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) setPixel(x, y, 240);
        }
        args.push('-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${WIDTH}x${HEIGHT}`, '-framerate', String(source.frameRate), '-i', 'pipe:0');
    }
    if (source.isAudio) args.push('-f', 'lavfi', '-i', `aevalsrc=if(lt(mod(t+${source.offset}\\,1)\\,0.06)\\,0.4*sin(2*PI*880*(t+${source.offset}))\\,0):s=48000:d=${duration}`);
    args.push('-t', String(duration));
    if (source.isVideo) args.push('-c:v', 'libvpx', '-b:v', '600k', '-g', String(source.frameRate));
    if (source.isAudio) args.push('-c:a', 'libopus', '-b:a', '128k');
    args.push(join(DIRECTORY, `${source.name}.webm`));
    const result = spawnSync(FFMPEG, args, { input: frames, maxBuffer: 4 * 1024 * 1024 });
    if (result.error || result.status !== 0) throw result.error || new Error(result.stderr.toString());
    process.stdout.write(`${source.name}: offset ${source.offset}s, ${source.frameRate || 'audio'} fps\n`);
}
