import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('repository commit range migration', () => {
    it('preserves existing projects and enforces IDs and whole-project clearing', async () => {
        const database = new PGlite();
        try {
            await database.exec(`CREATE TABLE public.workshops (
                github_repository text, github_repository_branches text[], deployment_urls text[],
                CONSTRAINT workshops_repository_connection CHECK (github_repository IS NOT NULL OR
                    (github_repository_branches IS NULL AND deployment_urls IS NULL)));
                INSERT INTO public.workshops VALUES ('example/workshop', ARRAY['main'], NULL);`);
            await database.exec(readFileSync('migrations/2026-09-2500-workshop-repository-commit-range.sql', 'utf8'));
            expect((await database.query('SELECT github_repository_start_commit, github_repository_end_commit FROM workshops')).rows)
                .toEqual([{ github_repository_start_commit: null, github_repository_end_commit: null }]);
            await database.exec("UPDATE workshops SET github_repository_start_commit = 'abcdef1'");
            await expect(database.exec("UPDATE workshops SET github_repository_end_commit = 'main'")).rejects.toThrow();
            await expect(database.exec('UPDATE workshops SET github_repository = NULL, github_repository_branches = NULL')).rejects.toThrow();
            await database.exec('UPDATE workshops SET github_repository = NULL, github_repository_branches = NULL, github_repository_start_commit = NULL');
        } finally { await database.close(); }
    });
});
