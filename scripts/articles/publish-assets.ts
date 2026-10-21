import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getArticleAssetParams, getPublicArticleAsset } from '../../lib/articles/load';

/** Copy already committed public downloads unchanged; never generate media or audit provenance. */
const outputDirectory = join(process.cwd(), 'public', 'article-assets');
rmSync(outputDirectory, { recursive: true, force: true });
const assets = getArticleAssetParams();
for (const { id, file } of assets) {
    const asset = getPublicArticleAsset(id, file.join('/'));
    if (!asset) throw new Error(`Published article asset is missing: ${id}/${file.join('/')}`);
    const destination = join(outputDirectory, id, ...file);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(asset.path, destination);
}
console.log(`Published ${assets.length} committed article downloads as static files.`);
