# Current preversion

- Added independent starting and ending commit IDs to workshop project settings in `/admin/workshops`, with commit
  message, author and date previews and separate date-based autofill buttons. The participant project graph opens on
  the inclusive range and highlights it, with expansion and pagination for history outside it. Missing bounds leave
  their respective side open. All views and lookups retain the selected branch patterns; unrelated branches stay
  hidden. Commit IDs are validated and normalized on save, and the range is copied or cleared with its repository.
  Concurrent autofill preserves both bounds, changing the branch selection discards pending history responses, and
  temporary GitHub failures retain the loaded graph without announcing historical commits as new.

- Granting trust or moderator status now approves all pending submissions by that room participant: chat messages,
  custom poll answers (including shared polls), and community projects. Promotion and approval commit together;
  rejected submissions stay rejected and interaction bans still block automatic approval. Moderators on
  `/cs/online-workshop/participant` and `/cs/komunita`, and administrators in the participant list, see each author's
  complete pending count. The shared project gallery refreshes with the room after approval.

- Added light and dark modes to `/cs/komunita` and `/cs/online-workshop/participant`, including their waiting rooms
  and shared project views. One accessible appearance control follows the device setting by default and remembers an
  explicit choice across visits, tabs, and rooms. Shared palette tokens cover chat, polls, calendars, event cards,
  materials and Markdown, project and membership dialogs, and cookie controls without duplicating the room UI.
  Switching appearance preserves typed names, e-mails, chat drafts, and the connected session.

- Allowed one isolated E2E retry for transient development-server or external-database failures. Each retry runs
  the complete test with its original assertions; failed-attempt traces remain available for diagnosis.

- Improved the shared event mini cards on `/cs/komunita`: removed star ratings and their unused feedback queries,
  enlarged project previews with a wide image, readable title and description, and a repository fallback. Ended
  workshops show a replay-length badge using the total video duration minus the configured recording start offset.
  The calendar and card list use the same component and keep their existing destinations and participant hand-off.

- Added a downloadable Czech wrap-up PDF to the ended stage of `/cs/online-workshop/participant?workshop=`.
  It includes the workshop description, key points extracted from existing descriptions and materials, full readable
  materials with clickable links, and any presentation, repository, and deployments. The download refreshes the
  existing authenticated room state, preserving publication, unlock, and membership rules and refusing workshops
  that have not ended or have been reopened. PDFs support Czech text and multiple pages and are generated in the
  browser on demand, with no new administration, database fields, or saved documents.

- Added a quiet display-settings switch to `/admin/workshops` and `/admin/community` for screen sharing. Artificial
  controls stay hidden by default: prepared chat comments and reactions, synthetic viewer counts, and artificial
  comment and poll-vote adjustments no longer appear among ordinary moderation controls. The switch is one compact
  settings icon away and keeps its intentional state in the shareable address as `artopts=on` or `artopts=off`; it
  changes no stored room data.

- Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
  picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
  next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
  keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
  makes it disappear as the next workshop.

- Added reusable Book agents to workshop and community chat. The shared Agents tab in `/admin/workshops` and
  `/admin/community` edits personalities with Promptbook `BookEditor`, enables each agent per room, and shows recent
  activity. `LiteAgent` from `@promptbook/node` uses server-side `OPENAI_API_KEY` and each agent's source Book to reply
  to approved participant, artificial and agent comments. A durable queue, per-agent cooldowns, leases and a two-turn
  limit prevent duplicate replies and unbounded agent conversations. Replies use the existing chat, threads, links and
  moderation; administration and CSV exports distinguish all three origins and retain agent/run identifiers.
  Live workshops can share stream-tab audio or a presenter microphone from the Agents tab. Private rolling
  transcripts supply timely questions; stopping capture, ending the event or disabling an agent prevents stale
  questions. A restarted capture excludes previous sessions' speech, and publication locks the active session against
  a concurrent stop. Books, transcripts and execution records remain private. Added migrations, isolated PostgreSQL tests,
  browser-capture tests, and setup instructions in `README.md`.

- Added follow-up actions to the ended stage of `/cs/online-workshop/participant?workshop=`:
  non-paying attendees can buy membership through the existing popup even when no recording exists,
  and everyone gets the next upcoming workshop, the next paid workshop, and an extra community button.
  Recommendations use published future terms and the shared event cards; room links preserve the attendee's
  identity. A term recommended in both roles appears once, and missing future terms show a short notice.
  Replay, feedback, PDF and material access stay available.

- Added a shared AI approval mechanism for chat in `/cs/online-workshop/participant?workshop=` and `/cs/komunita`,
  member-written poll answers, community projects, and project discussions. New submissions are saved first, then
  clearly suitable text can be approved automatically; uncertain content and unavailable AI stay in the existing
  manual queue. Trusted members and moderators retain immediate approval, and banned authors cannot gain AI approval.
  One atomic database operation protects concurrent human decisions, edits and deletions and privately records AI
  approvals. The reviewer never rejects content or changes trust. Server configuration, the eight-second timeout,
  provider setup, and the scope of text/URL review are documented in `README.md`; without a configured key, moderation
  continues as before. Existing moderator-created materials need no approval and are outside the review queue.

- Replaced the centered cookie popup on every page with a shallow desktop strip
  and an inset mobile panel. The banner and its settings now use
  light, workshop, or podcast colors together, with clearer button hierarchy,
  keyboard focus, and scrollable settings on short screens. One shared measurement
  hook keeps the banner, podcast player, coder badge, booking notice, and admin
  table scrollbar clear of each other as they appear or resize; reserved space
  keeps footer links reachable. Existing Czech/English copy, saved choices, and
  the privacy page's cookie settings link remain available across all pages.

- Put the answers members write into a community poll through the very same moderation a chat message goes through. An
  `Other` answer written in `/cs/komunita` or in an attached `/cs/online-workshop/participant?workshop=` is no longer
  public the moment it is written: it waits for a decision, while a trusted member and a moderator have theirs approved
  as they write it, because a chat message, a shared project and now a poll answer are all decided by one shared
  submission policy rather than by a rule each surface wrote for itself. The member who wrote the answer keeps seeing
  it, marked `Čeká na schválení`, and their vote is counted for them straight away, so waiting for a moderator never
  costs anybody their own choice; everybody else receives neither the answer nor its vote until it is approved, which
  keeps a poll's total honest without a second counting rule. A rejected answer leaves the poll for everybody including
  its writer, exactly as a rejected message leaves the chat. Deciding about an answer is offered where the decision
  belongs: a moderator of the room which owns the poll approves or rejects it from the poll itself, by the same quiet
  buttons which moderate a chat message, while a moderator of an occurrence the poll is merely about reads the same
  answers every other member does, because a poll is administered by its community rather than by whichever room it is
  attached to. `/admin/workshops` and `/admin/community` additionally say who wrote each answer, with the name and
  normalized e-mail they connected with and the moment they wrote it, and can reword it, reject it, or remove it
  together with the votes cast for it. A prepared choice of the administration is untouched by all of this: it is still
  edited as part of its question, stays public, and is never attributed to a member. An answer written before this
  change keeps being public, and its writer is recovered from the first vote it ever received, which is the vote the
  writing itself cast.

