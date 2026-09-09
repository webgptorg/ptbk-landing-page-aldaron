# Current preversion
- Let a workshop be about a project, and let its participants watch that project being built. `/admin/workshops` now
  asks every term for `GitHub repozitář projektu`, and optionally for the branch it follows and for the address the
  project runs at. The repository is written however it is at hand — `vlastník/název`, the address of the repository
  page, of a branch or a file in it, or the address `git clone` was given — and the administration says which project
  it read out of it before the term is saved. All three are one connection rather than three loose settings, so
  connecting, changing and disconnecting a project is one save: clearing the repository disconnects the whole thing,
  and neither a branch nor a deployment can outlive the repository it belonged to, which the database itself refuses.
  A copy of a term inherits the project it was about, exactly as it inherits its stream, and the settings export names
  the repository, the branch and the deployment beside them.

  The room of such a term gains a `Projekt workshopu` panel under its stage: the repository with what GitHub says
  about it, the branch which is being followed, a link into the repository, a link to the running application when one
  was written, and — this is what a workshop is really about — what has been committed in it. The panel says how much
  was committed since the workshop began and lists the newest commits with their message, their author and the moment
  they were made, and every commit which arrives while somebody has the room open is marked `Nový` for them, so the
  work happening on stage is visible in the room as it happens. Nothing of this is stored: the commits are read from
  the feed GitHub publishes for every public repository and what the repository says about itself from the public
  API, both without a key of any kind, both read once for the whole room rather than once per participant, and both
  read beside the state of the room rather than inside it — so a slow or unreachable GitHub delays neither the chat,
  nor the materials, nor the stream. A repository which cannot be read leaves the room saying which project it is
  about and where it runs instead of taking anything down, a term which is about no project shows no panel at all, and
  a permanent room such as the community cannot be about a project in the first place, so it is neither asked for one
  nor allowed to be given one.

- Gave the automatically shortened links of `/cs/komunita` and the online workshop rooms their context back: a raw
  URL or Markdown autolink now becomes `[the page title](the same short link)` for members, while an editor's own
  Markdown, HTML, and reference-link labels remain their own words. The page title is read once through the same
  bounded, public-only preview path used by community projects, stored beside the durable source-to-shortcode mapping,
  and reused on later room loads; a page which cannot be previewed still receives its short link with its hostname as
  a safe label. Existing raw-link mappings fill their missing title the next time they are read, so old materials and
  moderator messages gain the context too without rewriting their original Markdown.
- Made the landing-page audience of an administered term actionable without making a second contact system. The
  `Účastníci` section of `/admin/workshops` now puts `Registrovaní na webu` beside `Účastníci v místnosti`: the first
  says how many people signed up through the event form and leads to the exact filtered list in `/admin/contacts`,
  while the second remains the people who actually opened the participant room. From that registration block an
  administrator can also export CSV, vCard, or AI context directly. Those are the very same contact list and export
  formats that `/admin/contacts` already owns, rather than a copied table, serializer, or store.

  The shared contact filter identifies a registration by the same source places and slug, Prague-day, and exact-moment
  aliases used to count the term, so old registrations written before stable term URLs continue to appear and export
  with their term. Answered contacts remain included in this purpose-built view; clearing its filter returns to the
  ordinary contacts dashboard. A group registration still counts every person it signed up, although its export has
  one Contact record because no separate contact exists for the other people in that group. Permanent rooms without an
  event have no such block.

