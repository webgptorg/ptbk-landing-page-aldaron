[ ] !!

[✨💾] Make admin editing consistent: autosave existing records, explicitly create new records, and remove redundant Save buttons

- Existing records already autosave, but some editor dialogs still show `Uložit` as if manual saving were required. Remove this contradictory interaction pattern, starting with workshop administration and applying the shared fix consistently across affected admin editors.
- Follow up on `prompts/2026-09-0420-admin-autosave.md` and `prompts/2026-09-0430-admin-modals.md`.
- Use a consistent distinction between editing and creation.
    - EXISTING RECORD: edits autosave. Do not show a normal `Uložit`/`Save` submit button alongside functioning autosave, including inside nested settings dialogs.
    - NEW RECORD: keep changes as a local draft until the explicit `Vytvořit`, `Přidat materiál` or equivalent action. Merely opening, typing in or closing the dialog must not create an empty or half-filled database record.
    - DELETION and other explicit operations remain actions, with their existing confirmations and authorization. Removing Save must not remove `Smazat`, publishing/unlocking actions or the sensitive bulk-trust confirmation.
    - A nested dialog is classified by what it does, not its visual nesting: editing existing data autosaves; creating a new child requires explicit creation. Do not create orphan children merely because the parent editor is autosaved.
- Show one consistent, unobtrusive persistence status in existing-record editors.
    - Distinguish waiting/unsaved changes, saving, saved, validation problems and failed saves. Only show `Uloženo` after the latest draft has actually been persisted.
    - Preserve the user's draft on validation errors, network failures and polling updates. Give actionable error feedback and a retry action when saving fails; an error-specific retry is not a permanent Save button.
    - Autosaving must not close the dialog or move focus away from the edited field.
    - Use a clearly labelled `Zavřít` or equivalent close action. Do not label closing an autosaved editor `Zrušit` in a way that implies already persisted edits will be undone.
- Preserve and consistently apply unsaved-change protection.
    - While a draft is dirty, invalid, saving or failed, register the existing browser-native unload/reload warning. Do not promise that a web application can absolutely prevent the user from closing a browser.
    - For controlled navigation, section/record switches, sign-out and closing an existing-record dialog, flush pending saves first. If saving fails or validation is unresolved, keep the draft/editor available and explain why navigation did not proceed.
    - Clean, saved editors close without unnecessary confirmation. Keep the existing backdrop behavior and keyboard/focus handling.
    - Protect a modified NEW-record draft from accidental loss too, but do not auto-create it as a side effect of trying to close. Offer explicit discard/cancel behavior instead.
    - Prevent default form submission from causing navigation or duplicate mutations after the redundant submit buttons are removed.
- Reuse `hooks/useAdminAutosave.ts`, the shared `AdminSaveQueue`, `lib/admin/adminPendingSaves.ts`, `components/admin/AdminAutosaveStatus.tsx`, `AdminEditorDialog` and `AdminEditorButton`.
    - `businesses/workshop-admin/WorkshopContentEditor.tsx` is a concrete example: autosave is already enabled for existing content, but the footer still renders an `Uložit` submit button.
    - Audit other affected workshop editors and shared consumers such as contact and short-link editors. Preserve intentional inline settings; this task does not move all administration back into modals.
    - Reuse existing debouncing, serialized writes and stable record identity. Do not implement a new autosave queue per dialog.
    - Keep creation and deletion protected against duplicate requests and races with pending autosave. A delayed save must not recreate a deleted item.
- Acceptance criteria:
    - Editing an existing material/settings record persists without any Save button and stays open, with status reflecting the latest edit.
    - Slow responses, rapid typing, validation failure and a failed request cannot falsely show Saved or replace newer input.
    - Closing/Escape, navigation, sign-out and browser unload preserve the specified protection; saved editors close normally.
    - New-record and nested creation dialogs create nothing before explicit submission, create once after success, and retain the draft after failure.
    - Delete and immediate-operation controls still work; a shared-component audit prevents contradictory Save buttons remaining in equivalent editors.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