- Let an administrator write the start of a paid replay on a clock. The stage settings of `/admin/workshops` now ask
  for `Začít záznam od` in its own `Hodiny`, `Minuty` and `Sekundy` boxes instead of in one number of seconds, so the
  moment the workshop itself begins at is written as `0 : 1 : 15` rather than counted out as `75`. Nothing about the
  offset itself changed: it is held, saved, exported and read by `/cs/online-workshop/participant?workshop=` in exactly
  the same seconds as before, the field says underneath which number of seconds it is about to save, and a term which
  was given its offset before this change opens on the very same position of its recording.

- Let the project a term is about run in more than one place. The project settings of `/admin/workshops` now take one
  address of a deployment per line instead of a single address altogether, and
  `/cs/online-workshop/participant?workshop=` opens every one of them beside the repository the workshop follows. A
  project deployed in one place is still simply its `Živá aplikace`, exactly as it was; several deployments are named
  by the addresses they are reached at — `workshop.example/app` beside `staging.workshop.example/app` — because one
  repeated name would say nothing about which of them a participant is opening. The compact card of the term in
  `/cs/komunita` is previewed from the first written address, so a card still costs one request however many places
  the project runs at, and the settings export writes them all on one line. Every deployment belongs to the connected
  repository exactly as its branch patterns already did: they are written, changed and cleared as one connection, so
  clearing the repository can leave behind no address of a project nobody is connected to. An address which cannot be
  opened, and a second address which means the very same page, are refused when written and left out when read, while
  an address stored before this change keeps its place as the first deployment of its project.

- An administrator in `/admin/workshops` or a moderator in
  `/cs/online-workshop/participant?workshop=` can now turn any chat comment into an immediately available material.
  The source comment remains in the chat untouched; the new material keeps its complete Markdown body and names its
  chat author in the title. Both entry points use the ordinary material-creation path, so its short links, live room
  refresh, publication and member access behave exactly like a material created in the content editor.

- Made the compact cards of the published terms in `/cs/komunita` tell more of the story of an event without giving
  the calendar and the card-list two versions of it: the same card is shown below a selected calendar day, below a
  month, and in the `Karty` view, and can now show the anonymous average of the star ratings with its count, a visual
  preview of the project the workshop followed, and the real replay length. That length is the total public YouTube
  duration less the start offset an administrator set to remove the waiting room, so `1:30:00` with a `75`-second
  offset is named `1:28:45` rather than pretending the whole live stream is replay. Ratings are reduced before the
  browser receives them — no response, author, or e-mail is published — and the raw recording identifier stays on the
  server as well. A missing rating, project, deploy-preview, video, or public duration simply leaves that small part
  off the card; the ordinary event link, calendar subscription, and membership gate keep exactly their former jobs.

- A term which has only just been held is no longer one more term of the history. Where an event stands in time is now
  one of four things instead of three — it is still ahead, it runs right now, it is freshly past while less than a day
  has gone by since the end recorded for it, or it is past — and that is answered in the single place which already
  answered the other three, so no list, badge, or colour can decide it on its own. In `/cs/komunita` such a term wears
  its own amber `Právě proběhlo` badge, colours its own day of the calendar, is named in the legend beside the three
  others, and is listed after what is ahead rather than at the head of the archive. In
  `/cs/online-workshop/participant?workshop=` it is offered in the open under `Právě proběhlo`, between the workshops
  which run or are coming and the `Proběhlé workshopy` disclosure, so somebody who was at last night's workshop finds
  the room they have just left without unfolding the whole history to look for it. `/admin/workshops` lists such a term
  under `Aktuální a nadcházející`, after what runs and what is coming, because the workshop of last night is the one an
  administrator is still working on — reading its participants, moderating its comments, publishing its recording — and
  its `Historie` now holds only the terms nobody is wrapping up any more, so opening a freshly held term no longer
  unfolds that archive either. Everything which opens only after a workshop is over is untouched: the wrap-up, its PDF,
  the feedback, and the paid recording all read a freshly past term as exactly as finished as one from last spring.

- A term near enough to be looked forward to is now named rather than merely dated. One held today reads
  `dnes, úterý 15. 9. 2026 · 11:11`, one held tomorrow `zítra, středa 16. 9. 2026 · 11:11`, and one held later in the
  same week `tento čtvrtek 17. 9. 2026 · 11:11` — in the gender the name of that weekday has in Czech, so that
  `tento čtvrtek` stands beside `tato středa` and `toto úterý`. A week runs from Monday to Sunday, as it does in the
  Czech Republic, and a term further away than that stays the plain date it always was, so a list of distant terms
  does not grow a weekday it never showed. The waiting room and the term picker of `/cs/online-workshop/participant`,
  the cards and the calendar day of `/cs/komunita`, the header, hero, term picker and chosen-term line of
  `/cs/online-workshop`, its thank-you page, and the term picker of `/ai-supervize-mini` all say it, because how near a
  day is is worked out once, from the day a term falls on in Prague and the day the page was built on. That day comes
  from the server rather than from the browser, so a page says exactly what it was sent as instead of renaming its
  terms the instant it hydrates. Nothing which is not a term read against today changed: the times of chat messages and
  materials, the dates a membership is paid to, the printed participant sheet, the published calendar, and the notes a
  registration is counted by are untouched.

- Moved the community polls attached to an occurrence to the bottom of `/cs/online-workshop/participant?workshop=`.
  A participant now reads the stage, the invitation, and everything the workshop hands over in its materials first, and
  is asked for their vote below them, because a poll a workshop is merely the subject of matters less to its
  participant than the materials they came for. The poll itself, its options, its written answers and the one shared
  e-mail-owned vote are unchanged, and `/cs/komunita` keeps its own polls above its materials, because that is where
  the community makes its decisions rather than being asked about somebody else's. Where the polls of a room belong is
  now decided once, by the kind of that room, so the two rooms cannot drift into their own orders.

- Let `/cs/komunita` list the conferences and workshops which lecturers of the community speak at elsewhere. A term of
  the new `Externí akce` kind of event is administered in `/admin/workshops` beside every other term and carries one
  thing the terms held here never do: the address of its organizer, which is where its card and its calendar day lead,
  opened beside the room rather than instead of it. It is otherwise an ordinary term, so it is dated, placed, priced,
  coloured by whether it is over, running or still ahead, and published to `/cs/komunita/calendar.ics` exactly like
  the rest. Because such an event is held by somebody else, this application runs no room and gathers no registration
  for it: its administration says so rather than reporting an audience of nobody, the membership never returns a payer
  to somebody else's website, and a term whose address is missing is refused when written and offered nowhere if it
  was ever stored without one.

