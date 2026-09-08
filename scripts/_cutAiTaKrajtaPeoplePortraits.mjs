/**
 * Cuts a square portrait of every person of AI ta Krajta out of a picture that person is published in, and writes
 * them into `public/people/`, where `businesses/ai-ta-krajta/aiTaKrajtaPeople.ts` names them by file.
 *
 * Almost every portrait is cut from the cover picture of an episode the person sat in, because the show photographs
 * its own line-up against one background and therefore already owns a picture of everyone. Whoever the show never put
 * on a cover is cut from the portrait they publish of themselves instead; `sourceNote` says which is which.
 *
 * Nothing here runs at build time, and the cut files are committed. Run it again after replacing a source, with
 * `node scripts/_cutAiTaKrajtaPeoplePortraits.mjs`, or cut only the portraits which are still missing by naming their
 * people: `node scripts/_cutAiTaKrajtaPeoplePortraits.mjs ondra tomas-mikolov`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const PORTRAIT_DIRECTORY = 'public/people';

/**
 * Edge of a written portrait, in pixels
 *
 * Note: The page draws a portrait 96 pixels wide at most, so this carries a screen of three times that density and
 *       nothing beyond it.
 */
const PORTRAIT_SIZE_IN_PIXELS = 320;

/**
 * How far down its own height the face sits in the cut square
 *
 * Note: Slightly above the middle, which is where a portrait puts a head and leaves the shoulders room below it.
 */
const FACE_HEIGHT_RATIO = 0.42;

const PORTRAIT_JPEG_QUALITY = 88;

/**
 * Where the portrait of each person is cut from, and where their face sits in that picture
 *
 * Note: Every episode named below states its line-up in its own description, which is what says who is who on a cover
 *       with several faces on it. A face nobody can name that way is not cut - the page draws initials for that
 *       person, which is better than a wrong face.
 */
const PORTRAITS = [
    {
        personId: 'petr-glaser',
        sourceUrl: 'https://i.ytimg.com/vi/W5RVPpiolYs/maxresdefault.jpg',
        sourceNote: 'Cover of díl #34, which is "s Petrem, Pavlem a Prokopem" - first from the left',
        face: { x: 350, y: 545, size: 260 },
    },
    {
        personId: 'patrik-braborec',
        sourceUrl: 'https://i.ytimg.com/vi/_wI-urWvALU/maxresdefault.jpg',
        sourceNote: 'Cover of díl #25, which is "v klasické sestavě Patrik, Pavol, Jacek a Petr" - fourth from the left',
        face: { x: 1032, y: 535, size: 300 },
    },
    {
        personId: 'jacek-soubusta',
        sourceUrl: 'https://i.ytimg.com/vi/0dfaV9MSyzk/maxresdefault.jpg',
        sourceNote: 'Cover of díl #22, the díl Jacek brought back from Vector Space Day - first from the right',
        face: { x: 938, y: 508, size: 300 },
    },
    {
        personId: 'simon-podhajsky',
        sourceUrl: 'https://i.ytimg.com/vi/O1o1QhYVKB4/maxresdefault.jpg',
        sourceNote: 'Cover of díl #46 - second from the left, the same face díl #35 names as Šimon',
        face: { x: 378, y: 512, size: 300 },
    },
    {
        personId: 'roman-baranovic',
        sourceUrl: 'https://i.ytimg.com/vi/XkjNwXu9b4w/maxresdefault.jpg',
        sourceNote: 'Cover of díl #61, whose guest is Roman Baranovič - first from the left',
        face: { x: 245, y: 465, size: 320 },
    },
    {
        personId: 'katka-fajmanova',
        sourceUrl: 'https://i.ytimg.com/vi/O1o1QhYVKB4/maxresdefault.jpg',
        sourceNote: 'Cover of díl #46, which welcomes "speciálního hosta, Katku Fajmanovou" - in the middle',
        face: { x: 645, y: 512, size: 300 },
    },
    {
        personId: 'tomas-koblizek',
        sourceUrl: 'https://i.ytimg.com/vi/VGm3XFBLgvg/maxresdefault.jpg',
        sourceNote: 'Cover of speciální díl č. 1, whose only guest is Tomáš Koblížek - in the middle',
        face: { x: 630, y: 478, size: 300 },
    },
    {
        personId: 'lukas-caha',
        sourceUrl: 'https://i.ytimg.com/vi/L0_AZh8i9Wg/maxresdefault.jpg',
        sourceNote: 'Cover of díl #44, whose guest is Lukáš Caha - second from the left',
        face: { x: 512, y: 508, size: 300 },
    },
    {
        personId: 'richard-mladek',
        sourceUrl: 'https://i.ytimg.com/vi/xCdy420Cpw0/maxresdefault.jpg',
        sourceNote: 'Cover of díl #43, whose guest is Richard Mládek - second from the left, cut clear of the turtles',
        face: { x: 450, y: 505, size: 215 },
    },
    {
        personId: 'adam-zvada',
        sourceUrl: 'https://github.com/zvadaadam.png?size=460',
        sourceNote: 'His own picture on GitHub, where he writes he works at Expo / SteerCode',
        face: { x: 232, y: 200, size: 330 },
    },
    {
        personId: 'petr-brzek',
        sourceUrl: 'https://github.com/petrbrzek.png?size=400',
        sourceNote: 'His own picture on GitHub, where he writes he works on Macaly',
        face: { x: 200, y: 175, size: 380 },
    },
    {
        personId: 'dalibor-krejci',
        sourceUrl:
            'https://cdn.sanity.io/images/djwo98md/production/6fa6bcd95b900c4b63e7ee59f0c10ced623b3b1a-1536x1545.jpg',
        sourceNote: 'His portrait on pauseai.cz, the movement he came to the show to explain',
        face: { x: 760, y: 620, size: 1000 },
    },
    {
        personId: 'prokop-simek',
        sourceUrl: 'https://i.ytimg.com/vi/W5RVPpiolYs/maxresdefault.jpg',
        sourceNote: 'Cover of díl #34, which is "s Petrem, Pavlem a Prokopem" - last from the left',
        face: { x: 940, y: 515, size: 250 },
    },
    {
        personId: 'matyas-krecek',
        sourceUrl: 'https://i.ytimg.com/vi/Kev5eZwiWMU/maxresdefault.jpg',
        sourceNote: 'Cover of díl #24, the díl "s Lenkou a Janem z CloudTalku" - first from the left',
        face: { x: 128, y: 545, size: 250 },
    },
    {
        personId: 'jan-cienciala',
        sourceUrl: 'https://i.ytimg.com/vi/Kev5eZwiWMU/maxresdefault.jpg',
        sourceNote: 'Cover of díl #24, the díl "s Lenkou a Janem z CloudTalku" - second from the left',
        face: { x: 352, y: 540, size: 250 },
    },
    {
        personId: 'lenka-sefcakova',
        sourceUrl: 'https://i.ytimg.com/vi/Kev5eZwiWMU/maxresdefault.jpg',
        sourceNote: 'Cover of díl #24, the díl "s Lenkou a Janem z CloudTalku" - the only woman on it',
        face: { x: 600, y: 545, size: 250 },
    },
    {
        personId: 'tomas-mikolov',
        sourceUrl: 'https://i.ytimg.com/vi/RrKFAyYjbgg/maxresdefault.jpg',
        sourceNote: 'Cover of díl #23, whose only guest is Tomáš Mikolov - in the middle',
        face: { x: 640, y: 545, size: 250 },
    },
    {
        personId: 'pavel-ungr',
        sourceUrl: 'https://i.ytimg.com/vi/8pe_TMlItOY/maxresdefault.jpg',
        sourceNote: 'Cover of díl #30, whose only guest is Pavel Ungr - in the middle',
        face: { x: 640, y: 555, size: 260 },
    },
    {
        personId: 'matous-havlena',
        sourceUrl: 'https://i.ytimg.com/vi/p9PvTNkc2qY/maxresdefault.jpg',
        sourceNote: 'Cover of díl #47, whose guest is Matouš from Apoco - third from the left',
        face: { x: 788, y: 530, size: 250 },
    },
    {
        personId: 'tomas-kroupa',
        sourceUrl: 'https://i.ytimg.com/vi/xtebb91xaIo/maxresdefault.jpg',
        sourceNote: 'Cover of díl #21, whose guests are Tomáš and Ondřej from Agent ID and Galenio - first from the left',
        face: { x: 128, y: 555, size: 240 },
    },
    {
        personId: 'ondrej-sukac',
        sourceUrl: 'https://i.ytimg.com/vi/xtebb91xaIo/maxresdefault.jpg',
        sourceNote: 'Cover of díl #21, whose guests are Tomáš and Ondřej from Agent ID and Galenio - last from the left',
        face: { x: 1148, y: 545, size: 230 },
    },
    {
        personId: 'ondra',
        sourceUrl: 'https://i.ytimg.com/vi/p30kZEcrivI/maxresdefault.jpg',
        sourceNote:
            'Cover of díl #58, which welcomes "Ondru": the one of its four faces which is not Petr, Jacek nor Katka',
        face: { x: 1078, y: 490, size: 250 },
    },
];