- Said of every term in `/admin/workshops` how many people signed up for it, next to how many of them really came.
  Until now the administration counted one audience only — the people who entered the live room through the participant
  application — so a term which nobody had opened yet looked as though nobody wanted it, however full its registration
  form was. Every card of the term picker and the `Přehled` of the opened term now say both numbers: `Registrovaní` are
  the people who left their contact in the registration form on the landing page of that event, and `Účastníci` are the
  people who really entered its room. Each number explains itself when the mouse rests on it, because neither can be
  derived from the other — somebody registers and never comes, and somebody is handed a link into a room they never
  registered for.

  Nothing about how a contact is gathered or recorded changed: `/admin/contacts` remains the one place which gathers
  them, shows them and says who they are, and the administration of a term reads nothing of a registration but the note
  saying which term it was made for and for how many people. A registration signing up a whole group counts as the
  people it signed up rather than as one line. Which term a registration belongs to is now decided in one single place
  for the whole application, so the seats `/ai-supervize-mini` counts as taken and the registrations `/admin/workshops`
  counts are read by the very same rule and can never disagree: a term is recognised by its address, by the day it is
  held on, and by the exact moment it begins at, which is how the registrations written before the terms had addresses
  of their own named them — so the whole history of a term is counted rather than only what was registered since. The
  landing pages now write the term into their note through the very words that rule reads it back with. A permanent
  room such as the community is no term of an event and has no registration form at all, so it says nothing about
  registrations instead of claiming that nobody registered for it, and a server which cannot reach the contacts leaves
  the administration standing rather than taking it down with an audience it could not count.

- Stopped asking for a card where there is never going to be anything to charge it for. A discount code which takes
  the whole price of the community membership for as long as that membership lasts is now a voucher: in the membership
  popup of `/cs/komunita` and of `/cs/online-workshop/participant`, entering such a code turns the `Zaplatit 199 Kč /
  měsíc` button into `Aktivovat členství zdarma`, says that the code covers the whole membership, names no card, no
  Stripe gate and no test card, and hands the member their paid membership on the spot without sending them anywhere.
  A code which only takes the whole price for its first months keeps opening the payment gate exactly as before,
  because the price returns to normal afterwards and that is precisely what the card would then be charged. The one
  rule which tells those two apart is written a single time, so the button, the price summary, the endpoint and the
  redemption cannot disagree about which code is a voucher, and the browser never decides it: the server resolves the
  code again and takes one of its uses atomically before granting anything, so a voucher limited to five uses gives
  away five memberships and no sixth, however many members redeem it at the same moment. Such a membership is recorded
  like every other one, with its code, its zero price and the gate it was granted under, but with no checkout and no
  subscription behind it - so it says of itself that it is free rather than that 0 Kč is paid for it monthly, offers
  neither a cancellation nor the Stripe portal, because there is no renewal to stop, and `/admin/community` says of it
  that a discount code covered it instead of offering a Stripe payment which was never made.

- Kept the recording of an ended workshop for the members who pay for it, and put a teaser of it in front of everybody
  else. `/admin/workshops` now asks every term for a second video beside its stream, `YouTube URL nebo video ID
  ukázky`, which is the public snippet of its recording. While a workshop runs, nothing changes: everybody watches the
  same stream, because the membership pays for watching a workshop again rather than for being at it. Once it is over,
  the room decides the video on the server exactly as it already decides the materials: a paid member receives the
  stream and plays it again from the wrap-up as before, while everybody else receives no video at all — the recording
  is not merely hidden from them, it never reaches their browser. In its place the closing wrap-up carries the same
  amber card the paid materials are offered with: it says that the whole recording is for paid members, plays the
  published teaser under a `Ukázka ze záznamu` heading, and opens the very same membership popup the badge in the
  header opens. A term whose teaser was left empty says the same thing without one, a term which carries no stream at
  all offers nothing, so nobody is sold a recording which does not exist, and a paid member is never shown the teaser
  beside the recording it teases. Because the decision and the card are each written once, the materials and the
  recording of a workshop are offered by one card and one membership question rather than by two which could drift
  apart; a saved room snapshot from before this change is dropped rather than replayed, so a browser cannot keep
  playing a recording which is now behind the membership.

- Named the paid materials to the members who may not read them yet. The amber card of
  `/cs/online-workshop/participant` and `/cs/komunita` which says where the materials for paid members are now lists
  the titles of the very materials which are waiting behind the membership under a `Co odemknete` heading, so a free
  member reads what a purchase would give them instead of an unnamed promise. Nothing else of such a material leaves
  the server: its body, its links and its QR codes are never sent to a member who has not unlocked it, and its links
  are not even prepared for them. The room now reads its materials once, as a paid member would, and decides in one
  place which of them reach the member and which are only named to them, so the hidden materials and the card offering
  the membership can never disagree; a material an administrator left untitled keeps the card without being named in
  it, and a room which offers no membership still hides such a material without naming it at all. Because the card now
  names the materials the room really read rather than counting every paid material there is, a paid material whose
  unlock time has not come yet is no longer announced before its time: it is named exactly when a member who paid would
  receive it, so nobody buys the membership for something they then have to wait for. The `Obsah` section of
  `/admin/workshops` says beside the `Jen pro placené členy` choice that the title of the material becomes exactly this
  public teaser while its content stays paid.