- An administrator can now enable an `Other` answer for a community poll. In both `/cs/komunita` and an attached
  `/cs/online-workshop/participant?workshop=` room, a member can write an answer which immediately becomes a normal,
  anonymous option and receives that member's shared e-mail-owned vote at the same time. Everyone can then vote for
  it from either room; duplicate wording reuses the existing option, and later administration edits keep member-written
  answers intact.

- Added a configurable start offset in seconds to the stage settings of `/admin/workshops`. After an online workshop
  ends, `/cs/online-workshop/participant?workshop=` now opens the paid member replay at that position, so the same
  uploaded stream can skip its empty waiting room without a second trimmed upload. The countdown and live stream are
  unchanged; members without replay access still receive only the existing teaser or membership offer.

- Placed the community material of `/cs/online-workshop/participant?workshop=` by what the member reading it has: a
  participant who does not pay for the membership is invited into the community before the materials of the workshop,
  while a paying member keeps that invitation at the end of the list as one more way on. The card itself, its link and
  the identity it carries are unchanged, and the presentation and the project of a workshop stay where they were. Every
  card which shares the material list now says where among the ordinary materials it belongs, so one rule places them
  all instead of each room deciding its own order.

- Added a presentation setting to `/admin/workshops`. A workshop can now link a PDF, PowerPoint file, or public GitHub
  Markdown page, and `/cs/online-workshop/participant?workshop=` shows it beside ordinary materials with the same
  open action and desktop QR code. The presentation is a shared workshop-level material, so it is immediately visible
  to free and paid participants alike without becoming timed or membership-gated content.

- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
  participants without turning the repository into timed or membership-gated content.

- Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
  community material. It is shown even before an administrator has unlocked any ordinary material and remains
  available to free and paid members alike, while carrying the participant identity through the existing shared
  community link. The material list now has one reusable special-material slot for room features that belong beside
  ordinary materials without becoming timed or membership-gated workshop content.

- Let an administrator make a prefix discount code by ending it in `*`: `SUMMER*` now gives its configured discount
  to every submitted code starting with `SUMMER`. The same database resolver supplies form previews and the atomic
  registration consumption, so one path cannot accept a code which the other would reject; an exact code takes
  precedence over a pattern, then the more specific prefix wins.

- Let `/admin/workshops` reopen a workshop by clearing its recorded end, and give an open-ended workshop quick choices to end now, one hour after its start, or two hours after its start; each choice uses the existing live update, so `/cs/online-workshop/participant` immediately keeps or replaces the stream accordingly.
- Let a paid community member open their Stripe Customer Portal from the membership popup of `/cs/komunita`, through
  a new short-lived, authenticated link which belongs only to that member and returns them to the community. The
  portal is now available alongside, rather than instead of, the confirmed in-app cancellation and reactivation of
  the next renewal, so card and invoice management stays with Stripe while the simple cancellation remains where the
  member already sees their membership.

- Let a paid member manage renewal directly in the membership popup of `/cs/komunita`: after an explicit confirmation,
  they can stop the next Stripe payment without losing the days they have already paid for. The modal and its header
  badge say that the membership is ending and name the last paid day, then offer one-click reactivation until that day.
  The room saves and reads this intent through the same subscription-state mapping as the Stripe webhook, so a refresh,
  a later payment event and the member-facing state cannot disagree.

- Moved the community membership surface out of the `/cs/komunita` content column into the room’s shared popup
  modal. Both the `Free členství` and `Placené členství` header badges now open it, so a member can see their current
  status or the paid plan, agree to the terms, apply a discount, and enter the same Stripe checkout without leaving
  the community or scrolling past its materials. A return from Stripe opens that modal as well, preserving the clear
  paid or cancelled result the in-page surface previously showed.

- Added the paid-membership administration to `/admin/community`: its new `Placená členství` tab pages, filters and
  sorts the durable payment records by name, e-mail, lifecycle status and Stripe environment, shows the price,
  discount, payment identifiers and important lifecycle dates, and opens the exact checkout or subscription in Stripe
  for the payment changes which Stripe remains authoritative for. The existing `Účastníci` table now gives every
  community session the same shared membership-status badge, including the explicit free state, from one batched
  e-mail lookup. Each badge opens that member's payment record and each payment record opens their community
  participant history, so the two administration views stay directly connected without pretending one room session is
  the durable paid membership.

- Show every visible community poll attached to an occurrence inside that occurrence's participant room, including its
  current aggregate and the same attached-workshop labels the community and administration use. The workshop room reads
  the poll without copying it or inventing a second voting system: polls remain owned and edited in the community,
  while one e-mail-owned vote is shown and counted consistently wherever that attached poll is visible.

- Let a member buy the paid community membership inside `/cs/komunita` itself, through the Stripe payment gate, without
  ever leaving for the public membership page. The room already knows who is reading it, so it asks for nothing but a
  discount code and the agreement to its terms, then opens the gate for the monthly price this application decides -
  including a code's permanent discount or the temporary discount it grants for its configured first monthly renewals.
  The membership of a member is the same membership however often they reconnect, because it belongs to the address
  they connect with. A
  member who comes back from the gate has their payment confirmed against it immediately, while the webhook of the gate
  keeps following the subscription afterwards, so a cancelled membership, a failed payment and a payment which finished
  after the browser was closed all reach the room. The badge in the room header now says which membership its member
  has and leads a free member to that offer instead of to the landing page, a paying member is never sold the same
  membership again, and a member whose payment failed keeps their membership while the gate is still trying. A server
  which was given no Stripe key offers nothing at all rather than a button which cannot work, and a server on test keys
  says so beside the payment and names the test card, so a rehearsal is never mistaken for a real payment. How to
  configure the gate is written in `AGENT_MESSAGE.md`.

- Put community projects through the same moderation lifecycle as chat messages. A regular member's newly shared
  project waits for a community moderator or an administrator, while a trusted member or moderator has their project
  approved immediately by the same shared submission policy. Pending cards stay visible only to their author and the
  moderators deciding them; until approved they cannot be voted on or opened into a public project discussion. A
  community moderator can decide from the project gallery, and `/admin/community` now has the complete project queue,
  including rejected cards, so an administrator can approve, reject, and audit every decision.

- Made the material QR codes in the workshop and community rooms compact and square. Their shared renderer now owns
  the exact canvas dimensions and removes browser baseline space, while each material uses only the code's built-in
  scannable white quiet zone rather than a second padded white card. The redundant `Otevřít v telefonu` caption is
  gone; when one material has several links, the short label below each code remains to distinguish them.

- Made every wide table in the administration usable without travelling to its last row first: a shared table viewport
  now mirrors horizontal scrolling into a clearly visible bar fixed to the bottom of the screen while that table is in
  view, yet keeps the native scrollbar as a fallback. The participant, contact, discount-code and short-link tables
  all use it, and their useful identity column — the participant or contact name, a discount code, or a shortcode —
  stays pinned while the rest is explored.
