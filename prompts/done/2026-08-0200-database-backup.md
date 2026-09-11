[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.1961 8 minutes; Testing a minute

[✨👍] Do the script to backup entire database

- Add this script to the `package.json` as `npm run backup-database` and also to `terminals.json`
- If there is missing pg_dump, show the instructions how to install it.
    - Be aware that you can be on Windows, Mac or Linux.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2393 14 minutes; Testing 6 minutes

[✨👍] Do the script to verify the database backup

- Add this script to the `package.json` as `npm run backup-database:verify` and also to `terminals.json`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2814 13 minutes; Testing 6 minutes

[✨👍] Script that verifies the database backup should show some output indicating whether the backup is valid or not.

```console
me@DESKTOP-2QD9KQQ MINGW64 ~/work/promptbook-experiments-and-landing-pages/aldaron (main)
$ npm run backup-database:verify

> promptbook-landing-page@0.1.0 backup-database:verify
> tsx scripts/backup-database-verify.ts

Database backup verified at backups\database-2026-08-28T16-04-14-732Z.dump.
```

- There is no clue if the backup is good or just technically created but not backing up the actual data.
- List backed up tables and number of rows in each table to ensure that all necessary data has been included in the backup.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.

