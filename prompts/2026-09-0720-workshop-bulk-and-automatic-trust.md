[ ] !!

[✨🤝] Trust all existing workshop participants, optionally trust new arrivals automatically, and show role counts

- Add these controls beside the participant list in `/admin/workshops?tab=participants`.
- Respect the existing room-local trust model. Here, "everyone" means participants of the selected workshop/room, not every contact in `/admin/contacts` or participants of every workshop. Label the scope clearly. If the shared participant UI is also used in `/admin/community`, keep the behavior consistent and scoped to that community room.
- Add a one-time `Důvěřovat všem` action.
    - It grants trust to all currently untrusted, non-moderator participants in that room, including participants outside the current search results, pagination or visible rows. Already trusted participants and moderators need no promotion.
    - It is a sensitive explicit action, not an autosaved edit and not the automatic-trust setting.
    - Every activation must open a confirmation dialog before any mutation. Show the room and the exact server-derived number of participants whose trust will change, with explicit confirmation and cancellation actions.
    - Explain that granting trust also processes that person's pending submissions through the existing approval policy. Do not present it as a harmless cosmetic label.
    - Bind confirmation to the reviewed scope/participants. If the affected set changes before execution, refresh and reconfirm rather than silently affecting additional people.
    - Cancellation changes nothing. With no eligible participants, show a zero/disabled state. Prevent duplicate submissions and report the actual result or error.
- Add a persistent `Automaticky důvěřovat novým účastníkům` on/off setting in the same area.
    - Default it to off for existing and new rooms; do not silently opt any room in. A duplicated room must also start with this sensitive setting off.
    - While enabled, newly created participant identities joining that room receive trust immediately on the server. This must not depend on the admin page staying open.
    - Enabling it does not retroactively trust existing participants; the separate bulk action handles those.
    - Disabling it affects only future arrivals. It never revokes trust already granted automatically or manually and never changes moderator roles.
    - Reconnecting, opening another tab or logging in again as an existing participant is not a new identity. Do not regrant manually revoked trust on every room fetch or reconnect.
    - Show the currently persisted setting, a clear warning while it is active, and saving/error feedback. Do not show it as enabled if persistence failed.
- Show compact counts beside these controls: `Důvěryhodní`, `Nedůvěryhodní` and `Moderátoři`.
    - Use non-overlapping display groups: moderators first; among non-moderators, split by the trust flag. The three counts therefore sum to the room's participant count.
    - Counts cover the entire selected room, not just online participants or a filtered page. State that scope and refresh after individual moderation, bulk trust and new arrivals.
    - An interaction ban remains a separate existing property; trust must never silently remove a ban or make a banned participant able to submit.
- Reuse the existing moderation and pending-approval machinery, not a second implementation.
    - Read `prompts/2026-09-0390-trusted-to-approve.md`, `businesses/workshop-admin/WorkshopParticipantList.tsx`, `WorkshopAdminDashboard.tsx`, `lib/workshops/workshopParticipantModeration.ts` and `workshopSubmissionStatus.ts`.
    - Preserve the database promotion trigger and shared handling of pending comments, member-written poll answers and community projects. Rejected submissions remain rejected; bans retain precedence.
    - Preserve the existing agent-queue scheduling and room notifications for newly approved content. Bulk processing must not enqueue duplicate replies.
    - Perform the bulk operation through an authorized, room-scoped server operation, with atomic persistence rather than a browser loop of unrelated per-person requests.
    - Clients must not grant their own trust. Keep bulk trust and the policy setting administrator-only; do not expand ordinary participants' or moderators' existing permissions.
- Acceptance criteria:
    - Confirm/cancel/zero-count/error cases, filtered lists, already trusted people, moderators and banned people behave as specified.
    - Existing pending content receives the same treatment as an individual promotion; rejected content and bans are preserved.
    - Joining before enable, during enable and after disable gives the expected trust state. Toggling off does not remove earlier trust.
    - Reloading administration preserves the switch; reconnects do not undo manual moderation; two different rooms remain isolated.
    - Counts stay accurate after these operations, and unauthorized or cross-room requests fail.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