- Said on every term of `/cs/online-workshop` which workshop it is. Each card of the picker now names the workshop
  held on that date and says what it is about, in the very words `/admin/workshops` wrote about that term, so a
  visitor chooses a subject rather than guessing behind which of four dates the topic they came for is hiding. What a
  term is about is read from the term itself and is now part of every list of terms rather than of the live room
  alone, so the room and the list can never describe one term in two different ways. Both landing pages which let a
  visitor choose between the terms of their event now offer them with the very same card: `/ai-supervize-mini` keeps
  choosing its terms by when and where they are held, because its terms are the same workshop in another form, and
  reads their form and price from the administered event instead of from words written into the page.

- Put the terms listed on `/cs/komunita` into a calendar. The terms of every kind of event are now read as a month of
  a Czech calendar, which is what the room opens on: its weeks start on Monday, its days are dated in Prague, and each
  day is coloured by whether what is held on it is over, running, or still ahead. Choosing a day narrows the cards
  under the month to that day, and a day nothing is held on cannot be chosen at all. The very same terms are still
  read as cards, which now carry that same colour as a badge saying where the term stands in time, so the calendar and
  the cards can never say two different things about one term. A month a member is in which has no term at all is not
  opened on — the calendar opens on the month of the term which matters most instead of on an empty grid.

- Offered the whole calendar of those terms to the calendar application of a member. It is published at
  `/cs/komunita/calendar.ics` and taken either into Google Calendar or into any application which subscribes to
  `webcal:`, so a term which is published, moved or withdrawn later reaches everybody who took it without anybody
  deploying anything. The published calendar names no member: it carries neither an e-mail nor a name, leads to the
  public page of every term, leaves out the permanent community room which is no term of anything, and identifies each
  term by its own slug, so a renamed or moved term is corrected in a calendar which already knows it rather than
  appearing in it twice.

- Put the real community on `/cs/komunita/clenstvi`. The window in its header is no longer an invented conversation:
  it says how many members the community has, shows the newest approved messages of its chat in the order they were
  written, marks the moderators among their authors, and counts the messages and reactions the members really sent.
  Only the flight of the reactions is still made up, because nobody is reacting while a landing page is being read —
  which reactions fly is read from the ones the rooms celebrated most recently.

- Said the rest of the community on the same page out of the same source. The archive block now names the webinars
  which are really published, each with the day it is held on, and says how many have already been broadcast instead
  of listing four topics written by hand. A new section below it counts the members, the broadcast webinars, the
  messages and the reactions, shows the projects members shared with their preview, author and support, and gives the
  most chosen answers of the community poll. Nothing of it is claimed when it did not happen: a total of nothing is
  left out, a poll nobody answered is not shown, and the whole section disappears when the community has nothing to
  show yet. A member is named by their first name alone, so a page anybody can open never carries more of an identity
  than the room already showed.

- Replaced the stack of repeated registration forms on `/cs/online-workshop` with one clear term picker and one shared
  form. Every published online workshop is now a selectable date-and-time card, modelled after the picker on
  `/ai-supervize-mini`; choosing another card keeps the already entered name, e-mail and phone number, updates the
  selected workshop summary, and records that exact term in the registration and confirmation link. When no term is
  published, the page still shows a notice rather than a form that cannot be submitted.

- Let the host put a question on the live stage from `/admin/workshops`. In the `Komentáře` section, any attendee
  question which has not been rejected can now be sent above the stream of `/cs/online-workshop/participant`, replaced
  with another question, or hidden again; the artificial-comment form also has one action which creates arbitrary text
  and sends it to the stage immediately. Every connected attendee receives the change through the same private live
  channel as reactions, while the selected comment is kept as the room's current stage question so late joiners and
  reconnecting attendees see the same thing instead of missing a transient announcement. The database retains one
  comment reference rather than duplicating a message body, refuses a question from another workshop or a rejected
  comment, and clears a selected question if it is later rejected or deleted.

- Told apart the people who really attend a workshop from the people who only have it running. The room of
  `/cs/online-workshop/participant` now watches whether somebody is at their computer or phone at all — whether they
  move a pointer, type, scroll or touch the screen — and says so in the presence heartbeat it already sends, so every
  measured minute of a room is either actively or passively attended. Somebody who is watching without moving a hand
  for a while stays active, because the room waits two minutes of complete stillness before it decides that a chair is
  empty; somebody who left the tab open and walked away becomes passive and turns active again the moment they come
  back. Nothing new is asked of the browser and nothing is stored twice: the very same presence sample which already
  counted the audience now also remembers how that minute was attended.

  The overview graph of `/admin/workshops` and `/admin/community` draws it: next to `Diváci`, which is everybody who
  had the room open, there are now `Aktivní diváci` and `Pasivní diváci`, dashed in the colour of the audience they
  are a part of so that a reader sees at a glance how much of the room was really watching. The active audience is
  drawn from the start and the passive one is one click away, both are exported into the CSV and the picture of the
  graph like every other line, and which of them a graph draws travels in its link as usual. The time an individual
  participant is listed with is now named `Čas v místnosti` throughout the administration and its exports, because it
  has always meant how long that person had the room open rather than how attentively they watched it.

- Let a workshop have no end at all. A term whose end is left empty in `/admin/workshops` now runs from its start for
  as long as it takes: `/cs/online-workshop/participant` keeps its stream on the stage and its room open indefinitely
  instead of declaring the workshop over an hour after it started, which is what an unwritten end used to mean. The
  settings of such a running term offer an `Ukončit workshop` button which writes the current moment as its end, so
  the room replaces the stage with the closing wrap-up and its feedback the moment the workshop really ends, and the
  administration lists the term as finished. An end is still typed in by hand whenever it is known in advance, and a
  term whose end is open is still announced with the usual length of a workshop where a duration has to be named
  before the fact, such as in a calendar invitation.

- Made every event term of every kind of event administered from the one place and stored in the one table. A room
  which happens at a time is now a term of an event: it says which kind of event it is, whether it is held online or
  at a place, what one seat costs, and how many people fit into it. The administration of workshops asks these
  questions in the very same fields whether a term is being created or edited, and offering another kind of event
  means describing it in the event registry of the application rather than migrating the database or changing any
  page which lists terms.

- Removed the hard-coded terms of `/ai-supervize-mini` from the application. The page now lists the terms which the
  administration really published: its header, its hero, its dates, places, prices, capacities, the FAQ answers about
  the schedule, the capacity and the price, the registration form and the participant information page all read the
  same administered terms, so a term added, moved, withdrawn or repriced changes the page without a deploy. A term
  which is held somewhere names that place, a term held online says so, and a price of zero is presented as a free
  event. While no term is published, the page offers a short notice instead of a form nobody could submit. The seats
  already reserved keep being counted against the very same terms, because a registration written before this change
  named its term by the day it is held on and that identifier is still honoured.

