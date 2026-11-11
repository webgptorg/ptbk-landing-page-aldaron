const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '../..');
const directory = path.join(root, 'public/brand');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ptbk-brand-fonts-'));
const fontConfig = path.join(temporary, 'fonts.conf');
fs.writeFileSync(fontConfig, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><include>/etc/fonts/fonts.conf</include><dir>${path.join(root, 'public/fonts/workshop')}</dir><dir>${path.join(root, 'public/fonts/promptbook')}</dir><cachedir>${temporary}</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE = fontConfig;
const sharp = require('sharp');
async function main() {
    for (const filename of fs.readdirSync(directory).filter(name => name.endsWith('.svg'))) {
        const widths = filename.includes('symbol') ? [128, 256, 1024] : filename.includes('robot') ? [1024] : filename.includes('lockup') ? [1440] : filename.includes('abbreviation') ? [796] : [filename.includes('social') ? 1200 : 1600];
        for (const width of widths) {
            const suffix = filename.includes('symbol') ? `-${width}` : '';
            const image = sharp(path.join(directory, filename)).resize({ width });
            if (filename.endsWith('-black.svg')) image.flatten({ background: '#000000' });
            await image.png().toFile(path.join(directory, filename.replace('.svg', `${suffix}.png`)));
        }
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(temporary, { recursive: true, force: true }));