- Let a material be marked as one which only paid members may see. The `Obsah` section of `/admin/workshops` now asks
  this of every material with a `Jen pro placené členy` choice, and the room decides it on the server: a member who
  pays for the community membership receives such a material like any other, named `Pro placené členy` by its own
  badge, while the state of everybody else carries neither the material nor its title — only an amber card saying
  where the paid materials are, whose button opens the very same membership popup the badge in the header opens, and
  only while a payment gate is configured at all. The countdown to the next material never names an unlock which is
  not for the member reading it, the wrap-up keeps linking the follow-up material only to those who may see it, and
  the content export of the administration says of every material who may see it. The very same membership also
  unlocks the video of the workshop once it is over: the closing wrap-up keeps its feedback and its follow-up link
  for everybody, while a paid member additionally receives a `Přehrát video znovu` button which plays the stream the
  occurrence carried, with its controls visible, and leads back to the closing summary again. Because
  `/cs/online-workshop/participant` and `/cs/komunita` are the one shared participant room, the flag, the badge, the
  notice and the unlocked video are written a single time, and the membership they all ask about is the one
  membership the room already loads for its badge and its popup.

- Made the membership of the community readable and buyable in the live room of a workshop occurrence
  (`/cs/online-workshop/participant`) as well as in `/cs/komunita`. The header of the room now says whether its
  attendee is a free or a paid member, and the same popup opens the paid offer for a free member and the management,
  cancellation, reactivation and Stripe Customer Portal of an already-paid one. The membership belongs to the address
  the member connected with, so both rooms show and change one and the same membership, and the payment gate returns
  the member into the very room they paid or managed it from instead of into the community. The badge, the popup, the
  one loading of the membership and the endpoints behind them are the shared participant room's own, so neither page
  carries a copy of any of it; which kinds of room offer the membership is answered once by the room-kind
  capabilities, where a project discussion deliberately does not.

- Made each community poll attached to a workshop voteable from that workshop as well as from `/cs/komunita`. A
  normalized e-mail is now the one voter identity, so selecting or changing an answer in either place updates the
  same choice and the same aggregate in the community, every attached workshop, `/admin/community?tab=polls`, and
  the attached-poll view of `/admin/workshops`. The poll still has one owner and one administration in the community;
  workshop administration reads its shared result rather than maintaining a copy.

- Rebuilt the site-wide cookie notice from a small, central floating card into one responsive consent tray: it now
  keeps the primary page content clear by reading as a compact horizontal bar on larger screens and a shorter,
  two-action sheet on phones. The same shared component keeps every page on one layout, carries the cookie icon,
  contrast and focus treatment once, and lets the independent AI ta Krajta pages use their own moss-and-coral
  language without copying the consent flow. It also steps above the podcast mini player and any fixed admin table
  scrollbar, while the optional booking notice waits until the visitor has answered cookies instead of competing with
  the required action on a small screen. Accepting, opening settings and saving a tailored choice continue to use the
  same stored preferences as before.

- Let an administrator place any number of `*` wildcards anywhere in a discount code: `SUMMER*` applies to codes
  starting with `SUMMER`, `*SUMMER` to codes ending with it, `*SUMMER*` to codes containing it, and
  `*SUMMER*2026` to codes which contain `SUMMER` and end with `2026`. Each wildcard stands for zero or more normalized
  code characters. The same database resolver supplies form previews and atomic registration consumption, so one path
  cannot accept a code which the other would reject; an exact code takes precedence, then the matching pattern with
  more literal characters, with a deterministic fallback for equally specific patterns.

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
