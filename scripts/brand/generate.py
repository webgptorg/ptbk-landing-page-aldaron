"""Regenerate committed brand assets. Requires Python fontTools and the app's Node/sharp.

Original PB outlines: lib/promptbook-brand/artwork.json. Project all three faces
onto one exact regular hexagon; never fit the artwork to a square bounding box.
"""
from pathlib import Path
import json, math, subprocess, zipfile
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/brand'
BRAND = json.loads((ROOT / 'lib/promptbook-brand/brand.json').read_text())
ART = json.loads((ROOT / 'lib/promptbook-brand/artwork.json').read_text())
COLORS = BRAND['colors']
OUT.mkdir(parents=True, exist_ok=True)

def number(n): return f'{n:.9f}'.rstrip('0').rstrip('.')

def mark(color):
    radius = BRAND['logo']['radius']
    horizontal = radius * math.sqrt(3) / 2
    side = 52.362148
    a, b, d = horizontal / side, radius / 2 / side, radius / side
    # Authored face origins; letters and curves are kept verbatim.
    ar, br, dr = horizontal / 52.36218, radius / 2 / 52.36218, radius / 52.36218
    matrices = {
        'top': (a, b, -a, b, 64-a*170.43529+a*4.895752, 4-b*170.43529-b*4.895752),
        'left': (a, b, 0, d, 64-horizontal-a*170.43529, 34-b*170.43529-d*63.580528),
        'right': (ar, -br, 0, dr, 64-ar*233.25459, 64+br*233.25459-dr*63.55006),
    }
    return ''.join(f'<path fill="{color}" transform="matrix({" ".join(map(number, matrices[face]))})" d="{ART[face]}"/>' for face in matrices)

bold = TTFont(ROOT / 'public/fonts/workshop/Inter-Bold.ttf')
medium = TTFont(ROOT / 'scripts/brand/fonts/Inter-Medium.ttf')

