# Personal portfolio publication

The 109-entry public catalogue is derived from the reviewed D-confidence entries of the October 31 project research. It includes project families, modules and historic experiments, not 109 independently maintained products. Entries with unresolved authorship, forks, the explicitly internal category, and 15 Sites currently restricted to selected visitors are not published. Public Sites Rozbaleno and the financial board keep their current public URLs. Do not expand audiences from portfolio code.

Prominence is stored in the content: 1 neutral, above 1 promotes, between 0 and 1 reduces, 0 omits homepage selections. The shared ranking halves the temporal component after two years and keeps archive items discoverable. Podcasts keep strict newest/oldest sorting and use show diversity plus one guaranteed AI ta Krajta appearance in the homepage four. Feed ordering stays chronological.

## Homepage portrait

Both personal domains use the approved charcoal-blazer portrait and fitted burgundy-brown hat from Promptbook through `components/people/PavolPortrait.tsx`. The unchanged image assets, intrinsic alignment, rear lining and alpha-masked contact shadow are shared. The hat remains removable with `showHat={false}`. The personal hero retains its sage frame and gold disc, with headroom above the hat and consistent framing on mobile and desktop.

## Real images

- public/pavol/projects/collboard-ui.png: https://raw.githubusercontent.com/collboard/modules-sdk/main/media/collboard.png
- public/pavol/projects/h-edu-ui.png: https://www.h-edu.cz/media/Obrazky/PodobneUlohy.png, product context https://www.h-edu.cz/matematika
- public/pavol/gallery/talk-{1,2,3}.jpg: the existing author website, https://github.com/hejny/pavolhejny-old/tree/master/assets/background/free-spirit-{1,2,3}.jpg, commit 9604bf4fae0e198125aa19591850140acd3472bd. These show one talk from different views. Exact event/date/photographer are not established, so no such attribution is invented.

## Community calendar

Pavol's preview/archive reads loadPublishedWorkshopSummaries(), the same public projection as the community calendar. Online-workshop's existing lecturer is Pavol. Other event types require an explicitly reviewed slug in PAVOL_EVENT_PARTICIPATION. This avoids claiming all community events as his own. Changes to selected public term titles/times/publication are picked up on hourly page revalidation. No private room, member, registration or participant fields are rendered.

## Bilingual articles

Publish a Czech and English variant for each new Pavol article, with one translationGroupId, reciprocal canonical language links, an actual PDF and separately prepared narration in each language. Translation is editorial, never a build-time provider call. Narration must remain pending until an actual recording exists; do not reuse Czech speech as English or invent word alignment.

On 2 November 2026 the first English narration was generated in the owner's signed-in ElevenLabs Studio, using the exact committed English script and the existing Pavol Hejný 2026 voice. The project is named `Promptbook - What comes after code generation - English narration`. Export completed and offered an MP3 download. Browser access disconnected during the download; the recording has not been imported, reviewed or added to the article/feed. Recover that existing export before doing anything that charges for another generation.

## Recent event gallery

The gallery links to the corresponding event rather than the raw image. These are real photographs from public posts; captions identify the event, not unidentified people.

- /pavol/gallery/prg-tinkerers-0.jpg: https://www.linkedin.com/posts/prgai_ai-tinkerers-prague-successfully-kicked-off-activity-7238952458255761408-9FTh; event: https://fel.cvut.cz/cs/aktualne/novinky/35902-iniciativa-ai-tinkerers-dorazila-ze-silicon-valley-na-cvut-vytvori-prostor-pro-setkavani-vedcu-i-nadsencu-do-umele-inteligence
- /pavol/gallery/cassini-0.jpg: https://www.linkedin.com/posts/hejny_great-to-be-a-judge-at-this-wonderful-event-activity-7241118995829915649-A2Yf; event: https://www.linkedin.com/posts/esa-bic-czech-republic_thank-you-for-a-successful-hackathon-and-activity-7241425842365505536-KYDa
- /pavol/gallery/rakathon-2025-6.jpg: https://cz.linkedin.com/posts/hejny_rakathon-aiprotirakovine-zpracovanitextu-activity-7317473932570230786-1GAf; event: https://cz.linkedin.com/posts/hejny_rakathon-aiprotirakovine-zpracovanitextu-activity-7317473932570230786-1GAf

## Publication gate, 2 November 2026

The approved portfolio changes are committed separately on `main`. Build, TypeScript and 129 relevant tests passed. Production deployment `dpl_AcMGjELZE1i4Vzqwpck26H1uw8GU` served the new pages and artwork, but the personal-chat smoke request returned 503 before generation because its question could not be stored. Startup logged the pending `2026-11-0201-personal-chat-sources.sql` migration and then PostgreSQL statement timeout `57014` after three minutes. Local PostgreSQL-compatible migration tests pass; the production blocker is not yet diagnosed.

Commit `80106041aaa7622858628b286177fc75abe0f6da` adds slow-migration lock diagnostics without logging SQL text, credentials or application records. It passed the migration tests and TypeScript, but Vercel refused its deployment with HTTP 402, `api-deployments-free-per-day`, reporting more than 100 deployments and a one-day retry interval. No billing or plan changes were made.

Production was therefore rolled back to the preceding deployment `dpl_7xoZyX5VXUMZZxyFdNivArQcce7h` (commit `723c4d3e2fd45d89009baaae85a8721ce43e42fb`). Both personal domains, ptbk.io and AI ta Krajta returned HTTP 200 afterward. The new portfolio changes remain on `main`, not on the restored production version. Once deployment capacity is available, inspect the migration lock diagnostics, fix the actual blocker and verify a persisted chat question, generated reply and authenticated history before promoting this release again.

## Homepage simplification, 13 November 2026

Both personal homepages now share a shorter six-section composition with four navigation links. The original
portrait and branding remain. Services have concise descriptions and attributed contact links. Training formats
live at `/training`; the form has only name, email and message and still uses the versioned personal enquiry
source, consent evidence and asynchronous CRM projection. Query-selected training and introductory-call drafts
remain editable. No backend or database schema changes are required.

Promptbook and H-edu are the homepage project selection; the project catalogue and complete case studies remain
at `/projects`. Two exact testimonial excerpts link through a native disclosure to all five full originals.
One writing/speaking section selects at most three items, preserves article and podcast playback, retains old
section hash aliases and links to complete article, podcast and event archives. English homepage selection uses
matching-language content; the archives retain original Czech recordings and language labels. Press coverage is
still accessible in a native disclosure. Footer links include podcast subscriptions and cookie settings.
