import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('contact evidence migration', () => {
    it('keeps historical records empty, records new evidence and refuses later edits', async () => {
        const db = new PGlite();
        try {
            await db.exec('CREATE TABLE public."Contact" (id integer PRIMARY KEY, "userNote" text); INSERT INTO public."Contact" VALUES (1, \'old\');');
            await db.exec(readFileSync(new URL('../../migrations/2026-11-0300-contact-submission-evidence.sql', import.meta.url), 'utf8'));
            const old = await db.query('SELECT "submissionEvidence" FROM public."Contact" WHERE id=1');
            expect(old.rows).toEqual([{ submissionEvidence: null }]);
            await db.query('INSERT INTO public."Contact" (id,"submissionEvidence") VALUES (2,$1)', [JSON.stringify({ purpose: 'request', marketingConsent: false })]);
            await db.exec('UPDATE public."Contact" SET "userNote"=\'edited\' WHERE id=2');
            await expect(db.exec('UPDATE public."Contact" SET "submissionEvidence"=\'{"marketingConsent":true}\' WHERE id=2')).rejects.toThrow('cannot be changed');
            await expect(db.exec('UPDATE public."Contact" SET "submissionEvidence"=\'{}\' WHERE id=1')).rejects.toThrow('cannot be changed');
        } finally { await db.close(); }
    });
});
