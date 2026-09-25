[ ]

[✨↕️] Reorder workshop materials with drag and drop and save the order automatically

- Add drag-and-drop ordering to the material list in `/admin/workshops?tab=content`. This task is about materials, not reordering workshop events, participant lists or polls.
- Keep the existing numeric `Pořadí` field (`sortOrder`) inside the material editor as an advanced/manual option. Dragging and that field must operate on the same persisted order.
- Add a visible, dedicated drag handle to every ordinary material card/row.
    - Drag from the handle, not from the entire Markdown preview or edit button. Clicking links, selecting text and opening the editor must keep working.
    - Provide clear grabbed, drop-target and placement feedback, with stable item identity and no unnecessary remounting or page jumps.
    - Support mouse and touch without making ordinary scrolling start a drag. Offer keyboard reordering through the handle or equivalent accessible move controls, with useful labels and focus retention.
    - Escape/cancel restores the previous order without a write. Dropping in the same position is a no-op.
- On a successful drop, update the visible list immediately and automatically persist the new order. No Save button or confirmation is required for normal reordering.
    - Use the shared saving/saved/error feedback and pending-write navigation protection, consistent with `2026-09-0740-admin-autosave-ui-consistency.md`.
    - Serialize or coalesce rapid reorder operations so an older response cannot overwrite the most recent order.
    - Background admin snapshots must not snap a pending drag/reorder back to stale server state.
    - On failure, do not leave an unsaved visual order labelled as saved. Show the error and a retry or an explicit return to the last persisted order.
- Persist an order-only mutation through an authorized, workshop-scoped server operation.
    - Use stable material IDs and the existing numeric ordering model. Reindex when necessary to produce deterministic ordering, including records that previously shared an order value.
    - Save the affected ordering atomically rather than broadcasting intermediate per-row reorder states to participants.
    - Do not send stale full material records just to change order; a reorder must not overwrite another edit's title, body, unlock time, publication or paid-members flag.
    - Validate ownership and IDs. Handle a concurrently deleted/added material or a stale order snapshot explicitly; never recreate missing materials or drop unrelated ones.
    - Keep manual numeric-order edits and drag ordering consistent after refresh. New materials, including batches of quick links, append correctly even when numeric values are sparse.
- Preserve all content behavior.
    - Keep publication, unlock times, follow-up status, paid access, click counts and Markdown unchanged.
    - Participant rooms see the saved relative order of the materials they may access through the existing live-refresh mechanism, without rejoining.
    - Do not convert or reorder virtual special-material placements such as presentation, repository and community invitations as ordinary database content. Their existing placement policy remains separate.
    - Reuse the shared material admin component for other rooms where it already appears; do not introduce a second ordering implementation in community administration.
- Start with `businesses/workshop-admin/WorkshopContentAdmin.tsx`, `WorkshopContentEditor.tsx`, `WorkshopAdminDashboard.tsx`, `workshopAdminApiClient.ts`, the content API handlers and `lib/workshops/workshopSpecialMaterials.ts`.
- Acceptance criteria:
    - Move first/middle/last items in both directions and confirm the order survives reload and appears in a second connected participant session.
    - Test keyboard and touch operation, cancelled and unchanged drops, rapid successive moves, failed saves and background snapshots.
    - Verify that manual numeric edits still work and that reorder requests cannot touch another workshop or overwrite content fields.
    - Cover empty/single-item lists, duplicate old order values and concurrent material addition/deletion.
- Keep in mind the DRY _(don't repeat yourself)_ principle. Reuse existing interaction dependencies and admin persistence infrastructure where suitable.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