/**
 * Turns the place of a face into the square to cut, kept inside the picture it is cut from
 */
function createFaceCrop(face, pictureWidth, pictureHeight) {
    const size = Math.min(face.size, pictureWidth, pictureHeight);
    const left = Math.round(Math.min(Math.max(face.x - size / 2, 0), pictureWidth - size));
    const top = Math.round(Math.min(Math.max(face.y - size * FACE_HEIGHT_RATIO, 0), pictureHeight - size));

    return { left, top, width: size, height: size };
}

async function fetchPicture(sourceUrl) {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
        throw new Error(`${sourceUrl} answered ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
}

async function cutPortrait({ personId, sourceUrl, face }) {
    const picture = sharp(await fetchPicture(sourceUrl));
    const { width, height } = await picture.metadata();
    const filePath = `${PORTRAIT_DIRECTORY}/${personId}.jpg`;

    await writeFile(
        filePath,
        await picture
            .extract(createFaceCrop(face, width, height))
            .resize(PORTRAIT_SIZE_IN_PIXELS, PORTRAIT_SIZE_IN_PIXELS, { fit: 'cover' })
            .jpeg({ quality: PORTRAIT_JPEG_QUALITY, mozjpeg: true })
            .toBuffer(),
    );

    return filePath;
}

/**
 * The portraits to cut: every one of them, or only those the command line names
 *
 * Note: An identifier which is not a portrait of this script is a typo, and saying so beats quietly cutting nothing.
 */
function selectPortraits(personIdsToCut) {
    if (personIdsToCut.length === 0) {
        return PORTRAITS;
    }

    const unknownPersonIds = personIdsToCut.filter((personId) => !PORTRAITS.some((portrait) => portrait.personId === personId));

    if (unknownPersonIds.length > 0) {
        throw new Error(`No portrait is cut from ${unknownPersonIds.join(', ')}`);
    }

    return PORTRAITS.filter((portrait) => personIdsToCut.includes(portrait.personId));
}

async function main() {
    await mkdir(PORTRAIT_DIRECTORY, { recursive: true });

    for (const portrait of selectPortraits(process.argv.slice(2))) {
        console.log(await cutPortrait(portrait), '←', portrait.sourceNote);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
