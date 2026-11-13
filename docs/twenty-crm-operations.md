# Attended CRM operational setup

CRM is the primary working record. The historical CRM master spreadsheet is an archive, never a continuing source of current owners, stages or consent.

The production-only `/api/admin/twenty-crm` operator uses the existing environment-superadmin and cross-site guard. Enable it explicitly with `TWENTY_CRM_OPERATOR_ENABLED=true` for an attended deployment and disable it again afterwards. It never runs in a build, on GET, in preview or in development, and it never sends mail, charges, deletes, merges identities or grants integration permissions. It is independent of the commerce operator.

1. `inspect` reads metadata and accessible records. Responses contain field definitions, counts and source-detail key names, not raw personal submissions. Refused optional objects remain refused.
2. `backup` captures metadata and records into an immutable gzip object under the existing private object bucket's `private/crm-operations/` prefix. Required People, Companies and source backups must all succeed. Readback verifies the actual compressed bytes with SHA-256 before it reports success.
3. `schema` requires a verified backup less than 24 hours old. It validates all existing field types before writing, adds missing fields only, and never rewrites existing definitions, option values, native stages or records. Replaying setup produces zero new fields.
4. `export` displays the selected private backup as gzip/base64 behind the same superadmin guard, for an explicit local copy. Backup keys are strictly confined to this operator's namespace.

The new `ptbk*` fields separate operational qualification from immutable historical answers and distinguish confirmed partners from candidates. Empty fields stay unknown. A past workshop or advertisement response does not become a new current enquiry, customer or partner. Neither product terms nor marketing choices are inferred.

Backups preserve the original metadata and records for manual recovery. Do not delete newly added fields as a casual rollback once the team has started using them. Restore only explicitly selected original values, keeping newer activity and imported source identities. No automatic destructive rollback endpoint exists.
