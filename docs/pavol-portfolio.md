# Personal portfolio publication

The 109-entry public catalogue is derived from the reviewed D-confidence entries of the October 31 project research. It includes project families, modules and historic experiments, not 109 independently maintained products. Entries with unresolved authorship, forks, the explicitly internal category, and 15 Sites currently restricted to selected visitors are not published. Public Sites Rozbaleno and the financial board keep their current public URLs. Do not expand audiences from portfolio code.

Prominence is stored in the content: 1 neutral, above 1 promotes, between 0 and 1 reduces, 0 omits homepage selections. The shared ranking halves the temporal component after two years and keeps archive items discoverable. Podcasts keep strict newest/oldest sorting and use show diversity plus one guaranteed AI ta Krajta appearance in the homepage four. Feed ordering stays chronological.

## Real images

- public/pavol/projects/collboard-ui.png: https://raw.githubusercontent.com/collboard/modules-sdk/main/media/collboard.png
- public/pavol/projects/h-edu-ui.png: https://www.h-edu.cz/media/Obrazky/PodobneUlohy.png, product context https://www.h-edu.cz/matematika
- public/pavol/gallery/talk-{1,2,3}.jpg: the existing author website, https://github.com/hejny/pavolhejny-old/tree/master/assets/background/free-spirit-{1,2,3}.jpg, commit 9604bf4fae0e198125aa19591850140acd3472bd. These show one talk from different views. Exact event/date/photographer are not established, so no such attribution is invented.

## Community calendar

Pavol's preview/archive reads loadPublishedWorkshopSummaries(), the same public projection as the community calendar. Online-workshop's existing lecturer is Pavol. Other event types require an explicitly reviewed slug in PAVOL_EVENT_PARTICIPATION. This avoids claiming all community events as his own. Changes to selected public term titles/times/publication are picked up on hourly page revalidation. No private room, member, registration or participant fields are rendered.

## Bilingual articles

Publish a Czech and English variant for each new Pavol article, with one translationGroupId, reciprocal canonical language links, an actual PDF and separately prepared narration in each language. Translation is editorial, never a build-time provider call. Narration must remain pending until an actual recording exists; do not reuse Czech speech as English or invent word alignment. The first English article is fully translated but its narration needs an authorized ElevenLabs runtime credential before explicit generation/review.