def outlines(text, x, y, color, font):
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = 100 / font['head'].unitsPerEm
    result = []
    for character in text:
        glyph = glyphs[cmap[ord(character)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        result.append(f'<path fill="{color}" transform="translate({number(x)} {y}) scale({number(scale)} {number(-scale)})" d="{pen.getCommands()}"/>')
        x += glyph.width*scale - 4
    return ''.join(result), x

def lockup(theme='light', abbreviated=False):
    dark = theme != 'light'
    first_color = COLORS['white'] if dark else COLORS['ink']
    accent_color = COLORS['white'] if dark else COLORS['blue']
    if abbreviated:
        lettering, _ = outlines(BRAND['abbreviation'], 168, 109, first_color, medium)
    else:
        first, end = outlines('prompt', 184, 109, first_color, medium)
        second, _ = outlines('book', end, 109, accent_color, bold)
        lettering = first + second
    # Match the vertical edge of the cube to the height of the lettering.
    symbol_scale = (100 * bold['OS/2'].sCapHeight / bold['head'].unitsPerEm) / BRAND['logo']['radius']
    center_y = BRAND['logo']['lockupSize'][1] / 2
    symbol_y = center_y - BRAND['logo']['center'][1] * symbol_scale
    transform = f'translate(10 {number(symbol_y)}) scale({number(symbol_scale)})'
    background = f'<rect width="100%" height="100%" fill="{COLORS["black"]}"/>' if theme == 'black' else ''
    return f'{background}<g transform="{transform}">{mark(accent_color)}</g>{lettering}'

def svg(width, height, content, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img"><title>{escape(title)}</title>{content}</svg>\n'

for name, color in [('blue',COLORS['blue']),('white',COLORS['white'])]:
    (OUT / f'promptbook-symbol-{name}.svg').write_text(svg(128,128,mark(color),f'Promptbook {name} symbol'))
for theme in ('light', 'dark', 'black'):
    (OUT / f'promptbook-lockup-{theme}.svg').write_text(
        svg(*BRAND['logo']['lockupSize'], lockup(theme), BRAND['name'])
    )
    (OUT / f'promptbook-abbreviation-{theme}.svg').write_text(
        svg(*BRAND['logo']['abbreviationLockupSize'], lockup(theme, abbreviated=True), BRAND['abbreviation'])
    )

# Editable templates use actual brand outlines; text remains editable in SVG.
for locale, message in BRAND['messages'].items():
    first, second = message['headline'].split('. ',1)
    for kind, width, height in [('slide',1600,900),('social',1200,630)]:
        content = f'<rect width="{width}" height="{height}" fill="{COLORS["surface"]}"/>'
        content += f'<g transform="translate(64 48) scale(.65)">{lockup()}</g>'
        content += f'<g font-family="&quot;{escape(BRAND["fonts"]["heading"])}&quot;, sans-serif" font-size="{width/22}" font-weight="600" letter-spacing="-.025em" fill="{COLORS["ink"]}"><text x="64" y="{height*.48}">{escape(first)}</text><text x="64" y="{height*.61}" fill="{COLORS["blue"]}">{escape(second)}</text></g>'
        content += f'<text x="64" y="{height-48}" font-family="&quot;{escape(BRAND["fonts"]["body"])}&quot;, sans-serif" font-size="24" fill="{COLORS["ink"]}">ptbk.io</text>'
        (OUT/f'promptbook-{kind}-{locale}.svg').write_text(svg(width,height,content,'Promptbook — '+message['headline']))

(OUT/'brand.json').write_text(json.dumps(BRAND,ensure_ascii=False,indent=2)+'\n')
(OUT/'brand.css').write_text(':root {\n'+''.join(f'  --ptbk-{key}: {value};\n' for key,value in COLORS.items())+f'''  --ptbk-font-heading: "{BRAND['fonts']['heading']}", Arial, sans-serif;
  --ptbk-font-body: "{BRAND['fonts']['body']}", Arial, sans-serif;
  --ptbk-heading-weight: 600;
  --ptbk-heading-tracking: -.025em;
  --ptbk-heading-line-height: 1.18;
  --ptbk-body-line-height: 1.6;
'''+'}\n')
(OUT/'brand.md').write_text(f'''# Promptbook brand kit

Updated: {BRAND['updatedAt']}. Contact: {BRAND['contact']}.

Name: {BRAND['name']}. Visual wordmark: {BRAND['wordmark']} (no trailing dot).
Official abbreviation: {BRAND['abbreviation']} (lowercase). CLI command: {BRAND['abbreviation']}.
Use the supplied SVG/PNG assets. The PB mark projects onto a regular hexagon:
six equal sides, 120° interior angles. Never stretch, rotate, recolor or add effects.
Light artwork is transparent for white surfaces. Use the transparent white artwork on
ink blue {COLORS['blue']} or the all-white lockup with its solid black {COLORS['black']} background.
Keep at least 1/4 of
the symbol's height clear on all sides. Minimum digital widths: symbol 32 px,
complete lockup 160 px. Headings: {BRAND['fonts']['heading']} (600). Body: {BRAND['fonts']['body']} (400–700).
Full wordmark: Inter Medium (500) for prompt, Inter Bold (700) for book, at equal sizes.
The abbreviated ptbk wordmark is entirely Inter Medium (500).
In the complete lockup, the cube's vertical edge matches the wordmark's cap height.
Logo SVGs contain vector paths, with no embedded bitmap or font dependency.
Editable slide/social templates require Exo 2 and Barlow; their PNG exports do not.
Install the TTF files from fonts/ before editing. For websites, keep fonts/fonts.css
beside the WOFF2 files. The fonts include Czech characters. Distribute their OFL
notices and author credits with them; both families use SIL Open Font License 1.1.
Headings use 600, -.025em tracking and 1.18 line height. Body/UI uses Barlow 400,
emphasis 500-700 and 1.6 line height. Never recreate the outlined Inter wordmark
using the heading font: use the supplied logo artwork.

## Czech

{BRAND['messages']['cs']['short']}

{BRAND['messages']['cs']['paragraph']}

## English

{BRAND['messages']['en']['short']}

{BRAND['messages']['en']['paragraph']}

## Robot

The mascot is a supporting illustration for agent examples. Use the Promptbook logo
to identify the brand. The manual illustrates working, thinking, assembling, finished
and resting poses. The working pose is available as SVG, PNG and an editable
[GLB](https://www.ptbk.io/brand/promptbook-robot.glb).

The torso edge is 61.8% of the head edge. Each foot is 44% of the torso edge.
Place the feet diagonally with a gap. Keep continuous L-shaped arms, with clearance
below the chin and the pen through the left grip as seen from the front. Retain
the ink-blue triangle, light shell and pixel expression on the dark display.

## Scope and sources

Applies only to Promptbook, not AI ta Krajta or Pavol Hejny personal sites.
Product copy: ptbk.io/cs, ptbk.io/en and webgptorg/promptbook reborn/2026-10 README.
Original PB curves: {ART['source']}; face projection corrected to exact regular geometry.
Work examples describe configured agents and permissions, not guaranteed outcomes.
Screenshots must be genuine current captures. Do not fabricate customer evidence.
''')

# Sharp renders deterministic PNGs from these vectors. Font outlines make logos portable.
subprocess.run(['node', str(ROOT/'scripts/brand/export-robot.cjs')],cwd=ROOT,check=True)
subprocess.run(['node', str(ROOT/'scripts/brand/rasterize.cjs')],cwd=ROOT,check=True)
font_files = sorted((ROOT/'public/fonts/promptbook').iterdir())
with zipfile.ZipFile(OUT/'promptbook-fonts.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for path in font_files:
        if path.is_file():
            info=zipfile.ZipInfo(path.name,date_time=(2026,11,11,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            archive.writestr(info,path.read_bytes())
with zipfile.ZipFile(OUT/'promptbook-brand-kit.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(OUT.iterdir()):
        if path.suffix != '.zip':
            info=zipfile.ZipInfo(path.name,date_time=(2026,11,5,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            archive.writestr(info,path.read_bytes())
    for path in font_files:
        if path.is_file():
            info=zipfile.ZipInfo(f'fonts/{path.name}',date_time=(2026,11,11,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            archive.writestr(info,path.read_bytes())
print('Generated SVG, PNG, templates, brand rules, CSS, JSON and optional ZIP.')
