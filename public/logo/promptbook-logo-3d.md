# Promptbook 3D logo

This is a static 3D render of `promptbook-logo-blue-transparent-1024.png`, generated
with the built-in imagegen tool on 2026-09-21. It keeps the three-part PB composition
and adds blue surfaces, shallow extrusion, bevels and studio lighting. It is a raster
brand asset, not an editable 3D model.

`promptbook-logo-3d-transparent-1024.png` is the transparent, 1024 × 1024 download.
The 128, 256, 512 and 1024-pixel WebP files are web previews of that same image.
The shared `PromptbookLogo` component selects a preview at twice the requested display
size, capped at 1024 pixels, because this site's Next.js image optimization is disabled.
Small navigation logos therefore load the 128-pixel asset, not the full PNG.

The PNG was resized from the generated image with Sharp, preserving alpha. The WebP
exports use quality 88 and alpha quality 100. Keep them in step after any artwork change:

```sh
node --input-type=module <<'NODE'
import sharp from 'sharp';

const SOURCE_PATH = 'public/logo/promptbook-logo-3d-transparent-1024.png';
for (const SIZE of [128, 256, 512, 1024]) {
    await sharp(SOURCE_PATH)
        .resize(SIZE, SIZE)
        .webp({ quality: 88, alphaQuality: 100 })
        .toFile(`public/logo/promptbook-logo-3d-transparent-${SIZE}.webp`);
}
NODE
```

The `/branding` page previews the render and offers the PNG next to the existing flat
variants. The flat files remain suitable for print, small favicons and high-contrast
uses. Do not apply monochrome CSS filters to the 3D image: they remove its shading.
The dark footer and participant-room headers give the small blue render a white
backing so its edges remain visible in either room appearance.

## Generation prompt

The existing blue transparent PNG was supplied as the edit target.

```text
Use case: style-transfer.
Asset type: official Promptbook 3D logo render for a website header, footer and large brand-kit preview, square transparent PNG.
Input image: the supplied Promptbook logo is the edit target and exact silhouette reference.
Primary request: convert this precise flat blue mark into a beautifully lit three-dimensional solid with shallow visible extrusion and refined bevels. Preserve the original three separate shapes and their exact positions, proportions, camera angle and negative spaces: the floating triangle above, the P-shaped left face, and the large right face with its open B-shaped cutout. Preserve the recognizable PB cube/book composition. The front silhouette must match the reference; add depth behind it, not a redesigned cube.
Style/materials: premium product rendering of deep royal-blue satin anodized metal or enamel, fine rounded edge bevels, smooth broad faces, convincing darker blue side walls and cool pale-blue edge reflections. No gritty texture. Keep the blue rich, close to the reference, with enough bright edge light to read on both white and very dark backgrounds.
Lighting: large soft studio key from upper left, delicate cool rim light; restrained ambient occlusion only on the object. No floor, no cast shadow outside the object.
Composition: one centered logo, fills about 88 percent of the square canvas, whole object visible with clear margins. The triangle and both letter faces must remain distinct and separated exactly as in the reference. Transparent background with actual alpha, including all gaps and cutouts.
Constraints: change only depth, surface and lighting. Do not add letters, text, words, other shapes, a pedestal, an enclosing cube, a background, a gradient backdrop, glow, blur, watermark or checkerboard pixels. Output one 1024x1024 PNG with genuine transparent background.
```