- Listed the terms of every kind of event on `/cs/komunita`, each with the kind of event it is, its form and place,
  and its price. Where a term leads is now decided by the kind of event it is a term of: a term with a live room
  leads into that room carrying the already verified identity of the member, while a term without one leads to its
  landing page. Community polls about terms follow the same rule, so a poll about a paid workshop no longer offers a
  room that workshop does not have.

- Added a clickable `Free členství` badge beside the signed-in member information in `/cs/komunita`. It opens the
  existing membership page with the benefits of the paid membership, while the shared participant-room header now
  exposes a reusable slot for room-specific member information instead of duplicating its layout for the community.

- Simplified `/cs/komunita/clenstvi` to two easy-to-understand choices: the community and live AI webinars remain
  free, while one paid membership costs 199 Kč per month and can be cancelled anytime. The paid offer now focuses on
  webinar recordings and their archive, practical materials, additional content, priority questions and the existing
  paid-member Discord/community features; it no longer presents Standard versus Premium, annual billing or a free
  trial. New registrations are stored as a monthly payment request without a trial under a new plan id, while the
  legacy Standard/Premium plans, their billing terms and previously agreed prices remain supported for existing
  registrations. Discount codes, personalized name copy and e-mail prefilling continue to work.

- Added click analytics to `/admin/shortener`: every short link now shows its count of recorded public navigations,
  and its clickable count opens a private, newest-first history with timestamps, IP addresses, referrers, user agents,
  languages, platforms, and—for landing pages—the time the visitor opened the destination. The list search, provenance
  filters, sorting, and selected click history are all held in GET parameters, so an administrator can bookmark or
  share the exact view without exposing click metadata through the public short-link endpoint.

- Moved every community-project mutation out of PostgreSQL procedures and triggers into backend-owned transactions.
  Creating a project now generates its UUIDs and initial session hash in Node, makes the project room and author
  moderator together, and validates the member identity there; opening a discussion reuses or creates exactly one mapped room
  identity; and voting calculates the Reddit-style transition and both cached totals under a locked project row. The
  forward migration removes the old project-specific RPCs, identity/count/timestamp triggers, and the extension-backed
  project-ID default, so `gen_random_bytes(integer)` is no longer evaluated by this flow while foreign keys, uniqueness,
  RLS, and column constraints remain the database's storage boundary. Deleting a community member now removes their
  votes and reconciles the affected totals in that same backend transaction; a restrictive foreign key prevents a
  cascading delete from silently bypassing that reconciliation.

- Let a community poll be about workshop occurrences. The editor of `/admin/community?tab=polls` now offers every
  workshop beside the question and its choices; one poll can name several occurrences and one occurrence can be the
  subject of several polls. The shared transaction writes those attachments together with a poll and its settings.
  `/admin/workshops` now shows an attached community poll in a read-only `Ankety` section with its running result
  and a link to where it is administered, so no poll is editable from two places. Members of `/cs/komunita` see the
  published attached workshops beneath the poll as identity-prefilled room links, while drafts remain admin-only. The
  database enforces the many-to-many relationship, accepts only workshop occurrences as subjects, and removes an
  attachment when either its poll or workshop is removed.

- Added community project sharing to `/cs/komunita`: the room now places a three-column project gallery directly below
  the workshop links and above the materials, ordered by upvotes. Its home view shows the five strongest projects and a
  sixth “Další projekty” card which opens `/cs/komunita/projects` for the whole gallery. Members can vote one way per
  project with Reddit-style up/down controls, changing or removing their own vote without creating duplicate records.
  A two-step popup starts with only a URL, safely fetches its public Open Graph title, description and image, then lets
  the member edit the copy before saving the card. Every project also has `/cs/komunita/projects/<project_id>`, where
  the preview sits beside the existing moderated workshop chat; the author is connected as that discussion’s moderator
  automatically, while all project sessions still derive from the member’s existing community identity rather than
  creating a parallel sign-in system.

- Made community polls fully manageable from `/admin/community?tab=polls`: an administrator can now edit a question,
  preserve, add, remove or reorder its choices, switch voting and member visibility independently, and permanently
  delete a poll with all of its votes. The same shared poll editor supports both new and existing polls, so the
  community keeps using the workshop-room administration rather than growing a parallel dashboard. Each option also
  has a separately recorded artificial aggregate which can be adjusted without impersonating a member; create a poll
  hidden, seed those counts, then publish it to start the community with prepared results. Members of `/cs/komunita`
  see only visible polls and the combined anonymous totals, while database-side locking keeps a concurrent close or
  hide from accepting a last vote.

- Added `npm run backup-database:verify` and its terminal shortcut. It has `pg_restore` read the catalogue of the newest completed `.dump` archive in `backups/`, excluding interrupted temporary files, without connecting to or changing a database. Backup and verification share PostgreSQL-client invocation and platform-specific missing-client instructions, and the backup shortcut now calls only the canonical backup command instead of producing a duplicate `backup.sql`.

- Let moderators and administration-created artificial messages of `/cs/online-workshop/participant` and `/cs/komunita` carry active links while keeping every normal participant's URLs inert text. Eligible links now follow the same persisted ad hoc `ptbk.io` shortener path as materials, including their UTM source record and shortener redirect click measurement; the safe chat renderer opens only those already-shortened URLs in a new tab, so a raw destination cannot become an untracked active link.

- Made the workshop-feedback star picker preview the score under the pointer: empty stars now fill through the hovered score, so choosing a rating is visible before it is saved; the same preview appears while a keyboard user focuses a star.

- Added `/cs/komunita/clenstvi`, the Czech Premium membership landing page for developers, creators and small-business owners. Basic, Standard and Premium come from one inherited feature catalogue and a responsive comparison table; the page defaults to the concrete yearly prices of 1,800 Kč and 9,000 Kč, always shows their monthly equivalent beside the crossed-out monthly price, lets visitors switch to monthly billing, and gives both paid plans a seven-day trial. `fullname` personalizes the page, `fullname` and `email` pre-fill its registration, and the existing workshop `</>` and emoji animations form the community illustration. Community discount codes now validate and combine with the yearly price, limited codes are consumed by the server, and the accepted plan, trial, discount and guaranteed price are recorded with the Contact registration for e-mail activation because this application has no payment provider. The membership terms now cover the price guarantee and operator changes, suspension or termination while preserving non-waivable consumer rights.

- Added community polls to `/cs/komunita`: a signed-in administrator creates a question and two to eight choices from the new `Ankety` section of `/admin/community`, members choose one answer and may change that answer while voting remains open, and everybody sees only the aggregate result rather than who chose it. Ending a poll leaves its result readable and atomically refuses any last-moment vote. The community uses the existing shared room and administration rather than a parallel page, while the new RLS-secured tables, composite foreign keys, transactional poll creation and database-side vote guard keep every choice inside its community and attributable only to its own member.

- Put a branded QR code beside every linked material on the desktop layouts of `/cs/online-workshop/participant` and `/cs/komunita`. Each code carries the persisted public short URL prepared when `/admin/workshops` saves the material, so scanning it on a phone follows the exact same redirect and click tracking as opening, copying, or forwarding the material link; mobile layouts keep the panel out of the way. The shortener and the shared participant room now both use one client-only Promptbook QR renderer instead of loading separate implementations.

- Routed every HTTP(S) material link of `/cs/online-workshop/participant` and `/cs/komunita` through a persisted ad hoc `ptbk.io` short link, including ordinary Markdown, HTML, reference, autolink and bare-URL forms. The participant room no longer posts browser click events: opening, copying or forwarding the same short address is measured only by the shortener redirect, and `/admin/workshops` now derives material totals and its activity graph from those redirect records. Per-participant material-click figures were removed because a shareable public link cannot honestly identify the workshop participant who opened it. The shortener now records whether a link was manually created or ad hoc and which application created it, and `/admin/shortener` can display, filter and sort by both properties.

- Made `/cs/online-workshop/participant` survive a temporary overloaded or unavailable backend after it has been opened once: every successful room snapshot is now kept in the browser under its own workshop slug, for no longer than the participant session, and a failed refresh leaves the stream, countdown, chat and materials on the last known version instead of replacing the room with an error. A small shared status dot in the upper-right corner now quietly changes from green “Připojeno” to amber while the saved version is shown, keeps the detailed explanation in its tooltip and accessible label, and lets a participant retry immediately; it also serves `/cs/komunita` through the common participant room. The room keeps trying with a jittered exponential backoff rather than sending a whole audience back every half minute, and pauses nonessential presence reports until the service answers again; an authoritative missing-room or missing-session answer removes the private saved copy. The `state-changed` broadcasts already sent for every content and setting change in `/admin/workshops` make the next successful refresh replace that copy, so no second cache or migration is needed there.

- Added a small service worker for the online-workshop funnel: the landing page, confirmation and room prepare the already loaded Next.js assets, and every canonical participant document (`?workshop=…`) is saved network-first under that exact workshop selection. When the application server answers with an overload error or cannot be reached, a visitor who has opened that term before receives their local application shell and its matching room snapshot; prefilled e-mail/name URLs and legacy links without a selected workshop are deliberately never reused as a cached page.

- Added the third, post-workshop stage to `/cs/online-workshop/participant`: when an occurrence ends, the live video is replaced with a thank-you wrap-up, a progressively saved star review (low scores ask what to improve first; high scores ask what helped first), and a direct link to the chosen follow-up material. Chat and reactions remain available throughout. One ordinary Markdown material can now be marked as the follow-up; it is highlighted in the material list before the end and is enforced as a single selection per workshop in the database.

- Added the private `Zpětná vazba` section to `/admin/workshops`, with each rating, partial written response, and its linked Contact context. The same feedback joins the existing contact projection, so `/admin/contacts` and its CSV, vCard, and Book exports show a person's workshop feedback beside their Contact records and attendance history without duplicating source data.

- Verified `npm run test-for-ptbk-coder` locally: ESLint, TypeScript, the production build, and the public Playwright suite complete successfully. The two published-online-workshop scenarios remain intentionally skipped when no published workshop is available, while the other nine public scenarios pass.

- Added Playwright end-to-end coverage for the public site without touching `/admin`: the smoke test opens the public landing and information routes, while real `@example.com` submissions cover the footer newsletter, generic and business lead dialogs, qualification flow, podcast subscription, Pavol contact form, online workshop registration, AI Supervize Mini registration and its future-term interest form. The public workshop-room connection is covered too when a published room is available. `npm run test-e2e` runs headlessly, `npm run test-e2e:headed` opens the browser, both terminal shortcuts are available, and every run archives timestamped `.webm` recordings under the git-ignored `tests/e2e/videos/` directory. `npm run delete-test-data` is the separate, deliberate garbage collector: it removes `@example.com` Contact and workshop-participant records through `DATABASE_URL`, letting database cascades remove their dependent workshop activity without deleting data at the end of a test run.

- Added `npm run backup-database` and its terminal shortcut: `pg_dump` now writes the complete PostgreSQL database, including schema and data, as a timestamped custom-format archive under the git-ignored `backups/` directory, using the same server-only `DATABASE_URL` resolution as migrations and leaving no final file when the dump fails. If the PostgreSQL client is missing, the command explains how to install it on Windows, macOS, or Linux.
- Added one shared database migration runner: Node.js startup now applies `_initialize.sql` and then the remaining pending `migrations/*.sql` files in filename order, tracks their immutable names and SHA-256 checksums in `public."Migration"`, and refuses a changed or missing applied file. The same operation is available explicitly as `npm run migrate-database` and from the terminal shortcut, while a PostgreSQL advisory lock and one transaction keep concurrent server starts and failed migrations safe.
- Said the short link itself under "Your shortened link is ready!" in `/admin/shortener`, which until now read out the display text of the created link — most often the domain of the destination — so the result looked like the very address which had just been shortened, and only the QR code and the snippets below it carried the new one. The display text still wraps the short link in the HTML and the Markdown snippet, and copying the result into an application which takes nothing but plain text now hands over the short address instead of that label alone.
- Gave `/admin/shortener` the links it had been creating: every short link there is is now listed with what it leads to, when it was made and whether it greets its visitor with a landing page, is searched for by its shortcode, its destinations or its private note, and is edited or deleted from that very list. Editing keeps the address which has already been handed out and rewrites the destinations, the note and the landing page of a link, so a printed QR code can be pointed somewhere else instead of a second link being made for it; a link of the old Promptbook Studio system is neither retyped nor disowned by being edited here. Until now the page could only ever add one more link and never say which ones existed.
- Let the administration write the short links it lists at all: the service role had been given nothing but the right to insert one, and a link which was ever visited could not be deleted, because the clicks measured on it refused to let it go — they are now removed together with it.
- Stopped `/admin/community` drawing the community against a schedule it never had. Its graph opened on a "time of the workshop" which reached from the day the row was written to this very minute, so months of emptiness were drawn with everything which really happened squeezed into the last pixel of them; it now opens on everything which was ever measured in the room, is not offered a zoom back to that invented span, and says so in its own words instead of speaking of a workshop.
- Took the bar which places a member inside the start and the end of a workshop out of the detail of a community member as well, because the community has neither. The moments they were seen are said in words, which need no schedule to be true, and everything they did is still listed as it happened.
- Took the URL of the community out of `/admin/community` altogether: there is one community and its address was decided once and for all, so the settings neither show the field nor send it, the export of the settings leaves the column out, and the administration API now refuses an address written into any room whose kind keeps a fixed one, exactly as it already refuses a schedule and a stage.
- Replaced the stack of coloured bars in the "Přehled" of `/admin/workshops` and `/admin/community` with a real graph of the workshop in time: the audience is drawn across the hour the way a video draws its viewers, next to the messages, reactions, votes and clicks on the materials, all against one axis so that no two scales can invent a relation which is not in the data. Hovering anywhere reads out every line at that moment, dragging over the graph zooms into that span and the wheel zooms back out, and the graph opens exactly on the time of the workshop, from where it can be opened up to everything which happened before it started and after it ended.
- Let that graph be taken apart and taken away: every line is switched on and off by its own name, which says its number in the shown span as well; the reaction line counts either every reaction or one chosen emoji; and the whole thing is exported as SVG, PNG, PDF or as a CSV of the very numbers which are drawn, zoom, chosen lines and all.
- Added lines counted from the words of the chat: an administrator writes a regular expression, for example `pomoc|help`, names it, and the graph draws how many messages matched it minute by minute, without the letter case mattering and without an unfinished expression ever reaching the database.
- Made the whole view of the administration shareable, so a link now carries the room, the open section and everything about the graph — the zoom, the switched on lines, the chosen reaction and the metrics which were written — and signing in returns to that very view instead of to the dashboard as it was left.
- Stopped `/admin/workshops` blinking every few seconds: the administration reloads itself constantly, and until now each answer took the whole section off the screen and put a spinner in its place, so a graph could hardly be read at all. New data now slides into the drawing which is already there, and a quiet mark next to the title says a refresh is on its way.
- Started remembering who was watching a live room and when, as one row per participant and minute of the presence the room already reports, which is what the audience of the graph is counted from. A workshop which was held before this says so instead of drawing a room nobody watched.
- Made the workshop links of `/cs/komunita` carry the member who clicks them: a room now tells the participant reading it their own e-mail address, so every link it offers arrives at `/cs/online-workshop/participant` with `email` and `fullname` filled in and the workshop welcomes a community member without asking them to type either again. Until now only somebody who had just typed their e-mail into the connection form was handed on, and a member returning to the community on nothing but their session cookie was sent to an empty form — which the calendar invitation of a workshop room, built from the very same identity, was sending to an empty form as well.
- Took the subtitles off the stream of `/cs/online-workshop/participant`: asking the embed address not to turn them on was never enough for a participant whose own YouTube account keeps them on, or for a live broadcast which writes them by itself, so the room now unloads the subtitle module of the player, and keeps asking for the first few seconds because a player which has just appeared on the page is not listening yet.
- Fixed the participants of `/admin/workshops` and `/admin/community` still answering `column reference "fullname" is ambiguous` instead of listing anybody, which took their CSV and vCard exports down with them again: naming the row source of every ordering column mended the migration files but not a database which still held an older body of the paging function, so that function now settles the conflict for the whole of itself at once and drops every signature it ever had, leaving no older copy of it to be called instead.
- Said in the server console which query a database refused and everything it answered with — the error code, the details and the hint — and, when that code means the database simply does not know the schema this code was written against, that `migrations/*.sql` has to be applied to it; the arguments of the refused query are shown to the developer watching `npm run dev` and kept out of the long-lived log of a production server.
- Gave the live rooms moderators next to their invisible trusted participants: a moderator of `/cs/online-workshop/participant` or `/cs/komunita` is announced by a badge on their messages and in the header of the room, is shown every message which waits for a decision instead of only their own, and approves, rejects, corrects, or pins any message straight from the chat, while a trusted participant stays invisible with nothing but their own messages being approved as they write them.
- Let that moderator also trust the author of a message or take their interactions away, from the very same message, so a helpful participant stops waiting for moderation and a disruptive one stops reaching the room without anybody leaving the chat.
- Kept the appointment of a moderator with `/admin/workshops` alone, where an administrator makes and unmakes both trusted participants and moderators, filters the audience by either of them, and exports who moderates; a moderator of a room can hand on trust but never their own moderation, and cannot reach a fellow moderator whom a ban would dismiss, which both the room and the administration read from one description of what each moderating role may do.
- Added an AI-context `.book` export to `/admin/contacts`, using the exact same filtered and sorted contact selection as CSV and vCard while preserving every source Contact record, the normalized identity, and each workshop attendance with its join/last-seen times, active duration, comments, reactions, material-link clicks, votes, and moderation state.
- Gave the administration a real login instead of a token written into the address: `/admin/login` asks the one hard-coded administrator `admin` for the admin token of the server as their password, sends both in the body of one form, and answers with a signed session cookie which the browser keeps to itself for a week; whichever administration page was asked for is returned to after the sign in, refused credentials are said so on the login page itself, and a sign out ends the session again from the header of every administration page.
- Fixed valid admin form submissions being mistaken for cross-site requests when a reverse proxy gave Next.js an internal URL: browser same-origin metadata now remains authoritative, and the following redirect keeps the browser's public host.
- Took the `?token=` parameter out of the whole administration, so no page, no request of a dashboard, no export download and no short-link creation carries the shared token any more; every administration endpoint reads the session cookie instead and refuses a request which another site sends with it, which also keeps the credentials out of the browser history, the referrers and the address bar of a shared screen.
- Fixed the participants of `/admin/workshops` answering `column reference "fullname" is ambiguous` instead of listing anybody, which took their CSV and vCard exports down with them: the paging function now says which row source each of its ordering columns comes from, so the database no longer has to choose between a column and the returned value of the very same name.
- Made `/cs/komunita` the permanent room it is: no stage, no countdown towards a start it never had, no participant reactions and no watching count, and no realtime channel or fast poll behind them, so the community catches up calmly instead of pretending to be a live occurrence.
- Took the community picker, the creation of a second community, and the start, end, stage, and reaction settings out of `/admin/community`, which now offers only what one permanent room has, while the administration API refuses a schedule or a stage written into such a room at all.
- Described every room kind in one place — whether it is the only one of its kind, keeps a fixed URL, has a schedule, a stage, and live updates — so the participant room, its administration, the routes, and the data loading all ask the same question instead of naming the community, and a room which does not show a live panel neither counts nor broadcasts for it.
- Replaced the workshop selector of `/admin/workshops` with a card for every occurrence, saying when the term is, whether it is upcoming, ongoing or already over, and how many participants it gathered; a running room leads the list, the prepared terms follow it, and the history closes it.
- Generalized discount codes from an AI Supervize Mini-only feature into a shared, RLS-protected database-backed system: `/admin/discount-codes` can now make a code valid everywhere or only in selected offer places, optionally limit its total uses, and generate `?code=...` links which prefill and scroll to the matching registration form; previews show remaining uses and registration consumes limited codes atomically, while the old single online-workshop follow-up selection was removed.
- Added the Czech-only `/cs/komunita` member room with the workshop waiting-room flow, GET-prefilled name and e-mail, moderated chat, timed materials, and identity-prefilled links to every published workshop.
- Added `/admin/community`, reusing the workshop moderation, participants, content, analytics, and settings dashboard while keeping its stable community URL read-only.
- Moved the URL shortener into `/admin/shortener`, added it to the admin dashboard, and made database-backed short-link creation require the shared admin token while generated links remain public.
- Extended the live-room data model with a database-enforced singleton community kind, keeping it separate from workshop terms and their public/admin lists without duplicating the secure participant-room infrastructure.
- Rebuilt `/admin/workshops` around focused overview, participant, comment, reaction, content, and settings sections; large audiences now have server-side filtering, sorting, paging, per-person activity histories, a workshop-wide activity timeline, and CSV exports for every section plus filtered participant vCards.
- Made `/cs/online-workshop` load and present every upcoming published workshop from the shared workshop data, with a separate registration form and selected-term contact note for each date instead of one hardcoded occurrence.
- Carried the selected workshop as `?workshop=<slug>` through registration confirmation, direct room links, and calendar invitations; `/cs/online-workshop/participant` and `/cs/online-workshop/dekujeme` now resolve it, while old links without it use the most recent published workshop.
- Let `/admin/workshops` edit a workshop URL slug with the same validation and uniqueness handling used when creating it, and indexed published workshop dates for the public term list and legacy-link fallback.
- Fixed the cookie consent customization flow so the modal opens again and saving preferences dismisses the cookie bar.
- Improved landing page CTA flow so pricing cards keep the selected plan context and the Pro trial CTA goes straight to purchase instead of a generic waitlist modal.
- Reduced mobile hero/header overflow by tightening responsive header sizing and constraining hero text, hint pills, mocked chat, and AI Supervize terminal animation.
- Added the Czech `/ai-supervize-mini` workshop landing page with configurable dates, scarcity, SUPER discount tracking, Contact registration, `/skoleni` redirect, and cross-links from the full AI Supervize page.
- Updated `/ai-supervize-mini` terms to 19. 6. and 25. 6., added an online variant, and split onsite vs. online pricing in the registration flow.
- Rebuilt page metadata around one shared `createPageMetadata` factory, so every page derives its title, description, canonical, `hreflang` alternates, Open Graph and X card from a single definition instead of repeating them.
- Fixed `/cs` and `/en` sharing no preview image at all, because a page level `openGraph` object replaces the inherited one in Next.js.
- Generated on-brand sharing preview images for every landing page (`/cs`, `/en`, `/pro-mesta`, `/for-agro`, `/for-industry`, `/ai-supervize`, `/ai-supervize-mini`, `/cs/online-workshop`, `/hackathon-factory`, `/cs/pavol`, `/en/pavol`) from a derived palette, and dropped the duplicated `twitter-image` routes.
- Added `/sitemap.xml` built from the same page definitions, so the sitemap advertised by `robots.txt` finally exists.
- Added Organization, WebSite and Person structured data for Google, and removed the placeholder Google site verification tag that shipped to production.
- Gave metadata to the pages which had none (`/contact`, `/privacy`, `/terms`, `/data-deletion`, `/for-industry`) and kept `/old`, `/dekujeme`, `/admin/shortener` and `/admin/contacts` out of search results.
- Replaced the static `manifest.json` and `robots.txt` with generated routes, aligning the app manifest theme color with the browser theme color and dropping the dead `browserconfig.xml` reference.
- Moved the online workshop registration confirmation onto its own `/cs/online-workshop/dekujeme` url reached by a full page load, so the Meta Pixel reports a `PageView` of it and an ad campaign can optimize on real registrations instead of clicks.
- Added "add to calendar" links and the follow-up steps to the online workshop confirmation, and reported it to the Meta Pixel as a `CompleteRegistration` event.
- Rebuilt the `/admin/contacts` dashboard around one shared list of column definitions, so the table, the sorting, the fulltext search and both exports describe every column exactly once instead of repeating it.
- Joined the private contact and workshop-participant views by normalized e-mail, including case-insensitive and `+tag` aliases: `/admin/contacts` now groups duplicate Contact rows and shows workshop attendance, while workshop participant lists, timelines, CSV exports, and vCards include the matching Contact details such as phone numbers without changing stored data.
- Made the columns of the contacts table resizable by dragging the right edge of their header, which decides how much of the value is shown before the ellipsis "...", and remembered the widths for the next visit.
- Made every column of the contacts table sortable, with the empty values kept at the end in both directions and the whole values still readable in a tooltip.
- Added filtering of the contacts by a fulltext search, a created date range, the presence of the email, the phone or the user note, and by whether the contact was already contacted.
- Added the download of the contacts as a CSV or a vCard file, which always exports the current view and says next to the buttons how many contacts that is.
- Fixed the contacts CSV export mangling the diacritics in spreadsheet editors, and stopped a note being sent to the server on every single keystroke.
- Added the reusable `/cs/online-workshop/participant` live room with participant sessions, a server-synchronized countdown and YouTube stream, timed Markdown materials, moderated chat, upvotes, animated reactions, an RLS-secured Supabase model, and workshop administration from the new `/admin` dashboard.
- Offered the workshop to the calendar of a participant from the `/cs/online-workshop/participant` room as long as it has not started, as a `Karel <> Pavol - Produkční kód s AI agenty` event built from the live workshop details and carrying a prefilled link back into the room, and moved the registration confirmation onto the very same shared calendar code.
- Let a participant of the `/cs/online-workshop/participant` room rename themselves straight from the room header, which also renames the author of the comments they already wrote, and validates the new name by the very same rule as the connection form.
- Let a participant of the `/cs/online-workshop/participant` room answer a message of the chat, so a question and its answers are read as one conversation which the newest-first order lifts by its newest answer, while an answer is moderated, voted, and rate limited exactly like any other message and the moderation of it shows the question it answers.
- Gave every reaction of the `/cs/online-workshop/participant` room a celebration of its own: a thumbs-up hops, a heart beats its way up an S-curve, applause claps just above the edge, fire flickers up a draught, an idea glows and drifts, laughter rolls away, `</>` climbs line by line behind a blinking cursor, sparkles twinkle, a snake slithers, eyes dart around, a party popper throws confetti and a firework explodes, while any other emoji still flies with the animation the room had before and any text an admin sends flies as a readable chip instead of a huge word.
- Composed those animations in one registry out of a flight, a flourish and a decoration, which the stylesheet of the room answers with keyframes the browser runs on the compositor, so a new reaction is one entry and a full stage costs no JavaScript, keeps at most two dozen reactions in the air however many participants react at once, and stops travelling altogether for anyone who asked the system for less motion.
- Previewed the reactions of a workshop straight in `/admin/workshops`, where every reaction says which animation it gets and flies through the very same stream as the room, and made room for all thirteen animated reactions at once, which the database guarded at twelve.
- Kept every participant action in the online workshop attributable to its server-side timestamp: joining the room, comments, likes, reactions, and material-link clicks are recorded for the administration without duplicating the existing event records.
